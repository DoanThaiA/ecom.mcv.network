import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('/health endpoint (cms)', () => {
  const healthFilePath = join(__dirname, 'health');

  it('should have health file in public folder', () => {
    expect(existsSync(healthFilePath)).toBe(true);
  });

  it('should contain valid JSON with required fields', () => {
    const content = readFileSync(healthFilePath, 'utf-8');
    const data = JSON.parse(content);

    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('service');
    expect(data.status).toBe('healthy');
    expect(data.service).toBe('cchat-cms');
  });

  it('should be parseable as JSON', () => {
    const content = readFileSync(healthFilePath, 'utf-8');

    expect(() => JSON.parse(content)).not.toThrow();
  });

  it('should return healthy status', () => {
    const content = readFileSync(healthFilePath, 'utf-8');
    const data = JSON.parse(content);

    expect(data.status).toBe('healthy');
  });

  it('should identify service as cchat-cms', () => {
    const content = readFileSync(healthFilePath, 'utf-8');
    const data = JSON.parse(content);

    expect(data.service).toBe('cchat-cms');
  });
});
