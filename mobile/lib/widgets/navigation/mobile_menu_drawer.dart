import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/constants/mock_data.dart';
import '../../models/menu_item.dart' as models;
import '../common/primary_button.dart';

/// Full-screen mobile menu drawer
class MobileMenuDrawer extends StatefulWidget {
  const MobileMenuDrawer({super.key});

  @override
  State<MobileMenuDrawer> createState() => _MobileMenuDrawerState();
}

class _MobileMenuDrawerState extends State<MobileMenuDrawer> {
  String? _expandedMenuId;
  bool _isAuthenticated = false; // Mock state

  @override
  Widget build(BuildContext context) {
    return Drawer(
      width: MediaQuery.of(context).size.width * 0.85,
      child: SafeArea(
        child: Column(
          children: [
            // Header with close button
            _buildHeader(),

            // Search bar
            _buildSearchBar(),

            // Menu items
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: MockData.menuItems.map((item) => _buildMenuItem(item)).toList(),
              ),
            ),

            // Footer with auth buttons or contact info
            _buildFooter(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: AppColors.background,
        border: Border(
          bottom: BorderSide(
            color: AppColors.border.withOpacity(0.5),
            width: 1,
          ),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Logo
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.shopping_bag,
                  color: Colors.white,
                  size: 20,
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'CChat',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),

          // Language selector & close button
          Row(
            children: [
              // Language selector
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.backgroundGray,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      'VI',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Icon(
                      Icons.keyboard_arrow_down,
                      size: 16,
                      color: AppColors.textSecondary,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              // Close button
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: GestureDetector(
        onTap: () {
          Navigator.of(context).pop();
          context.push('/search');
        },
        child: Container(
          height: 44,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: AppColors.backgroundGray,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Icon(
                Icons.search,
                color: AppColors.textSecondary,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Search products...',
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMenuItem(models.MenuItem item) {
    final isExpanded = _expandedMenuId == item.id;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (item.showDivider)
          const Divider(height: 1, color: AppColors.border),

        Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () {
              if (item.hasChildren) {
                setState(() {
                  _expandedMenuId = isExpanded ? null : item.id;
                });
              } else if (item.route != null) {
                Navigator.of(context).pop();
                context.push(item.route!);
              } else if (item.onTap != null) {
                item.onTap!();
              }
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Row(
                children: [
                  if (item.icon != null) ...[
                    Icon(
                      item.icon,
                      color: AppColors.textPrimary,
                      size: 22,
                    ),
                    const SizedBox(width: 12),
                  ],
                  Expanded(
                    child: Text(
                      item.title,
                      style: AppTypography.bodyLarge.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  if (item.hasChildren)
                    Icon(
                      isExpanded
                          ? Icons.keyboard_arrow_up
                          : Icons.keyboard_arrow_down,
                      color: AppColors.textSecondary,
                      size: 24,
                    ),
                ],
              ),
            ),
          ),
        ),

        // Submenu
        if (item.hasChildren && isExpanded)
          Container(
            color: AppColors.backgroundGray,
            child: Column(
              children: item.children.map((child) {
                return Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () {
                      if (child.route != null) {
                        Navigator.of(context).pop();
                        context.push(child.route!);
                      }
                    },
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 50,
                        vertical: 12,
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              child.title,
                              style: AppTypography.bodyMedium,
                            ),
                          ),
                          const Icon(
                            Icons.chevron_right,
                            color: AppColors.textSecondary,
                            size: 20,
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
      ],
    );
  }

  Widget _buildFooter() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.background,
        border: Border(
          top: BorderSide(
            color: AppColors.border.withOpacity(0.5),
            width: 1,
          ),
        ),
      ),
      child: Column(
        children: [
          if (!_isAuthenticated) ...[
            // Auth buttons
            Row(
              children: [
                Expanded(
                  child: PrimaryButton(
                    text: 'Sign In',
                    onPressed: () {
                      Navigator.of(context).pop();
                      context.push('/sign-in');
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: SecondaryButton(
                    text: 'Sign Up',
                    onPressed: () {
                      Navigator.of(context).pop();
                      context.push('/sign-up');
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
          ],

          // Contact info
          Row(
            children: [
              Icon(
                Icons.phone_outlined,
                color: AppColors.textSecondary,
                size: 16,
              ),
              const SizedBox(width: 8),
              Text(
                '1800 1234 567',
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(width: 16),
              Icon(
                Icons.email_outlined,
                color: AppColors.textSecondary,
                size: 16,
              ),
              const SizedBox(width: 8),
              Text(
                'support@cchat.vn',
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
