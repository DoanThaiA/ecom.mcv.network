import { Box } from '@radix-ui/themes';
import { Navigation } from '@/components/navigation/Navigation';
import { SecondaryNavigation } from '@/components/navigation/SecondaryNavigation';
import { Footer } from '@/components/layout/Footer';
import { ReactNode } from 'react';
import { AppLocale } from '@/lib/locale';
import { getShopMenus } from '@/lib/repositories/menu.repository';
import type { ShopMenuItemWithLevel } from '@/lib/repositories/menu.repository';
import { productCategoryRepository } from '@/lib/repositories';
import type { ProductCategory } from '@/types/gen/shared/shared/product-categories/product-category';

export interface PageLayoutData {
  categories: ProductCategory[];
  menus: ShopMenuItemWithLevel[];
}

interface PageLayoutProps {
  locale: AppLocale;
  children: ReactNode | ((_data: PageLayoutData) => ReactNode);
  showSecondaryNav?: boolean;
  className?: string;
}

export async function PageLayout({
  locale,
  children,
  showSecondaryNav = true,
  className = '',
}: PageLayoutProps) {
  const [categories, menusResponse] = await Promise.all([
    productCategoryRepository.getAllCategories(),
    getShopMenus(),
  ]);

  const data: PageLayoutData = {
    categories,
    menus: menusResponse.menus,
  };

  return (
    <Box className="flex flex-col min-h-screen">
      {/* Navigation */}
      <Navigation locale={locale} />

      {/* Secondary Navigation */}
      {showSecondaryNav && (
        <SecondaryNavigation
          locale={locale}
          categories={categories}
          menus={menusResponse.menus}
        />
      )}

      {/* Main Content */}
      <Box className={className || 'flex-1'}>
        {typeof children === 'function' ? children(data) : children}
      </Box>

      {/* Footer */}
      <Footer locale={locale} />
    </Box>
  );
}
