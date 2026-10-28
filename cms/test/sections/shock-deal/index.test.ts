import { describe, it, expect, vi } from 'vitest';

// Mock all components to avoid DatePicker dependencies
vi.mock('src/sections/shock-deal/shock-deal-form', () => ({
  ShockDealForm: () => null,
}));

vi.mock('src/sections/shock-deal/shock-deal-create-view', () => ({
  ShockDealCreateView: () => null,
}));

vi.mock('src/sections/shock-deal/shock-deal-edit-view', () => ({
  ShockDealEditView: () => null,
}));

describe('sections/shock-deal/index', () => {
  it('should export ShockDealForm', async () => {
    const module = await import('src/sections/shock-deal/index');
    expect(module.ShockDealForm).toBeDefined();
  });

  it('should export ShockDealCreateView', async () => {
    const module = await import('src/sections/shock-deal/index');
    expect(module.ShockDealCreateView).toBeDefined();
  });

  it('should export ShockDealEditView', async () => {
    const module = await import('src/sections/shock-deal/index');
    expect(module.ShockDealEditView).toBeDefined();
  });

  it('should have all expected exports', async () => {
    const module = await import('src/sections/shock-deal/index');
    expect(module).toBeDefined();
    expect(typeof module).toBe('object');
  });
});
