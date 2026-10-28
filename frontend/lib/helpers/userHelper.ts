import type { User } from '@/types/gen/shared/shared/users/user';

/**
 * Get full name from user object
 */
export const getUserFullName = (user: User | null | undefined): string => {
  if (!user) return '';
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.firstName || user.lastName || '';
};
