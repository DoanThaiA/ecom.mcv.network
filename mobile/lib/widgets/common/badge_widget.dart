import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

/// Badge widget for notifications, cart count, etc.
class BadgeWidget extends StatelessWidget {
  final Widget child;
  final int count;
  final bool showBadge;
  final Color? backgroundColor;
  final Color? textColor;
  final BadgePosition position;
  final double size;

  const BadgeWidget({
    super.key,
    required this.child,
    this.count = 0,
    this.showBadge = true,
    this.backgroundColor,
    this.textColor,
    this.position = BadgePosition.topRight,
    this.size = 18,
  });

  @override
  Widget build(BuildContext context) {
    if (!showBadge || count <= 0) {
      return child;
    }

    return Stack(
      clipBehavior: Clip.none,
      children: [
        child,
        Positioned(
          top: position == BadgePosition.topRight || position == BadgePosition.topLeft ? -4 : null,
          bottom: position == BadgePosition.bottomRight || position == BadgePosition.bottomLeft ? -4 : null,
          right: position == BadgePosition.topRight || position == BadgePosition.bottomRight ? -4 : null,
          left: position == BadgePosition.topLeft || position == BadgePosition.bottomLeft ? -4 : null,
          child: _buildBadge(),
        ),
      ],
    );
  }

  Widget _buildBadge() {
    final displayText = count > 99 ? '99+' : count.toString();
    final badgeWidth = displayText.length > 2 ? size + 8 : size;

    return Container(
      height: size,
      width: badgeWidth,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: backgroundColor ?? AppColors.error,
        borderRadius: BorderRadius.circular(size / 2),
        border: Border.all(color: Colors.white, width: 1.5),
      ),
      child: Text(
        displayText,
        style: AppTypography.labelSmall.copyWith(
          color: textColor ?? Colors.white,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

enum BadgePosition { topRight, topLeft, bottomRight, bottomLeft }

/// Dot badge for simple indicators (no count)
class DotBadge extends StatelessWidget {
  final Widget child;
  final bool show;
  final Color? color;
  final double size;
  final BadgePosition position;

  const DotBadge({
    super.key,
    required this.child,
    this.show = true,
    this.color,
    this.size = 8,
    this.position = BadgePosition.topRight,
  });

  @override
  Widget build(BuildContext context) {
    if (!show) {
      return child;
    }

    return Stack(
      clipBehavior: Clip.none,
      children: [
        child,
        Positioned(
          top: position == BadgePosition.topRight || position == BadgePosition.topLeft ? 0 : null,
          bottom: position == BadgePosition.bottomRight || position == BadgePosition.bottomLeft ? 0 : null,
          right: position == BadgePosition.topRight || position == BadgePosition.bottomRight ? 0 : null,
          left: position == BadgePosition.topLeft || position == BadgePosition.bottomLeft ? 0 : null,
          child: Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              color: color ?? AppColors.error,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 1),
            ),
          ),
        ),
      ],
    );
  }
}

/// Status badge (e.g., "New", "Hot", "Sale")
class StatusBadge extends StatelessWidget {
  final String text;
  final Color? backgroundColor;
  final Color? textColor;

  const StatusBadge({
    super.key,
    required this.text,
    this.backgroundColor,
    this.textColor,
  });

  const StatusBadge.sale({super.key})
      : text = 'Sale',
        backgroundColor = AppColors.error,
        textColor = Colors.white;

  const StatusBadge.newItem({super.key})
      : text = 'New',
        backgroundColor = AppColors.success,
        textColor = Colors.white;

  const StatusBadge.hot({super.key})
      : text = 'Hot',
        backgroundColor = AppColors.primary,
        textColor = Colors.white;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor ?? AppColors.primary,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        text,
        style: AppTypography.labelSmall.copyWith(
          color: textColor ?? Colors.white,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
