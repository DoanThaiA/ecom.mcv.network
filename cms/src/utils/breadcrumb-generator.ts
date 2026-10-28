import type { NavItem } from 'src/layouts/config-nav-dashboard';
import type { BreadcrumbItem } from 'src/contexts/breadcrumb-context';

/**
 * Build a flat map of all navigation paths with their breadcrumb trails
 * This function recursively traverses the navigation tree and builds breadcrumb paths
 */
function buildPathMap(navItems: NavItem[], parentTrail: NavItem[] = []): Map<string, NavItem[]> {
  const pathMap = new Map<string, NavItem[]>();

  for (const item of navItems) {
    const currentTrail = [...parentTrail, item];

    // Only add to map if path is not '#' (placeholder for parent items)
    if (item.path && item.path !== '#') {
      pathMap.set(item.path, currentTrail);
    }

    // Recursively process children
    if (item.children && item.children.length > 0) {
      const childMap = buildPathMap(item.children, currentTrail);
      childMap.forEach((trail, path) => {
        pathMap.set(path, trail);
      });
    }
  }

  return pathMap;
}

/**
 * Match a pathname against navigation paths
 * Supports exact match and dynamic segments (e.g., /product/:id)
 */
function matchPath(navPath: string, currentPath: string): boolean {
  // Exact match
  if (navPath === currentPath) {
    return true;
  }

  // Check if current path starts with nav path (for detail pages)
  // e.g., navPath: '/product', currentPath: '/product/123'
  if (currentPath.startsWith(navPath + '/')) {
    return true;
  }

  return false;
}

/**
 * Generate breadcrumbs from navigation configuration
 *
 * @param navItems - Navigation items from NavbarData
 * @param currentPath - Current pathname (from useLocation)
 * @returns Array of breadcrumb items or null if no match found
 */
export function generateBreadcrumbsFromNav(
  navItems: NavItem[],
  currentPath: string
): BreadcrumbItem[] | null {
  // Build path map from navigation
  const pathMap = buildPathMap(navItems);

  // Find the best matching path
  let bestMatch: { path: string; trail: NavItem[] } | null = null;
  let bestMatchLength = 0;

  pathMap.forEach((trail, path) => {
    if (matchPath(path, currentPath) && path.length > bestMatchLength) {
      bestMatch = { path, trail };
      bestMatchLength = path.length;
    }
  });

  if (!bestMatch) {
    return null;
  }

  // Check if we're on a detail page (has extra path segments)
  const isOnDetailPage = currentPath !== bestMatch.path;

  // Convert navigation trail to breadcrumb items
  const breadcrumbs: BreadcrumbItem[] = bestMatch.trail.map((navItem) => {
    return {
      label: navItem.title,
      // Add href if:
      // 1. Has a valid path (not '#')
      // 2. Either we're on a detail page, OR it's not the last item in trail
      href: navItem.path !== '#' ? navItem.path : undefined,
    };
  });

  // If current path has extra segments, check if it's an action page or detail page
  if (isOnDetailPage) {
    // Extract the extra part (e.g., '/create' from '/flash-sale/create' or '/123' from '/product/123')
    const extraPath = currentPath.substring(bestMatch.path.length);

    if (extraPath.startsWith('/')) {
      // Check if it's an action page (create, edit) or a detail page (ID)
      const isActionPage = extraPath === '/create' || extraPath.startsWith('/edit/');

      if (isActionPage) {
        // For action pages (create/edit), determine the label based on the action
        if (extraPath === '/create') {
          breadcrumbs.push({
            label: 'create', // Will be translated by i18n (e.g., "Tạo mới")
            // No href for current page
          });
        } else if (extraPath.startsWith('/edit/')) {
          breadcrumbs.push({
            label: 'update', // Will be translated by i18n (e.g., "Cập nhật")
            // No href for current page
          });
        }
      } else {
        // For detail pages (e.g., /product/123), add generic detail breadcrumb
        breadcrumbs.push({
          label: 'detail', // Will be translated by i18n
          // No href for current page
        });
      }
    }
  } else {
    // If we're on the list page, remove href from the last item (current page)
    if (breadcrumbs.length > 0) {
      const lastItem = breadcrumbs[breadcrumbs.length - 1];
      lastItem.href = undefined;
    }
  }

  return breadcrumbs;
}

/**
 * Check if a breadcrumb should be added for the current path
 * This helps determine if we're on a detail page
 */
export function isDetailPage(navPath: string, currentPath: string): boolean {
  return currentPath.startsWith(navPath + '/') && currentPath !== navPath;
}
