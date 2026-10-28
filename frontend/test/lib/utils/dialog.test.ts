import { describe, it, expect, vi, beforeEach } from 'vitest';
import { preventDialogCloseOnToast } from '@/lib/utils/dialog';

describe('preventDialogCloseOnToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prevents default when clicking on sonner toast', () => {
    // Create a mock toast element
    const toastElement = document.createElement('div');
    toastElement.setAttribute('data-sonner-toast', 'true');
    document.body.appendChild(toastElement);

    const preventDefault = vi.fn();
    const event = {
      target: toastElement,
      preventDefault,
    };

    preventDialogCloseOnToast(event);

    expect(preventDefault).toHaveBeenCalled();

    document.body.removeChild(toastElement);
  });

  it('prevents default when clicking inside a sonner toast child element', () => {
    // Create toast with child element
    const toastElement = document.createElement('div');
    toastElement.setAttribute('data-sonner-toast', 'true');
    const childElement = document.createElement('span');
    toastElement.appendChild(childElement);
    document.body.appendChild(toastElement);

    const preventDefault = vi.fn();
    const event = {
      target: childElement,
      preventDefault,
    };

    preventDialogCloseOnToast(event);

    expect(preventDefault).toHaveBeenCalled();

    document.body.removeChild(toastElement);
  });

  it('does not prevent default when clicking outside sonner toast', () => {
    const regularElement = document.createElement('div');
    document.body.appendChild(regularElement);

    const preventDefault = vi.fn();
    const event = {
      target: regularElement,
      preventDefault,
    };

    preventDialogCloseOnToast(event);

    expect(preventDefault).not.toHaveBeenCalled();

    document.body.removeChild(regularElement);
  });

  it('does not prevent default when target is not an Element', () => {
    const preventDefault = vi.fn();
    const event = {
      target: null,
      preventDefault,
    };

    preventDialogCloseOnToast(event);

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('does not prevent default when target is a text node', () => {
    const preventDefault = vi.fn();
    const event = {
      target: document.createTextNode('text'),
      preventDefault,
    };

    preventDialogCloseOnToast(event);

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('handles event with undefined target', () => {
    const preventDefault = vi.fn();
    const event = {
      target: undefined,
      preventDefault,
    };

    preventDialogCloseOnToast(event);

    expect(preventDefault).not.toHaveBeenCalled();
  });
});
