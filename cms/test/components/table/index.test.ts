import { describe, it, expect } from 'vitest';
import * as TableExports from 'src/components/table/index';

describe('components/table/index', () => {
  it('should export SearchBar component', () => {
    expect(TableExports.SearchBar).toBeDefined();
  });

  it('should export ColumnVisibility component', () => {
    expect(TableExports.ColumnVisibility).toBeDefined();
  });

  it('should export DataTable component', () => {
    expect(TableExports.DataTable).toBeDefined();
  });

  it('should export createSelectionColumn function', () => {
    expect(TableExports.createSelectionColumn).toBeDefined();
    expect(typeof TableExports.createSelectionColumn).toBe('function');
  });

  it('should export TablePagination component', () => {
    expect(TableExports.TablePagination).toBeDefined();
  });

  it('should have all expected exports', () => {
    expect(TableExports).toBeDefined();
    expect(typeof TableExports).toBe('object');
  });
});
