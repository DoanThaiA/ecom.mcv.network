/**
 * Mock Data Loaders
 * Load test data from JSON fixtures following the convention:
 * - Data MUST be loaded from JSON files
 * - NO hard-coding complex data
 */

import usersData from '../fixtures/users.json';
import productsData from '../fixtures/products.json';
import ordersData from '../fixtures/orders.json';
import cartData from '../fixtures/cart.json';
import addressesData from '../fixtures/addresses.json';
import vouchersData from '../fixtures/vouchers.json';

// ============= USERS =============

export const loadUserData = (userId?: string) => {
  if (userId) return usersData.users.find((u) => u.id === userId);
  return usersData.singleUser;
};

export const loadUsersData = () => usersData.users;

export const createUserFromData = (data: any) => {
  if (!data) throw new Error('User data not found');
  return data;
};

// Quick helpers
export const mockUser = createUserFromData(loadUserData());
export const mockUsers = loadUsersData().map(createUserFromData);

// Custom builders
export const createCustomUser = (baseId: string, overrides: any) => {
  const baseData = loadUserData(baseId);
  if (!baseData) throw new Error(`User ${baseId} not found`);
  return createUserFromData({ ...baseData, ...overrides });
};

// ============= PRODUCTS =============

export const loadProductData = (productId?: string) => {
  if (productId) return productsData.products.find((p) => p.id === productId);
  return productsData.singleProduct;
};

export const loadProductsData = () => productsData.products;

export const createProductFromData = (data: any) => {
  if (!data) throw new Error('Product data not found');
  return data;
};

// Quick helpers
export const mockProduct = createProductFromData(loadProductData());
export const mockProducts = loadProductsData().map(createProductFromData);

// Custom builders
export const createCustomProduct = (baseId: string, overrides: any) => {
  const baseData = loadProductData(baseId);
  if (!baseData) throw new Error(`Product ${baseId} not found`);
  return createProductFromData({ ...baseData, ...overrides });
};

// ============= ORDERS =============

export const loadOrderData = (orderId?: string) => {
  if (orderId) return ordersData.orders.find((o) => o.id === orderId);
  return ordersData.singleOrder;
};

export const loadOrdersData = () => ordersData.orders;

export const createOrderFromData = (data: any) => {
  if (!data) throw new Error('Order data not found');
  return data;
};

// Quick helpers
export const mockOrder = createOrderFromData(loadOrderData());
export const mockOrders = loadOrdersData().map(createOrderFromData);

// Custom builders
export const createCustomOrder = (baseId: string, overrides: any) => {
  const baseData = loadOrderData(baseId);
  if (!baseData) throw new Error(`Order ${baseId} not found`);
  return createOrderFromData({ ...baseData, ...overrides });
};

// ============= CART =============

export const loadCartData = () => cartData.cartItems;
export const loadEmptyCartData = () => cartData.emptyCart;

export const createCartItemFromData = (data: any) => {
  if (!data) throw new Error('Cart item data not found');
  return data;
};

// Quick helpers
export const mockCartItems = loadCartData().map(createCartItemFromData);
export const mockEmptyCart = loadEmptyCartData();

// ============= ADDRESSES =============

export const loadAddressData = (addressId?: string) => {
  if (addressId)
    return addressesData.addresses.find((a) => a.id === addressId);
  return addressesData.singleAddress;
};

export const loadAddressesData = () => addressesData.addresses;

export const createAddressFromData = (data: any) => {
  if (!data) throw new Error('Address data not found');
  return data;
};

// Quick helpers
export const mockAddress = createAddressFromData(loadAddressData());
export const mockAddresses = loadAddressesData().map(createAddressFromData);

// Custom builders
export const createCustomAddress = (baseId: string, overrides: any) => {
  const baseData = loadAddressData(baseId);
  if (!baseData) throw new Error(`Address ${baseId} not found`);
  return createAddressFromData({ ...baseData, ...overrides });
};

// ============= VOUCHERS =============

export const loadVoucherData = (voucherId?: string) => {
  if (voucherId) return vouchersData.vouchers.find((v) => v.id === voucherId);
  return vouchersData.singleVoucher;
};

export const loadVouchersData = () => vouchersData.vouchers;

export const createVoucherFromData = (data: any) => {
  if (!data) throw new Error('Voucher data not found');
  return data;
};

// Quick helpers
export const mockVoucher = createVoucherFromData(loadVoucherData());
export const mockVouchers = loadVouchersData().map(createVoucherFromData);

// Custom builders
export const createCustomVoucher = (voucherId: string, overrides: any) => {
  const baseData = loadVoucherData(voucherId);
  if (!baseData) throw new Error(`Voucher ${voucherId} not found`);
  return createVoucherFromData({ ...baseData, ...overrides });
};
