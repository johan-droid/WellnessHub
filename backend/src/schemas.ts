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
  startTime: z.number().optional().nullable(),
  endTime: z.number().optional().nullable(),
  activityType: z.string().optional().nullable(),
});

export const createWellnessLogSchema = z.object({
  tripId: z.string().optional().nullable(),
  type: z.string().min(1, 'Type is required'),
  notes: z.string().optional().nullable(),
  rating: z.number().min(1).max(5).optional().nullable(),
  duration: z.number().optional().nullable(),
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
