import { describe, it, expect } from 'vitest';
import * as exports from 'src/components/table-image-preview/index';

describe('components/table-image-preview/index', () => {
  it('exports TableImagePreview component', () => {
    expect(exports).toHaveProperty('TableImagePreview');
    expect(typeof exports.TableImagePreview).toBe('function');
  });

  it('TableImagePreview is not undefined', () => {
    expect(exports.TableImagePreview).toBeDefined();
  });

  it('has all expected exports', () => {
    const exportKeys = Object.keys(exports);
    expect(exportKeys).toContain('TableImagePreview');
  });
});
