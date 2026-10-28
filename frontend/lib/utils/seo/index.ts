/**
 * SEO Module
 * Main exports for SEO metadata utilities
 */

// Types
export type {
  LocalizedSeoText,
  StaticPageSeoConfig,
  ProductSeoData,
  CategorySeoData,
  TopicSeoData,
  NewsSeoData,
  StaticPageKey,
} from './types';

// Schema.org types
export type {
  SchemaOrgBase,
  SchemaOrgBrand,
  SchemaOrgOffer,
  SchemaOrgAggregateRating,
  SchemaOrgProduct,
  SchemaOrgListItem,
  SchemaOrgBreadcrumbList,
  SchemaOrgContactPoint,
  SchemaOrgOrganization,
  SchemaOrgSearchAction,
  SchemaOrgWebSite,
  SchemaOrgSchema,
} from './schema-types';

// Constants
export {
  BASE_URL,
  SITE_NAME,
  DEFAULT_DESCRIPTION_VI,
  DEFAULT_DESCRIPTION_EN,
  DEFAULT_OG_IMAGE,
  TWITTER_CONFIG,
  OG_LOCALES,
  ALTERNATE_LOCALES,
  DEFAULT_BRAND,
  CURRENCY_CODE,
  SOCIAL_PROFILES,
} from './constants';

// Static metadata configuration
export { STATIC_PAGE_METADATA } from './static-metadata';

// Helper functions
export {
  generateStaticMetadata,
  generateProductMetadata,
  generateCategoryMetadata,
  generateTopicMetadata,
  generateNewsMetadata,
} from './metadata-helpers';

// Schema.org builder functions
export {
  buildProductSchema,
  buildProductBreadcrumbSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from './schema-builders';
