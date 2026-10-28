import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/mock_data.dart';
import 'components/hero_banner_slider.dart';
import 'components/flash_sale_section.dart';
import 'components/category_section.dart';
import 'components/topic_section.dart';

/// Home screen with banners, categories, flash sale, and product sections
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async {
        // Simulate refresh
        await Future.delayed(const Duration(seconds: 1));
      },
      color: AppColors.primary,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Banner Slider
            const HeroBannerSlider(),
            const SizedBox(height: 24),

            // Category Section
            const CategorySection(),
            const SizedBox(height: 24),

            // Flash Sale Section
            const FlashSaleSection(),
            const SizedBox(height: 24),

            // Topic Sections (New Arrivals, Best Sellers, etc.)
            ...MockData.topics.map((topic) => Padding(
                  padding: const EdgeInsets.only(bottom: 24),
                  child: TopicSection(topic: topic),
                )),

            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
