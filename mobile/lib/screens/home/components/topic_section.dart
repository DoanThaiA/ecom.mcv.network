import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/constants/mock_data.dart';
import '../../../models/menu_item.dart';
import '../../../widgets/product/product_card.dart';

/// Topic section showing products in a grid
class TopicSection extends StatelessWidget {
  final Topic topic;

  const TopicSection({
    super.key,
    required this.topic,
  });

  @override
  Widget build(BuildContext context) {
    // Get random products for this topic (mock)
    final products = MockData.products.take(4).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    topic.title,
                    style: AppTypography.h4,
                  ),
                  if (topic.subtitle != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      topic.subtitle!,
                      style: AppTypography.bodySmall,
                    ),
                  ],
                ],
              ),
              GestureDetector(
                onTap: () {
                  // Navigate to topic page
                },
                child: Row(
                  children: [
                    Text(
                      'See All',
                      style: AppTypography.labelMedium.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                    const Icon(
                      Icons.chevron_right,
                      color: AppColors.primary,
                      size: 18,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Product grid (2 columns)
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 0.65,
            ),
            itemCount: products.length,
            itemBuilder: (context, index) {
              return ProductCard(product: products[index]);
            },
          ),
        ),
      ],
    );
  }
}
