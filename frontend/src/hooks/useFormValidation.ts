import { useState, useCallback } from 'react';
import { z, ZodSchema } from 'zod';

interface ValidationError {
  field: string;
  message: string;
}

/**
 * Custom hook for form validation using Zod schemas
 */
export function useFormValidation<T>(schema: ZodSchema) {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const validate = useCallback(
    (data: unknown): data is T => {
      try {
        schema.parse(data);
        setErrors([]);
        return true;
      } catch (err) {
        if (err instanceof z.ZodError) {
          const validationErrors = err.issues.map((issue: z.ZodIssue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          }));
          setErrors(validationErrors);
        }
        return false;
      }
    },
    [schema]
  );

  const getFieldError = useCallback(
    (fieldName: string): string | undefined => {
      return errors.find((e) => e.field === fieldName)?.message;
    },
    [errors]
  );

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return { validate, errors, getFieldError, clearErrors };
}

/**
 * Safely parse data with Zod schema and return result or error message
 */
export function parseSchema<T>(
  schema: ZodSchema,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const parsed = schema.parse(data) as T;
    return { success: true, data: parsed };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues[0]?.message || 'Validation failed',
      };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}
