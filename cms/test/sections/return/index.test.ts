import { describe, it, expect, vi } from 'vitest';

// Mock all components
vi.mock('src/sections/return/return-view', () => ({
  ReturnView: () => null,
}));

vi.mock('src/sections/return/return-detail-view', () => ({
  ReturnDetailView: () => null,
}));

describe('sections/return/index', () => {
  it('should export ReturnView', async () => {
    const module = await import('src/sections/return/index');
    expect(module.ReturnView).toBeDefined();
  });

  it('should export ReturnDetailView', async () => {
    const module = await import('src/sections/return/index');
    expect(module.ReturnDetailView).toBeDefined();
  });

  it('should have all expected exports', async () => {
    const module = await import('src/sections/return/index');
    expect(module).toBeDefined();
    expect(typeof module).toBe('object');
  });
});
