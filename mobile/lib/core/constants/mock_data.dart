import 'package:flutter/material.dart';
import '../../models/product.dart';
import '../../models/category.dart';
import '../../models/cart_item.dart';
import '../../models/menu_item.dart';

/// Mock data for UI development
/// Replace with actual API data in production
class MockData {
  MockData._();

  // Sample product images (using placeholder URLs)
  static const String _productImage1 =
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400';
  static const String _productImage2 =
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400';
  static const String _productImage3 =
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400';
  static const String _productImage4 =
      'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=400';
  static const String _productImage5 =
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400';
  static const String _productImage6 =
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400';
  static const String _bannerImage1 =
      'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800';
  static const String _bannerImage2 =
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800';
  static const String _bannerImage3 =
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800';

  /// Sample product colors
  static List<ProductColor> get sampleColors => [
        ProductColor(id: '1', name: 'Black', hexCode: '#000000'),
        ProductColor(id: '2', name: 'White', hexCode: '#FFFFFF'),
        ProductColor(id: '3', name: 'Navy', hexCode: '#1E3A5F'),
        ProductColor(id: '4', name: 'Red', hexCode: '#DC2626'),
        ProductColor(id: '5', name: 'Beige', hexCode: '#D4B896'),
      ];

  /// Sample sizes
  static List<String> get sampleSizes => ['S', 'M', 'L', 'XL', 'XXL'];

  /// Sample products
  static List<Product> get products => [
        Product(
          id: '1',
          name: 'Classic Cotton T-Shirt',
          description:
              'Premium quality cotton t-shirt with comfortable fit. Perfect for everyday wear.',
          price: 299000,
          originalPrice: 399000,
          avatar: _productImage1,
          images: [_productImage1, _productImage2, _productImage3],
          colors: sampleColors.take(3).toList(),
          sizes: sampleSizes,
          stock: 50,
          categoryId: '1',
          categoryName: 'T-Shirts',
        ),
        Product(
          id: '2',
          name: 'Slim Fit Jeans',
          description: 'Modern slim fit jeans with stretch denim for maximum comfort.',
          price: 599000,
          originalPrice: 799000,
          avatar: _productImage2,
          images: [_productImage2, _productImage1],
          colors: sampleColors.where((c) => c.name == 'Navy' || c.name == 'Black').toList(),
          sizes: ['28', '30', '32', '34', '36'],
          stock: 30,
          categoryId: '2',
          categoryName: 'Jeans',
        ),
        Product(
          id: '3',
          name: 'Summer Floral Dress',
          description: 'Beautiful floral print dress perfect for summer outings.',
          price: 459000,
          avatar: _productImage3,
          images: [_productImage3],
          colors: [sampleColors[4]], // Beige
          sizes: ['S', 'M', 'L'],
          stock: 20,
          categoryId: '3',
          categoryName: 'Dresses',
          isFlashSale: true,
          flashSaleDiscount: 20,
        ),
        Product(
          id: '4',
          name: 'Winter Wool Coat',
          description: 'Warm and stylish wool coat for cold weather.',
          price: 1299000,
          originalPrice: 1599000,
          avatar: _productImage4,
          images: [_productImage4, _productImage5],
          colors: sampleColors.take(2).toList(),
          sizes: ['S', 'M', 'L', 'XL'],
          stock: 15,
          categoryId: '4',
          categoryName: 'Coats',
        ),
        Product(
          id: '5',
          name: 'Casual Hoodie',
          description: 'Cozy hoodie with kangaroo pocket. Great for lounging or working out.',
          price: 399000,
          avatar: _productImage5,
          images: [_productImage5],
          colors: sampleColors,
          sizes: sampleSizes,
          stock: 40,
          categoryId: '5',
          categoryName: 'Hoodies',
          isFlashSale: true,
          flashSaleDiscount: 15,
        ),
        Product(
          id: '6',
          name: 'Denim Jacket',
          description: 'Classic denim jacket with vintage wash. A wardrobe essential.',
          price: 699000,
          originalPrice: 899000,
          avatar: _productImage6,
          images: [_productImage6, _productImage4],
          colors:
              sampleColors.where((c) => c.name == 'Navy' || c.name == 'Black').toList(),
          sizes: ['S', 'M', 'L', 'XL'],
          stock: 25,
          categoryId: '6',
          categoryName: 'Jackets',
        ),
      ];

  /// Flash sale products
  static List<Product> get flashSaleProducts =>
      products.where((p) => p.isFlashSale || p.hasDiscount).toList();

  /// Categories
  static List<Category> get categories => [
        Category(
          id: '1',
          name: 'T-Shirts',
          slug: 't-shirts',
          productCount: 120,
          image: _productImage1,
        ),
        Category(
          id: '2',
          name: 'Jeans',
          slug: 'jeans',
          productCount: 85,
          image: _productImage2,
        ),
        Category(
          id: '3',
          name: 'Dresses',
          slug: 'dresses',
          productCount: 64,
          image: _productImage3,
        ),
        Category(
          id: '4',
          name: 'Coats',
          slug: 'coats',
          productCount: 42,
          image: _productImage4,
        ),
        Category(
          id: '5',
          name: 'Hoodies',
          slug: 'hoodies',
          productCount: 56,
          image: _productImage5,
        ),
        Category(
          id: '6',
          name: 'Jackets',
          slug: 'jackets',
          productCount: 38,
          image: _productImage6,
        ),
      ];

  /// Banners for hero slider
  static List<AppBanner> get banners => [
        const AppBanner(
          id: '1',
          image: _bannerImage1,
          title: 'New Arrivals',
          subtitle: 'Check out the latest trends',
          link: '/products',
        ),
        const AppBanner(
          id: '2',
          image: _bannerImage2,
          title: 'Summer Sale',
          subtitle: 'Up to 50% off',
          link: '/products?sale=true',
        ),
        const AppBanner(
          id: '3',
          image: _bannerImage3,
          title: 'Fashion Week',
          subtitle: 'Exclusive collections',
          link: '/products',
        ),
      ];

  /// Sample cart items
  static List<CartItem> get cartItems => [
        CartItem(
          id: '1',
          product: products[0],
          quantity: 2,
          selectedColorId: '1',
          selectedSize: 'M',
        ),
        CartItem(
          id: '2',
          product: products[1],
          quantity: 1,
          selectedColorId: '3',
          selectedSize: '32',
        ),
        CartItem(
          id: '3',
          product: products[4],
          quantity: 1,
          selectedColorId: '2',
          selectedSize: 'L',
        ),
      ];

  /// Menu items for drawer
  static List<MenuItem> get menuItems => [
        MenuItem(
          id: '1',
          title: 'Home',
          icon: Icons.home_outlined,
          route: '/',
        ),
        MenuItem(
          id: '2',
          title: 'Categories',
          icon: Icons.category_outlined,
          children: [
            MenuItem(id: '2-1', title: 'T-Shirts', route: '/category/t-shirts'),
            MenuItem(id: '2-2', title: 'Jeans', route: '/category/jeans'),
            MenuItem(id: '2-3', title: 'Dresses', route: '/category/dresses'),
            MenuItem(id: '2-4', title: 'Coats', route: '/category/coats'),
          ],
        ),
        MenuItem(
          id: '3',
          title: 'New Arrivals',
          icon: Icons.new_releases_outlined,
          route: '/products?filter=new',
        ),
        MenuItem(
          id: '4',
          title: 'Sale',
          icon: Icons.local_offer_outlined,
          route: '/products?filter=sale',
        ),
        MenuItem(
          id: '5',
          title: 'About Us',
          icon: Icons.info_outlined,
          route: '/about',
          showDivider: true,
        ),
        MenuItem(
          id: '6',
          title: 'Contact',
          icon: Icons.phone_outlined,
          route: '/contact',
        ),
      ];

  /// Account menu items
  static List<MenuItem> get accountMenuItems => [
        MenuItem(
          id: '1',
          title: 'My Orders',
          icon: Icons.receipt_long_outlined,
          route: '/orders',
        ),
        MenuItem(
          id: '2',
          title: 'Wishlist',
          icon: Icons.favorite_border,
          route: '/wishlist',
        ),
        MenuItem(
          id: '3',
          title: 'Addresses',
          icon: Icons.location_on_outlined,
          route: '/addresses',
        ),
        MenuItem(
          id: '4',
          title: 'Payment Methods',
          icon: Icons.payment_outlined,
          route: '/payment-methods',
        ),
        MenuItem(
          id: '5',
          title: 'Notifications',
          icon: Icons.notifications_outlined,
          route: '/notifications',
          showDivider: true,
        ),
        MenuItem(
          id: '6',
          title: 'Settings',
          icon: Icons.settings_outlined,
          route: '/settings',
        ),
        MenuItem(
          id: '7',
          title: 'Help & Support',
          icon: Icons.help_outline,
          route: '/support',
        ),
        MenuItem(
          id: '8',
          title: 'Sign Out',
          icon: Icons.logout,
          showDivider: true,
        ),
      ];

  /// Topics for home screen sections
  static List<Topic> get topics => [
        Topic(
          id: '1',
          title: 'New Arrivals',
          subtitle: 'Fresh styles just dropped',
          link: '/products?filter=new',
        ),
        Topic(
          id: '2',
          title: 'Best Sellers',
          subtitle: 'Top picks by our customers',
          link: '/products?filter=best-seller',
        ),
        Topic(
          id: '3',
          title: 'Trending Now',
          subtitle: 'What\'s hot this season',
          link: '/products?filter=trending',
        ),
      ];

  /// Trending search keywords
  static List<String> get trendingKeywords => [
        'Summer dress',
        'Denim jacket',
        'White sneakers',
        'Casual shirts',
        'Beach wear',
      ];
}
