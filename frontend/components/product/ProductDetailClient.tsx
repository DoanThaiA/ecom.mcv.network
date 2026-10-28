'use client';

import {
  getLocalizedProductDescription,
  getLocalizedProductDetails,
  getLocalizedProductName,
} from '@/lib/helpers/localizationHelper';
import { showWarningToast, showErrorToast } from '@/lib/helpers/toastHelper';
import {
  buildColorImageGroups,
  findColorAtIndex,
} from '@/lib/helpers/variantHelper';
import { AppLocale } from '@/lib/locale';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { addToCartRequest } from '@/lib/store/slices/cartSlice';
import { selectColorVariantsByName } from '@/lib/store/slices/colorVariantSlice';
import { getColorSwatchStyle } from '@/lib/utils/colorVariantRenderer';
import { formatPrice } from '@/lib/utils/format';
import type { Product } from '@/types/gen/shared/shared/products/product';
import { MinusIcon, PlusIcon } from '@radix-ui/react-icons';
import { Box, Button, Dialog, Flex, Heading, Text } from '@radix-ui/themes';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ProductComboSection } from './ProductComboSection';
import { ProductDescriptionSection } from './product-description';
import { ProductImageSlider } from './ProductImageSlider';
import { ProductPolicy } from './ProductPolicy';
import { ProductStickyBar } from './ProductStickyBar';
import { StockStatusBadge } from "./StockStatusBadge";
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver';
import { cartRepository } from '@/lib/repositories/cart.repository';
import { PaymentMethod } from '@/types/gen/shop/shared/orders/order';
import { FlashSaleInProductDetail } from '@/components/product/FlashSaleInProductDetail';
import { sortSizesByPattern } from '@/lib/utils/sort';
import { usePreloadVariantImages } from '@/lib/hooks/usePreloadVariantImages';

interface ProductDetailClientProps {
  product: Product;
  locale: AppLocale;
  t: any;
  promotionContent?: ReactNode;
}

export function ProductDetailClient({
  product,
  locale,
  t,
  promotionContent,
}: ProductDetailClientProps) {
  // Extract colors and sizes from variantOptions with robust matching
  const { colors, sizes } = useMemo(() => {
    if (!product.variantOptions?.length) {
      return { colors: [], sizes: [] };
    }

    // Helper function for case-insensitive Vietnamese matching
    const matchesVietnamese = (name: string, patterns: string[]): boolean => {
      const lowerName = name.toLowerCase().trim();
      return patterns.some((pattern) => lowerName === pattern.toLowerCase());
    };

    // Aggregate values from multiple entries with the same attribute name
    const aggregateOptions = (patterns: string[]): string[] => {
      const matchingOptions = product.variantOptions!.filter(
        (opt) =>
          matchesVietnamese(opt.name, patterns) ||
          patterns.some((p) => opt.name.toLowerCase().includes(p.toLowerCase()))
      );

      // Flatten and deduplicate values
      const allValues = matchingOptions.flatMap((opt) => opt.values || []);
      return Array.from(new Set(allValues));
    };

    // Color patterns: Vietnamese and English variations
    const colorPatterns = ["Màu sắc", "Màu Sắc", "color", "colour"];

    // Size patterns: Vietnamese variations and English
    const sizePatterns = [
      "Kích cỡ",
      "Kích Cỡ",
      "Kích thước",
      "Kích Thước",
      "size",
    ];
    const sizeAggregateOptions = aggregateOptions(sizePatterns);
    const sortSize = sortSizesByPattern(sizeAggregateOptions);
    return {
      colors: aggregateOptions(colorPatterns),
      sizes: sortSize,
    };
  }, [product.variantOptions]);
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const colorVariantsByName = useAppSelector(selectColorVariantsByName);

  // Preload variant images for faster color switching
  const { preloadColor } = usePreloadVariantImages(
    colors,
    product.variants || [],
    product.code
  );

  // Helper function to check if a color has any in-stock sizes
  const isColorOutOfStock = (color: string): boolean => {
    if (!product.variants?.length) return false;

    // Check if this color has at least one in-stock variant
    const hasInStockVariant = product.variants.some((variant) => {
      // Check both separator patterns: underscore and dash
      const normalizedCode = variant.code?.toLowerCase() ?? "";
      const normalizedColor = color.toLowerCase().trim();
      const hasColor =
        normalizedCode.includes(`_${normalizedColor}-`) ||
        normalizedCode.includes(`-${normalizedColor}-`) ||
        normalizedCode.endsWith(`_${normalizedColor}`) ||
        normalizedCode.endsWith(`-${normalizedColor}`);
      const isInStock = (variant.inventory?.available ?? 0) > 0;
      return hasColor && isInStock;
    });

    return !hasInStockVariant;
  };

  // Set initial color when colors are loaded - select first available color
  useEffect(() => {
    if (colors.length > 0 && !selectedColor) {
      // Find first available color (not out of stock)
      const firstAvailableColor = colors.find(
        (color) => !isColorOutOfStock(color)
      );
      setSelectedColor(firstAvailableColor || colors[0]);
    }
  }, [colors, product.variants]);

  // Set initial size when sizes are loaded - select first available size
  useEffect(() => {
    if (sizes.length > 0 && !selectedSize && selectedColor) {
      // Find first available size for selected color
      const firstAvailableSize = sizes.find((size) => {
        if (!product.variants?.length) return true;

        const normalizedColor = selectedColor.toLowerCase().trim();
        const normalizedSize = size.toLowerCase().trim();
        const variantCodeUnderscore = `${product.code}_${normalizedColor}-${normalizedSize}`;
        const variantCodeDash = `${product.code}-${normalizedColor}-${normalizedSize}`;

        const variant = product.variants.find(
          (v) =>
            v.code?.toLowerCase() === variantCodeUnderscore ||
            v.code?.toLowerCase() === variantCodeDash
        );

        return variant && (variant.inventory?.available ?? 0) > 0;
      });
      setSelectedSize(firstAvailableSize || sizes[0]);
    }
  }, [sizes, selectedColor, product.variants, product.code]);

  // Reset size selection when color changes
  useEffect(() => {
    if (!selectedColor) return;

    // Scenario 1: Check if currently selected size is still available for the new color
    if (selectedSize && !isSizeOutOfStock(selectedSize)) {
      // Current size is available for new color, keep it selected
      return;
    }

    // Scenario 2: Current size is unavailable, try to find another available size
    const firstAvailableSize = sizes.find((size) => !isSizeOutOfStock(size));

    if (firstAvailableSize) {
      // Found an available size, auto-select it
      setSelectedSize(firstAvailableSize);
    } else {
      // Scenario 3: No sizes are available, unselect
      setSelectedSize(null);
    }
  }, [selectedColor, selectedSize, sizes]);

  // Helper function to check if a size is out of stock for the selected color
  const isSizeOutOfStock = (size: string): boolean => {
    if (!product.variants?.length) return false;
    if (!selectedColor) return false;

    // Try both underscore and dash separators
    const normalizedColor = selectedColor.toLowerCase().trim();
    const normalizedSize = size.toLowerCase().trim();
    const normalizedProductCode = product.code.toLowerCase();
    const variantCodeUnderscore = `${normalizedProductCode}_${normalizedColor}-${normalizedSize}`;
    const variantCodeDash = `${normalizedProductCode}-${normalizedColor}-${normalizedSize}`;

    const variant = product.variants.find(
      (v) =>
        v.code?.toLowerCase() === variantCodeUnderscore ||
        v.code?.toLowerCase() === variantCodeDash
    );

    if (!variant) return true; // If variant doesn't exist, consider it out of stock
    return (variant.inventory?.available ?? 0) === 0;
  };

  // Find selected variant based on color and size using code pattern: {productCode}_{color}-{size}
  const selectedVariant = useMemo(() => {
    if (!product.variants?.length) return null;

    // If both color and size are selected, construct the code and find matching variant
    if (selectedColor && selectedSize) {
      // Try with underscore separator first (e.g., "AH023_trắng-S")
      const normalizedColor = selectedColor.toLowerCase().trim();
      const normalizedSize = selectedSize.toLowerCase().trim();
      const normalizedProductCode = product.code.toLowerCase();
      const variantCodeUnderscore = `${normalizedProductCode}_${normalizedColor}-${normalizedSize}`;
      // Fallback to dash separator (e.g., "AH023-trắng-S")
      const variantCodeDash = `${normalizedProductCode}-${normalizedColor}-${normalizedSize}`;

      const found =
        product.variants.find(
          (variant) =>
            variant.code?.toLowerCase() === variantCodeUnderscore ||
            variant.code?.toLowerCase() === variantCodeDash
        ) || null;

      return found;
    }

    // If only color is selected, find variant by color
    if (selectedColor && !selectedSize) {
      // Try both underscore and dash patterns
      const normalizedColor = selectedColor.toLowerCase().trim();
      const normalizedProductCode = product.code.toLowerCase();
      const colorPatternUnderscore = `${normalizedProductCode}_${normalizedColor}`;
      const colorPatternDash = `${normalizedProductCode}-${normalizedColor}`;
      return (
        product.variants.find((variant) => {
          const normalizedCode = variant.code?.toLowerCase() ?? "";
          return (
            normalizedCode.startsWith(colorPatternUnderscore) ||
            normalizedCode.startsWith(colorPatternDash)
          );
        }) || null
      );
    }

    // If only size is selected, find variant by size
    if (!selectedColor && selectedSize) {
      const normalizedSize = selectedSize.toLowerCase().trim();
      return (
        product.variants.find((variant) =>
          variant.code?.toLowerCase().endsWith(`-${normalizedSize}`)
        ) || null
      );
    }

    return null;
  }, [selectedColor, selectedSize, product.variants, product.code]);

  // Get current prices from selected variant or product
  const currentPrices = useMemo(() => {
    return selectedVariant?.prices || product.prices;
  }, [selectedVariant, product.prices]);

  // Get display prices - prioritize flash sale > product discount > regular
  const displayPrices = useMemo(() => {
    // Original price: prices.retail || flashSale.originalPrice || productDiscount.originalPrice
    const originalPrice =
      currentPrices?.retail ||
      product.flashSale?.originalPrice ||
      product.productDiscount?.originalPrice ||
      0;

    // Priority 1: Flash Sale (only when stock is available and price is actually discounted)
    const hasFlashSale =
      product.flashSale?.flashSaleId &&
      product.flashSale?.flashSalePrice >= 0 &&
      (product.flashSale?.remainingStock ?? 0) > 0 &&
      (product.flashSale?.effectivePrice ?? originalPrice) < originalPrice;
    if (hasFlashSale) {
      return {
        finalPrice: product.flashSale?.flashSalePrice || 0,
        originalPrice,
        discountAmount: product.flashSale?.discountAmount,
        discountPercent: product.flashSale?.discountPercent || 0,
        isFlashSale: true,
        isProductDiscount: false,
      };
    }
      

    // Priority 2: Product Discount (CTKM auto-apply, no min order)
    const hasPd =
      product.productDiscount?.promotionId &&
      product.productDiscount?.discountedPrice >= 0;
    if (hasPd) {
      return {
        finalPrice: product.productDiscount?.discountedPrice || 0,
        originalPrice,
        discountAmount: product.productDiscount?.discountAmount,
        discountPercent: product.productDiscount?.discountPercent || 0,
        isFlashSale: false,
        isProductDiscount: true,
      };
    }

    return {
      finalPrice: currentPrices?.retail || originalPrice,
      originalPrice,
      discountAmount: undefined,
      discountPercent: 0,
      isFlashSale: false,
      isProductDiscount: false,
    };
  }, [product.flashSale, product.productDiscount, currentPrices]);

  // Every colour's images, back to back, so the customer can swipe from the
  // last shot of one colour straight into the first shot of the next.
  // Deliberately independent of the current selection: the list stays stable
  // while browsing, so switching colour never remounts or refetches images.
  const colorImageGroups = useMemo(
    () =>
      buildColorImageGroups(
        colors,
        product.variants,
        product.code,
        product.images
      ),
    [colors, product.variants, product.code, product.images]
  );

  const images = useMemo(
    () => colorImageGroups.flatMap((group) => group.images),
    [colorImageGroups]
  );

  // color -> where that colour's images start and how many there are
  const colorImageRanges = useMemo(() => {
    const ranges = new Map<string, { start: number; count: number }>();
    colorImageGroups.forEach((group) => {
      if (group.color) {
        ranges.set(group.color, {
          start: group.startIndex,
          count: group.images.length,
        });
      }
    });
    return ranges;
  }, [colorImageGroups]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Thumbnails and dots cover only the colour on screen, otherwise a product
  // with several colours would list every image at once and the dots would stop
  // telling the customer where they are.
  const activeColorImageRange = useMemo(
    () => (selectedColor ? colorImageRanges.get(selectedColor) : undefined),
    [selectedColor, colorImageRanges]
  );

  /**
   * Tapping a swatch jumps to that colour's first image - unless we are already
   * looking at one of its images, in which case staying put is less jarring.
   */
  const handleSelectColor = useCallback(
    (color: string) => {
      setSelectedColor(color);

      const range = colorImageRanges.get(color);
      if (!range) return;

      setCurrentImageIndex((previous) =>
        previous >= range.start && previous < range.start + range.count
          ? previous
          : range.start
      );
    },
    [colorImageRanges]
  );

  /**
   * Swiping into another colour's images selects that colour, so price, sizes
   * and the add-to-cart button always describe the garment on screen.
   */
  const handleImageIndexChange = useCallback(
    (index: number) => {
      setCurrentImageIndex(index);

      const color = findColorAtIndex(colorImageGroups, index);
      if (!color) return;

      setSelectedColor((previous) => (previous === color ? previous : color));
    },
    [colorImageGroups]
  );

  // Open the gallery on the initially selected colour rather than on image 0,
  // which can belong to a different colour when the first one is sold out.
  const hasAlignedInitialImageRef = useRef(false);
  useEffect(() => {
    if (hasAlignedInitialImageRef.current || !selectedColor) return;

    const range = colorImageRanges.get(selectedColor);
    if (!range) return;

    hasAlignedInitialImageRef.current = true;
    setCurrentImageIndex(range.start);
  }, [selectedColor, colorImageRanges]);

  // The sticky bar steps aside while the inline colour/size/CTA block is on
  // screen, so the customer never sees two add-to-cart buttons at once.
  const { ref: inlineCtaRef, isIntersecting: isInlineCtaVisible } =
    useIntersectionObserver<HTMLDivElement>();

  const [stickyBarHeight, setStickyBarHeight] = useState(0);

  // Check inventory availability based on selected variant or product
  const currentInventory = useMemo(() => {
    return selectedVariant?.inventory || product.inventory;
  }, [selectedVariant, product.inventory]);

  const inStock = (currentInventory?.available ?? 0) > 0;

  const maxQuantity = Math.max(1, currentInventory?.available ?? 99);

  // Determine if add to cart button should be disabled
  const isAddToCartDisabled = useMemo(() => {
    // Disable if not in stock
    if (!inStock) return true;

    // Disable if no prices available
    if (!currentPrices) return true;

    // If product has colors, must select one
    if (colors.length > 0 && !selectedColor) return true;

    // If product has sizes, must select one
    if (sizes.length > 0 && !selectedSize) return true;

    // If both color and size are selected, must have a valid variant
    if (selectedColor && selectedSize && !selectedVariant) return true;

    return false;
  }, [
    inStock,
    currentPrices,
    colors.length,
    sizes.length,
    selectedColor,
    selectedSize,
    selectedVariant,
  ]);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity < 1) return;

    if (newQuantity > maxQuantity) {
      showWarningToast(t("maxQuantityReached", { max: maxQuantity }));
      return;
    }

    setQuantity(newQuantity);
  };

  // Auto-adjust quantity when variant changes and exceeds new max
  useEffect(() => {
    if (quantity > maxQuantity) {
      setQuantity(maxQuantity);
    }
  }, [maxQuantity]);

  const handleAddToCart = () => {
    // Validate color selection
    if (colors.length > 0 && !selectedColor) {
      showWarningToast(t('pleaseSelectColor'));
      return;
    }

    // Validate size selection
    if (sizes.length > 0 && !selectedSize) {
      showWarningToast(t('pleaseSelectSize'));
      return;
    }

    if (!inStock || isAdding || !currentPrices) return;

    setIsAdding(true);

    const payload = {
      productId: product.id,
      variantId: selectedVariant?.id,
      name: selectedVariant?.name || product.name,
      price: displayPrices.finalPrice,
      originalPrice: displayPrices.originalPrice || undefined,
      imageUrl: images[0] || '',
      quantity,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    };

    console.log(
      '[ProductDetail] Dispatching addToCartRequest with payload:',
      payload
    );

    dispatch(addToCartRequest(payload));

    setTimeout(() => setIsAdding(false), 500);
  };

  const handleBuyNow = async () => {
    // Validate color selection
    if (colors.length > 0 && !selectedColor) {
      showWarningToast(t('pleaseSelectColor'));
      return;
    }

    // Validate size selection
    if (sizes.length > 0 && !selectedSize) {
      showWarningToast(t('pleaseSelectSize'));
      return;
    }

    if (!inStock || isBuyingNow || !currentPrices) return;

    setIsBuyingNow(true);
    try {
      // Create checkout session directly without adding to cart
      const checkoutSession = await cartRepository.upsertCheckoutSession({
        items: [{
          productId: product.id,
          variantId: selectedVariant?.id,
          quantity,
        }],
        combos: [],
        clearCartAfterOrder: false, // Don't clear cart since we didn't add to it
        paymentMethod: PaymentMethod.PAYMENT_METHOD_COD,
      });

      // Navigate to confirm order page with session ID and source tracking
      router.push(`/${locale}/cart/confirm?checkoutSessionId=${checkoutSession.id}&source=product&productId=${product.id}`);
    } catch (error) {
      showErrorToast(t('failedToProceedCheckout'));
      console.error('[ProductDetail] Failed to create checkout session:', error);
    } finally {
      setIsBuyingNow(false);
    }
  };

  // Get flash sale end time from product data
  const flashSaleEndTime = useMemo(() => {
    const endTime = product.flashSale?.endTime;
    if (!endTime) return null;

    // Check if flash sale has expired
    const endDate = new Date(endTime);
    const now = new Date();

    if (isNaN(endDate.getTime()) || endDate.getTime() < now.getTime()) {
      return null; // Don't show expired flash sales
    }

    return endTime;
  }, [product.flashSale?.endTime]);

  return (
    // Reserve exactly the sticky bar's height so it never covers the last
    // section. Measures 0 on desktop, where the bar is display:none.
    <Box style={{ paddingBottom: stickyBarHeight }}>
      <Flex gap="6" className="min-w-0 max-w-full flex-col lg:flex-row">
        {/* Left: Image Gallery & Flash Sale */}
        <Flex direction="column" gap="4">
          {/* Product Image Slider */}
          <ProductImageSlider
            images={images}
            productName={product.name}
            hasFlashSale={product.flashSale?.flashSaleId != null}
            productBanner={product.productBanner}
            badge={product.badge}
            targetIndex={currentImageIndex}
            onIndexChange={handleImageIndexChange}
            visibleRange={activeColorImageRange}
          />

          {/* Flash Sale Timer */}
          {flashSaleEndTime && (
            <FlashSaleInProductDetail
              title={""}
              seeAllText={""}
              locale={locale}
              showTimer={true}
              endTime={flashSaleEndTime}
            />
          )}
        </Flex>
        {/* Right: Product Info */}
        <Box className="min-w-0 max-w-full flex-1 w-full px-4">
          {/* Product Name */}
          <Heading size="6" className="mb-2 font-bold text-black">
            {getLocalizedProductName(product, locale)}
          </Heading>

          {/* Product Code */}
          <Text className="text-gray-600 mb-4 text-sm">
            {t("productCode")}: {product.code}
          </Text>

          {/* Price Section */}
          <Flex direction="column" className="mt-4">
            {displayPrices.finalPrice >= 0 && (
              <>
                {/* Original Price (Strikethrough when there's a discount) */}
                <Text className="text-gray-500 text-sm line-through">
                  {displayPrices.originalPrice > 0 &&
                  displayPrices.originalPrice !== displayPrices.finalPrice
                    ? formatPrice(displayPrices.originalPrice)
                    : ""}
                </Text>
                {/* Final Price */}
                <Flex align="center" gap="2" className="flex-wrap">
                  <Text weight="bold" className="text-black text-2xl">
                    {formatPrice(displayPrices.finalPrice)}
                  </Text>
                  {displayPrices.discountPercent > 0 && (
                    <Box className="bg-red-600 text-white font-[12px] rounded flex items-center justify-center text-xs min-w-[34px] p-1">
                      -{displayPrices.discountPercent}%
                    </Box>
                  )}
                </Flex>
              </>
            )}
          </Flex>

          {promotionContent}

          {/* Color Selection - sits under name and price on every breakpoint */}
          {colors.length > 0 && (
            <Box className="mb-5">
              <Flex direction="row" align="center" gap="3" className="mb-3">
                <Text weight="medium" className="block text-black text-sm">
                  {`${t("color")}: ${selectedColor}`}
                </Text>
                <Box>
                  {/* Stock Status */}
                  <StockStatusBadge
                    available={
                      sizes.length > 0 && !selectedSize
                        ? 0
                        : currentInventory?.available ?? 0
                    }
                    t={t}
                    className=""
                  />
                </Box>
              </Flex>
              <Flex gap={{ initial: '5', md: '3' }} className="flex-wrap">
                {colors.map((color, index) => {
                  const isSelected = selectedColor === color;

                  return (
                    <Box
                      key={index}
                      /* No bg-no-repeat here: the polka-dot and checkered
                         swatches are small tiles that must repeat to fill */
                      className={`h-[32px] w-[62px] md:h-[30px] md:w-[54px] transition-all duration-150 rounded-full overflow-hidden cursor-pointer
                    hover:ring-[#9B5526] ring-offset-[2px] md:ring-offset-[4px] lg:ring-offset-2
                    ${isSelected ? "ring-[3px] ring-[#9B5526]" : "ring-1 ring-[#F39F3C]"}
                    `}
                      style={{
                        ...getColorSwatchStyle(
                          colorVariantsByName[color.toLowerCase().trim()],
                          color
                        ),
                      }}
                      onClick={() => handleSelectColor(color)}
                      onMouseEnter={() => preloadColor(color)}
                    ></Box>
                  );
                })}
              </Flex>
            </Box>
          )}

          {/* Size Selection */}
          {sizes.length > 0 && (
            <Box className="mb-5">
              <Flex justify="between" align="center" className="mb-3">
                <Text weight="medium" className="text-black text-sm">
                  {t("size")}
                </Text>
                <button
                  className="text-sm underline underline-offset-2 cursor-pointer hover:opacity-80 bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(90deg, #FAA63E 2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)" }}
                  onClick={() => setSizeGuideOpen(true)}
                >
                  {t('sizeGuideLink')}
                </button>
              </Flex>
              <Flex gap="3" className="flex-wrap">
                {sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  const outOfStock = isSizeOutOfStock(size);
                  return (
                    <Box
                      key={size}
                      className={`h-[36px] min-w-[70px] transition-all duration-150 rounded-full lg:h-[36px] lg:min-w-[60px] border text-sm font-medium flex items-center justify-center ${
                        isSelected ? `text-white` : "bg-[#F0F0F0] text-gray-700"
                      } ${
                        outOfStock
                          ? "opacity-40 diagonal-strike border-black"
                          : "border-[#F0F0F0]"
                      }`}
                      style={
                        isSelected
                          ? {
                              background:
                                "linear-gradient(90deg, #FAA63E 2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)",
                            }
                          : undefined
                      }
                      onClick={() => {
                        if (outOfStock) {
                          return;
                        }
                        setSelectedSize(size);
                      }}
                    >
                      {size}
                    </Box>
                  );
                })}
              </Flex>
            </Box>
          )}


          {/* Quantity Label */}
          <Text weight="medium" className="mb-3 block text-black text-sm">
            {t("quantity")}
          </Text>

          {/* Quantity Selector */}
          <Flex gap="3" className="mb-6">
            <Flex
              align="center"
              className="bg-[#FEF8F1] rounded-full p-1 gap-3"
            >
              <button
                className="w-6 h-6 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <MinusIcon width="16" height="16" className="text-white" />
              </button>
              <Box className="min-w-[24px] flex items-center justify-center">
                <Text weight="medium" className="text-black text-base">
                  {quantity}
                </Text>
              </Box>
              <button
                className="w-6 h-6 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= maxQuantity}
              >
                <PlusIcon width="16" height="16" className="text-white" />
              </button>
            </Flex>
          </Flex>

          {/* Action Buttons */}
          <Flex ref={inlineCtaRef} gap="4" className="mb-6">
            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={isAddToCartDisabled || isAdding}
              className="flex-1 bg-[#FEF8F1] text-black hover:bg-[#FEF0E1] cursor-pointer font-semibold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed h-12 text-sm uppercase"
            >
              {t("addToCartButton")}
            </Button>

            {/* Buy Now Button */}
            <Button
              onClick={handleBuyNow}
              disabled={isAddToCartDisabled || isBuyingNow}
              className="flex-1 text-white hover:opacity-90 cursor-pointer font-semibold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed h-12 text-sm uppercase"
              style={{
                background:
                  "linear-gradient(90deg, #FAA63E 2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)",
              }}
            >
              {isBuyingNow ? t("processing") : t("buyNowButton")}
            </Button>
          </Flex>
          <Box className="hidden lg:block">
            {/* Product Policy - Full Width */}
            <ProductPolicy />
          </Box>
        </Box>
      </Flex>

      <Box className="lg:hidden">
        {/* Product Policy - Full Width */}
        <ProductPolicy />
      </Box>

      <Box className="mt-8 px-4">
        {/* Product Description */}
        {(() => {
          const localizedDetails = getLocalizedProductDetails(product, locale);
          return (
            <ProductDescriptionSection
              title={t("descriptionTitle")}
              description={getLocalizedProductDescription(product, locale)}
              descriptionMedia={product.descriptionMedia}
              productName={getLocalizedProductName(product, locale)}
              productCode={product.code}
              details={localizedDetails}
            />
          );
        })()}
      </Box>

      {/* Product Combo Section */}
      <Box className="mt-8 px-4">
        <ProductComboSection productId={product.id} mainProduct={product} />
      </Box>

      {/* Size Guide Dialog */}
      <Dialog.Root open={sizeGuideOpen} onOpenChange={setSizeGuideOpen}>
        <Dialog.Content className="max-w-[90vw] md:max-w-[700px] p-0 overflow-hidden">
          <Dialog.Title className="sr-only">
            {t('sizeGuideLink')}
          </Dialog.Title>
          {product.sizeGuide ? (
            <img
              src={product.sizeGuide}
              alt={t('sizeGuideLink')}
              className="w-full h-auto max-h-[90vh] object-contain block"
            />
          ) : (
            <img
              src="/size-guide.png"
              alt={t('sizeGuideLink')}
              className="w-full h-auto max-h-[90vh] object-contain block"
            />
          )}
        </Dialog.Content>
      </Dialog.Root>

      {/* Mobile sticky purchase bar */}
      <ProductStickyBar
        colors={colors}
        selectedColor={selectedColor}
        onSelectColor={handleSelectColor}
        sizes={sizes}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
        isSizeOutOfStock={isSizeOutOfStock}
        colorVariantsByName={colorVariantsByName}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        disabled={isAddToCartDisabled}
        isAdding={isAdding}
        isBuyingNow={isBuyingNow}
        visible={!isInlineCtaVisible}
        onHeightChange={setStickyBarHeight}
        addToCartLabel={t('addToCartButton')}
        buyNowLabel={t('buyNowButton')}
        processingLabel={t('processing')}
      />
    </Box>
  );
}
