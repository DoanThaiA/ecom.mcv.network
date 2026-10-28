import { describe, it, expect, vi } from 'vitest';
import { showSuccess, showInfo, showWarning, showError } from 'src/utils/toast';
import { toast } from 'react-toastify';

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

describe('toast utils', () => {
  describe('showSuccess', () => {
    it('calls toast.success with message', () => {
      showSuccess('Success message');
      expect(toast.success).toHaveBeenCalledWith('Success message');
    });
  });

  describe('showInfo', () => {
    it('calls toast.info with message', () => {
      showInfo('Info message');
      expect(toast.info).toHaveBeenCalledWith('Info message');
    });
  });

  describe('showWarning', () => {
    it('calls toast.warning with message', () => {
      showWarning('Warning message');
      expect(toast.warning).toHaveBeenCalledWith('Warning message');
    });
  });

  describe('showError', () => {
    it('displays string error', () => {
      showError('Error message');
      expect(toast.error).toHaveBeenCalledWith('Error message');
    });
    it('extracts error from array', () => {
      showError({ response: { data: { errors: ['Error 1', 'Error 2'] } } });
      expect(toast.error).toHaveBeenCalledWith('Error 1, Error 2');
    });
    it('extracts error from string', () => {
      showError({ response: { data: { errors: 'Single error' } } });
      expect(toast.error).toHaveBeenCalledWith('Single error');
    });
    it('extracts message field', () => {
      showError({ response: { data: { message: 'Message error' } } });
      expect(toast.error).toHaveBeenCalledWith('Message error');
    });
    it('uses axios error message', () => {
      showError({ message: 'Network error' });
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
    it('shows default message for unknown error', () => {
      showError({});
      expect(toast.error).toHaveBeenCalledWith('An error occurred');
    });
    it('filters out empty strings from errors array', () => {
      showError({ response: { data: { errors: ['Error 1', '', '  ', 'Error 2'] } } });
      expect(toast.error).toHaveBeenCalledWith('Error 1, Error 2');
    });
    it('handles empty errors array', () => {
      showError({ response: { data: { errors: [] } } });
      expect(toast.error).toHaveBeenCalledWith('An error occurred');
    });
    it('trims whitespace from errors', () => {
      showError({ response: { data: { errors: '  Error message  ' } } });
      expect(toast.error).toHaveBeenCalledWith('Error message');
    });
    it('handles exception during extraction', () => {
      const circular: any = {};
      circular.self = circular;
      showError(circular);
      expect(toast.error).toHaveBeenCalledWith('An error occurred');
    });
  });
});
