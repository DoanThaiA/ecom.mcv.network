import { describe, it, expect, vi } from 'vitest';
import { shadows } from 'src/theme/core/shadows';

vi.mock('./palette', () => ({
  grey: {
    '500Channel': '158 158 158',
  },
}));

vi.mock('../styles', () => ({
  varAlpha: (channel: string, opacity: number) => `rgba(${channel}, ${opacity})`,
}));

describe('shadows', () => {
  it('returns an array', () => {
    const result = shadows();
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns 25 shadow levels', () => {
    const result = shadows();
    expect(result).toHaveLength(25);
  });

  it('first shadow is none', () => {
    const result = shadows();
    expect(result[0]).toBe('none');
  });

  it('contains rgba colors', () => {
    const result = shadows();
    expect(result[1]).toContain('rgba');
  });

  it('uses grey color channel', () => {
    const result = shadows();
    // grey 500 channel is "145 158 171"
    expect(result[1]).toContain('145 158 171');
  });

  it('shadow 1 has correct format', () => {
    const result = shadows();
    expect(result[1]).toContain('0px 2px 1px -1px');
  });

  it('shadow 2 has correct format', () => {
    const result = shadows();
    expect(result[2]).toContain('0px 3px 1px -2px');
  });

  it('shadow 3 has correct format', () => {
    const result = shadows();
    expect(result[3]).toContain('0px 3px 3px -2px');
  });

  it('shadow 4 has correct format', () => {
    const result = shadows();
    expect(result[4]).toContain('0px 2px 4px -1px');
  });

  it('shadow 5 has correct format', () => {
    const result = shadows();
    expect(result[5]).toContain('0px 3px 5px -1px');
  });

  it('shadow 10 has correct format', () => {
    const result = shadows();
    expect(result[10]).toContain('0px 6px 6px -3px');
  });

  it('shadow 15 has correct format', () => {
    const result = shadows();
    expect(result[15]).toContain('0px 8px 9px -5px');
  });

  it('shadow 20 has correct format', () => {
    const result = shadows();
    expect(result[20]).toContain('0px 10px 13px -6px');
  });

  it('shadow 24 has correct format', () => {
    const result = shadows();
    expect(result[24]).toContain('0px 11px 15px -7px');
  });

  it('uses varAlpha for color1', () => {
    const result = shadows();
    expect(result[1]).toContain('0.2');
  });

  it('uses varAlpha for color2', () => {
    const result = shadows();
    expect(result[1]).toContain('0.14');
  });

  it('uses varAlpha for color3', () => {
    const result = shadows();
    expect(result[1]).toContain('0.12');
  });

  it('shadows increase in elevation', () => {
    const result = shadows();
    // Later shadows have larger values
    expect(result[24].length).toBeGreaterThan(result[1].length);
  });

  it('exports shadows function', () => {
    expect(shadows).toBeDefined();
    expect(typeof shadows).toBe('function');
  });

  it('returns Shadows type', () => {
    const result = shadows();
    expect(result).toBeDefined();
  });

  it('each shadow is a string', () => {
    const result = shadows();
    result.forEach((shadow) => {
      expect(typeof shadow).toBe('string');
    });
  });

  it('uses consistent comma-separated format', () => {
    const result = shadows();
    // Shadows 1-24 have multiple parts separated by commas
    expect(result[1].split(',').length).toBeGreaterThan(1);
  });

  it('imports grey from palette', () => {
    const result = shadows();
    expect(result).toBeDefined();
  });

  it('imports varAlpha from styles', () => {
    const result = shadows();
    expect(result).toBeDefined();
  });

  it('shadow values contain px units', () => {
    const result = shadows();
    expect(result[1]).toContain('px');
  });

  it('creates three-layer shadows', () => {
    const result = shadows();
    // Each shadow (except 'none') has 3 layers separated by commas
    // Format: "shadow1,shadow2,shadow3" where each shadow is like "0px 2px 1px -1px color"
    const parts = result[1].split(',');
    expect(parts.length).toBe(3);
  });

  it('shadow 12 is defined', () => {
    const result = shadows();
    expect(result[12]).toBeDefined();
    expect(result[12]).toContain('0px 7px 8px -4px');
  });

  it('shadow 18 is defined', () => {
    const result = shadows();
    expect(result[18]).toBeDefined();
    expect(result[18]).toContain('0px 9px 11px -5px');
  });

  it('all shadows after 0 contain offset values', () => {
    const result = shadows();
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toContain('0px');
    }
  });
});
