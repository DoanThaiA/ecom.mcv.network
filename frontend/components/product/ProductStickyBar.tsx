'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Button, Flex } from '@radix-ui/themes';
import { getColorSwatchStyle } from '@/lib/utils/colorVariantRenderer';
import { useChatWidgetBottomOffset } from '@/lib/hooks/useChatWidgetBottomOffset';
import { scrollElementHorizontallyIntoView } from '@/lib/utils/dom';
import type { ColorVariant } from '@/types/colorVariant';

/** Ignore sub-pixel rounding when deciding whether the size row is scrolled out */
const SCROLL_END_SLACK_PX = 4;

interface ProductStickyBarProps {
  colors: string[];
  selectedColor: string | null;
  onSelectColor: (_color: string) => void;
  sizes: string[];
  selectedSize: string | null;
  onSelectSize: (_size: string) => void;
  isSizeOutOfStock: (_size: string) => boolean;
  colorVariantsByName: Record<string, ColorVariant>;
  onAddToCart: () => void;
  onBuyNow: () => void;
  disabled: boolean;
  isAdding: boolean;
  isBuyingNow: boolean;
  /** Hidden while the inline colour/size/CTA block is on screen */
  visible: boolean;
  /**
   * Reports the bar's rendered height so the page can reserve room for it.
   * Reads 0 on desktop, where the bar is display:none.
   */
  onHeightChange?: (_height: number) => void;
  addToCartLabel: string;
  buyNowLabel: string;
  processingLabel: string;
}

/**
 * Mobile-only bar pinned to the bottom of the product detail page, carrying the
 * colour swatches and the purchase buttons so they stay reachable while the
 * customer scrolls. It steps aside while the real inline controls are visible,
 * then comes back once they scroll past.
 */
export function ProductStickyBar({
  colors,
  selectedColor,
  onSelectColor,
  sizes,
  selectedSize,
  onSelectSize,
  isSizeOutOfStock,
  colorVariantsByName,
  onAddToCart,
  onBuyNow,
  disabled,
  isAdding,
  isBuyingNow,
  visible,
  onHeightChange,
  addToCartLabel,
  buyNowLabel,
  processingLabel,
}: ProductStickyBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const sizeRowRef = useRef<HTMLDivElement>(null);
  const [barHeight, setBarHeight] = useState(0);
  const [hasMoreSizes, setHasMoreSizes] = useState(false);

  // Measure the bar so the chat launcher can be lifted by exactly its height.
  // Reads 0 on desktop, where the bar is display:none.
  useEffect(() => {
    const element = barRef.current;
    if (!element) return;

    const measure = () => {
      const height = element.getBoundingClientRect().height;
      setBarHeight(height);
      onHeightChange?.(height);
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, [onHeightChange]);

  useChatWidgetBottomOffset(visible ? barHeight : 0);

  // Show the trailing fade only while there are sizes left to scroll to, so a
  // product whose sizes already fit does not get a fade for no reason.
  useEffect(() => {
    const row = sizeRowRef.current;
    if (!row) return;

    const update = () =>
      setHasMoreSizes(
        row.scrollLeft + row.clientWidth < row.scrollWidth - SCROLL_END_SLACK_PX
      );
    update();

    row.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(row);

    return () => {
      row.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [sizes]);

  // Keep the selected size in view - swiping to another colour can move the
  // selection to a size that sits off screen in the scrolled row.
  useEffect(() => {
    const row = sizeRowRef.current;
    if (!row || !selectedSize) return;

    const chip = row.querySelector<HTMLElement>(
      `[data-size="${CSS.escape(selectedSize)}"]`,
    );
    if (!chip) return;

    scrollElementHorizontallyIntoView(row, chip);
  }, [selectedSize]);

  return (
    <Box
      ref={barRef}
      aria-hidden={!visible}
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-[#F0F0F0] px-4 py-2.5 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] transition-transform duration-200 ${
        visible ? 'translate-y-0' : 'translate-y-full pointer-events-none'
      }`}
    >
      {colors.length > 0 && (
        // One scrollable row rather than wrapping, so the bar keeps a stable
        // height no matter how many colours the product has. The vertical
        // padding gives the selection ring room to draw - it renders outside
        // the swatch box and would otherwise be clipped by the scroll area.
        <Flex
          gap="3"
          className="mb-2 overflow-x-auto overflow-y-hidden flex-nowrap px-1 py-1.5"
        >
          {colors.map((color) => {
            const isSelected = selectedColor === color;
            return (
              <Box
                key={color}
                className={`h-[28px] w-[52px] flex-shrink-0 transition-all duration-150 rounded-full overflow-hidden cursor-pointer ring-offset-2 ring-offset-white
                  ${isSelected ? 'ring-2 ring-[#9B5526]' : 'ring-1 ring-[#F39F3C]'}
                `}
                style={{
                  ...getColorSwatchStyle(
                    colorVariantsByName[color.toLowerCase().trim()],
                    color
                  ),
                }}
                onClick={() => onSelectColor(color)}
              ></Box>
            );
          })}
        </Flex>
      )}

      {sizes.length > 0 && (
        <Box className="relative mb-2">
          <Flex
            ref={sizeRowRef}
            gap="2"
            className="overflow-x-auto overflow-y-hidden flex-nowrap px-1 pb-0.5"
          >
            {sizes.map((size) => {
              const isSelected = selectedSize === size;
              const outOfStock = isSizeOutOfStock(size);
              return (
                <Box
                  key={size}
                  data-size={size}
                  className={`h-[32px] min-w-[52px] px-3 flex-shrink-0 transition-all duration-150 rounded-full border text-sm font-medium flex items-center justify-center ${
                    isSelected ? 'text-white' : 'bg-[#F0F0F0] text-gray-700'
                  } ${
                    outOfStock
                      ? 'opacity-40 diagonal-strike border-black cursor-not-allowed'
                      : 'border-[#F0F0F0] cursor-pointer'
                  }`}
                  style={
                    isSelected
                      ? {
                          background:
                            'linear-gradient(90deg, #FAA63E 2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)',
                        }
                      : undefined
                  }
                  onClick={() => {
                    if (outOfStock) return;
                    onSelectSize(size);
                  }}
                >
                  {size}
                </Box>
              );
            })}
          </Flex>

          {/* Hints that the row scrolls further right */}
          {hasMoreSizes && (
            <Box className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l from-white to-transparent" />
          )}
        </Box>
      )}

      <Flex gap="3">
        <Button
          onClick={onAddToCart}
          disabled={disabled || isAdding}
          className="flex-1 bg-[#FEF8F1] text-black hover:bg-[#FEF0E1] cursor-pointer font-semibold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed h-11 text-sm uppercase"
        >
          {addToCartLabel}
        </Button>

        <Button
          onClick={onBuyNow}
          disabled={disabled || isBuyingNow}
          className="flex-1 text-white hover:opacity-90 cursor-pointer font-semibold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed h-11 text-sm uppercase"
          style={{
            background:
              'linear-gradient(90deg, #FAA63E 2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)',
          }}
        >
          {isBuyingNow ? processingLabel : buyNowLabel}
        </Button>
      </Flex>
    </Box>
  );
}
