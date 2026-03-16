import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// ============ USERS TABLE ============
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  profilePicture: text('profile_picture'), // URL to stored image
  bio: text('bio'),
  createdAt: integer('created_at').notNull().default(Date.now()),
  updatedAt: integer('updated_at').notNull().default(Date.now()),
});

// ============ TRIPS TABLE ============
export const trips = sqliteTable('trips', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  destination: text('destination'),
  description: text('description'),
  startDate: integer('start_date'), // Unix timestamp
  endDate: integer('end_date'), // Unix timestamp
  status: text('status').default('planning'), // planning | ongoing | completed | archived
  budget: real('budget'), // Optional budget tracking
  createdAt: integer('created_at').notNull().default(Date.now()),
  updatedAt: integer('updated_at').notNull().default(Date.now()),
});

// ============ WELLNESS LOGS TABLE ============
export const wellnessLogs = sqliteTable('wellness_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  tripId: text('trip_id').references(() => trips.id), // Optional: link to specific trip
  type: text('type').notNull(), // symptom | period | mood | sleep | exercise | nutrition | meditation | vitals
  
  // Flexible value storage
  value: text('value'), // JSON string for complex data
  rating: integer('rating'), // 1-10 scale for mood/stress/energy
  duration: integer('duration'), // Minutes for exercise/meditation/sleep
  notes: text('notes'),
  
  loggedAt: integer('logged_at').notNull().$defaultFn(() => Date.now()),
  createdAt: integer('created_at').notNull().$defaultFn(() => Date.now()),
  updatedAt: integer('updated_at').notNull().$defaultFn(() => Date.now()),
});

// Backward-compatible alias used by existing route handlers.
export const logs = wellnessLogs;

// ============ TRIP ACTIVITIES TABLE ============
export const tripActivities = sqliteTable('trip_activities', {
  id: text('id').primaryKey(),
  tripId: text('trip_id').notNull().references(() => trips.id),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location'),
  scheduledDate: integer('scheduled_date'),
  estimatedDuration: integer('estimated_duration'), // Minutes
  category: text('category'), // wellness | sightseeing | dining | transport | accommodation
  completed: integer('completed').default(0), // 0 | 1 (boolean)
  createdAt: integer('created_at').notNull().$defaultFn(() => Date.now()),
  updatedAt: integer('updated_at').notNull().$defaultFn(() => Date.now()),
});

// ============ HEALTH METRICS TABLE ============
export const healthMetrics = sqliteTable('health_metrics', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  metricType: text('metric_type').notNull(), // heart_rate | blood_pressure | weight | water_intake | steps
  value: real('value').notNull(),
  unit: text('unit').notNull(), // bpm, mmHg, kg, ml, steps
  recordedAt: integer('recorded_at').notNull().default(Date.now()),
  createdAt: integer('created_at').notNull().default(Date.now()),
});

// ============ APP SETTINGS TABLE ============
export const appSettings = sqliteTable('app_settings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id),
  theme: text('theme').notNull().default('light'), // light | dark | system
  language: text('language').notNull().default('English (US)'),
  units: text('units').notNull().default('metric'), // metric | imperial
  twoFactorEnabled: integer('two_factor_enabled').notNull().default(0), // 0 | 1
  notificationsEnabled: integer('notifications_enabled').notNull().default(1), // 0 | 1
  connectedGoogle: integer('connected_google').notNull().default(0), // 0 | 1
  connectedApple: integer('connected_apple').notNull().default(0), // 0 | 1
  createdAt: integer('created_at').notNull().default(Date.now()),
  updatedAt: integer('updated_at').notNull().default(Date.now()),
});

// ============ TWO-FACTOR AUTH TABLE ============
export const twoFactorAuth = sqliteTable('two_factor_auth', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id),
  secret: text('secret').notNull(),
  backupCode: text('backup_code').notNull(),
  enabled: integer('enabled').notNull().default(0), // 0 | 1
  createdAt: integer('created_at').notNull().default(Date.now()),
  updatedAt: integer('updated_at').notNull().default(Date.now()),
});

// ============ VALIDATION SCHEMAS (Zod) ============

// User registration schema
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character'),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// User login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Create trip schema
export const createTripSchema = z.object({
  title: z.string().min(1, 'Trip title required').max(200),
  destination: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  startDate: z.number().optional().nullable(), // Unix timestamp
  endDate: z.number().optional().nullable(),
  budget: z.number().optional().nullable(),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;

// Update trip schema
export const updateTripSchema = createTripSchema.partial();

export type UpdateTripInput = z.infer<typeof updateTripSchema>;

// Create wellness log schema
export const createWellnessLogSchema = z.object({
  type: z.enum([
    'symptom',
    'period',
    'mood',
    'sleep',
    'exercise',
    'nutrition',
    'meditation',
    'vitals',
  ]),
  tripId: z.string().optional().nullable(),
  value: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(10).optional().nullable(),
  duration: z.number().int().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
  loggedAt: z.number().optional(), // Unix timestamp
});

export type CreateWellnessLogInput = z.infer<typeof createWellnessLogSchema>;

// Create health metric schema
export const createHealthMetricSchema = z.object({
  metricType: z.enum([
    'heart_rate',
    'blood_pressure',
    'weight',
    'water_intake',
    'steps',
  ]),
  value: z.number().positive(),
  unit: z.string().min(1),
});

export type CreateHealthMetricInput = z.infer<typeof createHealthMetricSchema>;

// Update user profile schema
export const updateUserProfileSchema = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  profilePicture: z.string().url().optional().nullable(),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;

