import { describe, it, expect } from 'vitest';
import { getUserFullName } from '@/lib/helpers/userHelper';
import type { User } from '@/types/gen/shared/shared/users/user';

describe('getUserFullName', () => {
  it('returns full name when both first and last name exist', () => {
    const user: User = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
    } as User;
    expect(getUserFullName(user)).toBe('John Doe');
  });

  it('returns only firstName when lastName is missing', () => {
    const user: User = {
      id: '1',
      firstName: 'John',
    } as User;
    expect(getUserFullName(user)).toBe('John');
  });

  it('returns only lastName when firstName is missing', () => {
    const user: User = {
      id: '1',
      lastName: 'Doe',
    } as User;
    expect(getUserFullName(user)).toBe('Doe');
  });

  it('returns empty string when both names are missing', () => {
    const user: User = {
      id: '1',
    } as User;
    expect(getUserFullName(user)).toBe('');
  });

  it('returns empty string for null user', () => {
    expect(getUserFullName(null)).toBe('');
  });

  it('returns empty string for undefined user', () => {
    expect(getUserFullName(undefined)).toBe('');
  });

  it('handles empty string firstName', () => {
    const user: User = {
      id: '1',
      firstName: '',
      lastName: 'Doe',
    } as User;
    expect(getUserFullName(user)).toBe('Doe');
  });

  it('handles empty string lastName', () => {
    const user: User = {
      id: '1',
      firstName: 'John',
      lastName: '',
    } as User;
    expect(getUserFullName(user)).toBe('John');
  });

  it('handles both names being empty strings', () => {
    const user: User = {
      id: '1',
      firstName: '',
      lastName: '',
    } as User;
    expect(getUserFullName(user)).toBe('');
  });

  it('handles names with special characters', () => {
    const user: User = {
      id: '1',
      firstName: 'Nguyễn',
      lastName: 'Văn A',
    } as User;
    expect(getUserFullName(user)).toBe('Nguyễn Văn A');
  });

  it('trims spaces correctly in combined name', () => {
    const user: User = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
    } as User;
    expect(getUserFullName(user)).toBe('John Doe');
    expect(getUserFullName(user).trim()).toBe('John Doe');
  });
});
