import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import 'router.dart';

/// Main app widget with theme and router configuration
class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'CChat E-Commerce',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: appRouter,
    );
  }
}
