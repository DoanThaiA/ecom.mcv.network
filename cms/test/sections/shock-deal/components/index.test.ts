import { describe, it, expect, vi } from 'vitest';

// Mock all components
vi.mock('src/sections/shock-deal/components/classification-section', () => ({
  ClassificationSection: () => null,
}));

vi.mock('src/sections/shock-deal/components/basic-info-section', () => ({
  BasicInfoSection: () => null,
}));

vi.mock('src/sections/shock-deal/components/benefit-tiers-section', () => ({
  BenefitTiersSection: () => null,
}));

vi.mock('src/sections/shock-deal/components/form-action-buttons', () => ({
  FormActionButtons: () => null,
}));

vi.mock('src/sections/shock-deal/components/shock-deal-tabs', () => ({
  ShockDealTabs: () => null,
}));

describe('sections/shock-deal/components/index', () => {
  it('should export ClassificationSection', async () => {
    const module = await import('src/sections/shock-deal/components/index');
    expect(module.ClassificationSection).toBeDefined();
  });

  it('should export BasicInfoSection', async () => {
    const module = await import('src/sections/shock-deal/components/index');
    expect(module.BasicInfoSection).toBeDefined();
  });

  it('should export BenefitTiersSection', async () => {
    const module = await import('src/sections/shock-deal/components/index');
    expect(module.BenefitTiersSection).toBeDefined();
  });

  it('should export FormActionButtons', async () => {
    const module = await import('src/sections/shock-deal/components/index');
    expect(module.FormActionButtons).toBeDefined();
  });

  it('should export ShockDealTabs', async () => {
    const module = await import('src/sections/shock-deal/components/index');
    expect(module.ShockDealTabs).toBeDefined();
  });

  it('should have all expected exports', async () => {
    const module = await import('src/sections/shock-deal/components/index');
    expect(module).toBeDefined();
    expect(typeof module).toBe('object');
  });
});
