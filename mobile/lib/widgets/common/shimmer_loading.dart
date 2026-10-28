import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme/app_colors.dart';

/// Shimmer loading effect for skeleton screens
class ShimmerLoading extends StatelessWidget {
  final double width;
  final double height;
  final BorderRadius? borderRadius;
  final BoxShape shape;

  const ShimmerLoading({
    super.key,
    this.width = double.infinity,
    this.height = 16,
    this.borderRadius,
    this.shape = BoxShape.rectangle,
  });

  const ShimmerLoading.circle({
    super.key,
    required double size,
  })  : width = size,
        height = size,
        borderRadius = null,
        shape = BoxShape.circle;

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.gray200,
      highlightColor: AppColors.gray100,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: AppColors.gray200,
          borderRadius: shape == BoxShape.circle ? null : (borderRadius ?? BorderRadius.circular(4)),
          shape: shape,
        ),
      ),
    );
  }
}

/// Product card skeleton loading
class ProductCardSkeleton extends StatelessWidget {
  const ProductCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image placeholder
          ShimmerLoading(
            width: double.infinity,
            height: 180,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title
                const ShimmerLoading(width: 120, height: 14),
                const SizedBox(height: 8),
                // Color dots
                Row(
                  children: List.generate(
                    3,
                    (index) => const Padding(
                      padding: EdgeInsets.only(right: 6),
                      child: ShimmerLoading.circle(size: 16),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                // Price
                const ShimmerLoading(width: 80, height: 16),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// List item skeleton loading
class ListItemSkeleton extends StatelessWidget {
  final double? height;
  final bool showAvatar;
  final bool showTrailing;

  const ListItemSkeleton({
    super.key,
    this.height,
    this.showAvatar = true,
    this.showTrailing = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height ?? 72,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          if (showAvatar) ...[
            const ShimmerLoading.circle(size: 48),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const ShimmerLoading(width: 150, height: 14),
                const SizedBox(height: 8),
                ShimmerLoading(
                  width: 100,
                  height: 12,
                  borderRadius: BorderRadius.circular(4),
                ),
              ],
            ),
          ),
          if (showTrailing)
            const ShimmerLoading(width: 60, height: 24),
        ],
      ),
    );
  }
}

/// Banner skeleton loading
class BannerSkeleton extends StatelessWidget {
  final double height;

  const BannerSkeleton({
    super.key,
    this.height = 200,
  });

  @override
  Widget build(BuildContext context) {
    return ShimmerLoading(
      width: double.infinity,
      height: height,
      borderRadius: BorderRadius.circular(12),
    );
  }
}

/// Category item skeleton loading
class CategorySkeleton extends StatelessWidget {
  const CategorySkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ShimmerLoading(
          width: 64,
          height: 64,
          borderRadius: BorderRadius.circular(32),
        ),
        const SizedBox(height: 8),
        const ShimmerLoading(width: 50, height: 12),
      ],
    );
  }
}
