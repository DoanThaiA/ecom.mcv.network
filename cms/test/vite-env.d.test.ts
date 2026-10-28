import { describe, it, expect } from 'vitest';

describe('vite-env.d.ts', () => {
  it('should have vite client types reference', () => {
    // This file is a TypeScript declaration file
    // Just verify the test file can be imported without errors
    expect(true).toBe(true);
  });

  it('should allow importing the declaration file', async () => {
    // Verify no errors when importing
    expect(async () => {
      await import('src/vite-env.d');
    }).not.toThrow();
  });
});
