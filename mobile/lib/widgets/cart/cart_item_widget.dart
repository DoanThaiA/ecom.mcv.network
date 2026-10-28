import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../models/cart_item.dart';
import '../common/cached_product_image.dart';
import '../common/price_display.dart';
import '../common/quantity_selector.dart';

/// Cart item widget with checkbox, image, info, and quantity selector
class CartItemWidget extends StatelessWidget {
  final CartItem cartItem;
  final VoidCallback? onSelectionChanged;
  final ValueChanged<int>? onQuantityChanged;
  final VoidCallback? onRemove;

  const CartItemWidget({
    super.key,
    required this.cartItem,
    this.onSelectionChanged,
    this.onQuantityChanged,
    this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: AppColors.cardShadow,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Checkbox
          SizedBox(
            width: 24,
            height: 24,
            child: Checkbox(
              value: cartItem.isSelected,
              onChanged: (_) => onSelectionChanged?.call(),
              activeColor: AppColors.primary,
            ),
          ),
          const SizedBox(width: 12),

          // Product image
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: CachedProductImage(
              imageUrl: cartItem.product.displayImage,
              width: 80,
              height: 80,
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(width: 12),

          // Product info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Name
                Text(
                  cartItem.product.name,
                  style: AppTypography.bodyMedium.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),

                // Variant info
                if (cartItem.selectedColor != null ||
                    cartItem.selectedSize != null)
                  Text(
                    [
                      if (cartItem.selectedColor != null)
                        cartItem.selectedColor!.name,
                      if (cartItem.selectedSize != null) cartItem.selectedSize,
                    ].join(' / '),
                    style: AppTypography.bodySmall,
                  ),
                const SizedBox(height: 8),

                // Price and quantity
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    PriceDisplay(
                      price: cartItem.product.price,
                      originalPrice: cartItem.product.originalPrice,
                      size: PriceSize.small,
                      compact: true,
                    ),
                    QuantitySelector(
                      quantity: cartItem.quantity,
                      maxQuantity: cartItem.product.stock,
                      size: QuantitySelectorSize.small,
                      onChanged: onQuantityChanged,
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Remove button
          IconButton(
            icon: const Icon(Icons.close, size: 18),
            color: AppColors.textSecondary,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
            onPressed: () => _showRemoveConfirmation(context),
          ),
        ],
      ),
    );
  }

  void _showRemoveConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove Item'),
        content: const Text('Are you sure you want to remove this item from your cart?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              onRemove?.call();
            },
            child: Text(
              'Remove',
              style: TextStyle(color: AppColors.error),
            ),
          ),
        ],
      ),
    );
  }
}
