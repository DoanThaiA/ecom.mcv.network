import { describe, it, expect } from 'vitest';

describe('utils/index', () => {
  it('should export utils barrel file without errors', async () => {
    const utils = await import('src/utils/index');
    expect(utils).toBeDefined();
    expect(typeof utils).toBe('object');
  });

  it('should have multiple exports', async () => {
    const utils = await import('src/utils/index');
    const exportKeys = Object.keys(utils);
    expect(exportKeys.length).toBeGreaterThan(0);
  });
});
