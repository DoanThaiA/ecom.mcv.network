import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBreadcrumb } from 'src/contexts/breadcrumb-context';
import { NavbarData } from 'src/layouts/config-nav-dashboard';
import { generateBreadcrumbsFromNav } from 'src/utils/breadcrumb-generator';

/**
 * Hook to automatically sync breadcrumbs based on current route
 *
 * This hook automatically generates breadcrumbs from the navigation configuration.
 * It should be called once in the DashboardLayout component.
 *
 * How it works:
 * 1. Reads navigation items from NavbarData
 * 2. Matches current path against navigation paths
 * 3. Builds breadcrumb trail automatically
 * 4. Translates labels using i18n
 *
 * No manual configuration needed!
 */
export function useBreadcrumbSync() {
  const location = useLocation();
  const { setBreadcrumbs } = useBreadcrumb();
  const { t } = useTranslation();

  useEffect(() => {
    // Get navigation data
    const navData = new NavbarData().getNavigation();

    // Generate breadcrumbs from navigation
    const breadcrumbs = generateBreadcrumbsFromNav(navData, location.pathname);

    if (breadcrumbs) {
      // Translate breadcrumb labels
      const translatedBreadcrumbs = breadcrumbs.map((item) => ({
        ...item,
        label: t(item.label),
      }));

      setBreadcrumbs(translatedBreadcrumbs);
    } else {
      // No breadcrumbs found for this route (e.g., home page or auth pages)
      setBreadcrumbs([]);
    }
  }, [location.pathname, setBreadcrumbs, t]);
}
