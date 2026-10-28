import { toast } from 'react-toastify';

/**
 * Display success toast notification
 * @param message - Success message to display
 */
export const showSuccess = (message: string): void => {
  toast.success(message);
};

/**
 * Display info toast notification
 * @param message - Info message to display
 */
export const showInfo = (message: string): void => {
  toast.info(message);
};

/**
 * Display warning toast notification
 * @param message - Warning message to display
 */
export const showWarning = (message: string): void => {
  toast.warning(message);
};

/**
 * Extract error message from API response or axios error
 * Supports multiple error response formats:
 * - { errors: ["error1", "error2"] } - array of errors
 * - { errors: "error message" } - string error
 * - { message: "error message" } - message only
 */
const getErrorMessage = (error: unknown): string | undefined => {
  try {
    const err = error as any;
    const data = err?.response?.data;

    if (data) {
      // Prioritize errors field (more detailed)
      if (data.errors) {
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          // Case 1: errors is array - filter valid strings and join
          const validErrors = data.errors
            .filter((e: unknown) => typeof e === 'string' && e.trim())
            .map((e: string) => e.trim());
          if (validErrors.length > 0) {
            return validErrors.join(', ');
          }
        } else if (typeof data.errors === 'string' && data.errors.trim()) {
          // Case 2: errors is string
          return data.errors.trim();
        }
      }
      // Case 3: fallback to message
      if (typeof data.message === 'string' && data.message.trim()) {
        return data.message.trim();
      }
    }

    // Final fallback: error.message (axios error message)
    if (typeof err?.message === 'string' && err.message.trim()) {
      return err.message.trim();
    }
  } catch {
    // Silent fail - return undefined if any unexpected error occurs
  }

  return undefined;
};

/**
 * Display error toast notification
 * Handles both API errors and plain string messages
 * @param error - Error object from API or plain string message
 */
export const showError = (error: unknown): void => {
  let errorMessage = 'An error occurred';

  if (typeof error === 'string') {
    // If error is a plain string
    errorMessage = error;
  } else {
    // Extract from API response using helper
    const extracted = getErrorMessage(error);
    if (extracted) {
      errorMessage = extracted;
    }
  }

  toast.error(errorMessage);
};
