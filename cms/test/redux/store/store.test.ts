import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create a mock reducer that returns an initial state
const createMockReducer = () => (state = {}) => state;

// Mock all slices
vi.mock('src/redux/store/authSlice', () => ({
  authSlice: { name: 'auth', reducer: createMockReducer() },
}));

vi.mock('src/redux/store/accountSlice', () => ({
  accountSlice: { name: 'account', reducer: createMockReducer() },
}));

vi.mock('src/redux/store/comboSlice', () => ({
  comboSlice: { name: 'combo', reducer: createMockReducer() },
}));

vi.mock('src/redux/store/fileSlice', () => ({
  fileSlice: { name: 'file', reducer: createMockReducer() },
}));

vi.mock('src/redux/store/inventorySlice', () => ({
  inventorySlice: { name: 'inventory', reducer: createMockReducer() },
}));

vi.mock('src/redux/store/jobSlice', () => ({
  jobSlice: { name: 'job', reducer: createMockReducer() },
}));

vi.mock('src/redux/store/nhanhSlice', () => ({
  nhanhSlice: { name: 'nhanh', reducer: createMockReducer() },
}));

vi.mock('src/redux/store/productSlice', () => ({
  productSlice: { name: 'product', reducer: createMockReducer() },
}));

vi.mock('src/redux/store/productCategorySlice', () => ({
  productCategorySlice: { name: 'productCategory', reducer: createMockReducer() },
}));

vi.mock('src/redux/store/flashSaleSlice', () => ({
  flashSaleSlice: { name: 'flashSale', reducer: createMockReducer() },
}));

vi.mock('src/redux/store/zaloSlice', () => ({
  zaloSlice: { name: 'zalo', reducer: createMockReducer() },
}));

vi.mock('src/redux/store/orderSlice', () => ({
  orderSlice: { name: 'order', reducer: createMockReducer() },
}));

vi.mock('src/redux/store/newsSlice', () => ({
  newsSlice: { name: 'news', reducer: createMockReducer() },
}));

vi.mock('src/redux/store/topicSlice', () => ({
  topicSlice: { name: 'topic', reducer: createMockReducer() },
}));

vi.mock('src/redux/store/menuSlice', () => ({
  menuSlice: { name: 'menu', reducer: createMockReducer() },
}));

vi.mock('src/redux/store/returnSlice', () => ({
  returnSlice: { name: 'return', reducer: createMockReducer() },
}));

vi.mock('src/redux/store/reviewSlice', () => ({
  default: createMockReducer(),
}));

vi.mock('src/redux/store/promotionSlice', () => ({
  promotionSlice: { name: 'promotion', reducer: createMockReducer() },
}));

vi.mock('src/redux/saga/rootSaga', () => ({
  default: function* () {
    yield;
  },
}));

describe('redux/store/store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export store', async () => {
    const module = await import('src/redux/store/store');
    expect(module.store).toBeDefined();
  });

  it('should export useAppDispatch', async () => {
    const module = await import('src/redux/store/store');
    expect(module.useAppDispatch).toBeDefined();
  });

  it('should export useAppSelector', async () => {
    const module = await import('src/redux/store/store');
    expect(module.useAppSelector).toBeDefined();
  });

  it('should have store with dispatch method', async () => {
    const module = await import('src/redux/store/store');
    expect(module.store.dispatch).toBeDefined();
    expect(typeof module.store.dispatch).toBe('function');
  });

  it('should have store with getState method', async () => {
    const module = await import('src/redux/store/store');
    expect(module.store.getState).toBeDefined();
    expect(typeof module.store.getState).toBe('function');
  });

  it('should export all expected types', async () => {
    const module = await import('src/redux/store/store');
    // Type exports are compile-time only, so we just verify the module loads
    expect(module).toBeDefined();
    expect(typeof module).toBe('object');
  });
});
