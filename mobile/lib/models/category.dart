/// Category model for navigation and filtering
class Category {
  final String id;
  final String name;
  final String? slug;
  final String? image;
  final String? icon;
  final int productCount;
  final List<Category> children;
  final String? parentId;

  Category({
    required this.id,
    required this.name,
    this.slug,
    this.image,
    this.icon,
    this.productCount = 0,
    this.children = const [],
    this.parentId,
  });

  /// Check if category has children
  bool get hasChildren => children.isNotEmpty;

  /// Check if it's a root category
  bool get isRoot => parentId == null;
}
