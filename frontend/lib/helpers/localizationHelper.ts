import { AppLocale } from '@/lib/locale';
import type { Localization } from '@/types/gen/shared/shared/common/localization';
import type {
  Product,
  ProductDetails,
} from '@/types/gen/shared/shared/products/product';

/**
 * Lấy tên đã được localize theo locale hiện tại
 * Nếu không có localization hoặc không có giá trị cho locale, fallback về name
 * @param name - Tên mặc định (fallback)
 * @param localization - Object chứa các bản dịch (vi, en)
 * @param locale - Locale hiện tại (vi hoặc en)
 * @returns Tên đã được localize hoặc name nếu không có
 */
export function getLocalizedName(
  name: string,
  localization: Localization | undefined,
  locale: AppLocale
): string {
  if (!localization) return name;
  return localization[locale] || name;
}

/**
 * Lấy tên sản phẩm đã được localize
 * @param product - Đối tượng Product
 * @param locale - Locale hiện tại (vi hoặc en)
 * @returns Tên sản phẩm đã được localize
 */
export function getLocalizedProductName(
  product: Product,
  locale: AppLocale
): string {
  return getLocalizedName(product.name, product.nameLocalization, locale);
}

/**
 * Lấy mô tả sản phẩm đã được localize
 * @param product - Đối tượng Product
 * @param locale - Locale hiện tại (vi hoặc en)
 * @returns Mô tả sản phẩm đã được localize hoặc undefined (không fallback về description gốc)
 */
export function getLocalizedProductDescription(
  product: Product,
  locale: AppLocale
): string | undefined {
  if (!product.descriptionLocalization) return undefined;
  const hasContent = (s?: string) => !!s && s.replace(/<[^>]*>/g, '').trim().length > 0;
  const localized = product.descriptionLocalization[locale];
  return hasContent(localized) ? localized : (hasContent(product.descriptionLocalization.vi) ? product.descriptionLocalization.vi : undefined);
}

/**
 * Lấy chi tiết sản phẩm đã được localize
 * @param product - Đối tượng Product
 * @param locale - Locale hiện tại (vi hoặc en)
 * @returns Chi tiết sản phẩm đã được localize hoặc undefined
 */
export function getLocalizedProductDetails(
  product: Product,
  locale: AppLocale
): ProductDetails | undefined {
  if (!product.details && !product.detailsLocalization) return undefined;

  const details = product.details;
  const localization = product.detailsLocalization;

  return {
    material:
      getLocalizedName(details?.material || '', localization?.material, locale) ||
      undefined,
    style:
      getLocalizedName(details?.style || '', localization?.style, locale) ||
      undefined,
    highlights:
      getLocalizedName(
        details?.highlights || '',
        localization?.highlights,
        locale
      ) || undefined,
    suitableFor:
      getLocalizedName(
        details?.suitableFor || '',
        localization?.suitableFor,
        locale
      ) || undefined,
    careInstructions:
      getLocalizedName(
        details?.careInstructions || '',
        localization?.careInstructions,
        locale
      ) || undefined,
  };
}
