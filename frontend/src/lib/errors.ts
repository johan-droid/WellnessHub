export const ERRORS = {
  // Auth errors
  AUTH_FAILED: 'Authentication failed. Please try again.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  TOKEN_MISSING: 'Authentication token was not returned.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  
  // Network errors
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  REQUEST_TIMEOUT: 'Request timed out. Please try again.',

  // Data errors
  DATA_LOAD_FAILED: 'Failed to load data.',
  DATA_SAVE_FAILED: 'Failed to save data.',
  DATA_DELETE_FAILED: 'Failed to delete data.',
  NO_DATA_FOUND: 'No data found.',

  // Form errors
  FORM_VALIDATION_FAILED: 'Please check your input.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  INVALID_EMAIL: 'Please enter a valid email.',
  REQUIRED_FIELD: 'This field is required.',
  
  // Trip/Activity errors
  TRIP_CREATION_FAILED: 'Failed to create trip. Please try again.',
  TRIP_UPDATE_FAILED: 'Failed to update trip. Please try again.',
  TRIP_DELETE_FAILED: 'Failed to delete trip. Please try again.',
  
  // Wellness log errors
  LOG_CREATION_FAILED: 'Failed to create wellness log. Please try again.',
  LOG_UPDATE_FAILED: 'Failed to update wellness log. Please try again.',
  LOG_DELETE_FAILED: 'Failed to delete wellness log. Please try again.',
  
  // Health metric errors
  METRIC_CREATION_FAILED: 'Failed to record health metric. Please try again.',
  METRIC_UPDATE_FAILED: 'Failed to update health metric. Please try again.',
  METRIC_DELETE_FAILED: 'Failed to delete health metric. Please try again.',

  // Generic error
  UNKNOWN_ERROR: 'Something went wrong. Please try again later.',
} as const;

/**
 * Get user-friendly error message from error response
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Check if error message is one of our constants
    const errorValue = Object.values(ERRORS).find(
      (msg) => msg === error.message
    );
    if (errorValue) return errorValue;
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return ERRORS.UNKNOWN_ERROR;
}

/**
 * Map API error status codes to user-friendly messages
 */
export function getErrorByStatusCode(status: number): string {
  switch (status) {
    case 400:
      return ERRORS.FORM_VALIDATION_FAILED;
    case 401:
    case 403:
      return ERRORS.SESSION_EXPIRED;
    case 404:
      return ERRORS.NO_DATA_FOUND;
    case 500:
    case 502:
    case 503:
      return ERRORS.SERVER_ERROR;
    case 0:
      return ERRORS.NETWORK_ERROR;
    default:
      return ERRORS.UNKNOWN_ERROR;
  }
}
