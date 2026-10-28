/**
 * Script to export product data to Google Merchant Center format
 * Fetches product pages from sitemap, extracts JSON-LD schema, exports to xlsx
 */

import * as XLSX from 'xlsx';

// ========== CONFIG ==========
// Set to true to use localhost, false for production
const USE_LOCAL = false;
// ============================

const PROD_URL = 'https://cchat.vn';
const LOCAL_URL = 'http://localhost:3000';
const FETCH_BASE = USE_LOCAL ? LOCAL_URL : PROD_URL;
const SITEMAP_URL = `${FETCH_BASE}/sitemap.xml`;
const BRAND = 'CChat';

// GMC column headers
const GMC_HEADERS = [
  'id',
  'title',
  'description',
  'availability',
  'availability date',
  'expiration date',
  'link',
  'mobile link',
  'image link',
  'price',
  'sale price',
  'sale price effective date',
  'identifier exists',
  'gtin',
  'mpn',
  'brand',
  'product highlight',
  'product detail',
  'additional image link',
  'condition',
  'adult',
  'color',
  'size',
  'size type',
  'size system',
  'gender',
  'material',
  'pattern',
  'age group',
  'multipack',
  'is bundle',
  'unit pricing measure',
  'unit pricing base measure',
  'energy efficiency class',
  'min energy efficiency class',
  'max energy efficiency class',
  'item group id',
  'sell on google quantity',
];

/**
 * Fetch sitemap and extract product URLs
 */
async function getProductUrls() {
  console.log('Fetching sitemap...');
  const response = await fetch(SITEMAP_URL);
  const xml = await response.text();

  // Extract URLs containing /vi/products/ (sitemap always uses production URL)
  const urlRegex = /<loc>(https:\/\/cchat\.vn\/vi\/products\/[^<]+)<\/loc>/g;
  const urls = [];
  let match;
  while ((match = urlRegex.exec(xml)) !== null) {
    urls.push(match[1]);
  }

  console.log(`Found ${urls.length} product URLs`);
  return urls;
}

/**
 * Extract JSON-LD schema from HTML
 */
function extractJsonLd(html) {
  const scriptRegex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const schemas = [];
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const json = JSON.parse(match[1].trim());
      schemas.push(json);
    } catch (e) {
      // Skip invalid JSON
    }
  }

  return schemas;
}

/**
 * Convert URL to fetch URL (replace prod with local if USE_LOCAL)
 */
function toFetchUrl(url) {
  return USE_LOCAL ? url.replace(PROD_URL, LOCAL_URL) : url;
}

/**
 * Fetch product page and extract schema
 */
async function fetchProductSchema(url) {
  const fetchUrl = toFetchUrl(url);
  try {
    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; GMCExporter/1.0; +https://cchat.vn)',
        Accept: 'text/html',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${fetchUrl}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const schemas = extractJsonLd(html);

    // Find Product schema
    const productSchema = schemas.find((s) => s['@type'] === 'Product');
    return productSchema;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return null;
  }
}

/**
 * Map schema to GMC format
 */
function mapToGmcRow(schema, url) {
  if (!schema) return null;

  const offer = schema.offers || {};
  const price = offer.price || 0;
  const availability = offer.availability || '';

  // Map availability to GMC format
  let gmcAvailability = 'out of stock';
  if (availability.includes('InStock')) {
    gmcAvailability = 'in_stock';
  } else if (availability.includes('OutOfStock')) {
    gmcAvailability = 'out_of_stock';
  } else if (availability.includes('PreOrder')) {
    gmcAvailability = 'preorder';
  }

  // Extract ID from URL (last segment after -)
  const urlParts = url.split('/');
  const lastSegment = urlParts[urlParts.length - 1];
  const idMatch = lastSegment.match(/([a-f0-9]{24})$/);
  const productId = idMatch ? idMatch[1] : lastSegment;

  // Get image(s)
  const images = Array.isArray(schema.image) ? schema.image : [schema.image];
  const mainImage = images[0] || '';
  const additionalImages = images.slice(1).join(',');

  // Format price for GMC (price + currency)
  const formattedPrice = price > 0 ? `${price} VND` : '';

  // Check for sale price
  let salePrice = '';
  let salePriceEffective = '';
  if (offer.priceValidUntil) {
    // If there's a priceValidUntil, current price might be a sale price
    // We'd need original price from another source
  }

  // Map condition
  let condition = 'new';
  if (offer.itemCondition) {
    if (offer.itemCondition.includes('New')) {
      condition = 'new';
    } else if (offer.itemCondition.includes('Used')) {
      condition = 'used';
    } else if (offer.itemCondition.includes('Refurbished')) {
      condition = 'refurbished';
    }
  }

  // Check identifier exists
  const hasIdentifier = !!(schema.gtin || schema.mpn || schema.sku);

  return {
    id: schema.sku || productId,
    title: schema.name || '',
    description: (schema.description || '').substring(0, 5000), // GMC limit
    availability: gmcAvailability,
    'availability date': '',
    'expiration date': '',
    link: url,
    'mobile link': url,
    'image link': mainImage,
    price: formattedPrice,
    'sale price': salePrice,
    'sale price effective date': salePriceEffective,
    'identifier exists': hasIdentifier ? 'yes' : 'no',
    gtin: schema.gtin || '',
    mpn: schema.sku || '',
    brand: schema.brand?.name || BRAND,
    'product highlight': '',
    'product detail': '',
    'additional image link': additionalImages,
    condition: condition,
    adult: 'no',
    color: '',
    size: '',
    'size type': '',
    'size system': '',
    gender: 'unisex',
    material: '',
    pattern: '',
    'age group': 'adult',
    multipack: '',
    'is bundle': 'no',
    'unit pricing measure': '',
    'unit pricing base measure': '',
    'energy efficiency class': '',
    'min energy efficiency class': '',
    'max energy efficiency class': '',
    'item group id': productId,
    'sell on google quantity': '',
  };
}

/**
 * Main function
 */
async function main() {
  console.log('Starting GMC Feed Export...\n');

  // Get product URLs
  const urls = await getProductUrls();

  // Fetch each product and extract schema
  const products = [];
  const batchSize = 5; // Fetch 5 at a time to avoid overwhelming server

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    console.log(
      `Fetching products ${i + 1}-${Math.min(i + batchSize, urls.length)} of ${urls.length}...`
    );

    const batchResults = await Promise.all(
      batch.map(async (url) => {
        const schema = await fetchProductSchema(url);
        return { url, schema };
      })
    );

    for (const { url, schema } of batchResults) {
      if (schema) {
        const row = mapToGmcRow(schema, url);
        if (row) {
          products.push(row);
        }
      }
    }

    // Small delay between batches
    if (i + batchSize < urls.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log(`\nSuccessfully extracted ${products.length} products`);

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Create worksheet data with headers
  const wsData = [GMC_HEADERS];

  // Add product rows
  for (const product of products) {
    const row = GMC_HEADERS.map((header) => product[header] || '');
    wsData.push(row);
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = GMC_HEADERS.map((header) => ({
    wch: Math.max(header.length, 15),
  }));

  XLSX.utils.book_append_sheet(wb, ws, 'Products');

  // Write file
  const outputPath = './gmc-product-feed.xlsx';
  XLSX.writeFile(wb, outputPath);
  console.log(`\nExported to: ${outputPath}`);

  // Also export as CSV for easy viewing
  const csvPath = './gmc-product-feed.csv';
  XLSX.writeFile(wb, csvPath, { bookType: 'csv' });
  console.log(`Also exported CSV to: ${csvPath}`);
}

main().catch(console.error);
