import 'product.dart';

/// Cart item model for cart screen
class CartItem {
  final String id;
  final Product product;
  final int quantity;
  final String? selectedColorId;
  final String? selectedSize;
  final bool isSelected;

  CartItem({
    required this.id,
    required this.product,
    this.quantity = 1,
    this.selectedColorId,
    this.selectedSize,
    this.isSelected = true,
  });

  /// Get the selected color
  ProductColor? get selectedColor {
    if (selectedColorId == null) return null;
    try {
      return product.colors.firstWhere((c) => c.id == selectedColorId);
    } catch (_) {
      return null;
    }
  }

  /// Calculate subtotal for this item
  double get subtotal => product.price * quantity;

  /// Get product name with variant info
  String get displayName {
    final parts = [product.name];
    if (selectedColor != null) {
      parts.add(selectedColor!.name);
    }
    if (selectedSize != null) {
      parts.add(selectedSize!);
    }
    return parts.join(' - ');
  }

  /// Create a copy with updated values
  CartItem copyWith({
    String? id,
    Product? product,
    int? quantity,
    String? selectedColorId,
    String? selectedSize,
    bool? isSelected,
  }) {
    return CartItem(
      id: id ?? this.id,
      product: product ?? this.product,
      quantity: quantity ?? this.quantity,
      selectedColorId: selectedColorId ?? this.selectedColorId,
      selectedSize: selectedSize ?? this.selectedSize,
      isSelected: isSelected ?? this.isSelected,
    );
  }
}
