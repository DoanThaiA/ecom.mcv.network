import { describe, it, expect, vi } from 'vitest';

// Mock all components
vi.mock('src/sections/return/components/return-tabs', () => ({
  ReturnTabs: () => null,
}));

vi.mock('src/sections/return/components/return-type-tabs', () => ({
  ReturnTypeTabs: () => null,
}));

vi.mock('src/sections/return/components/return-status-chip', () => ({
  ReturnStatusChip: () => null,
}));

vi.mock('src/sections/return/components/return-detail-dialog', () => ({
  ReturnDetailDialog: () => null,
}));

vi.mock('src/sections/return/components/return-filter', () => ({
  ReturnFilter: () => null,
}));

describe('sections/return/components/index', () => {
  it('should export ReturnTabs', async () => {
    const module = await import('src/sections/return/components/index');
    expect(module.ReturnTabs).toBeDefined();
  });

  it('should export ReturnTypeTabs', async () => {
    const module = await import('src/sections/return/components/index');
    expect(module.ReturnTypeTabs).toBeDefined();
  });

  it('should export ReturnStatusChip', async () => {
    const module = await import('src/sections/return/components/index');
    expect(module.ReturnStatusChip).toBeDefined();
  });

  it('should export ReturnDetailDialog', async () => {
    const module = await import('src/sections/return/components/index');
    expect(module.ReturnDetailDialog).toBeDefined();
  });

  it('should export ReturnFilter', async () => {
    const module = await import('src/sections/return/components/index');
    expect(module.ReturnFilter).toBeDefined();
  });

  it('should have all expected exports', async () => {
    const module = await import('src/sections/return/components/index');
    expect(module).toBeDefined();
    expect(typeof module).toBe('object');
  });
});
