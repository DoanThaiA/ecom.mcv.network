/**
 * Schema.org TypeScript Types
 * Type definitions for JSON-LD structured data
 */

/**
 * Base Schema.org thing with context and type
 */
export interface SchemaOrgBase {
  '@context': 'https://schema.org';
  '@type': string;
}

/**
 * Schema.org Brand
 */
export interface SchemaOrgBrand {
  '@type': 'Brand';
  name: string;
}

/**
 * Schema.org Offer - price and availability info
 */
export interface SchemaOrgOffer {
  '@type': 'Offer';
  url: string;
  priceCurrency: string;
  price: number;
  availability: string;
  itemCondition: string;
  priceValidUntil?: string;
}

/**
 * Schema.org AggregateRating - review statistics
 */
export interface SchemaOrgAggregateRating {
  '@type': 'AggregateRating';
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

/**
 * Schema.org Product
 */
export interface SchemaOrgProduct extends SchemaOrgBase {
  '@type': 'Product';
  name: string;
  description?: string;
  image?: string | string[];
  sku?: string;
  gtin?: string;
  brand?: SchemaOrgBrand;
  category?: string;
  offers?: SchemaOrgOffer;
  aggregateRating?: SchemaOrgAggregateRating;
}

/**
 * Schema.org BreadcrumbList item
 */
export interface SchemaOrgListItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
}

/**
 * Schema.org BreadcrumbList
 */
export interface SchemaOrgBreadcrumbList extends SchemaOrgBase {
  '@type': 'BreadcrumbList';
  itemListElement: SchemaOrgListItem[];
}

/**
 * Schema.org ContactPoint
 */
export interface SchemaOrgContactPoint {
  '@type': 'ContactPoint';
  telephone?: string;
  contactType: string;
  availableLanguage?: string[];
}

/**
 * Schema.org Organization
 */
export interface SchemaOrgOrganization extends SchemaOrgBase {
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
  contactPoint?: SchemaOrgContactPoint[];
}

/**
 * Schema.org SearchAction for WebSite
 */
export interface SchemaOrgSearchAction {
  '@type': 'SearchAction';
  target: {
    '@type': 'EntryPoint';
    urlTemplate: string;
  };
  'query-input': string;
}

/**
 * Schema.org WebSite
 */
export interface SchemaOrgWebSite extends SchemaOrgBase {
  '@type': 'WebSite';
  name: string;
  url: string;
  potentialAction?: SchemaOrgSearchAction;
}

/**
 * Union type for all Schema.org types
 */
export type SchemaOrgSchema =
  | SchemaOrgProduct
  | SchemaOrgBreadcrumbList
  | SchemaOrgOrganization
  | SchemaOrgWebSite;
