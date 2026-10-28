import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/constants/mock_data.dart';
import '../../models/cart_item.dart';
import '../../widgets/cart/cart_item_widget.dart';
import '../../widgets/cart/cart_bottom_bar.dart';
import '../../widgets/cart/empty_cart.dart';

/// Cart screen
class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  late List<CartItem> _cartItems;
  bool _selectAll = true;

  @override
  void initState() {
    super.initState();
    _cartItems = List.from(MockData.cartItems);
  }

  double get _subtotal {
    return _cartItems
        .where((item) => item.isSelected)
        .fold(0, (sum, item) => sum + item.subtotal);
  }

  int get _selectedCount {
    return _cartItems.where((item) => item.isSelected).length;
  }

  void _toggleSelectAll() {
    setState(() {
      _selectAll = !_selectAll;
      _cartItems = _cartItems
          .map((item) => item.copyWith(isSelected: _selectAll))
          .toList();
    });
  }

  void _toggleItemSelection(String itemId) {
    setState(() {
      _cartItems = _cartItems.map((item) {
        if (item.id == itemId) {
          return item.copyWith(isSelected: !item.isSelected);
        }
        return item;
      }).toList();
      _selectAll = _cartItems.every((item) => item.isSelected);
    });
  }

  void _updateQuantity(String itemId, int quantity) {
    setState(() {
      _cartItems = _cartItems.map((item) {
        if (item.id == itemId) {
          return item.copyWith(quantity: quantity);
        }
        return item;
      }).toList();
    });
  }

  void _removeItem(String itemId) {
    setState(() {
      _cartItems.removeWhere((item) => item.id == itemId);
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_cartItems.isEmpty) {
      return const EmptyCart();
    }

    return Column(
      children: [
        // Select all header
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: AppColors.background,
            border: Border(
              bottom: BorderSide(color: AppColors.border.withOpacity(0.5)),
            ),
          ),
          child: Row(
            children: [
              SizedBox(
                width: 24,
                height: 24,
                child: Checkbox(
                  value: _selectAll,
                  onChanged: (_) => _toggleSelectAll(),
                  activeColor: AppColors.primary,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'Select All (${_cartItems.length})',
                style: AppTypography.bodyMedium,
              ),
            ],
          ),
        ),

        // Cart items
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: _cartItems.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final item = _cartItems[index];
              return CartItemWidget(
                cartItem: item,
                onSelectionChanged: () => _toggleItemSelection(item.id),
                onQuantityChanged: (qty) => _updateQuantity(item.id, qty),
                onRemove: () => _removeItem(item.id),
              );
            },
          ),
        ),

        // Bottom bar
        CartBottomBar(
          subtotal: _subtotal,
          itemCount: _selectedCount,
          onCheckout: _selectedCount > 0
              ? () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Proceeding to checkout...'),
                    ),
                  );
                }
              : null,
        ),
      ],
    );
  }
}
