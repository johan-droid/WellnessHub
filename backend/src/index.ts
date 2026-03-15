import { Hono } from 'hono'
import type { D1Database } from '@cloudflare/workers-types'
import { cors } from 'hono/cors'
import { drizzle } from 'drizzle-orm/d1'
import { v4 as uuidv4 } from 'uuid'
import { sign, verify } from 'hono/jwt'
import { eq } from 'drizzle-orm'
import { users } from './db/schema'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

type Variables = {
  userId: string
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Middleware
app.use('/*', cors({
  origin: (origin) => {
    // Allow any origin from Vercel preview environments, localhost, or production URLs
    // In strict production, lock this down to the specific frontend domain
    return origin ? origin : 'http://localhost:3000'
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}))

// Simple auth middleware
app.use('/api/protected/*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid authorization header' }, 401)
  }
  const token = authHeader.split(' ')[1]
  try {
    const payload = await verify(token, c.env.JWT_SECRET || 'fallback-secret-key-dev', 'HS256')
    c.set('userId', payload.sub as string)
    await next()
  } catch (err) {
    return c.json({ error: 'Unauthorized token' }, 401)
  }
})

app.get('/', (c) => c.json({ status: 'API is running' }))

// Public Status Route
app.get('/api/status', (c) => c.json({ status: 'Platform is operational on Cloudflare Edge!' }))

// Register
app.post('/api/auth/register', async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()

  // Basic validation
  if (!body.email || !body.password) {
    return c.json({ error: 'Email and password required' }, 400)
  }
  
  // Hash password natively using Web Crypto API or external polyfill (simulated here for brevity)
  const encoder = new TextEncoder()
  const data = encoder.encode(body.password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  const id = uuidv4()

  try {
    await db.insert(users).values({
      id,
      email: body.email,
      passwordHash,
      firstName: body.firstName,
      lastName: body.lastName,
    })
    
    const token = await sign({ sub: id, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, c.env.JWT_SECRET || 'fallback-secret-key-dev')
    return c.json({ message: 'User created successfully', token })
  } catch (e: any) {
    return c.json({ error: 'Registration failed or email exists' }, 400)
  }
})

// Login
app.post('/api/auth/login', async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()

  if (!body.email || !body.password) return c.json({ error: 'Credentials required' }, 400)

  const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1)
  
  if (!user) return c.json({ error: 'Invalid credentials' }, 401)

  const encoder = new TextEncoder()
  const data = encoder.encode(body.password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const providedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  if (user.passwordHash !== providedHash) return c.json({ error: 'Invalid credentials' }, 401)

  const token = await sign({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, c.env.JWT_SECRET || 'fallback-secret-key-dev')
  return c.json({ message: 'Logged in successfully', token })
})

// Protected Profile
app.get('/api/protected/me', async (c) => {
  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  
  const [user] = await db.select({
    id: users.id,
    email: users.email,
    firstName: users.firstName,
    lastName: users.lastName,
    createdAt: users.createdAt
  }).from(users).where(eq(users.id, userId)).limit(1)

  if (!user) return c.json({ error: 'User not found' }, 404)
  return c.json({ user })
})

export default app
