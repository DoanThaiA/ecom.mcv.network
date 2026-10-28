"use client";

import { useAppDispatch } from "@/lib/store/hooks";
import {
  removeFromCartRequest,
  updateCartItemRequest,
} from "@/lib/store/slices/cartSlice";
import { CartItem as CartItemType } from "@/types/cart";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import { AlertDialog, Box, Button, Flex, Text } from "@radix-ui/themes";
import { formatPrice } from "@/lib/utils/format";
// import { getColorHex } from "@/lib/utils/color";
import Image from "next/image";
import { ProductImage } from "@/components/common/ProductImage";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";

interface CartItemProps {
  item: CartItemType;
  isSelected: boolean;
  onSelectChange: () => void;
  // Flash sale pricing (from checkout session)
  originalPrice?: number;
  flashSalePrice?: number;
  flashSaleId?: string;
  // Combo information
  comboName?: string;
  // Gift item callbacks
  onChangeGift?: () => void;
  onRemoveGift?: () => void;
  // Quantity change callback
  onQuantityChange?: (
    _productId: string,
    _variantId: string | undefined,
    _quantity: number,
    _comboInstanceId?: string
  ) => void;
  // Remove item callback
  onRemoveItem?: (
    _productId: string,
    _variantId?: string,
    _comboInstanceId?: string
  ) => void;
  // Payment processing state - disables all controls
  isPaymentProcessing?: boolean;
  // Quantity update in progress - disables quantity controls
  isUpdatingQuantity?: boolean;
  // Whether the product is unavailable (from checkout session)
  isUnavailable?: boolean;
}

export function CartItem({
  item,
  isSelected,
  onSelectChange,
  originalPrice,
  flashSalePrice,
  flashSaleId,
  comboName,
  onChangeGift: _onChangeGift,
  onRemoveGift,
  onQuantityChange,
  onRemoveItem,
  isPaymentProcessing = false,
  isUpdatingQuantity = false,
  isUnavailable = false,
}: CartItemProps) {
  const dispatch = useAppDispatch();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("cart");
  const tCommon = useTranslations("common");
  const tProduct = useTranslations("productDetail");

  // Debounce state for quantity changes
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [localPendingChange, setLocalPendingChange] = useState(0);

  // Check if this is a gift item
  const isGift = item.isGift === true;

  // Determine which price to show
  // Gift items always show 0đ with original price strikethrough
  const hasFlashSale =
    !isGift &&
    flashSaleId &&
    flashSalePrice !== undefined &&
    originalPrice !== undefined &&
    flashSalePrice < originalPrice;
  const hasProductDiscount =
    !isGift &&
    !hasFlashSale &&
    item.effectivePrice > 0 &&
    item.effectivePrice < item.price;
  const displayPrice = isGift
    ? 0
    : hasFlashSale
      ? flashSalePrice
      : hasProductDiscount
        ? item.effectivePrice
        : item.price;
  const showOriginalPrice = isGift
    ? item.originalPrice
    : hasFlashSale
      ? originalPrice
      : hasProductDiscount
        ? item.price
        : undefined;

  // Mock color and size - in real app, these would come from variant metadata
  // const [selectedColor, setSelectedColor] = useState<string>("Đen");
  // const [selectedSize, setSelectedSize] = useState<string>("M");

  // Mock available options
  // const availableColors = ["Đen", "Trắng", "Xám"];
  // const availableSizes = ["XS", "S", "M", "L", "XL"];

  const handleIncrement = () => {
    if (!onQuantityChange) {
      // Fallback to Redux (backward compatibility)
      dispatch(
        updateCartItemRequest({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity + 1,
          comboInstanceId: item.comboInstanceId,
        })
      );
      return;
    }

    // Update pending change immediately for optimistic UI
    const newPending = localPendingChange + 1;
    setLocalPendingChange(newPending);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer (500ms debounce)
    debounceTimerRef.current = setTimeout(async () => {
      const finalQuantity = item.quantity + newPending;

      try {
        await onQuantityChange(
          item.productId,
          item.variantId,
          finalQuantity,
          item.comboInstanceId
        );
        // Success: clear pending
        setLocalPendingChange(0);
      } catch (error) {
        console.error("Failed to update quantity:", error);
        // Revert pending change on error
        setLocalPendingChange(0);
        // Error toast is already shown by handleQuantityChange in useCartContent
      }
    }, 500);
  };

  const handleDecrement = () => {
    const wouldBeQuantity = item.quantity + localPendingChange - 1;
    if (wouldBeQuantity < 1) return; // Don't allow below 1

    if (!onQuantityChange) {
      // Fallback to Redux (backward compatibility)
      dispatch(
        updateCartItemRequest({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity - 1,
          comboInstanceId: item.comboInstanceId,
        })
      );
      return;
    }

    // Update pending change immediately for optimistic UI
    const newPending = localPendingChange - 1;
    setLocalPendingChange(newPending);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer (500ms debounce)
    debounceTimerRef.current = setTimeout(async () => {
      const finalQuantity = item.quantity + newPending;
      if (finalQuantity < 1) return;

      try {
        await onQuantityChange(
          item.productId,
          item.variantId,
          finalQuantity,
          item.comboInstanceId
        );
        // Success: clear pending
        setLocalPendingChange(0);
      } catch (error) {
        console.error("Failed to update quantity:", error);
        // Revert pending change on error
        setLocalPendingChange(0);
        // Error toast is already shown by handleQuantityChange in useCartContent
      }
    }, 500);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Reset pending changes if item quantity changes externally
  useEffect(() => {
    setLocalPendingChange(0);
  }, [item.quantity]);

  const handleRemove = () => {
    // Use callback if provided (allows parent to handle session recalculation)
    if (onRemoveItem) {
      onRemoveItem(item.productId, item.variantId, item.comboInstanceId);
    } else {
      // Fallback to direct Redux dispatch (backward compatibility)
      dispatch(
        removeFromCartRequest({
          productId: item.productId,
          variantId: item.variantId,
          comboInstanceId: item.comboInstanceId,
        })
      );
    }
  };

  return (
    <Box
      className={`rounded-lg ${
        isSelected ? "bg-[#FAA63E]" : "bg-white"
      } border ${isSelected ? "border-[#FAA63E]" : "border-[#E5E5E5]"}`}
    >
      <Flex gap="2" align="center">
        {/* Custom Checkbox - Left side, centered with 8px horizontal margin */}
        {/* Hide checkbox for gift items - they are always included */}
        {!isGift && (
          <Box className="flex items-center justify-center flex-shrink-0 ml-2">
            <button
              onClick={() => !isPaymentProcessing && onSelectChange()}
              disabled={isPaymentProcessing}
              className={`flex items-center justify-center ${isPaymentProcessing ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              aria-label={isSelected ? "Unselect item" : "Select item"}
            >
              {isSelected ? (
                <Image
                  src="/assets/svg/product/selected_icon.svg"
                  alt="Selected"
                  width={30}
                  height={30}
                  className="w-[30px] h-[30px]"
                />
              ) : (
                <Image
                  src="/assets/svg/product/unselected_icon.svg"
                  alt="Selected"
                  width={30}
                  height={30}
                  className="w-[30px] h-[30px]"
                />
              )}
            </button>
          </Box>
        )}
        {/* Gift items get a small spacer instead of checkbox */}
        {isGift && <Box className="w-2 flex-shrink-0" />}

        {/* Content Container - All cart item information in single white background */}
        <Box
          className={`bg-white rounded-lg p-2 flex-1 min-w-0 border ${
            isSelected ? "border-[#FAA63E]" : "border-[#E5E5E5]"
          }`}
        >
          <Flex direction="column" gap="2">
            {/* Row 1: Image + Product Information */}
            <Flex gap="3" align="stretch">
              {/* Product Image */}
              <Box
                className="flex-shrink-0 bg-gray-100 overflow-hidden relative"
                style={{
                  width: "80px",
                  height: "100px",
                  borderRadius: "8px",
                }}
              >
                {item.image ? (
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Box className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Text size="1" color="gray">
                      No Image
                    </Text>
                  </Box>
                )}
                {isUnavailable && (
                  <Box className="absolute inset-0 flex items-center justify-center">
                    <Box className="rounded-full flex items-center justify-center w-14 h-14 bg-black/60">
                      <Text className="text-white text-xs font-medium text-center">
                        {tProduct("soldOut")}
                      </Text>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Product Information */}
              <Flex direction="column" justify="between" className="flex-1">
                <Flex direction="column" gap="1">
                  {/* Product Name and Flash Sale Price - Same Row */}
                  <Flex justify="between" align="center" gap="2">
                    <Link
                      href={`/${locale}/products/${item.productId}`}
                      className="flex-1 no-underline"
                    >
                      <Text
                        weight="medium"
                        className="text-black cursor-pointer hover:text-[#FAA63E] transition-colors"
                        style={{
                          fontSize: "14px",
                          lineHeight: "24px",
                        }}
                      >
                        {item.name}
                      </Text>
                    </Link>
                    <Text
                      weight="bold"
                      className="text-black flex-shrink-0"
                      style={{
                        fontSize: "14px",
                        lineHeight: "24px",
                      }}
                    >
                      {formatPrice(displayPrice)}
                    </Text>
                  </Flex>

                  {/* Tags Row - Combo, Gift, and Flash Sale */}
                  <Flex align="start" gap="1" direction="column">
                    <Flex align="center" gap="2" className="flex-wrap">
                      {/* Gift Tag */}
                      {isGift && (
                        <Text className="bg-[#FAA63E] text-white px-2 py-0.5 rounded text-xs font-medium">
                          {t("giftTag") || "Quà tặng"}
                        </Text>
                      )}
                      {/* Combo Tag */}
                      {item.comboInstanceId && (
                        <Flex align="center" gap="1">
                          <Image
                            src="/assets/svg/product/combo_tag.svg"
                            alt="Combo"
                            width={14}
                            height={14}
                            className="w-4 h-4"
                          />
                          <Text
                            className="text-gray-500"
                            style={{
                              fontSize: "12px",
                              lineHeight: "16px",
                            }}
                          >
                            {t("comboProduct")}
                          </Text>
                        </Flex>
                      )}
                    </Flex>
                    {comboName && (
                      <Text
                        className="text-gray-500"
                        style={{
                          fontSize: "12px",
                          lineHeight: "16px",
                        }}
                      >
                        {comboName}
                      </Text>
                    )}
                  </Flex>

                  {/* Original Price Row (only show if flash sale active) */}
                  {showOriginalPrice && (
                    <Flex justify="end" align="center">
                      <Text
                        className="text-gray-400 line-through"
                        style={{
                          fontSize: "12px",
                          lineHeight: "16px",
                        }}
                      >
                        {formatPrice(showOriginalPrice)}
                      </Text>
                    </Flex>
                  )}
                </Flex>

                {/* Color and Size Selectors - Bottom aligned */}
                {/* <Flex
                  align="center"
                  justify="end"
                  className="flex-wrap gap-[10px] w-full"
                >
                  <Select.Root
                    value={selectedColor}
                    onValueChange={setSelectedColor}
                    size="1"
                  >
                    <Flex direction="row">
                      <Select.Trigger className="w-[105px] h-[32px] rounded-[32px] mr-1 px-2 py-2 border border-gray-300 bg-white cursor-pointer relative [&>svg]:hidden justify-between">
                        <Flex
                          align="center"
                          justify="between"
                          className="w-[90px] h-[32px]"
                        >
                          <Text
                            size="1"
                            className="text-black flex-shrink-0 text-[14px] font-normal"
                          >
                            {selectedColor}
                          </Text>
                          <Flex
                            align="center"
                            gap="1.5"
                            className="flex-shrink-0"
                          >
                            <Box
                              className="w-6 h-6 rounded-full border border-gray-300 flex-shrink-0"
                              style={{
                                backgroundColor: getColorHex(selectedColor),
                              }}
                            />
                          </Flex>
                        </Flex>
                      </Select.Trigger>
                      <Image
                        src="/assets/svg/arrow_down_icon.svg"
                        alt="ArrowDown"
                        width={10}
                        height={5}
                      />
                    </Flex>

                    <Select.Content>
                      {availableColors.map((color) => (
                        <Select.Item key={color} value={color}>
                          <Flex align="center" gap="2">
                            <Box
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: getColorHex(color) }}
                            />
                            <Text>{color}</Text>
                          </Flex>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>

                  <Select.Root
                    value={selectedSize}
                    onValueChange={setSelectedSize}
                    size="1"
                  >
                    <Flex>
                      <Select.Trigger
                        className="w-[64px] h-[32px] rounded-[32px] mr-1 px-1 py-2 border border-gray-300 bg-white cursor-pointer relative [&>svg]:hidden"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          size="1"
                          className="text-black text-center w-full text-[14px] font-normal"
                        >
                          {selectedSize}
                        </Text>
                      </Select.Trigger>
                      <Select.Content>
                        {availableSizes.map((size) => (
                          <Select.Item key={size} value={size}>
                            {size}
                          </Select.Item>
                        ))}
                      </Select.Content>
                      <Image
                        src="/assets/svg/arrow_down_icon.svg"
                        alt="ArrowDown"
                        width={10}
                        height={5}
                      />
                    </Flex>
                  </Select.Root>
                </Flex> */}
              </Flex>
            </Flex>

            {/* Horizontal Divider */}
            <Box className="w-full h-[1px] bg-[#F0F0F0]" />

            {/* Row 2: Delete Button + Quantity Controls (or Change Gift for gift items) */}
            <Flex align="center" justify="between">
              {/* Delete/Remove Button */}
              {isGift ? (
                // Gift remove is simpler - just a button
                <Button
                  variant="ghost"
                  size="1"
                  disabled={isPaymentProcessing}
                  className={`hover:bg-gray-100 text-black px-2 mx-[8px] ${isPaymentProcessing ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                  style={{
                    backgroundColor: "white",
                    border: "1px solid #F0F0F0",
                    borderRadius: "8px",
                  }}
                  onClick={onRemoveGift || handleRemove}
                >
                  <Image
                    src="/assets/svg/remove_icon.svg"
                    alt="Remove"
                    width={14}
                    height={14}
                  />
                  <Text className="ml-1" style={{ fontSize: "14px" }}>
                    {t("remove")}
                  </Text>
                </Button>
              ) : (
                <AlertDialog.Root>
                  <AlertDialog.Trigger disabled={isPaymentProcessing}>
                    <Button
                      variant="ghost"
                      size="1"
                      disabled={isPaymentProcessing}
                      className={`hover:bg-gray-100 text-black px-2 mx-[8px] ${isPaymentProcessing ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                      style={{
                        backgroundColor: "white",
                        border: "1px solid #F0F0F0",
                        borderRadius: "8px",
                      }}
                    >
                      <Image
                        src="/assets/svg/remove_icon.svg"
                        alt="Remove"
                        width={14}
                        height={14}
                      />
                      <Text className="ml-1" style={{ fontSize: "14px" }}>
                        {t("remove")}
                      </Text>
                    </Button>
                  </AlertDialog.Trigger>

                  <AlertDialog.Content className="max-w-md">
                    <AlertDialog.Title className="text-lg font-bold">
                      {t("removeConfirm")}
                    </AlertDialog.Title>
                    <AlertDialog.Description className="text-gray-600 mt-2">
                      {t("removeMessage")}
                    </AlertDialog.Description>

                    <Flex gap="3" mt="5" justify="end">
                      <AlertDialog.Cancel>
                        <Button
                          variant="soft"
                          color="gray"
                          className="cursor-pointer"
                        >
                          {tCommon("buttons.cancel")}
                        </Button>
                      </AlertDialog.Cancel>
                      <AlertDialog.Action>
                        <Button
                          variant="solid"
                          color="red"
                          onClick={handleRemove}
                          className="cursor-pointer"
                        >
                          {tCommon("buttons.confirm")}
                        </Button>
                      </AlertDialog.Action>
                    </Flex>
                  </AlertDialog.Content>
                </AlertDialog.Root>
              )}

              {/* Quantity Controls (regular items) or Disabled Quantity (gift items) */}
              {isGift ? (
                <Flex align="center" gap="2">
                  <Text className="text-black" style={{ fontSize: "14px" }}>
                    {t("quantity")}:
                  </Text>
                  <Flex
                    align="center"
                    gap="2"
                    className="border border-gray-300 rounded-lg bg-gray-50 px-2 py-1"
                  >
                    <button
                      disabled
                      className="w-[24px] h-[24px] rounded-full flex items-center justify-center opacity-50 cursor-not-allowed"
                      style={{
                        background:
                          "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)",
                      }}
                    >
                      <MinusIcon
                        width="12"
                        height="12"
                        className="text-white"
                      />
                    </button>

                    <Box className="flex items-center justify-center min-w-[20px]">
                      <Text size="1" weight="bold" className="text-black">
                        {item.quantity}
                      </Text>
                    </Box>

                    <button
                      disabled
                      className="w-[24px] h-[24px] rounded-full flex items-center justify-center opacity-50 cursor-not-allowed"
                      style={{
                        background:
                          "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)",
                      }}
                    >
                      <PlusIcon width="12" height="12" className="text-white" />
                    </button>
                  </Flex>
                </Flex>
              ) : (
                <Flex align="center" gap="2">
                  <Text className="text-black" style={{ fontSize: "14px" }}>
                    {t("quantity")}:
                  </Text>
                  <Flex
                    align="center"
                    gap="2"
                    className={`border border-gray-300 rounded-lg px-2 py-1 ${isPaymentProcessing ? "bg-gray-50" : "bg-white"}`}
                  >
                    <button
                      onClick={handleDecrement}
                      disabled={
                        item.quantity + localPendingChange <= 1 ||
                        isPaymentProcessing ||
                        isUpdatingQuantity
                      }
                      className="w-[24px] h-[24px] rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                      style={{
                        background:
                          "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)",
                      }}
                    >
                      <MinusIcon
                        width="12"
                        height="12"
                        className="text-white"
                      />
                    </button>

                    <Box className="flex items-center justify-center min-w-[20px]">
                      <Text size="1" weight="bold" className="text-black">
                        {item.quantity + localPendingChange}
                      </Text>
                    </Box>

                    <button
                      onClick={handleIncrement}
                      disabled={isPaymentProcessing || isUpdatingQuantity}
                      className={`w-[24px] h-[24px] rounded-full flex items-center justify-center transition-opacity ${isPaymentProcessing || isUpdatingQuantity ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
                      style={{
                        background:
                          "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)",
                      }}
                    >
                      <PlusIcon width="12" height="12" className="text-white" />
                    </button>
                  </Flex>
                </Flex>
              )}
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}
