export enum ModulePermission {
  'product_management' = 1,
  'order_management' = 2,
  'return_management' = 3,
  'flash_sale_management' = 4,
  'promotion_management' = 5,
  'news_management' = 6,
  'homepage_management' = 7,
  'settings' = 8,
  'push_notification_management' = 9,
  'affiliate_management' = 10,
  'account_management' = 11,
  'shipping_management' = 12,
  /** Hidden super permission – bypasses all module checks. Only set via DB. */
  'super_admin' = 99,
}

export const ALL_MODULE_PERMISSIONS = Object.values(ModulePermission).filter(
  (v): v is ModulePermission => typeof v === 'number',
);

/** Permissions visible in CMS UI (excludes super_admin). */
export const VISIBLE_MODULE_PERMISSIONS = ALL_MODULE_PERMISSIONS.filter(
  (v) => v !== ModulePermission.super_admin,
);
