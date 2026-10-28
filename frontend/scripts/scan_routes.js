// scan-routes.js
// Scan all pages from sitemap with deduplicated dynamic routes
//
// Usage:
//   node scripts/scan_routes.js          # Default: local
//   node scripts/scan_routes.js --local  # Scan localhost:3000
//   node scripts/scan_routes.js --live   # Scan production (cchat.vn)

const { chromium } = require("playwright");

// ============ CONFIGURATION ============
// Change this to toggle default mode, or use --local / --live flag
const DEFAULT_MODE = "local"; // "local" | "live"
// ========================================

const URLS = {
  local: "http://localhost:3000",
  live: "https://cchat.vn",
};

// Parse command line args
const args = process.argv.slice(2);
const MODE = args.includes("--live")
  ? "live"
  : args.includes("--local")
    ? "local"
    : DEFAULT_MODE;

const BASE_URL = URLS[MODE];
const SITEMAP_BASE_URL = URLS.live; // Sitemap always uses production URL

const visited = new Set();
const errors = [];

// Dynamic route patterns to deduplicate
const DYNAMIC_PATTERNS = {
  products: /\/products\/[\w-]+$/,
  category: /\/danh-muc\/[\w-]+$/,
  topic: /\/topic\/[\w-]+$/,
};

// Routes to exclude from scanning
const EXCLUDED_PATTERNS = [/\/health/, /\/404/];

/**
 * Fetch and parse sitemap.xml to get all URLs
 */
async function fetchSitemap() {
  try {
    const response = await fetch(`${BASE_URL}/sitemap.xml`);
    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.status}`);
    }
    const xml = await response.text();

    // Parse XML to extract <loc> tags
    const locMatches = xml.match(/<loc>(.*?)<\/loc>/g);
    if (!locMatches) {
      return [];
    }

    const urls = locMatches.map((loc) => {
      const url = loc.replace(/<\/?loc>/g, "");
      // Replace production URL with target URL (only needed for local mode)
      return url.replace(SITEMAP_BASE_URL, BASE_URL);
    });
    return urls;
  } catch (err) {
    console.error(`❌ Error fetching sitemap: ${err.message}`);
    return [];
  }
}

/**
 * Deduplicate dynamic routes - keep only one URL per pattern
 */
function deduplicateUrls(urls) {
  const seen = new Set();
  const result = [];

  for (const url of urls) {
    let patternKey = null;

    // Check if URL matches any dynamic pattern
    for (const [key, regex] of Object.entries(DYNAMIC_PATTERNS)) {
      if (regex.test(url)) {
        patternKey = key;
        break;
      }
    }

    if (patternKey) {
      // Dynamic route - only include first occurrence
      if (!seen.has(patternKey)) {
        seen.add(patternKey);
        result.push(url);
      }
    } else {
      // Static route - always include
      result.push(url);
    }
  }

  return result;
}

/**
 * Filter out excluded routes
 */
function filterExcluded(urls) {
  return urls.filter(
    (url) => !EXCLUDED_PATTERNS.some((pattern) => pattern.test(url))
  );
}

/**
 * Scan a single URL
 */
async function scanUrl(page, url) {
  if (visited.has(url)) return;

  visited.add(url);

  try {
    const response = await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 15000,
    });

    if (!response) {
      errors.push({ url, error: "No response" });
      return;
    }

    const status = response.status();

    if (status >= 400) {
      errors.push({ url, error: `HTTP ${status}` });
    }

    console.log(`✅ ${url} (${status})`);
  } catch (err) {
    errors.push({ url, error: err.message });
    console.log(`💥 ${url} crashed: ${err.message}`);
  }
}

(async () => {
  console.log(`🚀 Mode: ${MODE.toUpperCase()} (${BASE_URL})`);
  console.log("🔍 Fetching sitemap...");

  // Step 1: Fetch sitemap
  const allUrls = await fetchSitemap();
  if (allUrls.length === 0) {
    console.error("❌ No URLs found in sitemap. Is the dev server running?");
    process.exit(1);
  }
  console.log(`📄 Found ${allUrls.length} URLs in sitemap`);

  // Step 2: Filter excluded routes
  const filteredUrls = filterExcluded(allUrls);
  console.log(`🔧 After excluding health/404: ${filteredUrls.length} URLs`);

  // Step 3: Deduplicate dynamic routes
  const urlsToScan = deduplicateUrls(filteredUrls);
  console.log(`📋 After deduplication: ${urlsToScan.length} URLs to scan\n`);

  // Step 4: Launch browser and scan
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on("pageerror", (err) => {
    errors.push({ url: page.url(), error: `Page error: ${err.message}` });
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push({ url: page.url(), error: `Console error: ${msg.text()}` });
    }
  });

  // Scan each URL
  for (const url of urlsToScan) {
    await scanUrl(page, url);
  }

  await browser.close();

  console.log("\n=====================");
  console.log("Scan finished");
  console.log("Pages scanned:", visited.size);

  if (errors.length) {
    console.log("\n❌ Errors found:");
    console.table(errors);
    process.exit(1);
  } else {
    console.log("\n🎉 No errors found");
  }
})();
