import { z } from 'zod';

// ...existing code...
// Existing schemas

// ...existing code...
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase')
  .regex(/[a-z]/, 'Must contain lowercase')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[!@#$%^&*]/, 'Must contain special character'),
  firstName: z.string().max(100).optional().nullable(),
  lastName: z.string().max(100).optional().nullable(),
});
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const createTripSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional().nullable(),
  destination: z.string().max(300).optional().nullable(),
  startDate: z.number().int().positive().optional().nullable(),
  endDate: z.number().int().positive().optional().nullable(),
  budget: z.number().positive().optional().nullable(),
  status: z.enum(['planning', 'ongoing', 'completed', 'archived']).default('planning'),
});

export const updateTripSchema = createTripSchema.partial();
export const createActivitySchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  description: z.string().max(2000).optional().nullable(),
  location: z.string().max(500).optional().nullable(),
  scheduledDate: z.number().int().positive().optional().nullable(),
  estimatedDuration: z.number().int().min(0).optional().nullable(),
  category: z.enum(['wellness', 'sightseeing', 'dining', 'transport', 'accommodation', 'other']).optional().nullable(),
});

export const updateActivitySchema = createActivitySchema.partial().extend({
  completed: z.boolean().optional(),
});

export const createWellnessLogSchema = z.object({
  tripId: z.string().optional().nullable(),
  type: z.string().min(1, 'Type is required'),
  notes: z.string().max(2000).optional().nullable(),
  // Accept 1-10 scale (frontend may send 1-5 or 1-10)
  rating: z.number().int().min(1).max(10).optional().nullable(),
  duration: z.number().int().min(0).optional().nullable(),
  // JSON string for complex data (mood tags, exercise details etc.)
  value: z.string().optional().nullable(),
  loggedAt: z.number().int().positive().optional(),
});

export const createHealthMetricSchema = z.object({
  metricType: z.string().min(1, 'Metric type is required'),
  value: z.number().positive('Value is required'),
  unit: z.string().min(1, 'Unit is required').max(20),
  recordedAt: z.number().int().positive().optional(),
});

export const updateUserProfileSchema = z.object({
  firstName: z.string().max(100).optional().nullable(),
  lastName: z.string().max(100).optional().nullable(),
  profilePicture: z.string().url('Must be a valid URL').optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
});

export const updateAppSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().min(2).max(50).optional(),
  units: z.enum(['metric', 'imperial']).optional(),
  twoFactorEnabled: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
  connectedGoogle: z.boolean().optional(),
  connectedApple: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase')
  .regex(/[a-z]/, 'Must contain lowercase')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[!@#$%^&*]/, 'Must contain special character'),
});
export const verifyTwoFactorSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Code must be a 6-digit number'),
});
export const disableTwoFactorSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
});
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[!@#$%^&*]/, 'Must contain special character'),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const createTripSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  destination: z.string().optional().nullable(),
  startDate: z.number().optional().nullable(),
  endDate: z.number().optional().nullable(),
  budget: z.number().optional().nullable(),
  status: z.enum(['planning', 'ongoing', 'completed', 'archived']).default('planning'),
});

export const updateTripSchema = createTripSchema.partial();

export const createActivitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  scheduledDate: z.number().optional().nullable(),
  estimatedDuration: z.number().optional().nullable(),
  category: z.string().optional().nullable(),
});

export const updateActivitySchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  scheduledDate: z.number().optional().nullable(),
  estimatedDuration: z.number().optional().nullable(),
  category: z.string().optional().nullable(),
  completed: z.boolean().optional(),
});

export const createWellnessLogSchema = z.object({
  tripId: z.string().optional().nullable(),
  type: z.string().min(1, 'Type is required'),
  value: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  rating: z.number().min(1).max(10).optional().nullable(),
  duration: z.number().optional().nullable(),
  loggedAt: z.number().optional().nullable(),
});

export const createHealthMetricSchema = z.object({
  metricType: z.string().min(1, 'Metric type is required'),
  value: z.number().positive('Value is required'),
  unit: z.string().min(1, 'Unit is required'),
  recordedAt: z.number().optional(),
});

export const updateUserProfileSchema = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  profilePicture: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
});

export const updateAppSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().min(2).max(50).optional(),
  units: z.enum(['metric', 'imperial']).optional(),
  twoFactorEnabled: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
  connectedGoogle: z.boolean().optional(),
  connectedApple: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[!@#$%^&*]/, 'Must contain special character'),
});

export const verifyTwoFactorSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Code must be a 6-digit number'),
});

export const disableTwoFactorSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
});
