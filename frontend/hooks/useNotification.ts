import { toast } from 'sonner';

export interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
}

// Create a simple hash function for generating unique IDs
const generateToastId = (message: string, title?: string) => {
  const content = title ? `${title}-${message}` : message;
  return content.replace(/\s+/g, '-').toLowerCase();
};

export function useNotification() {
  const success = (message: string, options?: NotificationOptions) => {
    const id = generateToastId(message, options?.title);
    // Dismiss existing toast with same ID to create flash effect

    if (options?.title) {
      return toast.success(options.title, {
        id,
        description: message,
        duration: options?.duration,
      });
    }
    return toast.success(message, {
      id,
      duration: options?.duration,
    });
  };

  const error = (message: string, options?: NotificationOptions) => {
    const id = generateToastId(message, options?.title);
    // Dismiss existing toast with same ID to create flash effect

    if (options?.title) {
      return toast.error(options.title, {
        id,
        description: message,
        duration: options?.duration,
      });
    }
    return toast.error(message, {
      id,
      duration: options?.duration,
    });
  };

  const info = (message: string, options?: NotificationOptions) => {
    const id = generateToastId(message, options?.title);
    // Dismiss existing toast with same ID to create flash effect

    if (options?.title) {
      return toast.info(options.title, {
        id,
        description: message,
        duration: options?.duration,
      });
    }
    return toast.info(message, {
      id,
      duration: options?.duration,
    });
  };

  const warning = (message: string, options?: NotificationOptions) => {
    const id = generateToastId(message, options?.title);
    // Dismiss existing toast with same ID to create flash effect

    if (options?.title) {
      return toast.warning(options.title, {
        id,
        description: message,
        duration: options?.duration,
      });
    }
    return toast.warning(message, {
      id,
      duration: options?.duration,
    });
  };

  const loading = (message: string, options?: NotificationOptions) => {
    const id = generateToastId(message, options?.title);

    if (options?.title) {
      return toast.loading(options.title, {
        id,
        description: message,
      });
    }
    return toast.loading(message, { id });
  };

  const promise = <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((_data: T) => string);
      error: string | ((_error: Error) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  };

  const dismiss = (toastId?: string | number) => {
    toast.dismiss(toastId);
  };

  return {
    success,
    error,
    info,
    warning,
    loading,
    promise,
    dismiss,
  };
}
