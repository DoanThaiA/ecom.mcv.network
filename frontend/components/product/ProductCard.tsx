'use client';

import { DEFAULT_PRODUCT_IMAGE, IMAGE_SIZES } from '@/lib/constants';
import { getLocalizedProductName } from '@/lib/helpers/localizationHelper';
import { useIsDesktop } from '@/lib/hooks/useBreakpoint';
import type { AppLocale } from '@/lib/locale';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { addToCartRequest } from '@/lib/store/slices/cartSlice';
import { selectColorVariantsByName } from '@/lib/store/slices/colorVariantSlice';
import { getColorSwatchStyle } from '@/lib/utils/colorVariantRenderer';
import { formatPrice } from '@/lib/utils/format';
import { getProductUrl } from '@/lib/utils/seoUrl';
import {
  findBestVariantWithColor,
  countVariantImages,
} from "@/lib/helpers/variantHelper";
import type { Product } from "@/types/gen/shared/shared/products/product";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { ProductImage } from "@/components/common/ProductImage";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProductBadge as ProductBadgeComponent } from "./ProductBadge";

interface ProductCardProps {
  product: Product;
  locale?: string;
  translations?: {
    addToCart: string;
  };
  fromFlashSale?: boolean;
  priority?: boolean;
}

export function ProductCard({
  product,
  locale = "vi",
  translations = { addToCart: "Thêm vào giỏ hàng" },
  fromFlashSale,
  priority = false,
}: ProductCardProps) {
  const t = useTranslations("productDetail");
  const [isHovered, setIsHovered] = useState(false);
  const [hoverImageLoaded, setHoverImageLoaded] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(
    null
  );
  const [isAdding, setIsAdding] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const [visibleColorCount, setVisibleColorCount] = useState(0);

  const [isTogglingColors, setIsTogglingColors] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const mouseDownY = useRef<number | null>(null);
  const dispatch = useAppDispatch();
  const colorVariantsByName = useAppSelector(selectColorVariantsByName);
  const isDesktop = useIsDesktop();

  // Extract color option from variantOptions (regex for "màu/mau")
  const colorOption = useMemo(
    () => product.variantOptions?.find((opt) => /m[aàáảãạ]u/i.test(opt.name)),
    [product.variantOptions]
  );
  const colorNames = useMemo(
    () => colorOption?.values || [],
    [colorOption?.values]
  );
  useEffect(() => {
    const el = listRef.current;
    if (!el || colorNames.length === 0) return;

    const calculateVisibleCount = () => {
      const containerWidth = el.clientWidth;
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

      const COLOR_WIDTH = isDesktop ? 36 : 30;
      const GAP = 8;
      const TOGGLE_WIDTH = 26; // 18px icon + 8px gap

      // First check if ALL colors fit without toggle
      const totalColorsWidth =
        colorNames.length * COLOR_WIDTH + (colorNames.length - 1) * GAP;

      if (totalColorsWidth <= containerWidth) {
        // All colors fit, no toggle needed
        setVisibleColorCount(colorNames.length);
        return;
      }

      // Not all fit, calculate with toggle space reserved
      const availableWidth = containerWidth - TOGGLE_WIDTH;
      const count = Math.floor((availableWidth + GAP) / (COLOR_WIDTH + GAP));
      setVisibleColorCount(Math.max(1, Math.min(count, colorNames.length)));
    };

    const observer = new ResizeObserver(calculateVisibleCount);
    observer.observe(el);
    calculateVisibleCount();

    return () => observer.disconnect();
  }, [colorNames.length]);

  // Extract size option from variantOptions (regex for "kích/kich")
  const sizeOption = useMemo(
    () => product.variantOptions?.find((opt) => /k[iíìỉĩị]ch/i.test(opt.name)),
    [product.variantOptions]
  );
  const sizes = useMemo(
    () => sizeOption?.values || [],
    [sizeOption?.values]
  );

  // Find variant by color + size.
  // Nhanh-generated variant codes have inconsistent casing/separators (e.g. option
  // value "Kẻ Đen" vs code "...-kẻ đen-M"), so a case-sensitive "===" match silently
  // drops the variant and the item gets added against the parent product (no variantId).
  // Match is therefore case-insensitive and tolerant of both "-"/"_" separators, with an
  // attribute-value fallback (variant.attributes values stay in sync with variantOptions).
  const findVariant = useCallback(
    (colorName: string, sizeName: string) => {
      if (!product.variants?.length) return null;

      const normalizedColor = colorName.toLowerCase().trim();
      const normalizedSize = sizeName.toLowerCase().trim();
      const normalizedProductCode = product.code.toLowerCase();

      // 1) Match by reconstructed code (case-insensitive, "-" or "_" separator)
      const dashCode = `${normalizedProductCode}-${normalizedColor}-${normalizedSize}`;
      const underscoreCode = `${normalizedProductCode}_${normalizedColor}-${normalizedSize}`;
      const byCode = product.variants.find((v) => {
        const code = v.code?.toLowerCase();
        return code === dashCode || code === underscoreCode;
      });
      if (byCode) return byCode;

      // 2) Fallback: match by attribute values (color + size), case-insensitive
      return (
        product.variants.find((v) => {
          const values = (v.attributes ?? []).map(
            (a) => a.value?.toLowerCase().trim() ?? ""
          );
          return (
            values.includes(normalizedColor) && values.includes(normalizedSize)
          );
        }) || null
      );
    },
    [product.code, product.variants]
  );
  // Calculate prices for a given variant (reusable for display and add to cart)
  const calculatePricesForVariant = useCallback(
    (variant: ReturnType<typeof findVariant>) => {
      const displayData = variant || product;
      const retail = displayData.prices?.retail || 0;

      // Check if variant has valid flash sale data before using it
      const variantFlashSale = variant?.flashSale;
      const hasValidVariantFlashSale =
        variantFlashSale?.flashSalePrice != null &&
        variantFlashSale.flashSalePrice >= 0;
      const flashSale = hasValidVariantFlashSale
        ? variantFlashSale
        : product.flashSale;

      // Priority 1: Flash Sale
      if (flashSale?.flashSalePrice != null && flashSale.flashSalePrice >= 0) {
        return {
          finalPrice: flashSale.flashSalePrice,
          originalPrice: flashSale.originalPrice,
          discountPercent: flashSale.discountPercent,
          isFlashSale: true,
        };
      }

      // Priority 2: Product Discount (CTKM auto-apply, no min order)
      const variantPd = variant?.productDiscount;
      const hasValidVariantPd =
        variantPd?.discountedPrice != null && variantPd.discountedPrice > 0;
      const pd = hasValidVariantPd ? variantPd : product.productDiscount;
      if (pd?.discountedPrice != null && pd.discountedPrice >= 0) {
        return {
          finalPrice: pd.discountedPrice,
          originalPrice: pd.originalPrice,
          discountPercent: pd.discountPercent,
          isFlashSale: false,
        };
      }

      // Priority 3: Old price
      const oldPrice = displayData.prices?.old;
      if (oldPrice && oldPrice > retail) {
        return {
          finalPrice: retail,
          originalPrice: oldPrice,
          discountPercent: Math.round(((oldPrice - retail) / oldPrice) * 100),
          isFlashSale: false,
        };
      }

      return {
        finalPrice: retail,
        originalPrice: undefined,
        discountPercent: undefined,
        isFlashSale: false,
      };
    },
    [product]
  );

  // Get current variant based on selected color and first size (for display)
  // Only find variant if user has selected a color
  const currentVariant = useMemo(() => {
    if (selectedColorIndex === null) return null;

    const selectedColor = colorNames[selectedColorIndex] || "";
    const selectedSize = sizes[0] || "";

    return findVariant(selectedColor, selectedSize);
  }, [colorNames, selectedColorIndex, sizes, findVariant]);
  // Use variant data if available, otherwise fallback to parent product
  const displayProduct = currentVariant || product;
  const displayName = getLocalizedProductName(product, locale as AppLocale);

  // Extract product banner - prioritize variant banner over parent
  const productBanner = displayProduct.productBanner || product.productBanner;
  const hasBannerAtBottom = productBanner?.position === 2;

  // 2-tier image fallback system
  const images = useMemo(() => {
    const productImages = product.images;

    // Tier 1: When color selected, find variant with MOST images for that color
    if (selectedColorIndex !== null) {
      const selectedColor = colorNames[selectedColorIndex] || "";
      const bestVariant = findBestVariantWithColor(
        product.variants,
        selectedColor.toLowerCase(),
        product.code
      );

      if (bestVariant?.images) {
        const imageCount = countVariantImages(bestVariant.images);
        if (imageCount > 0) {
          const avatar = bestVariant.images.avatar || "";
          const others = bestVariant.images.others || [];
          return [...(avatar ? [avatar] : []), ...others].filter(
            (url): url is string => !!url
          );
        }
      }
    }

    // Tier 2: Use parent product's images as fallback
    const avatar = productImages?.avatar || "";
    const others = productImages?.others || [];
    return [...(avatar ? [avatar] : []), ...others].filter(
      (url): url is string => !!url
    );
  }, [
    product.images,
    product.variants,
    product.code,
    selectedColorIndex,
    colorNames,
  ]);

  // Reset image errors when images array changes
  useEffect(() => {
    setImageErrors({});
  }, [images]);

  // Calculate prices - Flash Sale takes priority over old price
  const { finalPrice, originalPrice, discountPercent } = useMemo(
    () => calculatePricesForVariant(currentVariant),
    [calculatePricesForVariant, currentVariant]
  );

  // Determine if overlay should be shown (when cart icon is clicked)
  const shouldShowOverlay = isOverlayOpen;

  // Check if product is sold out
  // Conditions: flash sale stock depleted OR all variant stock depleted
  const isSoldOut = useMemo(() => {
    // Priority check: Flash sale remaining stock
    if (
      fromFlashSale === true &&
      product.flashSale &&
      product.flashSale.remainingStock <= 0
    ) {
      return true;
    }

    // Check variant inventory (existing logic)
    if (product.variants && product.variants.length > 0) {
      // Check if ALL variants are sold out (every variant has available === 0)
      return product.variants.every(
        (variant) => (variant.inventory?.available ?? 0) === 0
      );
    }

    // Fallback to product inventory if no variants
    return (product.inventory?.available ?? 0) === 0;
  }, [product.flashSale, product.variants, product.inventory]);

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  // Check if all images have errors or no images available
  const hasValidImages =
    images.length > 0 && !images.every((_, index) => imageErrors[index]);

  const handleAddToCart = (sizeName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdding) return;

    // Get selected color name (if any)
    const selectedColorName =
      selectedColorIndex !== null ? colorNames[selectedColorIndex] || "" : "";

    // Find variant if color is selected
    const variant = selectedColorName
      ? findVariant(selectedColorName, sizeName)
      : null;

    // Calculate correct prices (including Flash Sale)
    const prices = calculatePricesForVariant(variant);

    setIsAdding(true);
    dispatch(
      addToCartRequest({
        productId: product.id,
        variantId: variant?.id,
        name: variant?.name || product.name,
        price: prices.finalPrice,
        originalPrice: prices.originalPrice,
        imageUrl:
          variant?.images?.avatar || product.images?.avatar || images[0],
        quantity: 1,
        size: sizeName,
        color: selectedColorName,
      })
    );

    // Close overlay and reset adding state after a short delay
    setTimeout(() => {
      setIsAdding(false);
      setIsOverlayOpen(false);
    }, 500);
  };

  // Handle size button click - add to cart immediately
  const handleSizeClick = (sizeName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleAddToCart(sizeName, e);
  };

  const getWrapperClassName = () => {
    return "w-full";
  };

  const getCardClassName = () => {
    return "relative p-0 transition-transform duration-200 flex flex-col h-full bg-transparent touch-manipulation";
  };

  const cardContent = (
    <Box className={getCardClassName()}>
      {/* Product Badge - Top Left */}
      {product.badge && (
        <ProductBadgeComponent
          badge={product.badge}
          className="absolute top-1 right-1 z-10"
        />
      )}
      {/* Product Image + Banner Wrapper */}
      <Link href={getProductUrl(product, locale)}>
        <Box
          className="relative w-full"
          onMouseEnter={() => {
            setIsHovered(true);
            if (!hoverImageLoaded) setHoverImageLoaded(true);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
          }}
        >
          {/* Product Image */}
          <Box className="relative w-full aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden">
            {/* Add to Cart Icon - positioned at bottom right of image, hidden when overlay is open */}
            {!isOverlayOpen &&
              (sizes.length > 0 ||
                sizes.length === 0) && (
                <Box
                  className={`absolute ${
                    isDesktop ? "bottom-8" : "bottom-6"
                  } right-2 z-10 cursor-pointer`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    // If no variants at all, add directly to cart with parent ID
                    if (sizes.length === 0 && colorNames.length === 0) {
                      if (isAdding) return;
                      // Calculate correct prices (including Flash Sale)
                      const prices = calculatePricesForVariant(null);
                      setIsAdding(true);
                      dispatch(
                        addToCartRequest({
                          productId: product.id,
                          variantId: undefined,
                          name: product.name,
                          price: prices.finalPrice,
                          originalPrice: prices.originalPrice,
                          imageUrl: product.images?.avatar || images[0],
                          quantity: 1,
                          size: undefined,
                          color: undefined,
                        })
                      );
                      setTimeout(() => setIsAdding(false), 500);
                      return;
                    }

                    // Has color but no size → add with selected color variant
                    if (sizes.length === 0 && colorNames.length > 0) {
                      if (isAdding) return;

                      // Auto-select first color if none selected
                      const colorIndex = selectedColorIndex !== null ? selectedColorIndex : 0;
                      const selectedColorName = colorNames[colorIndex] || "";

                      // Find variant by color only (no size)
                      const variant = product.variants?.find(v => {
                        const normalizedCode = v.code?.toLowerCase() || "";
                        const normalizedColor = selectedColorName.toLowerCase().trim();
                        const normalizedProductCode = product.code.toLowerCase();
                        // Match pattern: productCode-color (no size suffix)
                        return normalizedCode === `${normalizedProductCode}-${normalizedColor}`;
                      });

                      // Calculate correct prices
                      const prices = calculatePricesForVariant(variant || null);

                      setIsAdding(true);
                      dispatch(
                        addToCartRequest({
                          productId: product.id,
                          variantId: variant?.id,
                          name: variant?.name || product.name,
                          price: prices.finalPrice,
                          originalPrice: prices.originalPrice,
                          imageUrl: variant?.images?.avatar || product.images?.avatar || images[0],
                          quantity: 1,
                          size: undefined,
                          color: selectedColorName,
                        })
                      );
                      setTimeout(() => setIsAdding(false), 500);
                      return;
                    }

                    // Has sizes → open overlay for size selection
                    if (selectedColorIndex === null && colorNames.length > 0) {
                      setSelectedColorIndex(0);
                    }
                    setIsOverlayOpen(true);
                  }}
                >
                  <Image
                    src="/assets/svg/cart/add_cart_home.svg"
                    alt="Add to cart"
                    width={42}
                    height={24}
                    className="w-[42px] h-[24px]"
                    loading="lazy"
                  />
                </Box>
              )}

            {/* Product images: fallback → single image → multiple images */}
            {/* Product images: fallback → single image → multiple images */}
            {!hasValidImages ? (
              <Box className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <ProductImage
                  src={DEFAULT_PRODUCT_IMAGE}
                  alt={displayName}
                  width={400}
                  height={600}
                  loading="lazy"
                  className="object-contain opacity-50"
                />
              </Box>
            ) : images.length >= 2 ? (
              <Box className="absolute inset-0 overflow-hidden">
                {/* Base image */}
                {!imageErrors[0] && (
                  <ProductImage
                    key={`base-${images[0]}`}
                    src={images[0]}
                    alt={displayName}
                    fill
                    sizes={IMAGE_SIZES.productCard}
                    loading={priority ? 'eager' : 'lazy'}
                    priority={priority}
                    className={`absolute inset-0 object-cover transition-opacity duration-300 ease-in-out ${
                      isHovered && !imageErrors[1] ? "opacity-0" : "opacity-100"
                    }`}
                    onError={() => handleImageError(0)}
                  />
                )}
                {/* Hover image - only load when hovered */}
                {hoverImageLoaded && !imageErrors[1] && (
                  <ProductImage
                    key={`hover-${images[1]}`}
                    src={images[1]}
                    alt={`${displayName} hover`}
                    fill
                    quality={75}
                    sizes={IMAGE_SIZES.productCard}
                    loading="lazy"
                    className={`absolute inset-0 object-cover transition-opacity duration-300 ease-in-out ${
                      isHovered ? "opacity-100" : "opacity-0"
                    }`}
                    onError={() => handleImageError(1)}
                  />
                )}
              </Box>
            ) : images.length === 1 && !imageErrors[0] ? (
              <Box className="absolute inset-0 overflow-hidden">
                <ProductImage
                  key={`single-${images[0]}`}
                  src={images[0]}
                  alt={displayName}
                  fill
                  sizes={IMAGE_SIZES.productCard}
                  loading={priority ? 'eager' : 'lazy'}
                  priority={priority}
                  className={`object-cover transition-transform duration-400 ease-in-out ${
                    isHovered ? "scale-110" : "scale-100"
                  }`}
                  onError={() => handleImageError(0)}
                />
              </Box>
            ) : null}

            {/* Product Banner - Position 1 (Top) */}
            {productBanner && productBanner.position === 1 && (
              <Box className="absolute top-0 left-0 right-0 z-[5]">
                <ProductImage
                  src={productBanner.image}
                  alt={productBanner.name}
                  width={400}
                  height={50}
                  sizes={IMAGE_SIZES.productCard}
                  loading={priority ? 'eager' : 'lazy'}
                  priority={priority}
                  className="w-full h-4 object-fill"
                  style={{
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                  }}
                />
              </Box>
            )}

            {/* Overlay on Hover/Tap - only show if sizes available */}
            {shouldShowOverlay && sizes.length > 0 && (
              <Box
                className={`absolute ${
                  hasBannerAtBottom ? "bottom-5" : "bottom-2 sm:bottom-3"
                } left-2  right-2  z-10 rounded-[5px] px-2 pt-1.5 sm:pt-2 pb-2 sm:pb-3 flex flex-col gap-2 sm:gap-4 animate-slideUp`}
                style={{
                  backgroundColor: "#CACACA66",
                  backdropFilter: "blur(25px)",
                  WebkitBackdropFilter: "blur(25px)",
                }}
              >
                {/* Add to cart text */}
                <Text className="text-sm sm:text-sm leading-5 sm:leading-6 font-normal text-black text-center">
                  {translations.addToCart}
                </Text>

                {/* Size selector - dynamic grid based on number of sizes */}
                <div
                  className={`grid gap-1 sm:gap-1.5 grid-cols-3 sm:grid-cols-5 md:grid-cols-4`}
                >
                  {sizes.map((sizeName) => {
                    // Check if this size variant is available
                    const selectedColorName =
                      selectedColorIndex !== null
                        ? colorNames[selectedColorIndex] || ""
                        : "";
                    const variant = selectedColorName
                      ? findVariant(selectedColorName, sizeName)
                      : null;
                    const isVariantAvailable = variant
                      ? (variant.inventory?.available ?? 0) > 0
                      : true;

                    return (
                      <Button
                        key={sizeName}
                        onClick={(e) => handleSizeClick(sizeName, e)}
                        disabled={isAdding || !isVariantAvailable}
                        className={`h-7 sm:h-7 border-none text-xs p-0 rounded ${
                          isVariantAvailable
                            ? "cursor-pointer bg-white text-black hover:bg-gray-100"
                            : "cursor-not-allowed bg-gray-300 text-gray-500"
                        }`}
                      >
                        {sizeName}
                      </Button>
                    );
                  })}
                </div>
              </Box>
            )}

            {/* Sold Out Overlay - Circle in center */}
            {isSoldOut && (
              <Box className="absolute inset-0 flex items-center justify-center z-20">
                <Box className="rounded-full flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 bg-black/60">
                  <Text className="text-white text-sm sm:text-base font-medium">
                    {t("soldOut")}
                  </Text>
                </Box>
              </Box>
            )}
          </Box>

          {/* Product Banner - Position 2 (Bottom) */}
          {productBanner && productBanner.position === 2 && (
            <Box className="absolute bottom-0 left-0 right-0 z-[5]">
              <ProductImage
                src={productBanner.image}
                alt={productBanner.name}
                width={400}
                height={50}
                sizes={IMAGE_SIZES.productCard}
                loading={priority ? 'eager' : 'lazy'}
                priority={priority}
                className="w-full h-4 rounded-b-lg object-fill"
                style={{ width: "100%", height: "100%" }}
              />
            </Box>
          )}
        </Box>
      </Link>
      {/* Product Info */}
      <Flex className="flex flex-col gap-[0.5] mt-2 relative">
        {/* Color Options - Pill shaped */}
        {colorNames.length > 0 && (
          <Box ref={listRef} className="mb-2 p-1">
            <Flex
              className={`gap-2 transition-all items-center ${
                showAllColors ? "flex-wrap" : "flex-row justify-between"
              }`}
            >
              {!showAllColors && (
                <Flex className="gap-2">
                  {colorNames.slice(0, visibleColorCount).map((colorName) => {
                    const actualIndex = colorNames.indexOf(colorName);
                    const isSelected = selectedColorIndex === actualIndex;

                    return (
                      <Box
                        key={actualIndex}
                        className={`h-[17px] w-[30px] min-w-[30px] transition-all duration-150 rounded-full ring-1 lg:h-5 lg:w-9 lg:min-w-9 overflow-hidden
                          hover:ring-offset-1 hover:lg:ring-offset-2 hover:ring-[#9B5526]
                          ${
                            isSelected
                              ? "ring-offset-1 lg:ring-offset-2 ring-[#9B5526]"
                              : "ring-transparent border-[#e9b887] border"
                          }
                          ${
                            isTogglingColors
                              ? "pointer-events-none"
                              : "cursor-pointer"
                          }
                          `}
                        style={{
                          ...getColorSwatchStyle(
                            colorVariantsByName[colorName.toLowerCase().trim()],
                            colorName
                          ),
                        }}
                        onMouseDown={(e) => {
                          mouseDownY.current = e.clientY;
                        }}
                        onTouchStart={(e) => {
                          if (e.touches.length > 0) {
                            touchStartY.current = e.touches[0].clientY;
                          }
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          if (isTogglingColors) return;

                          const currentY = e.clientY;
                          const mouseMoved =
                            mouseDownY.current !== null &&
                            Math.abs(currentY - mouseDownY.current) > 5;

                          mouseDownY.current = null;
                          touchStartY.current = null;

                          if (mouseMoved) return;

                          if (selectedColorIndex === actualIndex) {
                            setSelectedColorIndex(null);
                          } else {
                            setSelectedColorIndex(actualIndex);
                          }
                        }}
                        onTouchEnd={(e) => {
                          if (
                            touchStartY.current !== null &&
                            e.changedTouches.length > 0
                          ) {
                            const touchEndY = e.changedTouches[0].clientY;
                            const touchMoved =
                              Math.abs(touchEndY - touchStartY.current) > 5;

                            if (touchMoved) {
                              touchStartY.current = null;
                              e.preventDefault();
                              e.stopPropagation();
                              return;
                            }
                          }
                        }}
                      ></Box>
                    );
                  })}
                </Flex>
              )}
              {showAllColors &&
                colorNames.map((colorName) => {
                  const actualIndex = colorNames.indexOf(colorName);
                  const isSelected = selectedColorIndex === actualIndex;

                  return (
                    <Box
                      key={actualIndex}
                      className={`h-[17px] w-[30px] min-w-[30px] transition-all duration-150 rounded-full ring-1 lg:h-5 lg:w-9 lg:min-w-9 overflow-hidden
                        hover:ring-offset-1 hover:lg:ring-offset-2 hover:ring-[#9B5526]
                        ${
                          isSelected
                            ? "ring-offset-1 lg:ring-offset-2 ring-[#9B5526]"
                            : "ring-transparent border-[#e9b887] border"
                        }
                        ${
                          isTogglingColors
                            ? "pointer-events-none"
                            : "cursor-pointer"
                        }
                        `}
                      style={{
                        ...getColorSwatchStyle(
                          colorVariantsByName[colorName.toLowerCase().trim()],
                          colorName
                        ),
                      }}
                      onMouseDown={(e) => {
                        mouseDownY.current = e.clientY;
                      }}
                      onTouchStart={(e) => {
                        if (e.touches.length > 0) {
                          touchStartY.current = e.touches[0].clientY;
                        }
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (isTogglingColors) return;

                        const currentY = e.clientY;
                        const mouseMoved =
                          mouseDownY.current !== null &&
                          Math.abs(currentY - mouseDownY.current) > 5;

                        mouseDownY.current = null;
                        touchStartY.current = null;

                        if (mouseMoved) return;

                        if (selectedColorIndex === actualIndex) {
                          setSelectedColorIndex(null);
                        } else {
                          setSelectedColorIndex(actualIndex);
                        }
                      }}
                      onTouchEnd={(e) => {
                        if (
                          touchStartY.current !== null &&
                          e.changedTouches.length > 0
                        ) {
                          const touchEndY = e.changedTouches[0].clientY;
                          const touchMoved =
                            Math.abs(touchEndY - touchStartY.current) > 5;

                          if (touchMoved) {
                            touchStartY.current = null;
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                          }
                        }
                      }}
                    ></Box>
                  );
                })}
              {(visibleColorCount < colorNames.length || showAllColors) && (
                <Box
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    setIsTogglingColors(true);
                    setShowAllColors((prev) => !prev);

                    setTimeout(() => {
                      setIsTogglingColors(false);
                    }, 400);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                  }}
                  className="cursor-pointer flex items-center"
                >
                  <ChevronRightIcon
                    width={18}
                    height={18}
                    className={`text-gray-600 transition-transform duration-200 ${
                      showAllColors ? "rotate-180" : ""
                    }`}
                  />
                </Box>
              )}
            </Flex>
          </Box>
        )}

        {/* Product Name - max 2 lines on mobile */}
        <Link href={getProductUrl(product, locale)}>
          <Text
            className="block text-black text-sm md:truncate md:whitespace-normal md:overflow-visible hover:font-semibold"
            title={displayName}
          >
            {displayName}
          </Text>
        </Link>

        {/* Price Display - Flash Sale takes priority */}
        <>
          {fromFlashSale ? (
            // Flash Sale Layout: Match ProductDetailClient
            <>
              {originalPrice !== undefined && originalPrice > 0 && (
                <Text className="line-through text-[#FFDBBB] text-xs">
                  {formatPrice(originalPrice)}
                </Text>
              )}
              <Flex align="center" gap="2" wrap="wrap">
                <Text className="text-black text-base">
                  {formatPrice(finalPrice)}
                </Text>
                {discountPercent !== undefined && discountPercent > 0 && (
                  <Box className="bg-red-600 text-white font-[12px] rounded flex items-center justify-center text-xs w-[38px] h-[14px]">
                    -{discountPercent}%
                  </Box>
                )}
              </Flex>
            </>
          ) : (
            // Regular Layout: Keep current behavior
            <>
              {originalPrice !== undefined && originalPrice > 0 && (
                <Text className="line-through text-[#FFDBBB] text-xs">
                  {formatPrice(originalPrice)}
                </Text>
              )}
              <Flex align="center" gap="1" wrap="wrap">
                <Text className="text-black text-base">
                  {formatPrice(finalPrice)}
                </Text>
                {discountPercent !== undefined && discountPercent > 0 && (
                  <Flex
                    align="center"
                    gap="1"
                    className={`bg-red-600 text-white font-[12px] rounded flex items-center justify-center text-xs w-[38px] h-[14px]`}
                  >
                    -{discountPercent}%
                  </Flex>
                )}
              </Flex>
            </>
          )}
        </>

        {/* Spacer when no colors - keeps consistent card height */}
        {colorNames.length === 0 && <Box className="h-4 mb-2" />}
      </Flex>
    </Box>
  );

  // Wrap in Link with proper layout classes
  return (
    <Box className={`no-underline text-inherit block ${getWrapperClassName()}`}>
      {cardContent}
    </Box>
  );
}
