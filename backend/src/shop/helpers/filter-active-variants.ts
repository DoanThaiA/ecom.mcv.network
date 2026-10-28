import { Product } from '../../products/domain/product';
import { ProductStatus } from '../../products/domain/product-status.enum';

type VariantOption = {
  id: string;
  name: string;
  values: string[];
};

/**
 * Lọc variants của 1 product, chỉ giữ các variant có status = ACTIVE
 * và tính lại `variantOptions` từ danh sách đã lọc.
 *
 * Dùng cho các shop endpoint để color/size picker trên storefront không
 * còn hiển thị các variant không bán được (DISCONTINUED, INACTIVE,
 * OUT_OF_STOCK, NEW). CMS endpoint phải giữ nguyên data không lọc.
 *
 * Pure: không mutate input product.
 */
export function filterActiveVariants(product: Product): Product {
  if (product.variants === undefined) {
    return product;
  }
  const activeVariants = product.variants.filter(
    (variant) => variant.status === ProductStatus.ACTIVE,
  );
  const variantOptions = aggregateVariantOptions(activeVariants);
  return { ...product, variants: activeVariants, variantOptions };
}

/**
 * Trả về true khi product là parent đã có variants embed và không còn
 * variant ACTIVE nào — tức không còn SKU con bán được.
 *
 * Không dùng `snapshot.parentId` để detect parent vì repository shop
 * luôn project-out field `snapshot` (xem `BASE_PROJECTION` trong
 * `products/model/product.repository.ts`). Thay vào đó dựa vào sự hiện
 * diện của `variants[]`: standalone không có field này, parent đã embed
 * luôn có mảng non-empty. Parent mới tạo chưa embed xong (`variants` là
 * `undefined` hoặc `[]`) thì trả false để không 404 nhầm trạng thái
 * transient.
 *
 * Shop endpoint coi các product match case này là không tồn tại (trả
 * 404 ở detail, ẩn khỏi list) để tránh tạo đơn hàng với SKU của parent
 * — SKU parent không phải hàng bán thực tế ở Nhanh.
 */
export function hasZeroActiveVariants(product: Product): boolean {
  const variants = product.variants;
  if (!variants || variants.length === 0) {
    return false;
  }
  return !variants.some((variant) => variant.status === ProductStatus.ACTIVE);
}

/**
 * Gộp variant options từ `attributes` của các variant con.
 *
 * Sao logic từ `ProductDocumentRepository.aggregateVariantOptions` để
 * output của shop khớp đúng shape mà sync/embed tạo ra. Method gốc đang
 * `private`; logic đơn giản nên duplicate ở đây để helper
 * giữ được tính pure, dễ test mà không phải mở rộng public API của
 * repository.
 */
function aggregateVariantOptions(
  variants: Array<{
    attributes?: Array<{ id?: number | string; name: string; value: string }>;
  }>,
): VariantOption[] {
  const optionsMap = new Map<
    string,
    { id: string; name: string; values: Set<string> }
  >();

  for (const variant of variants) {
    const attributes = variant.attributes;
    if (!attributes) continue;

    for (const attr of attributes) {
      const attrName = attr.name;

      if (!optionsMap.has(attrName)) {
        optionsMap.set(attrName, {
          id: String(attr.id ?? attrName),
          name: attrName,
          values: new Set(),
        });
      }

      optionsMap.get(attrName)!.values.add(attr.value);
    }
  }

  return Array.from(optionsMap.values()).map(({ id, name, values }) => ({
    id,
    name,
    values: Array.from(values).sort(),
  }));
}
