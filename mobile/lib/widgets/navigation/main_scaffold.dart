import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import 'app_bottom_nav.dart';
import 'mobile_nav_header.dart';
import 'mobile_menu_drawer.dart';

/// Main scaffold with bottom navigation and header
class MainScaffold extends StatefulWidget {
  final Widget child;

  const MainScaffold({
    super.key,
    required this.child,
  });

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  int _getCurrentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    if (location == '/') return 0;
    if (location.startsWith('/products') && !location.contains('/products/')) return 1;
    if (location == '/cart') return 2;
    if (location == '/account') return 3;
    return 0;
  }

  void _onNavItemTapped(int index) {
    switch (index) {
      case 0:
        context.go('/');
        break;
      case 1:
        context.go('/products');
        break;
      case 2:
        context.go('/cart');
        break;
      case 3:
        context.go('/account');
        break;
    }
  }

  void _openDrawer() {
    _scaffoldKey.currentState?.openDrawer();
  }

  void _openSearch() {
    context.push('/search');
  }

  void _openCart() {
    context.go('/cart');
  }

  @override
  Widget build(BuildContext context) {
    final currentIndex = _getCurrentIndex(context);

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AppColors.background,
      drawer: const MobileMenuDrawer(),
      body: SafeArea(
        child: Column(
          children: [
            MobileNavHeader(
              onMenuTap: _openDrawer,
              onSearchTap: _openSearch,
              onCartTap: _openCart,
              cartItemCount: 3, // Mock data
            ),
            Expanded(child: widget.child),
          ],
        ),
      ),
      bottomNavigationBar: AppBottomNav(
        currentIndex: currentIndex,
        onTap: _onNavItemTapped,
      ),
    );
  }
}
