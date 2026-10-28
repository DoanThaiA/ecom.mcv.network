import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

/// Price display widget with optional discount
class PriceDisplay extends StatelessWidget {
  final double price;
  final double? originalPrice;
  final bool showDiscount;
  final PriceSize size;
  final bool compact;
  final String currency;

  const PriceDisplay({
    super.key,
    required this.price,
    this.originalPrice,
    this.showDiscount = true,
    this.size = PriceSize.medium,
    this.compact = false,
    this.currency = 'đ',
  });

  @override
  Widget build(BuildContext context) {
    final hasDiscount = originalPrice != null && originalPrice! > price;
    final discountPercent = hasDiscount ? ((1 - price / originalPrice!) * 100).round() : 0;

    final priceStyle = _getPriceStyle();
    final originalPriceStyle = _getOriginalPriceStyle();

    if (compact) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.baseline,
        textBaseline: TextBaseline.alphabetic,
        children: [
          Text(_formatPrice(price), style: priceStyle),
          if (hasDiscount && showDiscount) ...[
            const SizedBox(width: 6),
            Text(_formatPrice(originalPrice!), style: originalPriceStyle),
          ],
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(_formatPrice(price), style: priceStyle),
            if (hasDiscount && showDiscount) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.error.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  '-$discountPercent%',
                  style: AppTypography.priceDiscount,
                ),
              ),
            ],
          ],
        ),
        if (hasDiscount && showDiscount) ...[
          const SizedBox(height: 2),
          Text(_formatPrice(originalPrice!), style: originalPriceStyle),
        ],
      ],
    );
  }

  TextStyle _getPriceStyle() {
    switch (size) {
      case PriceSize.small:
        return AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.bold);
      case PriceSize.medium:
        return AppTypography.priceRegular;
      case PriceSize.large:
        return AppTypography.priceLarge;
    }
  }

  TextStyle _getOriginalPriceStyle() {
    switch (size) {
      case PriceSize.small:
        return AppTypography.bodySmall.copyWith(
          decoration: TextDecoration.lineThrough,
          color: AppColors.textSecondary,
        );
      case PriceSize.medium:
      case PriceSize.large:
        return AppTypography.priceOriginal;
    }
  }

  String _formatPrice(double value) {
    final formatter = NumberFormat('#,###', 'vi_VN');
    return '${formatter.format(value)}$currency';
  }
}

enum PriceSize { small, medium, large }

/// Discount badge widget
class DiscountBadge extends StatelessWidget {
  final int percent;
  final bool isFlashSale;

  const DiscountBadge({
    super.key,
    required this.percent,
    this.isFlashSale = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isFlashSale ? AppColors.error : AppColors.primary,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (isFlashSale) ...[
            const Icon(
              Icons.flash_on,
              color: Colors.white,
              size: 12,
            ),
            const SizedBox(width: 2),
          ],
          Text(
            '-$percent%',
            style: AppTypography.labelSmall.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
