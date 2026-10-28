import { describe, it, expect } from 'vitest';
import * as AuthExports from 'src/sections/auth/index';

describe('sections/auth/index', () => {
  it('should export SignInView', () => {
    expect(AuthExports.SignInView).toBeDefined();
  });

  it('should export NhanhAuthCallbackView', () => {
    expect(AuthExports.NhanhAuthCallbackView).toBeDefined();
  });

  it('should export ZaloAuthCallbackView', () => {
    expect(AuthExports.ZaloAuthCallbackView).toBeDefined();
  });

  it('should have all expected exports', () => {
    expect(AuthExports).toBeDefined();
    expect(typeof AuthExports).toBe('object');
  });
});
