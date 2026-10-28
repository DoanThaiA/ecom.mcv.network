import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';

/// Filter and sort header for products screen
class MobileFilterHeader extends StatelessWidget {
  final int totalProducts;
  final String sortBy;
  final bool isGridView;
  final ValueChanged<String> onSortChanged;
  final VoidCallback onViewToggle;
  final VoidCallback onFilterTap;

  const MobileFilterHeader({
    super.key,
    required this.totalProducts,
    required this.sortBy,
    required this.isGridView,
    required this.onSortChanged,
    required this.onViewToggle,
    required this.onFilterTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.background,
        border: Border(
          bottom: BorderSide(color: AppColors.border.withOpacity(0.5)),
        ),
      ),
      child: Row(
        children: [
          // Product count
          Expanded(
            child: Text(
              '$totalProducts products',
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ),

          // Sort dropdown
          GestureDetector(
            onTap: () => _showSortOptions(context),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.border),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.sort,
                    size: 18,
                    color: AppColors.textPrimary,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    _getSortLabel(sortBy),
                    style: AppTypography.labelMedium,
                  ),
                  const SizedBox(width: 4),
                  const Icon(
                    Icons.keyboard_arrow_down,
                    size: 18,
                    color: AppColors.textSecondary,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Filter button
          GestureDetector(
            onTap: onFilterTap,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.border),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.tune,
                size: 20,
                color: AppColors.textPrimary,
              ),
            ),
          ),
          const SizedBox(width: 8),

          // View toggle
          GestureDetector(
            onTap: onViewToggle,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.border),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                isGridView ? Icons.view_list : Icons.grid_view,
                size: 20,
                color: AppColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showSortOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: AppColors.border.withOpacity(0.5)),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Sort By', style: AppTypography.h5),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),

            // Options
            _SortOption(
              label: 'Newest',
              value: 'newest',
              isSelected: sortBy == 'newest',
              onTap: () {
                onSortChanged('newest');
                Navigator.pop(context);
              },
            ),
            _SortOption(
              label: 'Price: Low to High',
              value: 'price_asc',
              isSelected: sortBy == 'price_asc',
              onTap: () {
                onSortChanged('price_asc');
                Navigator.pop(context);
              },
            ),
            _SortOption(
              label: 'Price: High to Low',
              value: 'price_desc',
              isSelected: sortBy == 'price_desc',
              onTap: () {
                onSortChanged('price_desc');
                Navigator.pop(context);
              },
            ),
            _SortOption(
              label: 'Best Selling',
              value: 'best_selling',
              isSelected: sortBy == 'best_selling',
              onTap: () {
                onSortChanged('best_selling');
                Navigator.pop(context);
              },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  String _getSortLabel(String value) {
    switch (value) {
      case 'newest':
        return 'Newest';
      case 'price_asc':
        return 'Price ↑';
      case 'price_desc':
        return 'Price ↓';
      case 'best_selling':
        return 'Best Selling';
      default:
        return 'Newest';
    }
  }
}

class _SortOption extends StatelessWidget {
  final String label;
  final String value;
  final bool isSelected;
  final VoidCallback onTap;

  const _SortOption({
    required this.label,
    required this.value,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  label,
                  style: AppTypography.bodyLarge.copyWith(
                    color: isSelected ? AppColors.primary : AppColors.textPrimary,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                  ),
                ),
              ),
              if (isSelected)
                const Icon(
                  Icons.check,
                  color: AppColors.primary,
                  size: 20,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
