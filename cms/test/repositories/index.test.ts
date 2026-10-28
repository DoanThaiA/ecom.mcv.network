import { describe, it, expect } from 'vitest';
import * as RepositoryExports from 'src/repositories/index';

describe('repositories/index', () => {
  it('should export authRepository', () => {
    expect(RepositoryExports.authRepository).toBeDefined();
  });

  it('should export comboRepository', () => {
    expect(RepositoryExports.comboRepository).toBeDefined();
  });

  it('should export fileRepository', () => {
    expect(RepositoryExports.fileRepository).toBeDefined();
  });

  it('should export inventoryRepository', () => {
    expect(RepositoryExports.inventoryRepository).toBeDefined();
  });

  it('should export jobRepository', () => {
    expect(RepositoryExports.jobRepository).toBeDefined();
  });

  it('should export nhanhRepository', () => {
    expect(RepositoryExports.nhanhRepository).toBeDefined();
  });

  it('should export productRepository', () => {
    expect(RepositoryExports.productRepository).toBeDefined();
  });

  it('should export productCategoryRepository', () => {
    expect(RepositoryExports.productCategoryRepository).toBeDefined();
  });

  it('should export orderRepository', () => {
    expect(RepositoryExports.orderRepository).toBeDefined();
  });

  it('should export topicRepository', () => {
    expect(RepositoryExports.topicRepository).toBeDefined();
  });

  it('should export menuRepository', () => {
    expect(RepositoryExports.menuRepository).toBeDefined();
  });

  it('should export returnRepository', () => {
    expect(RepositoryExports.returnRepository).toBeDefined();
  });

  it('should export promotionRepository', () => {
    expect(RepositoryExports.promotionRepository).toBeDefined();
  });

  it('should have all expected exports', () => {
    expect(RepositoryExports).toBeDefined();
    expect(typeof RepositoryExports).toBe('object');
  });
});
