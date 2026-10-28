import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../common/primary_button.dart';
import '../common/price_display.dart';

/// Cart bottom bar with subtotal and checkout button
class CartBottomBar extends StatelessWidget {
  final double subtotal;
  final int itemCount;
  final VoidCallback? onCheckout;

  const CartBottomBar({
    super.key,
    required this.subtotal,
    required this.itemCount,
    this.onCheckout,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.background,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            offset: const Offset(0, -2),
            blurRadius: 8,
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Voucher section (optional)
            GestureDetector(
              onTap: () {
                // Show voucher selection
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.local_offer_outlined,
                      color: AppColors.primary,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Apply voucher code',
                        style: AppTypography.bodyMedium.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                    const Icon(
                      Icons.chevron_right,
                      color: AppColors.textSecondary,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Subtotal and checkout
            Row(
              children: [
                // Subtotal
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Subtotal ($itemCount items)',
                        style: AppTypography.bodySmall,
                      ),
                      PriceDisplay(
                        price: subtotal,
                        size: PriceSize.large,
                        compact: true,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),

                // Checkout button
                Expanded(
                  child: PrimaryButton(
                    text: 'Checkout',
                    onPressed: onCheckout,
                    disabled: onCheckout == null,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
