export enum JobType {
  // Nhanh sync jobs
  NHANH_PRODUCT_LIST_SYNC = 'nhanh_product_list_sync', // Step 1: Sync product list from Nhanh API
  NHANH_PRODUCT_DETAIL_SYNC = 'nhanh_product_detail_sync', // Step 2: Sync product details from Nhanh API
  NHANH_PRODUCT_EMBED_SYNC = 'nhanh_product_embed_sync', // Step 3+4: Embed variants + populate parent metadata (DB only)
  NHANH_CATEGORY_SYNC = 'nhanh_category_sync',
  NHANH_INVENTORY_SYNC = 'nhanh_inventory_sync',
  NHANH_BRAND_SYNC = 'nhanh_brand_sync',
  NHANH_DEPOT_SYNC = 'nhanh_depot_sync',

  // Flash sale import
  FLASH_SALE_IMPORT = 'flash_sale_import',

  // Product discount import
  PRODUCT_DISCOUNT_IMPORT = 'product_discount_import',

  // Topic product import
  TOPIC_PRODUCT_IMPORT = 'topic_product_import',

  // Affiliate product commission import (per-affiliate + global commission settings)
  AFFILIATE_PRODUCT_COMMISSION_IMPORT = 'affiliate_product_commission_import',

  // Commission rate recalculation
  COMMISSION_RATE_RECALCULATION = 'commission_rate_recalculation',

  // Recommendation pre-computation
  RECOMMENDATION_PRECOMPUTE = 'recommendation_precompute',
}
