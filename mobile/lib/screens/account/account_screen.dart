import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/constants/mock_data.dart';
import '../../widgets/common/cached_product_image.dart';
import 'components/account_menu_item.dart';

/// Account screen with profile and menu items
class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  // Mock user data
  static const bool _isAuthenticated = true;
  static const String _userName = 'John Doe';
  static const String _userEmail = 'john.doe@example.com';
  static const String? _userAvatar = null;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        children: [
          const SizedBox(height: 16),

          // Profile section
          _buildProfileSection(context),
          const SizedBox(height: 24),

          // Quick actions
          _buildQuickActions(context),
          const SizedBox(height: 24),

          // Menu items
          _buildMenuSection(context),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildProfileSection(BuildContext context) {
    if (!_isAuthenticated) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.primaryLight,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Welcome!',
                      style: AppTypography.h4,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Sign in to access your account',
                      style: AppTypography.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        ElevatedButton(
                          onPressed: () => context.push('/sign-in'),
                          child: const Text('Sign In'),
                        ),
                        const SizedBox(width: 12),
                        OutlinedButton(
                          onPressed: () => context.push('/sign-up'),
                          child: const Text('Sign Up'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.person_outline,
                size: 64,
                color: AppColors.primary,
              ),
            ],
          ),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          // Avatar
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.backgroundGray,
              border: Border.all(
                color: AppColors.primary.withOpacity(0.3),
                width: 2,
              ),
            ),
            child: _userAvatar != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(36),
                    child: CachedProductImage(
                      imageUrl: _userAvatar,
                      width: 72,
                      height: 72,
                      fit: BoxFit.cover,
                    ),
                  )
                : const Icon(
                    Icons.person,
                    size: 36,
                    color: AppColors.gray400,
                  ),
          ),
          const SizedBox(width: 16),

          // User info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _userName,
                  style: AppTypography.h4,
                ),
                const SizedBox(height: 4),
                Text(
                  _userEmail,
                  style: AppTypography.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),

          // Edit button
          IconButton(
            onPressed: () {
              // Navigate to edit profile
            },
            icon: const Icon(Icons.edit_outlined),
            color: AppColors.primary,
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          _QuickActionItem(
            icon: Icons.receipt_long_outlined,
            label: 'Orders',
            onTap: () {},
          ),
          _QuickActionItem(
            icon: Icons.favorite_border,
            label: 'Wishlist',
            onTap: () {},
          ),
          _QuickActionItem(
            icon: Icons.local_offer_outlined,
            label: 'Vouchers',
            onTap: () {},
          ),
          _QuickActionItem(
            icon: Icons.help_outline,
            label: 'Help',
            onTap: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildMenuSection(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: AppColors.cardShadow,
        ),
        child: Column(
          children: MockData.accountMenuItems.map((item) {
            return AccountMenuItem(
              icon: item.icon ?? Icons.circle,
              title: item.title,
              showDivider: !item.showDivider,
              isDestructive: item.title == 'Sign Out',
              onTap: () {
                if (item.route != null) {
                  context.push(item.route!);
                } else if (item.title == 'Sign Out') {
                  _showSignOutConfirmation(context);
                }
              },
            );
          }).toList(),
        ),
      ),
    );
  }

  void _showSignOutConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // Handle sign out
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Signed out successfully')),
              );
            },
            child: Text(
              'Sign Out',
              style: TextStyle(color: AppColors.error),
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickActionItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;

  const _QuickActionItem({
    required this.icon,
    required this.label,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Column(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  icon,
                  color: AppColors.primary,
                  size: 24,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                label,
                style: AppTypography.labelSmall.copyWith(
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
