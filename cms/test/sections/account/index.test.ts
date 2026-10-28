import { describe, it, expect } from 'vitest';
import * as AccountExports from 'src/sections/account/index';

describe('sections/account/index', () => {
  it('should export AccountView', () => {
    expect(AccountExports.AccountView).toBeDefined();
  });

  it('should export EditAccountDialog', () => {
    expect(AccountExports.EditAccountDialog).toBeDefined();
  });

  it('should export LogoutDialog', () => {
    expect(AccountExports.LogoutDialog).toBeDefined();
  });

  it('should export ChangePasswordDialog', () => {
    expect(AccountExports.ChangePasswordDialog).toBeDefined();
  });

  it('should export NhanhVnSyncCard', () => {
    expect(AccountExports.NhanhVnSyncCard).toBeDefined();
  });

  it('should have all expected exports', () => {
    expect(AccountExports).toBeDefined();
    expect(typeof AccountExports).toBe('object');
  });
});
