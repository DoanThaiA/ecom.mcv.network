/**
 * Toast Helper
 * Helper functions to show notifications with validation
 * Use this helper in ALL parts of the application (Saga, Components, Services)
 * DO NOT import toast from 'sonner' directly
 */

import { toast } from 'sonner';

/**
 * Check if message is valid (not empty, null, or undefined)
 */
const isValidMessage = (message?: string | null): message is string => {
  return message !== null && message !== undefined && message.trim() !== '';
};

/**
 * Extract error message from API response or axios error
 * Supports multiple error response formats:
 * - { errors: ["error1", "error2"] } - array of errors
 * - { errors: "error message" } - string error
 * - { message: "error message" } - message only
 */
export const getErrorMessage = (error: any): string | undefined => {
  try {
    const data = error?.response?.data;

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
    if (typeof error?.message === 'string' && error.message.trim()) {
      return error.message.trim();
    }
  } catch {
    // Silent fail - return undefined if any unexpected error occurs
  }

  return undefined;
};

/**
 * Show success toast if message is not empty
 */
export const showSuccessToast = (
  message?: string | null,
  options?: { duration?: number }
) => {
  if (isValidMessage(message)) {
    toast.success(message, options);
  }
};

/**
 * Show error toast if message is not empty
 * Special handling: extracts error message from API response or axios error
 * Also accepts plain string messages
 */
export const showErrorToast = (error: any) => {
  // If error is a plain string, show it directly
  if (typeof error === 'string') {
    if (isValidMessage(error)) {
      toast.error(error);
    }
    return;
  }

  // Otherwise extract error message from API response
  const errorMessage = getErrorMessage(error);
  if (isValidMessage(errorMessage)) {
    toast.error(errorMessage);
  }
};

/**
 * Show info toast if message is not empty
 */
export const showInfoToast = (message?: string | null) => {
  if (isValidMessage(message)) {
    toast.info(message);
  }
};

/**
 * Show warning toast if message is not empty
 */
export const showWarningToast = (message?: string | null) => {
  if (isValidMessage(message)) {
    toast.warning(message);
  }
};

/**
 * Show loading toast if message is not empty
 */
export const showLoadingToast = (message?: string | null) => {
  if (isValidMessage(message)) {
    return toast.loading(message);
  }
  return null;
};
