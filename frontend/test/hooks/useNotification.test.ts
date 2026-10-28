import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNotification } from '@/hooks/useNotification';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(),
    promise: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe('useNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('success', () => {
    it('shows success toast with message only', () => {
      const { result } = renderHook(() => useNotification());

      result.current.success('Operation successful');

      expect(toast.success).toHaveBeenCalledWith('Operation successful', {
        id: 'operation-successful',
        duration: undefined,
      });
    });

    it('shows success toast with title and description', () => {
      const { result } = renderHook(() => useNotification());

      result.current.success('Your changes have been saved', {
        title: 'Success',
      });

      expect(toast.success).toHaveBeenCalledWith('Success', {
        id: 'success-your-changes-have-been-saved',
        description: 'Your changes have been saved',
        duration: undefined,
      });
    });

    it('shows success toast with custom duration', () => {
      const { result } = renderHook(() => useNotification());

      result.current.success('Done', { duration: 5000 });

      expect(toast.success).toHaveBeenCalledWith('Done', {
        id: 'done',
        duration: 5000,
      });
    });

    it('shows success toast with title, description, and duration', () => {
      const { result } = renderHook(() => useNotification());

      result.current.success('All files uploaded', {
        title: 'Upload Complete',
        duration: 3000,
      });

      expect(toast.success).toHaveBeenCalledWith('Upload Complete', {
        id: 'upload-complete-all-files-uploaded',
        description: 'All files uploaded',
        duration: 3000,
      });
    });

    it('generates consistent IDs for same messages', () => {
      const { result } = renderHook(() => useNotification());

      result.current.success('Test Message');
      result.current.success('Test Message');

      expect(toast.success).toHaveBeenCalledTimes(2);
      const firstCall = vi.mocked(toast.success).mock.calls[0][1];
      const secondCall = vi.mocked(toast.success).mock.calls[1][1];
      expect(firstCall?.id).toBe(secondCall?.id);
      expect(firstCall?.id).toBe('test-message');
    });
  });

  describe('error', () => {
    it('shows error toast with message only', () => {
      const { result } = renderHook(() => useNotification());

      result.current.error('Something went wrong');

      expect(toast.error).toHaveBeenCalledWith('Something went wrong', {
        id: 'something-went-wrong',
        duration: undefined,
      });
    });

    it('shows error toast with title and description', () => {
      const { result } = renderHook(() => useNotification());

      result.current.error('Failed to save changes', {
        title: 'Error',
      });

      expect(toast.error).toHaveBeenCalledWith('Error', {
        id: 'error-failed-to-save-changes',
        description: 'Failed to save changes',
        duration: undefined,
      });
    });

    it('shows error toast with custom duration', () => {
      const { result } = renderHook(() => useNotification());

      result.current.error('Network error', { duration: 10000 });

      expect(toast.error).toHaveBeenCalledWith('Network error', {
        id: 'network-error',
        duration: 10000,
      });
    });

    it('shows error toast with all options', () => {
      const { result } = renderHook(() => useNotification());

      result.current.error('Connection failed', {
        title: 'Connection Error',
        duration: 8000,
      });

      expect(toast.error).toHaveBeenCalledWith('Connection Error', {
        id: 'connection-error-connection-failed',
        description: 'Connection failed',
        duration: 8000,
      });
    });
  });

  describe('info', () => {
    it('shows info toast with message only', () => {
      const { result } = renderHook(() => useNotification());

      result.current.info('New update available');

      expect(toast.info).toHaveBeenCalledWith('New update available', {
        id: 'new-update-available',
        duration: undefined,
      });
    });

    it('shows info toast with title and description', () => {
      const { result } = renderHook(() => useNotification());

      result.current.info('Click here to learn more', {
        title: 'Information',
      });

      expect(toast.info).toHaveBeenCalledWith('Information', {
        id: 'information-click-here-to-learn-more',
        description: 'Click here to learn more',
        duration: undefined,
      });
    });

    it('shows info toast with custom duration', () => {
      const { result } = renderHook(() => useNotification());

      result.current.info('Tip of the day', { duration: 7000 });

      expect(toast.info).toHaveBeenCalledWith('Tip of the day', {
        id: 'tip-of-the-day',
        duration: 7000,
      });
    });
  });

  describe('warning', () => {
    it('shows warning toast with message only', () => {
      const { result } = renderHook(() => useNotification());

      result.current.warning('Please check your input');

      expect(toast.warning).toHaveBeenCalledWith('Please check your input', {
        id: 'please-check-your-input',
        duration: undefined,
      });
    });

    it('shows warning toast with title and description', () => {
      const { result } = renderHook(() => useNotification());

      result.current.warning('Some fields are empty', {
        title: 'Warning',
      });

      expect(toast.warning).toHaveBeenCalledWith('Warning', {
        id: 'warning-some-fields-are-empty',
        description: 'Some fields are empty',
        duration: undefined,
      });
    });

    it('shows warning toast with custom duration', () => {
      const { result } = renderHook(() => useNotification());

      result.current.warning('Session expiring soon', { duration: 15000 });

      expect(toast.warning).toHaveBeenCalledWith('Session expiring soon', {
        id: 'session-expiring-soon',
        duration: 15000,
      });
    });
  });

  describe('loading', () => {
    it('shows loading toast with message only', () => {
      const { result } = renderHook(() => useNotification());

      result.current.loading('Processing...');

      expect(toast.loading).toHaveBeenCalledWith('Processing...', {
        id: 'processing...',
      });
    });

    it('shows loading toast with title and description', () => {
      const { result } = renderHook(() => useNotification());

      result.current.loading('Please wait', {
        title: 'Loading',
      });

      expect(toast.loading).toHaveBeenCalledWith('Loading', {
        id: 'loading-please-wait',
        description: 'Please wait',
      });
    });

    it('ignores duration option for loading toast', () => {
      const { result } = renderHook(() => useNotification());

      result.current.loading('Uploading files', {
        duration: 5000, // Should be ignored
      });

      expect(toast.loading).toHaveBeenCalledWith('Uploading files', {
        id: 'uploading-files',
      });
    });
  });

  describe('promise', () => {
    it('wraps promise with toast notifications', async () => {
      const { result } = renderHook(() => useNotification());
      const testPromise = Promise.resolve('success');

      result.current.promise(testPromise, {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error!',
      });

      expect(toast.promise).toHaveBeenCalledWith(testPromise, {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error!',
      });
    });

    it('supports function for success message', async () => {
      const { result } = renderHook(() => useNotification());
      const testPromise = Promise.resolve({ data: 'test' });

      result.current.promise(testPromise, {
        loading: 'Loading...',
        success: (data) => `Success with ${data}`,
        error: 'Error!',
      });

      expect(toast.promise).toHaveBeenCalledWith(testPromise, {
        loading: 'Loading...',
        success: expect.any(Function),
        error: 'Error!',
      });
    });

    it('supports function for error message', () => {
      const { result } = renderHook(() => useNotification());
      const testPromise = Promise.reject(new Error('fail'));

      // Catch the rejection to prevent unhandled rejection
      testPromise.catch(() => {});

      result.current.promise(testPromise, {
        loading: 'Loading...',
        success: 'Success!',
        error: (err) => `Error: ${err.message}`,
      });

      expect(toast.promise).toHaveBeenCalledWith(testPromise, {
        loading: 'Loading...',
        success: 'Success!',
        error: expect.any(Function),
      });
    });
  });

  describe('dismiss', () => {
    it('dismisses toast with specific ID', () => {
      const { result } = renderHook(() => useNotification());

      result.current.dismiss('toast-123');

      expect(toast.dismiss).toHaveBeenCalledWith('toast-123');
    });

    it('dismisses toast with numeric ID', () => {
      const { result } = renderHook(() => useNotification());

      result.current.dismiss(456);

      expect(toast.dismiss).toHaveBeenCalledWith(456);
    });

    it('dismisses all toasts when no ID provided', () => {
      const { result } = renderHook(() => useNotification());

      result.current.dismiss();

      expect(toast.dismiss).toHaveBeenCalledWith(undefined);
    });
  });

  describe('ID generation', () => {
    it('generates lowercase IDs', () => {
      const { result } = renderHook(() => useNotification());

      result.current.success('TEST MESSAGE');

      expect(toast.success).toHaveBeenCalledWith(
        'TEST MESSAGE',
        expect.objectContaining({ id: 'test-message' })
      );
    });

    it('replaces spaces with hyphens', () => {
      const { result } = renderHook(() => useNotification());

      result.current.success('Hello World From Test');

      expect(toast.success).toHaveBeenCalledWith(
        'Hello World From Test',
        expect.objectContaining({ id: 'hello-world-from-test' })
      );
    });

    it('replaces multiple consecutive spaces with single hyphen', () => {
      const { result } = renderHook(() => useNotification());

      result.current.success('Multiple   Spaces    Here');

      expect(toast.success).toHaveBeenCalledWith(
        'Multiple   Spaces    Here',
        expect.objectContaining({ id: 'multiple-spaces-here' })
      );
    });

    it('combines title and message in ID when both provided', () => {
      const { result } = renderHook(() => useNotification());

      result.current.success('Message Content', { title: 'Title Text' });

      expect(toast.success).toHaveBeenCalledWith(
        'Title Text',
        expect.objectContaining({ id: 'title-text-message-content' })
      );
    });
  });

  describe('return value', () => {
    it('returns all notification methods', () => {
      const { result } = renderHook(() => useNotification());

      expect(result.current).toHaveProperty('success');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('info');
      expect(result.current).toHaveProperty('warning');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('promise');
      expect(result.current).toHaveProperty('dismiss');
    });

    it('all methods are functions', () => {
      const { result } = renderHook(() => useNotification());

      expect(typeof result.current.success).toBe('function');
      expect(typeof result.current.error).toBe('function');
      expect(typeof result.current.info).toBe('function');
      expect(typeof result.current.warning).toBe('function');
      expect(typeof result.current.loading).toBe('function');
      expect(typeof result.current.promise).toBe('function');
      expect(typeof result.current.dismiss).toBe('function');
    });
  });
});
