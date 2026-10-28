import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/constants/mock_data.dart';
import '../../models/product.dart';
import '../../widgets/common/primary_button.dart';
import '../../widgets/common/price_display.dart';
import '../../widgets/common/quantity_selector.dart';
import '../../widgets/product/product_image_slider.dart';
import '../../widgets/product/color_swatch_row.dart';
import '../../widgets/product/size_selector.dart';
import '../../widgets/navigation/mobile_nav_header.dart';

/// Product detail screen
class ProductDetailScreen extends StatefulWidget {
  final String productId;

  const ProductDetailScreen({
    super.key,
    required this.productId,
  });

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  late Product product;
  String? _selectedColorId;
  String? _selectedSize;
  int _quantity = 1;

  @override
  void initState() {
    super.initState();
    // Find product from mock data
    product = MockData.products.firstWhere(
      (p) => p.id == widget.productId,
      orElse: () => MockData.products.first,
    );

    // Set default selections
    if (product.colors.isNotEmpty) {
      _selectedColorId = product.colors.first.id;
    }
    if (product.sizes.isNotEmpty) {
      _selectedSize = product.sizes.first;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            SimpleHeader(
              title: 'Product Details',
              actions: [
                IconButton(
                  icon: const Icon(Icons.share_outlined),
                  onPressed: () {},
                ),
                IconButton(
                  icon: const Icon(Icons.favorite_border),
                  onPressed: () {},
                ),
              ],
            ),

            // Content
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Image slider
                    ProductImageSlider(
                      images: product.images.isNotEmpty
                          ? product.images
                          : [product.avatar ?? ''],
                      height: 350,
                    ),
                    const SizedBox(height: 16),

                    // Product info
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Name
                          Text(
                            product.name,
                            style: AppTypography.h3,
                          ),
                          const SizedBox(height: 8),

                          // Price
                          PriceDisplay(
                            price: product.price,
                            originalPrice: product.originalPrice,
                            size: PriceSize.large,
                          ),
                          const SizedBox(height: 16),

                          // Stock status
                          Row(
                            children: [
                              Icon(
                                product.inStock
                                    ? Icons.check_circle
                                    : Icons.cancel,
                                size: 18,
                                color: product.inStock
                                    ? AppColors.success
                                    : AppColors.error,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                product.inStock
                                    ? 'In Stock (${product.stock} available)'
                                    : 'Out of Stock',
                                style: AppTypography.bodyMedium.copyWith(
                                  color: product.inStock
                                      ? AppColors.success
                                      : AppColors.error,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),

                          // Color selection
                          if (product.colors.isNotEmpty) ...[
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Color',
                                  style: AppTypography.h5,
                                ),
                                if (_selectedColorId != null)
                                  Text(
                                    product.colors
                                        .firstWhere(
                                            (c) => c.id == _selectedColorId)
                                        .name,
                                    style: AppTypography.bodyMedium.copyWith(
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: product.colors.map((color) {
                                return ColorOption(
                                  color: color,
                                  isSelected: color.id == _selectedColorId,
                                  onTap: () {
                                    setState(() {
                                      _selectedColorId = color.id;
                                    });
                                  },
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 24),
                          ],

                          // Size selection
                          if (product.sizes.isNotEmpty) ...[
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Size',
                                  style: AppTypography.h5,
                                ),
                                GestureDetector(
                                  onTap: () => _showSizeGuide(context),
                                  child: Text(
                                    'Size Guide',
                                    style: AppTypography.labelMedium.copyWith(
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            SizeSelector(
                              sizes: product.sizes,
                              selectedSize: _selectedSize,
                              onSizeSelected: (size) {
                                setState(() {
                                  _selectedSize = size;
                                });
                              },
                            ),
                            const SizedBox(height: 24),
                          ],

                          // Quantity
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Quantity',
                                style: AppTypography.h5,
                              ),
                              QuantitySelector(
                                quantity: _quantity,
                                maxQuantity: product.stock,
                                onChanged: (value) {
                                  setState(() {
                                    _quantity = value;
                                  });
                                },
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),

                          // Description
                          if (product.description != null) ...[
                            Text(
                              'Description',
                              style: AppTypography.h5,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              product.description!,
                              style: AppTypography.bodyMedium.copyWith(
                                color: AppColors.textMuted,
                                height: 1.6,
                              ),
                            ),
                            const SizedBox(height: 24),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Bottom action bar
            _buildBottomBar(),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomBar() {
    final total = product.price * _quantity;

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
        child: Row(
          children: [
            // Total
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Total',
                    style: AppTypography.bodySmall,
                  ),
                  PriceDisplay(
                    price: total,
                    size: PriceSize.large,
                    compact: true,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),

            // Add to cart button
            Expanded(
              child: PrimaryButton(
                text: 'Add to Cart',
                icon: Icons.shopping_cart_outlined,
                onPressed: product.inStock
                    ? () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Added to cart!'),
                            duration: Duration(seconds: 2),
                          ),
                        );
                      }
                    : null,
                disabled: !product.inStock,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showSizeGuide(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const SizeGuideSheet(),
    );
  }
}
