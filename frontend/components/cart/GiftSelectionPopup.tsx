'use client';

import { formatPrice } from '@/lib/utils/format';
import type { EligibleGiftTierResponse, GiftProductDetailResponse } from '@/types/cart';
import {
    Box,
    Button,
    Dialog,
    Flex,
    Text,
    Select,
} from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ProductImage } from '@/components/common/ProductImage';
import { useState } from 'react';

interface GiftSelectionPopupProps {
    tier: EligibleGiftTierResponse;
    promotionId: string;
    onSelectGift: (_productId: string, _variantId?: string) => Promise<void>;
    onClose: () => void;
    isLoading?: boolean;
}

/**
 * Gift selection popup - shows available gift products for a tier
 * Allows selecting variant if product has variants
 */
export function GiftSelectionPopup({
    tier,
    promotionId: _promotionId,
    onSelectGift,
    onClose,
    isLoading = false,
}: GiftSelectionPopupProps) {
    const t = useTranslations('cart');
    const [selectedProduct, setSelectedProduct] = useState<GiftProductDetailResponse | null>(
        tier.giftProducts.length === 1 ? tier.giftProducts[0] : null
    );
    const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
        undefined
    );

    const handleProductSelect = (product: GiftProductDetailResponse) => {
        setSelectedProduct(product);
        setSelectedVariantId(undefined);
    };

    const handleVariantSelect = (variantId: string) => {
        setSelectedVariantId(variantId);
    };

    const handleConfirm = async () => {
        if (!selectedProduct) return;

        // If product has variants but none selected, show error
        if (selectedProduct.hasVariants && !selectedVariantId) {
            return;
        }

        await onSelectGift(selectedProduct.productId, selectedVariantId);
    };

    const isConfirmDisabled =
        isLoading ||
        !selectedProduct ||
        (selectedProduct.hasVariants && !selectedVariantId);

    return (
        <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Content
                className="max-w-md p-0 rounded-2xl overflow-hidden"
                style={{ maxWidth: '420px' }}
                aria-describedby="gift-selection-description"
            >
                <Dialog.Title className="sr-only">
                    {t('giftOffer.selectGiftTitle')}
                </Dialog.Title>
                <Dialog.Description id="gift-selection-description" className="sr-only">
                    {t('giftOffer.selectGiftTitle')}
                </Dialog.Description>

                {/* Header */}
                <Flex
                    justify="between"
                    align="center"
                    className="p-4 border-b border-gray-200"
                >
                    <Text weight="bold" style={{ fontSize: '18px' }}>
                        {t('giftOffer.selectGiftTitle')}
                    </Text>
                    <Button
                        variant="ghost"
                        size="1"
                        className="cursor-pointer"
                        onClick={onClose}
                    >
                        <Cross2Icon width={20} height={20} />
                    </Button>
                </Flex>

                {/* Content */}
                <Box className="p-4 max-h-[60vh] overflow-y-auto">
                    {/* Tier info */}
                    <Box className="bg-[#FFF5E6] rounded-lg p-3 mb-4">
                        <Text className="text-[#C0752F]" style={{ fontSize: '14px' }}>
                            {t('giftOffer.minOrderHint', {
                                amount: formatPrice(tier.minOrderValue),
                            })}
                        </Text>
                    </Box>

                    {/* Product list */}
                    <Box className="space-y-3">
                        {tier.giftProducts.map((product) => {
                            const isProductSelected =
                                selectedProduct?.productId === product.productId;

                            return (
                                <Box
                                    key={product.productId}
                                    className={`bg-white rounded-lg p-3 border-2 cursor-pointer transition-all ${isProductSelected
                                        ? 'border-[#FAA63E]'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    onClick={() => handleProductSelect(product)}
                                >
                                    <Flex gap="3" align="start">
                                        {/* Product image */}
                                        <Box
                                            className="flex-shrink-0 bg-gray-100 overflow-hidden rounded-lg"
                                            style={{ width: '70px', height: '85px' }}
                                        >
                                            {product.image ? (
                                                <ProductImage
                                                    src={product.image}
                                                    alt={product.name}
                                                    width={70}
                                                    height={85}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Box className="w-full h-full flex items-center justify-center bg-gray-200">
                                                    <Text size="1" color="gray">
                                                        {t('giftOffer.noImage')}
                                                    </Text>
                                                </Box>
                                            )}
                                        </Box>

                                        {/* Product info */}
                                        <Flex direction="column" className="flex-1" gap="1">
                                            <Text
                                                className="text-black font-medium"
                                                style={{ fontSize: '14px' }}
                                            >
                                                {product.name}
                                            </Text>

                                            <Flex align="center" gap="2">
                                                <Text
                                                    weight="bold"
                                                    className="text-[#FAA63E]"
                                                    style={{ fontSize: '14px' }}
                                                >
                                                    0đ
                                                </Text>
                                                {product.price > 0 && (
                                                    <Text
                                                        className="text-gray-400 line-through"
                                                        style={{ fontSize: '12px' }}
                                                    >
                                                        {formatPrice(product.price)}
                                                    </Text>
                                                )}
                                            </Flex>

                                            {/* Variant selector - only show when product is selected */}
                                            {isProductSelected && product.hasVariants && (
                                                <Box className="mt-2">
                                                    <Select.Root
                                                        value={selectedVariantId}
                                                        onValueChange={handleVariantSelect}
                                                    >
                                                        <Select.Trigger
                                                            placeholder={t('giftOffer.selectVariant')}
                                                            className="w-full"
                                                        />
                                                        <Select.Content>
                                                            {product.variants.map((variant) => (
                                                                <Select.Item
                                                                    key={variant.variantId}
                                                                    value={variant.variantId}
                                                                    disabled={!variant.isAvailable}
                                                                >
                                                                    <Flex align="center" gap="2">
                                                                        <Text>
                                                                            {variant.name ||
                                                                                variant.attributes
                                                                                    .map((a) => a.value)
                                                                                    .join(' - ')}
                                                                        </Text>
                                                                        {!variant.isAvailable && (
                                                                            <Text className="text-red-500 text-xs">
                                                                                {t('giftOffer.outOfStock')}
                                                                            </Text>
                                                                        )}
                                                                    </Flex>
                                                                </Select.Item>
                                                            ))}
                                                        </Select.Content>
                                                    </Select.Root>
                                                </Box>
                                            )}

                                        </Flex>

                                        {/* Selection indicator */}
                                        <Box className="flex-shrink-0">
                                            {isProductSelected ? (
                                                <Image
                                                    src="/assets/svg/product/selected_icon.svg"
                                                    alt="Selected"
                                                    width={24}
                                                    height={24}
                                                />
                                            ) : (
                                                <Image
                                                    src="/assets/svg/product/unselected_icon.svg"
                                                    alt="Unselected"
                                                    width={24}
                                                    height={24}
                                                />
                                            )}
                                        </Box>
                                    </Flex>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>

                {/* Footer */}
                <Box className="p-4 border-t border-gray-200">
                    <Button
                        size="3"
                        className="w-full cursor-pointer"
                        style={{
                            background: isConfirmDisabled
                                ? '#ccc'
                                : 'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
                            color: 'white',
                            borderRadius: '8px',
                        }}
                        onClick={handleConfirm}
                        disabled={isConfirmDisabled}
                    >
                        {isLoading
                            ? t('giftOffer.selecting')
                            : t('giftOffer.confirmButton')}
                    </Button>
                </Box>
            </Dialog.Content>
        </Dialog.Root>
    );
}
