import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

/// Quantity selector with +/- buttons
class QuantitySelector extends StatelessWidget {
  final int quantity;
  final int minQuantity;
  final int maxQuantity;
  final ValueChanged<int>? onChanged;
  final QuantitySelectorSize size;

  const QuantitySelector({
    super.key,
    required this.quantity,
    this.minQuantity = 1,
    this.maxQuantity = 99,
    this.onChanged,
    this.size = QuantitySelectorSize.medium,
  });

  @override
  Widget build(BuildContext context) {
    final buttonSize = _getButtonSize();
    final iconSize = _getIconSize();
    final textStyle = _getTextStyle();

    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildButton(
            icon: Icons.remove,
            onPressed: quantity > minQuantity
                ? () => onChanged?.call(quantity - 1)
                : null,
            buttonSize: buttonSize,
            iconSize: iconSize,
          ),
          Container(
            width: buttonSize,
            alignment: Alignment.center,
            child: Text(
              quantity.toString(),
              style: textStyle,
            ),
          ),
          _buildButton(
            icon: Icons.add,
            onPressed: quantity < maxQuantity
                ? () => onChanged?.call(quantity + 1)
                : null,
            buttonSize: buttonSize,
            iconSize: iconSize,
          ),
        ],
      ),
    );
  }

  Widget _buildButton({
    required IconData icon,
    required VoidCallback? onPressed,
    required double buttonSize,
    required double iconSize,
  }) {
    final isDisabled = onPressed == null;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(6),
        child: SizedBox(
          width: buttonSize,
          height: buttonSize,
          child: Icon(
            icon,
            size: iconSize,
            color: isDisabled ? AppColors.gray300 : AppColors.textPrimary,
          ),
        ),
      ),
    );
  }

  double _getButtonSize() {
    switch (size) {
      case QuantitySelectorSize.small:
        return 28;
      case QuantitySelectorSize.medium:
        return 36;
      case QuantitySelectorSize.large:
        return 44;
    }
  }

  double _getIconSize() {
    switch (size) {
      case QuantitySelectorSize.small:
        return 16;
      case QuantitySelectorSize.medium:
        return 20;
      case QuantitySelectorSize.large:
        return 24;
    }
  }

  TextStyle _getTextStyle() {
    switch (size) {
      case QuantitySelectorSize.small:
        return AppTypography.labelMedium;
      case QuantitySelectorSize.medium:
        return AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600);
      case QuantitySelectorSize.large:
        return AppTypography.bodyLarge.copyWith(fontWeight: FontWeight.w600);
    }
  }
}

enum QuantitySelectorSize { small, medium, large }
