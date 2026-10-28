// Notification types (frontend-only, not from proto)

export type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'order' | 'promotion';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  timestamp?: string;
  isRead?: boolean;
  duration?: number;
}
