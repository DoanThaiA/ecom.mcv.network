/**
 * Room naming utilities for WebSocket connections
 */
export function getUserRoom(userId: string): string {
  return `user:${userId}`;
}

export function getSessionRoom(sessionId: string): string {
  return `session:${sessionId}`;
}
