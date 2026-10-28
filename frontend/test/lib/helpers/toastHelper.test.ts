import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  showLoadingToast,
} from '@/lib/helpers/toastHelper';
import { toast } from 'sonner';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(),
  },
}));

describe('toastHelper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('showSuccessToast', () => {
    it('shows toast with valid message', () => {
      showSuccessToast('Success message');
      expect(toast.success).toHaveBeenCalledWith('Success message', undefined);
    });

    it('shows toast with options', () => {
      showSuccessToast('Success', { duration: 5000 });
      expect(toast.success).toHaveBeenCalledWith('Success', { duration: 5000 });
    });

    it('does not show toast for null message', () => {
      showSuccessToast(null);
      expect(toast.success).not.toHaveBeenCalled();
    });

    it('does not show toast for undefined message', () => {
      showSuccessToast(undefined);
      expect(toast.success).not.toHaveBeenCalled();
    });

    it('does not show toast for empty string', () => {
      showSuccessToast('');
      expect(toast.success).not.toHaveBeenCalled();
    });

    it('does not show toast for whitespace only', () => {
      showSuccessToast('   ');
      expect(toast.success).not.toHaveBeenCalled();
    });

    it('shows toast with trimmed whitespace', () => {
      showSuccessToast('  Message  ');
      expect(toast.success).toHaveBeenCalledWith('  Message  ', undefined);
    });
  });

  describe('showErrorToast', () => {
    it('shows toast for plain string error', () => {
      showErrorToast('Error message');
      expect(toast.error).toHaveBeenCalledWith('Error message');
    });

    it('does not show toast for empty string error', () => {
      showErrorToast('');
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('extracts error from API response with errors array', () => {
      const error = {
        response: {
          data: {
            errors: ['Error 1', 'Error 2'],
          },
        },
      };
      showErrorToast(error);
      expect(toast.error).toHaveBeenCalledWith('Error 1, Error 2');
    });

    it('filters empty strings from errors array', () => {
      const error = {
        response: {
          data: {
            errors: ['Error 1', '', '  ', 'Error 2'],
          },
        },
      };
      showErrorToast(error);
      expect(toast.error).toHaveBeenCalledWith('Error 1, Error 2');
    });

    it('extracts error from API response with errors string', () => {
      const error = {
        response: {
          data: {
            errors: 'Single error message',
          },
        },
      };
      showErrorToast(error);
      expect(toast.error).toHaveBeenCalledWith('Single error message');
    });

    it('falls back to message field when errors is empty array', () => {
      const error = {
        response: {
          data: {
            errors: [],
            message: 'Fallback message',
          },
        },
      };
      showErrorToast(error);
      expect(toast.error).toHaveBeenCalledWith('Fallback message');
    });

    it('falls back to message field when errors is whitespace', () => {
      const error = {
        response: {
          data: {
            errors: '   ',
            message: 'Fallback message',
          },
        },
      };
      showErrorToast(error);
      expect(toast.error).toHaveBeenCalledWith('Fallback message');
    });

    it('extracts message from data.message', () => {
      const error = {
        response: {
          data: {
            message: 'Error from message field',
          },
        },
      };
      showErrorToast(error);
      expect(toast.error).toHaveBeenCalledWith('Error from message field');
    });

    it('falls back to error.message for axios errors', () => {
      const error = {
        message: 'Network Error',
      };
      showErrorToast(error);
      expect(toast.error).toHaveBeenCalledWith('Network Error');
    });

    it('does not show toast when no valid message found', () => {
      const error = {
        response: {
          data: {},
        },
      };
      showErrorToast(error);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('handles undefined error', () => {
      showErrorToast(undefined);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('handles null error', () => {
      showErrorToast(null);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('trims whitespace from extracted errors', () => {
      const error = {
        response: {
          data: {
            errors: '  Error with spaces  ',
          },
        },
      };
      showErrorToast(error);
      expect(toast.error).toHaveBeenCalledWith('Error with spaces');
    });

    it('trims whitespace from message field', () => {
      const error = {
        response: {
          data: {
            message: '  Message with spaces  ',
          },
        },
      };
      showErrorToast(error);
      expect(toast.error).toHaveBeenCalledWith('Message with spaces');
    });

    it('handles errors array with non-string values', () => {
      const error = {
        response: {
          data: {
            errors: ['Valid error', 123, null, undefined, {}],
          },
        },
      };
      showErrorToast(error);
      expect(toast.error).toHaveBeenCalledWith('Valid error');
    });

    it('handles exception during error extraction', () => {
      const error = {
        get response() {
          throw new Error('Getter error');
        },
      };
      showErrorToast(error);
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  describe('showInfoToast', () => {
    it('shows toast with valid message', () => {
      showInfoToast('Info message');
      expect(toast.info).toHaveBeenCalledWith('Info message');
    });

    it('does not show toast for null message', () => {
      showInfoToast(null);
      expect(toast.info).not.toHaveBeenCalled();
    });

    it('does not show toast for undefined message', () => {
      showInfoToast(undefined);
      expect(toast.info).not.toHaveBeenCalled();
    });

    it('does not show toast for empty string', () => {
      showInfoToast('');
      expect(toast.info).not.toHaveBeenCalled();
    });

    it('does not show toast for whitespace only', () => {
      showInfoToast('   ');
      expect(toast.info).not.toHaveBeenCalled();
    });
  });

  describe('showWarningToast', () => {
    it('shows toast with valid message', () => {
      showWarningToast('Warning message');
      expect(toast.warning).toHaveBeenCalledWith('Warning message');
    });

    it('does not show toast for null message', () => {
      showWarningToast(null);
      expect(toast.warning).not.toHaveBeenCalled();
    });

    it('does not show toast for undefined message', () => {
      showWarningToast(undefined);
      expect(toast.warning).not.toHaveBeenCalled();
    });

    it('does not show toast for empty string', () => {
      showWarningToast('');
      expect(toast.warning).not.toHaveBeenCalled();
    });

    it('does not show toast for whitespace only', () => {
      showWarningToast('   ');
      expect(toast.warning).not.toHaveBeenCalled();
    });
  });

  describe('showLoadingToast', () => {
    it('shows toast with valid message', () => {
      const mockId = 'toast-123';
      vi.mocked(toast.loading).mockReturnValue(mockId as any);

      const result = showLoadingToast('Loading...');
      expect(toast.loading).toHaveBeenCalledWith('Loading...');
      expect(result).toBe(mockId);
    });

    it('returns null for null message', () => {
      const result = showLoadingToast(null);
      expect(toast.loading).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('returns null for undefined message', () => {
      const result = showLoadingToast(undefined);
      expect(toast.loading).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = showLoadingToast('');
      expect(toast.loading).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('returns null for whitespace only', () => {
      const result = showLoadingToast('   ');
      expect(toast.loading).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
