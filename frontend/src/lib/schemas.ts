import { z } from 'zod';

// ============ AUTH SCHEMAS ============
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[!@#$%^&*]/, 'Password must contain special character'),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ============ HEALTH METRIC SCHEMAS ============
export const heartRateSchema = z.object({
  bpm: z.number().min(40, 'BPM must be at least 40').max(220, 'BPM must not exceed 220'),
  time: z.string().optional(),
  state: z.enum(['Resting', 'Post-Workout']),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
});

export const weightSchema = z.object({
  value: z.number().positive('Weight must be positive'),
  unit: z.enum(['kg', 'lbs']),
  dateTime: z.string().optional(),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
});

export const bloodPressureSchema = z.object({
  systolic: z.number().min(60).max(200),
  diastolic: z.number().min(40).max(130),
  time: z.string().optional(),
  notes: z.string().max(500).optional(),
}).refine((data) => data.systolic > data.diastolic, {
  message: 'Systolic must be greater than diastolic',
  path: ['systolic'],
});

export const stepsSchema = z.object({
  steps: z.number().int().min(0, 'Steps must be non-negative'),
  date: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const waterIntakeSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  unit: z.enum(['ml', 'L', 'oz']),
  time: z.string().optional(),
  notes: z.string().max(500).optional(),
});

// ============ WELLNESS LOG SCHEMAS ============
export const moodLogSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(10, 'Rating must not exceed 10'),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
  tripId: z.string().optional().nullable(),
});

export const sleepLogSchema = z.object({
  hours: z.number().min(0.5, 'Sleep must be at least 0.5 hours').max(24, 'Sleep cannot exceed 24 hours'),
  quality: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(500).optional(),
  tripId: z.string().optional().nullable(),
});

export const exerciseLogSchema = z.object({
  duration: z.number().int().min(1, 'Duration must be at least 1 minute'),
  intensity: z.enum(['Low', 'Moderate', 'High']),
  activity: z.string().min(1, 'Activity is required').max(100),
  notes: z.string().max(500).optional(),
  tripId: z.string().optional().nullable(),
});

export const nutritionLogSchema = z.object({
  mealType: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack']),
  quality: z.number().int().min(1).max(5),
  notes: z.string().max(500).optional(),
  tripId: z.string().optional().nullable(),
});

export const meditationLogSchema = z.object({
  duration: z.number().int().min(1, 'Duration must be at least 1 minute'),
  type: z.enum(['Breathing', 'Mindfulness', 'Yoga', 'Other']),
  notes: z.string().max(500).optional(),
  tripId: z.string().optional().nullable(),
});

// ============ TRIP SCHEMAS ============
export const createTripSchema = z.object({
  title: z.string().min(1, 'Trip title is required').max(200, 'Title must be 200 characters or less'),
  destination: z.string().optional().nullable(),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional().nullable(),
  startDate: z.number().optional().nullable(),
  endDate: z.number().optional().nullable(),
  budget: z.number().positive().optional().nullable(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.startDate < data.endDate;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const updateTripSchema = createTripSchema.partial();

// ============ PROFILE SCHEMAS ============
export const updateProfileSchema = z.object({
  firstName: z.string().max(100).optional().nullable(),
  lastName: z.string().max(100).optional().nullable(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional().nullable(),
  profilePicture: z.string().url('Must be a valid URL').optional().nullable(),
});

// ============ TYPE EXPORTS ============
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type HeartRateInput = z.infer<typeof heartRateSchema>;
export type WeightInput = z.infer<typeof weightSchema>;
export type BloodPressureInput = z.infer<typeof bloodPressureSchema>;
export type StepsInput = z.infer<typeof stepsSchema>;
export type WaterIntakeInput = z.infer<typeof waterIntakeSchema>;
export type MoodLogInput = z.infer<typeof moodLogSchema>;
export type SleepLogInput = z.infer<typeof sleepLogSchema>;
export type ExerciseLogInput = z.infer<typeof exerciseLogSchema>;
export type NutritionLogInput = z.infer<typeof nutritionLogSchema>;
export type MeditationLogInput = z.infer<typeof meditationLogSchema>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
