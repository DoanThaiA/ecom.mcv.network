import * as productsData from '../fixtures/products.json';
import * as usersData from '../fixtures/users.json';
import * as ordersData from '../fixtures/orders.json';
import * as cartsData from '../fixtures/carts.json';
import * as addressesData from '../fixtures/addresses.json';
import * as combosData from '../fixtures/combos.json';
import * as categoriesData from '../fixtures/product-categories.json';

// ==================== PRODUCTS ====================

/**
 * Load danh sách products từ fixtures
 */
export const loadProductsData = () => productsData.products;

/**
 * Load single product từ fixtures
 */
export const loadProductData = (productId?: string) => {
  if (productId) {
    return productsData.products.find((p) => p._id === productId);
  }
  return productsData.singleProduct;
};

/**
 * Tạo product object từ fixture data
 */
export const createProductFromData = (data: any) => {
  if (!data) throw new Error('Product data not found');
  return data;
};

/**
 * Pre-built mock products
 */
export const mockProduct = createProductFromData(loadProductData());
export const mockProducts = loadProductsData().map(createProductFromData);

/**
 * Tạo custom product với overrides
 */
export const createCustomProduct = (baseId: string, overrides: any) => {
  const baseData = loadProductData(baseId);
  if (!baseData) throw new Error(`Product ${baseId} not found`);
  return createProductFromData({ ...baseData, ...overrides });
};

// ==================== USERS ====================

/**
 * Load danh sách users từ fixtures
 */
export const loadUsersData = () => usersData.users;

/**
 * Load single user từ fixtures
 */
export const loadUserData = (userId?: string) => {
  if (userId) {
    return usersData.users.find((u) => u._id === userId);
  }
  return usersData.singleUser;
};

/**
 * Tạo user object từ fixture data
 */
export const createUserFromData = (data: any) => {
  if (!data) throw new Error('User data not found');
  return data;
};

/**
 * Pre-built mock users
 */
export const mockUser = createUserFromData(loadUserData());
export const mockUsers = loadUsersData().map(createUserFromData);

/**
 * Tạo custom user với overrides
 */
export const createCustomUser = (baseId: string, overrides: any) => {
  const baseData = loadUserData(baseId);
  if (!baseData) throw new Error(`User ${baseId} not found`);
  return createUserFromData({ ...baseData, ...overrides });
};

// ==================== ORDERS ====================

/**
 * Load danh sách orders từ fixtures
 */
export const loadOrdersData = () => ordersData.orders;

/**
 * Load single order từ fixtures
 */
export const loadOrderData = (orderId?: string) => {
  if (orderId) {
    return ordersData.orders.find((o) => o._id === orderId);
  }
  return ordersData.singleOrder;
};

/**
 * Tạo order object từ fixture data
 */
export const createOrderFromData = (data: any) => {
  if (!data) throw new Error('Order data not found');
  return data;
};

/**
 * Pre-built mock orders
 */
export const mockOrder = createOrderFromData(loadOrderData());
export const mockOrders = loadOrdersData().map(createOrderFromData);

/**
 * Tạo custom order với overrides
 */
export const createCustomOrder = (baseId: string, overrides: any) => {
  const baseData = loadOrderData(baseId);
  if (!baseData) throw new Error(`Order ${baseId} not found`);
  return createOrderFromData({ ...baseData, ...overrides });
};

// ==================== CARTS ====================

/**
 * Load danh sách carts từ fixtures
 */
export const loadCartsData = () => cartsData.carts;

/**
 * Load single cart từ fixtures
 */
export const loadCartData = (cartId?: string) => {
  if (cartId) {
    return cartsData.carts.find((c) => c._id === cartId);
  }
  return cartsData.singleCart;
};

/**
 * Tạo cart object từ fixture data
 */
export const createCartFromData = (data: any) => {
  if (!data) throw new Error('Cart data not found');
  return data;
};

/**
 * Pre-built mock carts
 */
export const mockCart = createCartFromData(loadCartData());
export const mockCarts = loadCartsData().map(createCartFromData);

/**
 * Tạo custom cart với overrides
 */
export const createCustomCart = (baseId: string, overrides: any) => {
  const baseData = loadCartData(baseId);
  if (!baseData) throw new Error(`Cart ${baseId} not found`);
  return createCartFromData({ ...baseData, ...overrides });
};

// ==================== ADDRESSES ====================

/**
 * Load danh sách addresses từ fixtures
 */
export const loadAddressesData = () => addressesData.addresses;

/**
 * Load single address từ fixtures
 */
export const loadAddressData = (addressId?: string) => {
  if (addressId) {
    return addressesData.addresses.find((a) => a._id === addressId);
  }
  return addressesData.singleAddress;
};

/**
 * Tạo address object từ fixture data
 */
export const createAddressFromData = (data: any) => {
  if (!data) throw new Error('Address data not found');
  return data;
};

/**
 * Pre-built mock addresses
 */
export const mockAddress = createAddressFromData(loadAddressData());
export const mockAddresses = loadAddressesData().map(createAddressFromData);

/**
 * Tạo custom address với overrides
 */
export const createCustomAddress = (baseId: string, overrides: any) => {
  const baseData = loadAddressData(baseId);
  if (!baseData) throw new Error(`Address ${baseId} not found`);
  return createAddressFromData({ ...baseData, ...overrides });
};

// ==================== COMBOS ====================

/**
 * Load danh sách combos từ fixtures
 */
export const loadCombosData = () => combosData.combos;

/**
 * Load single combo từ fixtures
 */
export const loadComboData = (comboId?: string) => {
  if (comboId) {
    return combosData.combos.find((c) => c._id === comboId);
  }
  return combosData.singleCombo;
};

/**
 * Tạo combo object từ fixture data
 */
export const createComboFromData = (data: any) => {
  if (!data) throw new Error('Combo data not found');
  return data;
};

/**
 * Pre-built mock combos
 */
export const mockCombo = createComboFromData(loadComboData());
export const mockCombos = loadCombosData().map(createComboFromData);

/**
 * Tạo custom combo với overrides
 */
export const createCustomCombo = (baseId: string, overrides: any) => {
  const baseData = loadComboData(baseId);
  if (!baseData) throw new Error(`Combo ${baseId} not found`);
  return createComboFromData({ ...baseData, ...overrides });
};

// ==================== CATEGORIES ====================

/**
 * Load danh sách categories từ fixtures
 */
export const loadCategoriesData = () => categoriesData.categories;

/**
 * Load single category từ fixtures
 */
export const loadCategoryData = (categoryId?: string) => {
  if (categoryId) {
    return categoriesData.categories.find((c) => c._id === categoryId);
  }
  return categoriesData.singleCategory;
};

/**
 * Tạo category object từ fixture data
 */
export const createCategoryFromData = (data: any) => {
  if (!data) throw new Error('Category data not found');
  return data;
};

/**
 * Pre-built mock categories
 */
export const mockCategory = createCategoryFromData(loadCategoryData());
export const mockCategories = loadCategoriesData().map(createCategoryFromData);

/**
 * Tạo custom category với overrides
 */
export const createCustomCategory = (baseId: string, overrides: any) => {
  const baseData = loadCategoryData(baseId);
  if (!baseData) throw new Error(`Category ${baseId} not found`);
  return createCategoryFromData({ ...baseData, ...overrides });
};
