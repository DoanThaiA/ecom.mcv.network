import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../screens/home/home_screen.dart';
import '../screens/products/products_screen.dart';
import '../screens/products/product_detail_screen.dart';
import '../screens/category/category_screen.dart';
import '../screens/cart/cart_screen.dart';
import '../screens/account/account_screen.dart';
import '../screens/auth/sign_in_screen.dart';
import '../screens/auth/sign_up_screen.dart';
import '../screens/search/search_screen.dart';
import '../widgets/navigation/main_scaffold.dart';

/// Route names
class Routes {
  Routes._();

  static const String home = '/';
  static const String products = '/products';
  static const String productDetail = '/products/:productId';
  static const String category = '/category/:slug';
  static const String cart = '/cart';
  static const String account = '/account';
  static const String signIn = '/sign-in';
  static const String signUp = '/sign-up';
  static const String search = '/search';
}

/// App router configuration using GoRouter
final GoRouter appRouter = GoRouter(
  initialLocation: Routes.home,
  debugLogDiagnostics: true,
  routes: [
    // Shell route for main scaffold with bottom navigation
    ShellRoute(
      builder: (context, state, child) {
        return MainScaffold(child: child);
      },
      routes: [
        GoRoute(
          path: Routes.home,
          name: 'home',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: HomeScreen(),
          ),
        ),
        GoRoute(
          path: Routes.products,
          name: 'products',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: ProductsScreen(),
          ),
        ),
        GoRoute(
          path: Routes.cart,
          name: 'cart',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: CartScreen(),
          ),
        ),
        GoRoute(
          path: Routes.account,
          name: 'account',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: AccountScreen(),
          ),
        ),
      ],
    ),
    // Routes outside shell (no bottom navigation)
    GoRoute(
      path: Routes.productDetail,
      name: 'productDetail',
      builder: (context, state) {
        final productId = state.pathParameters['productId']!;
        return ProductDetailScreen(productId: productId);
      },
    ),
    GoRoute(
      path: Routes.category,
      name: 'category',
      builder: (context, state) {
        final slug = state.pathParameters['slug']!;
        return CategoryScreen(slug: slug);
      },
    ),
    GoRoute(
      path: Routes.signIn,
      name: 'signIn',
      builder: (context, state) => const SignInScreen(),
    ),
    GoRoute(
      path: Routes.signUp,
      name: 'signUp',
      builder: (context, state) => const SignUpScreen(),
    ),
    GoRoute(
      path: Routes.search,
      name: 'search',
      pageBuilder: (context, state) => CustomTransitionPage(
        child: const SearchScreen(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(
            opacity: animation,
            child: child,
          );
        },
      ),
    ),
  ],
);
