import { describe, it, expect } from 'vitest';
import * as exports from 'src/components/html-editor/index';

describe('components/html-editor/index', () => {
  it('exports HtmlEditor component', () => {
    expect(exports).toHaveProperty('HtmlEditor');
    expect(typeof exports.HtmlEditor).toBe('function');
  });

  it('HtmlEditor is not undefined', () => {
    expect(exports.HtmlEditor).toBeDefined();
  });

  it('has all expected exports', () => {
    const exportKeys = Object.keys(exports);
    expect(exportKeys).toContain('HtmlEditor');
  });
});
