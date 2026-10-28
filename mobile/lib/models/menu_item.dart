import 'package:flutter/material.dart';

/// Menu item model for navigation drawers and account menus
class MenuItem {
  final String id;
  final String title;
  final IconData? icon;
  final String? iconPath;
  final String? route;
  final List<MenuItem> children;
  final bool showDivider;
  final VoidCallback? onTap;

  MenuItem({
    required this.id,
    required this.title,
    this.icon,
    this.iconPath,
    this.route,
    this.children = const [],
    this.showDivider = false,
    this.onTap,
  });

  /// Check if menu item has children
  bool get hasChildren => children.isNotEmpty;

  /// Check if menu item is navigable
  bool get isNavigable => route != null || onTap != null;
}

/// Banner model for hero slider
class AppBanner {
  final String id;
  final String image;
  final String? title;
  final String? subtitle;
  final String? link;

  const AppBanner({
    required this.id,
    required this.image,
    this.title,
    this.subtitle,
    this.link,
  });
}

/// Topic/Section model for home screen
class Topic {
  final String id;
  final String title;
  final String? subtitle;
  final String? link;

  Topic({
    required this.id,
    required this.title,
    this.subtitle,
    this.link,
  });
}
