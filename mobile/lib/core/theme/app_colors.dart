import 'package:flutter/material.dart';

/// Brand colors for the CChat E-Commerce app
/// Based on frontend design system
class AppColors {
  AppColors._();

  // Primary Brand Colors
  static const Color primary = Color(0xFFFAA63E);
  static const Color primaryHover = Color(0xFFE8952F);
  static const Color primaryLight = Color(0xFFFEF8F1);

  // Text Colors
  static const Color textPrimary = Color(0xFF000000);
  static const Color textSecondary = Color(0xFFAFAFAF);
  static const Color textMuted = Color(0xFF666666);

  // Background Colors
  static const Color background = Color(0xFFFFFFFF);
  static const Color backgroundGray = Color(0xFFF5F6FA);
  static const Color backgroundLight = Color(0xFFF9FAFB);

  // Status Colors
  static const Color error = Color(0xFFF62E2E);
  static const Color success = Color(0xFF22C55E);
  static const Color warning = Color(0xFFFBBF24);
  static const Color info = Color(0xFF3B82F6);

  // Border Colors
  static const Color border = Color(0xFFE5E7EB);
  static const Color borderLight = Color(0xFFF0F1F5);

  // Gray Scale
  static const Color gray50 = Color(0xFFF9FAFB);
  static const Color gray100 = Color(0xFFF5F6FA);
  static const Color gray200 = Color(0xFFE5E7EB);
  static const Color gray300 = Color(0xFFD1D5DB);
  static const Color gray400 = Color(0xFF9CA3AF);
  static const Color gray500 = Color(0xFF6B7280);
  static const Color gray600 = Color(0xFF4B5563);
  static const Color gray700 = Color(0xFF374151);
  static const Color gray800 = Color(0xFF1F2937);
  static const Color gray900 = Color(0xFF111827);

  // Gradient for primary button
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, primaryHover],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  // Shadow
  static List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Colors.black.withOpacity(0.08),
      offset: const Offset(0, 2),
      blurRadius: 8,
    ),
  ];
}
