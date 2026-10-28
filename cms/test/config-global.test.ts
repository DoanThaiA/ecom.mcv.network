import { describe, it, expect, vi } from 'vitest';
import { CONFIG } from 'src//config-global';
import type { ConfigValue } from 'src//config-global';

vi.mock('../version.json', () => ({
  default: {
    version: '1.0.0-test',
  },
}));

describe('config-global', () => {
  it('exports CONFIG object', () => {
    expect(CONFIG).toBeDefined();
    expect(typeof CONFIG).toBe('object');
  });

  it('exports ConfigValue type', () => {
    const config: ConfigValue = {
      appName: 'Test',
      appVersion: '1.0.0',
    };
    expect(config).toBeDefined();
  });

  it('CONFIG has appName property', () => {
    expect(CONFIG).toHaveProperty('appName');
  });

  it('CONFIG has appVersion property', () => {
    expect(CONFIG).toHaveProperty('appVersion');
  });

  it('appName is string type', () => {
    expect(typeof CONFIG.appName).toBe('string');
  });

  it('appVersion is string type', () => {
    expect(typeof CONFIG.appVersion).toBe('string');
  });

  it('appName has correct value', () => {
    expect(CONFIG.appName).toBe('CCHAT CMS');
  });

  it('appVersion is loaded from version.json', () => {
    expect(CONFIG.appVersion).toBe('1.0.0-test');
  });

  it('appName is not empty', () => {
    expect(CONFIG.appName).not.toBe('');
  });

  it('appVersion is not empty', () => {
    expect(CONFIG.appVersion).not.toBe('');
  });

  it('has exactly 2 properties', () => {
    expect(Object.keys(CONFIG)).toHaveLength(2);
  });

  it('has correct property keys', () => {
    expect(Object.keys(CONFIG)).toEqual(['appName', 'appVersion']);
  });

  it('ConfigValue type requires appName', () => {
    // @ts-expect-error - appName is required
    const config: ConfigValue = {
      appVersion: '1.0.0',
    };
    expect(config).toBeDefined();
  });

  it('ConfigValue type requires appVersion', () => {
    // @ts-expect-error - appVersion is required
    const config: ConfigValue = {
      appName: 'Test',
    };
    expect(config).toBeDefined();
  });

  it('appName is readonly in usage', () => {
    const name = CONFIG.appName;
    expect(name).toBe('CCHAT CMS');
  });

  it('appVersion is readonly in usage', () => {
    const version = CONFIG.appVersion;
    expect(version).toBe('1.0.0-test');
  });
});
