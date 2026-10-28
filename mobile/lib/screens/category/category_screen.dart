import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/mock_data.dart';
import '../../widgets/product/product_card.dart';
import '../../widgets/navigation/mobile_nav_header.dart';
import '../products/components/mobile_filter_header.dart';

/// Category products screen
class CategoryScreen extends StatefulWidget {
  final String slug;

  const CategoryScreen({
    super.key,
    required this.slug,
  });

  @override
  State<CategoryScreen> createState() => _CategoryScreenState();
}

class _CategoryScreenState extends State<CategoryScreen> {
  String _sortBy = 'newest';
  bool _isGridView = true;

  String get categoryName {
    final category = MockData.categories.firstWhere(
      (c) => c.slug == widget.slug,
      orElse: () => MockData.categories.first,
    );
    return category.name;
  }

  @override
  Widget build(BuildContext context) {
    // Filter products by category (mock - just return all)
    final products = MockData.products;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            SimpleHeader(title: categoryName),

            // Filter header
            MobileFilterHeader(
              totalProducts: products.length,
              sortBy: _sortBy,
              isGridView: _isGridView,
              onSortChanged: (value) {
                setState(() {
                  _sortBy = value;
                });
              },
              onViewToggle: () {
                setState(() {
                  _isGridView = !_isGridView;
                });
              },
              onFilterTap: () {
                // Show filter
              },
            ),

            // Products
            Expanded(
              child: GridView.builder(
                padding: const EdgeInsets.all(16),
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
        ),
      ),
    );
  }
}
