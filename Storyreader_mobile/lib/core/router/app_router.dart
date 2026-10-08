import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../features/admin/admin_layout_screen.dart';
import '../../features/auth/login_screen.dart';
import '../../features/auth/register_screen.dart';
import '../../features/chapter_read/chapter_read_screen.dart';
import '../../features/home/home_screen.dart';
import '../../features/pricing/pricing_screen.dart';
import '../../features/profile/profile_screen.dart';
import '../../features/story_detail/story_detail_screen.dart';
import '../../providers/auth_provider.dart';

class _AuthRouterNotifier extends ChangeNotifier {
  _AuthRouterNotifier(Ref ref) {
    ref.listen(authProvider, (_, _) {
      notifyListeners();
    });
  }
}

final routerProvider = Provider<GoRouter>((ref) {
  final notifier = _AuthRouterNotifier(ref);

  return GoRouter(
    initialLocation: '/',
    refreshListenable: notifier,
    redirect: (context, state) {
      final auth = ref.read(authProvider);
      final location = state.matchedLocation;

      // Profile requires login
      if (location.startsWith('/profile') && !auth.isAuthenticated) {
        return '/login';
      }

      // Admin routes require Admin role
      if (location.startsWith('/admin') && !auth.isAdmin) {
        return '/';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/stories/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return StoryDetailScreen(storyId: id);
        },
      ),
      GoRoute(
        path: '/chapters/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return ChapterReadScreen(chapterId: id);
        },
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/pricing',
        builder: (context, state) => const PricingScreen(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: '/admin',
        builder: (context, state) => const AdminLayoutScreen(initialIndex: 0),
      ),
      GoRoute(
        path: '/admin/stories',
        builder: (context, state) => const AdminLayoutScreen(initialIndex: 1),
      ),
      GoRoute(
        path: '/admin/categories',
        builder: (context, state) => const AdminLayoutScreen(initialIndex: 2),
      ),
      GoRoute(
        path: '/admin/users',
        builder: (context, state) => const AdminLayoutScreen(initialIndex: 3),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      backgroundColor: AppColors.inkBg,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, size: 48, color: AppColors.red400),
              const SizedBox(height: 16),
              Text(
                'Không tìm thấy trang: ${state.uri}',
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppColors.inkText, fontSize: 16),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => context.go('/'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.gold,
                  foregroundColor: AppColors.inkBg,
                ),
                child: const Text('Về trang chủ'),
              ),
            ],
          ),
        ),
      ),
    ),
  );
});
