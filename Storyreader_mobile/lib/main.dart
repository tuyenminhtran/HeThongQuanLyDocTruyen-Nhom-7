import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/network/dio_client.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/theme_provider.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const ProviderScope(
      child: StoryReaderApp(),
    ),
  );
}

class StoryReaderApp extends ConsumerStatefulWidget {
  const StoryReaderApp({super.key});

  @override
  ConsumerState<StoryReaderApp> createState() => _StoryReaderAppState();
}

class _StoryReaderAppState extends ConsumerState<StoryReaderApp> {
  @override
  void initState() {
    super.initState();
    // Configure 401 Unauthorized handler
    DioClient.onUnauthorized = () {
      if (mounted) {
        ref.read(authProvider.notifier).logout();
        final router = ref.read(routerProvider);
        router.go('/login');
      }
    };
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);
    final themeMode = ref.watch(appThemeModeProvider);

    return MaterialApp.router(
      title: 'StoryReader',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      routerConfig: router,
    );
  }
}
