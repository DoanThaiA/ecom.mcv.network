import { productPromotionHighlightsRepository } from '@/lib/repositories/productPromotionHighlights.repository';
import { ProductPromotionHighlights } from './ProductPromotionHighlights';

interface ProductPromotionHighlightsLoaderProps {
  productId: string;
}

export async function ProductPromotionHighlightsLoader({
  productId,
}: ProductPromotionHighlightsLoaderProps) {
  const highlights =
    await productPromotionHighlightsRepository.getByProductId(productId);

  if (!highlights) return null;

  return (
    <ProductPromotionHighlights
      highlights={highlights}
      productId={productId}
      evaluatedAt={new Date().toISOString()}
    />
  );
}
