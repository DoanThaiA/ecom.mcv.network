import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

/// Size selector chips
class SizeSelector extends StatelessWidget {
  final List<String> sizes;
  final String? selectedSize;
  final ValueChanged<String>? onSizeSelected;

  const SizeSelector({
    super.key,
    required this.sizes,
    this.selectedSize,
    this.onSizeSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: sizes.map((size) {
        final isSelected = size == selectedSize;
        return _SizeChip(
          size: size,
          isSelected: isSelected,
          onTap: onSizeSelected != null ? () => onSizeSelected!(size) : null,
        );
      }).toList(),
    );
  }
}

class _SizeChip extends StatelessWidget {
  final String size;
  final bool isSelected;
  final VoidCallback? onTap;

  const _SizeChip({
    required this.size,
    this.isSelected = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        constraints: const BoxConstraints(minWidth: 48),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: 1,
          ),
        ),
        child: Text(
          size,
          style: AppTypography.labelMedium.copyWith(
            color: isSelected ? Colors.white : AppColors.textPrimary,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }
}

/// Size guide bottom sheet
class SizeGuideSheet extends StatelessWidget {
  const SizeGuideSheet({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Size Guide',
                style: AppTypography.h4,
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Size table
          Table(
            border: TableBorder.all(color: AppColors.border),
            children: [
              // Header row
              TableRow(
                decoration: const BoxDecoration(color: AppColors.backgroundGray),
                children: const [
                  _TableCell(text: 'Size', isHeader: true),
                  _TableCell(text: 'Chest (cm)', isHeader: true),
                  _TableCell(text: 'Waist (cm)', isHeader: true),
                  _TableCell(text: 'Hips (cm)', isHeader: true),
                ],
              ),
              // Data rows
              const TableRow(children: [
                _TableCell(text: 'S'),
                _TableCell(text: '86-91'),
                _TableCell(text: '71-76'),
                _TableCell(text: '91-97'),
              ]),
              const TableRow(children: [
                _TableCell(text: 'M'),
                _TableCell(text: '91-97'),
                _TableCell(text: '76-81'),
                _TableCell(text: '97-102'),
              ]),
              const TableRow(children: [
                _TableCell(text: 'L'),
                _TableCell(text: '97-102'),
                _TableCell(text: '81-86'),
                _TableCell(text: '102-107'),
              ]),
              const TableRow(children: [
                _TableCell(text: 'XL'),
                _TableCell(text: '102-107'),
                _TableCell(text: '86-91'),
                _TableCell(text: '107-112'),
              ]),
              const TableRow(children: [
                _TableCell(text: 'XXL'),
                _TableCell(text: '107-112'),
                _TableCell(text: '91-97'),
                _TableCell(text: '112-117'),
              ]),
            ],
          ),
          const SizedBox(height: 16),

          // Note
          Text(
            '* Measurements may vary slightly between styles',
            style: AppTypography.bodySmall,
          ),
        ],
      ),
    );
  }
}

class _TableCell extends StatelessWidget {
  final String text;
  final bool isHeader;

  const _TableCell({
    required this.text,
    this.isHeader = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
      child: Text(
        text,
        style: isHeader
            ? AppTypography.labelMedium.copyWith(fontWeight: FontWeight.w600)
            : AppTypography.bodySmall,
        textAlign: TextAlign.center,
      ),
    );
  }
}
