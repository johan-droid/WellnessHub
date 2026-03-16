git pull origin masterimport { Hono } from 'hono'
import type { D1Database } from '@cloudflare/workers-types'
import { cors } from 'hono/cors'
import { drizzle } from 'drizzle-orm/d1'
import { v4 as uuidv4 } from 'uuid'
import { sign, verify as verifyJwt } from 'hono/jwt'
import { generateSecret, generateURI, verify as verifyOtp } from 'otplib'
import { eq, and, desc, inArray } from 'drizzle-orm'
import { users, trips, logs, tripActivities, healthMetrics, appSettings, twoFactorAuth } from './db/schema'
import { hashPassword, verifyPassword, successResponse, errorResponse, rateLimiter } from './utils'
import { 
  registerSchema, 
  loginSchema, 
  createTripSchema, 
  updateTripSchema, 
  createActivitySchema,
  createWellnessLogSchema,
  createHealthMetricSchema,
  updateUserProfileSchema,
  updateAppSettingsSchema,
  changePasswordSchema,
  verifyTwoFactorSchema,
  disableTwoFactorSchema
} from './schemas'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
  ENVIRONMENT?: string
  CORS_ORIGINS?: string
}

type Variables = {
  userId: string
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

async function ensureSettingsTable(db: D1Database): Promise<void> {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS app_settings (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL UNIQUE,
        theme TEXT NOT NULL DEFAULT 'light',
        language TEXT NOT NULL DEFAULT 'English (US)',
        units TEXT NOT NULL DEFAULT 'metric',
        two_factor_enabled INTEGER NOT NULL DEFAULT 0,
        notifications_enabled INTEGER NOT NULL DEFAULT 1,
        connected_google INTEGER NOT NULL DEFAULT 0,
        connected_apple INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`
    )
    .run()
}

async function ensureTwoFactorTable(db: D1Database): Promise<void> {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS two_factor_auth (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL UNIQUE,
        secret TEXT NOT NULL,
        backup_code TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`
    )
    .run()
}

function generateBackupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const chunks = [4, 4, 4, 2]
  const random = (len: number): string =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')

  return chunks.map((len) => random(len)).join('-')
}

// --- Middleware ---

app.use('/*', async (c, next) => {
  const configured = (c.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  const middleware = cors({
    origin: (origin) => {
      if (!origin) return ''
      if (configured.includes(origin) || origin.endsWith('.vercel.app')) {
        return origin
      }
      return ''
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })

  return middleware(c, next)
})

// Auth Middleware
app.use('/api/protected/*', async (c, next) => {
  if (!c.env.JWT_SECRET) {
    return c.json(errorResponse('JWT_SECRET not configured', 500), 500);
  }

  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(errorResponse('Missing or invalid authorization header', 401), 401)
  }
  const token = authHeader.split(' ')[1]
  try {
    const payload = await verifyJwt(token, c.env.JWT_SECRET, 'HS256')
    c.set('userId', payload.sub as string)
    await next()
  } catch (err) {
    return c.json(errorResponse('Unauthorized token', 401), 401)
  }
})

// --- Public Routes ---

app.get('/api/health', (c) => c.json(successResponse({ status: 'Platform is operational' })))

// Register
app.post('/api/auth/register', async (c) => {
  const clientIp = c.req.header('cf-connecting-ip') || 'unknown';
  if (!rateLimiter.isAllowed(`register:${clientIp}`, 5, 3600000)) {
    return c.json(errorResponse('Too many registration attempts', 429), 429);
  }

  const db = drizzle(c.env.DB)
  const body = await c.req.json()
  
  const validation = registerSchema.safeParse(body)
  if (!validation.success) {
    return c.json(errorResponse(`Validation failed: ${validation.error.issues.map((e: any) => e.message).join(', ')}`), 400)
  }

  const { email: rawEmail, password, firstName, lastName } = validation.data
  // FIX 1: Normalise email to lowercase so User@Example.com and user@example.com are the same account
  const email = rawEmail.toLowerCase()

  // FIX 2: Explicit duplicate-email check -> proper 409 instead of a generic DB constraint error
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
  if (existing) {
    return c.json(errorResponse('Email already registered', 409), 409)
  }

  const passwordHash = await hashPassword(password)
  const id = uuidv4()

  try {
    await db.insert(users).values({
      id,
      email,
      passwordHash,
      firstName,
      lastName,
    })
    
    const token = await sign({ 
      sub: id, 
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 
    }, c.env.JWT_SECRET)
    
    return c.json(successResponse({ message: 'User created successfully', token }, 201), 201)
  } catch (e: any) {
    console.error('Registration error:', e);
    return c.json(errorResponse('Registration failed'), 400)
  }
})

// Login
app.post('/api/auth/login', async (c) => {
  const clientIp = c.req.header('cf-connecting-ip') || 'unknown';
  if (!rateLimiter.isAllowed(`login:${clientIp}`, 10, 900000)) {
    return c.json(errorResponse('Too many login attempts', 429), 429);
  }

  const db = drizzle(c.env.DB)
  const body = await c.req.json()
  
  const validation = loginSchema.safeParse(body)
  if (!validation.success) return c.json(errorResponse('Invalid input'), 400)

  const { email: rawLoginEmail, password } = validation.data
  // FIX 1: Match the lowercase normalisation applied during registration
  const email = rawLoginEmail.toLowerCase()
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

  // FIX 3: Always run verifyPassword regardless of whether the user was found.
  // The original short-circuit `!user || !(await verifyPassword(...))` skips hashing
  // when the email doesn't exist, creating a measurable timing difference that lets
  // an attacker enumerate registered email addresses.
  const passwordValid = user ? await verifyPassword(password, user.passwordHash) : false
  if (!user || !passwordValid) {
    return c.json(errorResponse('Invalid credentials', 401), 401)
  }

  const token = await sign({ 
    sub: user.id, 
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 
  }, c.env.JWT_SECRET)
  
  return c.json(successResponse({ message: 'Logged in successfully', token }))
})

// --- Protected Routes ---

// User Profile
app.get('/api/protected/me', async (c) => {
  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  
  const [user] = await db.select({
    id: users.id,
    email: users.email,
    firstName: users.firstName,
    lastName: users.lastName,
    profilePicture: users.profilePicture,
    bio: users.bio,
    createdAt: users.createdAt
  }).from(users).where(eq(users.id, userId)).limit(1)

  if (!user) return c.json(errorResponse('User not found', 404), 404)
  return c.json(successResponse({ user }))
})

app.put('/api/protected/me', async (c) => {
  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  const body = await c.req.json()
  
  const validation = updateUserProfileSchema.safeParse(body)
  if (!validation.success) return c.json(errorResponse('Invalid input'), 400)

  await db.update(users)
    .set({ ...validation.data, updatedAt: Date.now() })
    .where(eq(users.id, userId))

  return c.json(successResponse({ message: 'Profile updated' }))
})

app.delete('/api/protected/me', async (c) => {
  const db = drizzle(c.env.DB)
  const userId = c.get('userId')

  const userTrips = await db.select({ id: trips.id }).from(trips).where(eq(trips.userId, userId))
  const tripIds = userTrips.map((trip) => trip.id)

  if (tripIds.length > 0) {
    await db.delete(tripActivities).where(inArray(tripActivities.tripId, tripIds))
  }

  await db.delete(trips).where(eq(trips.userId, userId))
  await db.delete(appSettings).where(eq(appSettings.userId, userId))
  await db.delete(logs).where(eq(logs.userId, userId))
  await db.delete(healthMetrics).where(eq(healthMetrics.userId, userId))
  await db.delete(users).where(eq(users.id, userId))

  return c.json(successResponse({ message: 'Account deleted' }))
})

app.get('/api/protected/settings', async (c) => {
  await ensureSettingsTable(c.env.DB)

  const db = drizzle(c.env.DB)
  const userId = c.get('userId')

  const [settings] = await db.select().from(appSettings).where(eq(appSettings.userId, userId)).limit(1)

  const result = settings
    ? {
        theme: settings.theme,
        language: settings.language,
        units: settings.units,
        twoFactorEnabled: Boolean(settings.twoFactorEnabled),
        notificationsEnabled: Boolean(settings.notificationsEnabled),
        connectedGoogle: Boolean(settings.connectedGoogle),
        connectedApple: Boolean(settings.connectedApple),
      }
    : {
        theme: 'light',
        language: 'English (US)',
        units: 'metric',
        twoFactorEnabled: false,
        notificationsEnabled: true,
        connectedGoogle: false,
        connectedApple: false,
      }

  return c.json(successResponse({ settings: result }))
})

app.put('/api/protected/settings', async (c) => {
  await ensureSettingsTable(c.env.DB)

  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  const body = await c.req.json()

  const validation = updateAppSettingsSchema.safeParse(body)
  if (!validation.success) return c.json(errorResponse('Invalid input'), 400)

  const now = Date.now()
  const payload = validation.data
  const [existing] = await db.select().from(appSettings).where(eq(appSettings.userId, userId)).limit(1)

  const normalized = {
    ...(payload.theme !== undefined ? { theme: payload.theme } : {}),
    ...(payload.language !== undefined ? { language: payload.language } : {}),
    ...(payload.units !== undefined ? { units: payload.units } : {}),
    ...(payload.twoFactorEnabled !== undefined ? { twoFactorEnabled: payload.twoFactorEnabled ? 1 : 0 } : {}),
    ...(payload.notificationsEnabled !== undefined ? { notificationsEnabled: payload.notificationsEnabled ? 1 : 0 } : {}),
    ...(payload.connectedGoogle !== undefined ? { connectedGoogle: payload.connectedGoogle ? 1 : 0 } : {}),
    ...(payload.connectedApple !== undefined ? { connectedApple: payload.connectedApple ? 1 : 0 } : {}),
  }

  if (existing) {
    await db
      .update(appSettings)
      .set({ ...normalized, updatedAt: now })
      .where(eq(appSettings.userId, userId))
  } else {
    await db.insert(appSettings).values({
      id: uuidv4(),
      userId,
      theme: payload.theme ?? 'light',
      language: payload.language ?? 'English (US)',
      units: payload.units ?? 'metric',
      twoFactorEnabled: payload.twoFactorEnabled === undefined ? 0 : payload.twoFactorEnabled ? 1 : 0,
      notificationsEnabled: payload.notificationsEnabled === undefined ? 1 : payload.notificationsEnabled ? 1 : 0,
      connectedGoogle: payload.connectedGoogle ? 1 : 0,
      connectedApple: payload.connectedApple ? 1 : 0,
      createdAt: now,
      updatedAt: now,
    })
  }

  return c.json(successResponse({ message: 'Settings updated' }))
})

app.put('/api/protected/change-password', async (c) => {
  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  const body = await c.req.json()

  const validation = changePasswordSchema.safeParse(body)
  if (!validation.success) return c.json(errorResponse('Invalid input'), 400)

  const { currentPassword, newPassword } = validation.data
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user) return c.json(errorResponse('User not found', 404), 404)

  const isValid = await verifyPassword(currentPassword, user.passwordHash)
  if (!isValid) return c.json(errorResponse('Current password is incorrect', 400), 400)

  const passwordHash = await hashPassword(newPassword)
  await db.update(users).set({ passwordHash, updatedAt: Date.now() }).where(eq(users.id, userId))

  return c.json(successResponse({ message: 'Password changed successfully' }))
})

app.get('/api/protected/2fa/status', async (c) => {
  await ensureTwoFactorTable(c.env.DB)

  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  const [record] = await db.select().from(twoFactorAuth).where(eq(twoFactorAuth.userId, userId)).limit(1)

  return c.json(
    successResponse({
      enabled: Boolean(record?.enabled),
      configured: Boolean(record),
    }),
  )
})

app.post('/api/protected/2fa/setup', async (c) => {
  await ensureTwoFactorTable(c.env.DB)

  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user) return c.json(errorResponse('User not found', 404), 404)

  const secret = generateSecret()
  const backupCode = generateBackupCode()
  const otpauthUrl = generateURI({
    issuer: 'WellbeingHub',
    label: user.email,
    secret,
    strategy: 'totp',
    period: 30,
  })
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(otpauthUrl)}`
  const now = Date.now()

  const [existing] = await db.select().from(twoFactorAuth).where(eq(twoFactorAuth.userId, userId)).limit(1)

  if (existing) {
    await db
      .update(twoFactorAuth)
      .set({ secret, backupCode, enabled: 0, updatedAt: now })
      .where(eq(twoFactorAuth.userId, userId))
  } else {
    await db.insert(twoFactorAuth).values({
      id: uuidv4(),
      userId,
      secret,
      backupCode,
      enabled: 0,
      createdAt: now,
      updatedAt: now,
    })
  }

  return c.json(
    successResponse({
      qrCodeUrl,
      backupCode,
      otpauthUrl,
    }),
  )
})

app.post('/api/protected/2fa/verify', async (c) => {
  await ensureTwoFactorTable(c.env.DB)
  await ensureSettingsTable(c.env.DB)

  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  const body = await c.req.json()

  const validation = verifyTwoFactorSchema.safeParse(body)
  if (!validation.success) return c.json(errorResponse('Invalid input'), 400)

  const [record] = await db.select().from(twoFactorAuth).where(eq(twoFactorAuth.userId, userId)).limit(1)
  if (!record) return c.json(errorResponse('2FA setup not found', 404), 404)

  const verifyResult = await verifyOtp({
    token: validation.data.code,
    secret: record.secret,
    strategy: 'totp',
    period: 30,
    epochTolerance: 30,
  })

  if (!verifyResult.valid) return c.json(errorResponse('Invalid verification code', 400), 400)

  const now = Date.now()
  await db.update(twoFactorAuth).set({ enabled: 1, updatedAt: now }).where(eq(twoFactorAuth.userId, userId))

  const [existingSettings] = await db.select().from(appSettings).where(eq(appSettings.userId, userId)).limit(1)
  if (existingSettings) {
    await db
      .update(appSettings)
      .set({ twoFactorEnabled: 1, updatedAt: now })
      .where(eq(appSettings.userId, userId))
  } else {
    await db.insert(appSettings).values({
      id: uuidv4(),
      userId,
      theme: 'light',
      language: 'English (US)',
      units: 'metric',
      twoFactorEnabled: 1,
      notificationsEnabled: 1,
      connectedGoogle: 0,
      connectedApple: 0,
      createdAt: now,
      updatedAt: now,
    })
  }

  return c.json(successResponse({ message: 'Two-factor authentication enabled' }))
})

app.post('/api/protected/2fa/disable', async (c) => {
  await ensureTwoFactorTable(c.env.DB)
  await ensureSettingsTable(c.env.DB)

  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  const body = await c.req.json()

  const validation = disableTwoFactorSchema.safeParse(body)
  if (!validation.success) return c.json(errorResponse('Invalid input'), 400)

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user) return c.json(errorResponse('User not found', 404), 404)

  const validPassword = await verifyPassword(validation.data.currentPassword, user.passwordHash)
  if (!validPassword) return c.json(errorResponse('Current password is incorrect', 400), 400)

  const now = Date.now()
  await db.update(twoFactorAuth).set({ enabled: 0, updatedAt: now }).where(eq(twoFactorAuth.userId, userId))
  await db.update(appSettings).set({ twoFactorEnabled: 0, updatedAt: now }).where(eq(appSettings.userId, userId))

  return c.json(successResponse({ message: 'Two-factor authentication disabled' }))
})

// Trip Management
app.get('/api/protected/trips', async (c) => {
  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  const userTrips = await db.select().from(trips).where(eq(trips.userId, userId)).orderBy(desc(trips.createdAt))
  return c.json(successResponse({ trips: userTrips }))
})

app.get('/api/protected/trips/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  const tripId = c.req.param('id')
  
  const [trip] = await db.select().from(trips).where(and(eq(trips.id, tripId), eq(trips.userId, userId))).limit(1)
  if (!trip) return c.json(errorResponse('Trip not found', 404), 404)
  
  const activities = await db.select().from(tripActivities).where(eq(tripActivities.tripId, tripId))
  return c.json(successResponse({ ...trip, activities }))
})

app.post('/api/protected/trips', async (c) => {
  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  const body = await c.req.json()
  
  const validation = createTripSchema.safeParse(body)
  if (!validation.success) return c.json(errorResponse('Invalid input'), 400)

  const id = uuidv4()
  await db.insert(trips).values({
    id,
    userId,
    ...validation.data,
    createdAt: Date.now(),
    updatedAt: Date.now()
  })

  return c.json(successResponse({ id, message: 'Trip created' }, 201), 201)
})

app.put('/api/protected/trips/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  const tripId = c.req.param('id')
  const body = await c.req.json()
  
  const validation = updateTripSchema.safeParse(body)
  if (!validation.success) return c.json(errorResponse('Invalid input'), 400)

  const result = await db.update(trips)
    .set({ ...validation.data, updatedAt: Date.now() })
    .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))

  return c.json(successResponse({ message: 'Trip updated' }))
})

app.delete('/api/protected/trips/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  const tripId = c.req.param('id')
  
  await db.delete(trips).where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
  return c.json(successResponse({ message: 'Trip deleted' }))
})

// Wellness Logs
app.get('/api/protected/wellness-logs', async (c) => {
  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  const userLogs = await db.select().from(logs).where(eq(logs.userId, userId)).orderBy(desc(logs.loggedAt))
  return c.json(successResponse({ logs: userLogs }))
})

app.post('/api/protected/wellness-logs', async (c) => {
  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  const body = await c.req.json()
  
  const validation = createWellnessLogSchema.safeParse(body)
  if (!validation.success) return c.json(errorResponse('Invalid input'), 400)

  const id = uuidv4()
  await db.insert(logs).values({
    id,
    userId,
    ...validation.data,
    // FIX 4: Removed `updatedAt: Date.now()` - the DB table (migration 0000) has no
    // updated_at column on wellness_logs, so including it causes an insert failure.
    loggedAt: Date.now(),
  })

  return c.json(successResponse({ id, message: 'Log created' }, 201), 201)
})

app.delete('/api/protected/wellness-logs/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  const logId = c.req.param('id')
  
  await db.delete(logs).where(and(eq(logs.id, logId), eq(logs.userId, userId)))
  return c.json(successResponse({ message: 'Log deleted' }))
})

// Health Metrics
app.get('/api/protected/health-metrics', async (c) => {
  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  const metrics = await db.select().from(healthMetrics).where(eq(healthMetrics.userId, userId)).orderBy(desc(healthMetrics.recordedAt))
  return c.json(successResponse({ metrics }))
})

app.post('/api/protected/health-metrics', async (c) => {
  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  const body = await c.req.json()
  
  const validation = createHealthMetricSchema.safeParse(body)
  if (!validation.success) return c.json(errorResponse('Invalid input'), 400)

  const id = uuidv4()
  await db.insert(healthMetrics).values({
    id,
    userId,
    ...validation.data,
    recordedAt: validation.data.recordedAt || Date.now()
  })

  return c.json(successResponse({ id, message: 'Metric recorded' }, 201), 201)
})

export default app
