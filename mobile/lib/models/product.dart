/// Product model for displaying in lists and detail pages
class Product {
  final String id;
  final String name;
  final String? description;
  final double price;
  final double? originalPrice;
  final String? avatar;
  final List<String> images;
  final List<ProductColor> colors;
  final List<String> sizes;
  final int stock;
  final String? categoryId;
  final String? categoryName;
  final bool isFlashSale;
  final double? flashSaleDiscount;

  Product({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    this.originalPrice,
    this.avatar,
    this.images = const [],
    this.colors = const [],
    this.sizes = const [],
    this.stock = 0,
    this.categoryId,
    this.categoryName,
    this.isFlashSale = false,
    this.flashSaleDiscount,
  });

  /// Calculate discount percentage
  int? get discountPercent {
    if (originalPrice == null || originalPrice! <= price) return null;
    return ((1 - price / originalPrice!) * 100).round();
  }

  /// Check if product has discount
  bool get hasDiscount => discountPercent != null && discountPercent! > 0;

  /// Check if product is in stock
  bool get inStock => stock > 0;

  /// Get main display image
  String? get displayImage => avatar ?? (images.isNotEmpty ? images.first : null);
}

/// Product color variant
class ProductColor {
  final String id;
  final String name;
  final String hexCode;
  final String? image;

  ProductColor({
    required this.id,
    required this.name,
    required this.hexCode,
    this.image,
  });
}
