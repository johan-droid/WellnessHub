// Type guards for safer type narrowing

type WellnessLog = {
  id: string;
  tripId: string | null;
  type: string;
  value: string | null;
  rating: number | null;
  duration: number | null;
  notes: string | null;
  loggedAt: number;
};

type HealthMetric = {
  id: string;
  metricType: string;
  value: number | string;
  unit: string;
  recordedAt: number;
};

/**
 * Type guard for mood logs - ensures rating is a number
 */
export function isMoodLog(log: WellnessLog): log is WellnessLog & { rating: number } {
  return log.type.toLowerCase() === 'mood' && typeof log.rating === 'number';
}

/**
 * Type guard for sleep logs - ensures duration is a number
 */
export function isSleepLog(log: WellnessLog): log is WellnessLog & { duration: number } {
  return log.type.toLowerCase() === 'sleep' && typeof log.duration === 'number';
}

/**
 * Type guard for exercise logs - ensures duration is a number
 */
export function isExerciseLog(log: WellnessLog): log is WellnessLog & { duration: number } {
  return log.type.toLowerCase() === 'exercise' && typeof log.duration === 'number';
}

/**
 * Type guard for logs with numeric values
 */
export function isNumericLog(log: WellnessLog): log is WellnessLog & { rating: number } | WellnessLog & { duration: number } {
  return typeof log.rating === 'number' || typeof log.duration === 'number';
}

/**
 * Type guard for health metrics with numeric values
 */
export function isNumericMetric(metric: HealthMetric): metric is HealthMetric & { value: number } {
  return typeof metric.value === 'number';
}

/**
 * Type guard for health metrics with string values
 */
export function isStringMetric(metric: HealthMetric): metric is HealthMetric & { value: string } {
  return typeof metric.value === 'string';
}
