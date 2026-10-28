# Scan Routes Script

Script to scan all pages from sitemap and detect errors (HTTP errors, JS errors, console errors).

## Prerequisites

- Node.js installed
- Playwright installed (`npm install playwright`)

## Usage

```bash
# Scan localhost (requires dev server running)
node scripts/scan_routes.js

# Explicitly scan localhost
node scripts/scan_routes.js --local

# Scan production (cchat.vn)
node scripts/scan_routes.js --live
```

## Configuration

Edit `scripts/scan_routes.js` to change default mode:

```javascript
const DEFAULT_MODE = "local"; // "local" | "live"
```

## How It Works

1. **Fetch sitemap** - Gets `/sitemap.xml` from target URL
2. **Parse URLs** - Extracts all `<loc>` entries from XML
3. **Filter excluded routes** - Removes `/health` and `/404` pages
4. **Deduplicate dynamic routes** - Keeps only 1 URL per pattern:
   - `/products/*` - 1 product page
   - `/danh-muc/*` - 1 category page
   - `/topic/*` - 1 topic page
5. **Scan each URL** - Opens page with Playwright, checks for errors

## Output

```
🚀 Mode: LOCAL (http://localhost:3000)
🔍 Fetching sitemap...
📄 Found 50 URLs in sitemap
🔧 After excluding health/404: 48 URLs
📋 After deduplication: 15 URLs to scan

✅ http://localhost:3000/vi (200)
✅ http://localhost:3000/vi/about (200)
✅ http://localhost:3000/vi/categories (200)
...

=====================
Scan finished
Pages scanned: 15

🎉 No errors found
```

## Error Detection

The script detects:
- **HTTP errors** - Status codes >= 400
- **Page errors** - JavaScript runtime errors
- **Console errors** - `console.error` messages

If errors are found, they are displayed in a table and the script exits with code 1.

## Adding New Dynamic Patterns

To deduplicate additional dynamic routes, add patterns to `DYNAMIC_PATTERNS`:

```javascript
const DYNAMIC_PATTERNS = {
  products: /\/products\/[\w-]+$/,
  category: /\/danh-muc\/[\w-]+$/,
  topic: /\/topic\/[\w-]+$/,
  // Add new patterns here:
  news: /\/news\/[\w-]+$/,
};
```

## Adding Excluded Routes

To exclude additional routes from scanning:

```javascript
const EXCLUDED_PATTERNS = [
  /\/health/,
  /\/404/,
  // Add new patterns here:
  /\/admin/,
];
```
