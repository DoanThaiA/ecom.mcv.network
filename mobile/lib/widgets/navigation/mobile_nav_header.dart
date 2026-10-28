import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../common/badge_widget.dart';

/// Mobile navigation header with hamburger menu, logo, and action icons
/// Height: 60px
class MobileNavHeader extends StatelessWidget {
  final VoidCallback? onMenuTap;
  final VoidCallback? onSearchTap;
  final VoidCallback? onNotificationTap;
  final VoidCallback? onCartTap;
  final int cartItemCount;
  final int notificationCount;
  final bool showBackButton;
  final VoidCallback? onBackTap;
  final String? title;

  const MobileNavHeader({
    super.key,
    this.onMenuTap,
    this.onSearchTap,
    this.onNotificationTap,
    this.onCartTap,
    this.cartItemCount = 0,
    this.notificationCount = 0,
    this.showBackButton = false,
    this.onBackTap,
    this.title,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(horizontal: 8),
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
        children: [
          // Left side - Menu or Back button
          if (showBackButton)
            _HeaderIconButton(
              icon: Icons.arrow_back,
              onTap: onBackTap ?? () => Navigator.of(context).pop(),
            )
          else
            _HeaderIconButton(
              icon: Icons.menu,
              onTap: onMenuTap,
            ),

          // Center - Logo or Title
          Expanded(
            child: Center(
              child: title != null
                  ? Text(
                      title!,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    )
                  : const _LogoWidget(),
            ),
          ),

          // Right side - Action icons
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _HeaderIconButton(
                icon: Icons.search,
                onTap: onSearchTap,
              ),
              if (onNotificationTap != null)
                BadgeWidget(
                  count: notificationCount,
                  child: _HeaderIconButton(
                    icon: Icons.notifications_outlined,
                    onTap: onNotificationTap,
                  ),
                ),
              BadgeWidget(
                count: cartItemCount,
                child: _HeaderIconButton(
                  icon: Icons.shopping_cart_outlined,
                  onTap: onCartTap,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HeaderIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;

  const _HeaderIconButton({
    required this.icon,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Icon(
            icon,
            color: AppColors.textPrimary,
            size: 24,
          ),
        ),
      ),
    );
  }
}

class _LogoWidget extends StatelessWidget {
  const _LogoWidget();

  @override
  Widget build(BuildContext context) {
    // Simple text logo - can be replaced with image/SVG
    return Row(
      mainAxisSize: MainAxisSize.min,
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
    );
  }
}

/// Simple header for detail pages (without menu drawer)
class SimpleHeader extends StatelessWidget implements PreferredSizeWidget {
  final String? title;
  final List<Widget>? actions;
  final bool centerTitle;

  const SimpleHeader({
    super.key,
    this.title,
    this.actions,
    this.centerTitle = true,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: AppColors.background,
      elevation: 0,
      centerTitle: centerTitle,
      title: title != null
          ? Text(
              title!,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            )
          : null,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
        onPressed: () => Navigator.of(context).pop(),
      ),
      actions: actions,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(56);
}
