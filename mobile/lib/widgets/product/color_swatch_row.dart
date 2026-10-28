import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../models/product.dart';

/// Row of color swatches for product cards
class ColorSwatchRow extends StatelessWidget {
  final List<ProductColor> colors;
  final double size;
  final int maxDisplay;
  final String? selectedColorId;
  final ValueChanged<ProductColor>? onColorSelected;

  const ColorSwatchRow({
    super.key,
    required this.colors,
    this.size = 18,
    this.maxDisplay = 5,
    this.selectedColorId,
    this.onColorSelected,
  });

  @override
  Widget build(BuildContext context) {
    final displayColors = colors.take(maxDisplay).toList();
    final remainingCount = colors.length - maxDisplay;

    return Row(
      children: [
        ...displayColors.map((color) {
          final isSelected = color.id == selectedColorId;
          return Padding(
            padding: const EdgeInsets.only(right: 6),
            child: _ColorSwatch(
              color: color,
              size: size,
              isSelected: isSelected,
              onTap: onColorSelected != null ? () => onColorSelected!(color) : null,
            ),
          );
        }),
        if (remainingCount > 0)
          Text(
            '+$remainingCount',
            style: AppTypography.labelSmall.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
      ],
    );
  }
}

class _ColorSwatch extends StatelessWidget {
  final ProductColor color;
  final double size;
  final bool isSelected;
  final VoidCallback? onTap;

  const _ColorSwatch({
    required this.color,
    required this.size,
    this.isSelected = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colorValue = _parseColor(color.hexCode);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: colorValue,
          shape: BoxShape.circle,
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: [
            if (isSelected)
              BoxShadow(
                color: AppColors.primary.withOpacity(0.3),
                blurRadius: 4,
                spreadRadius: 1,
              ),
          ],
        ),
        // White check mark for selected dark colors
        child: isSelected && _isDarkColor(colorValue)
            ? Icon(
                Icons.check,
                size: size * 0.6,
                color: Colors.white,
              )
            : isSelected && !_isDarkColor(colorValue)
                ? Icon(
                    Icons.check,
                    size: size * 0.6,
                    color: AppColors.textPrimary,
                  )
                : null,
      ),
    );
  }

  Color _parseColor(String hexCode) {
    String hex = hexCode.replaceAll('#', '');
    if (hex.length == 6) {
      hex = 'FF$hex';
    }
    return Color(int.parse(hex, radix: 16));
  }

  bool _isDarkColor(Color color) {
    final luminance = color.computeLuminance();
    return luminance < 0.5;
  }
}

/// Selectable color option for product detail
class ColorOption extends StatelessWidget {
  final ProductColor color;
  final bool isSelected;
  final VoidCallback? onTap;

  const ColorOption({
    super.key,
    required this.color,
    this.isSelected = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colorValue = _parseColor(color.hexCode);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryLight : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                color: colorValue,
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.border),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              color.name,
              style: AppTypography.labelMedium.copyWith(
                color: isSelected ? AppColors.primary : AppColors.textPrimary,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _parseColor(String hexCode) {
    String hex = hexCode.replaceAll('#', '');
    if (hex.length == 6) {
      hex = 'FF$hex';
    }
    return Color(int.parse(hex, radix: 16));
  }
}
