import 'dart:async';
import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/constants/mock_data.dart';
import '../../../widgets/product/product_card.dart';

/// Flash sale section with countdown timer
class FlashSaleSection extends StatefulWidget {
  const FlashSaleSection({super.key});

  @override
  State<FlashSaleSection> createState() => _FlashSaleSectionState();
}

class _FlashSaleSectionState extends State<FlashSaleSection> {
  late Timer _timer;
  Duration _remainingTime = const Duration(hours: 5, minutes: 30, seconds: 45);

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingTime.inSeconds > 0) {
        setState(() {
          _remainingTime = _remainingTime - const Duration(seconds: 1);
        });
      } else {
        timer.cancel();
      }
    });
  }

  String _formatTime(int value) {
    return value.toString().padLeft(2, '0');
  }

  @override
  Widget build(BuildContext context) {
    final products = MockData.flashSaleProducts;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header with countdown
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              // Flash sale icon and title
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.error,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.flash_on,
                      color: Colors.white,
                      size: 16,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Flash Sale',
                      style: AppTypography.labelMedium.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),

              // Countdown timer
              Row(
                children: [
                  _CountdownBox(value: _formatTime(_remainingTime.inHours)),
                  const _CountdownSeparator(),
                  _CountdownBox(
                      value: _formatTime(_remainingTime.inMinutes % 60)),
                  const _CountdownSeparator(),
                  _CountdownBox(
                      value: _formatTime(_remainingTime.inSeconds % 60)),
                ],
              ),

              const Spacer(),

              // View all button
              GestureDetector(
                onTap: () {
                  // Navigate to flash sale products
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

        // Product list (horizontal scroll)
        SizedBox(
          height: 280,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: products.length,
            separatorBuilder: (context, index) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              return SizedBox(
                width: 160,
                child: ProductCard(
                  product: products[index],
                  showFlashSaleBadge: true,
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _CountdownBox extends StatelessWidget {
  final String value;

  const _CountdownBox({required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 28,
      height: 28,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: AppColors.gray800,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        value,
        style: AppTypography.labelMedium.copyWith(
          color: Colors.white,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

class _CountdownSeparator extends StatelessWidget {
  const _CountdownSeparator();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: Text(
        ':',
        style: AppTypography.labelMedium.copyWith(
          color: AppColors.gray800,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
