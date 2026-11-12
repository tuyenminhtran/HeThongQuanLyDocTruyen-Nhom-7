import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/auth_provider.dart';
import 'admin_dashboard_screen.dart';
import 'admin_stories_screen.dart';
import 'admin_categories_screen.dart';
import 'admin_users_screen.dart';

class AdminLayoutScreen extends ConsumerStatefulWidget {
  final int initialIndex;

  const AdminLayoutScreen({super.key, this.initialIndex = 0});

  @override
  ConsumerState<AdminLayoutScreen> createState() => _AdminLayoutScreenState();
}

class _AdminLayoutScreenState extends ConsumerState<AdminLayoutScreen> {
  late int _currentIndex;

  final List<Map<String, dynamic>> _tabs = [
    {
      'title': 'Dashboard',
      'icon': Icons.dashboard_outlined,
      'screen': const AdminDashboardScreen(),
    },
    {
      'title': 'Quản lý Truyện',
      'icon': Icons.menu_book_outlined,
      'screen': const AdminStoriesScreen(),
    },
    {
      'title': 'Quản lý Thể Loại',
      'icon': Icons.category_outlined,
      'screen': const AdminCategoriesScreen(),
    },
    {
      'title': 'Người Dùng',
      'icon': Icons.people_outline,
      'screen': const AdminUsersScreen(),
    },
  ];

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);

    // Guard: redirect non-admin users
    if (!auth.isAdmin) {
      return Scaffold(
        backgroundColor: AppColors.inkBg,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.red400.withValues(alpha: 0.1),
                    border: Border.all(
                      color: AppColors.red400.withValues(alpha: 0.2),
                    ),
                  ),
                  alignment: Alignment.center,
                  child: const Icon(
                    Icons.block,
                    color: AppColors.red400,
                    size: 32,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Bạn không có quyền truy cập',
                  style: GoogleFonts.notoSerif(
                    color: AppColors.inkText,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Trang này chỉ dành cho quản trị viên.',
                  style: GoogleFonts.inter(
                    color: AppColors.inkMuted,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () => context.go('/'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.gold,
                    foregroundColor: AppColors.inkBg,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    'Về trang chủ',
                    style: GoogleFonts.inter(fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.inkBg,
      appBar: AppBar(
        title: Text(
          'Menu Quản Trị',
          style: GoogleFonts.inter(
            color: AppColors.inkText,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.inkMuted),
          onPressed: () => context.go('/'),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Container(
            height: 48,
            padding: const EdgeInsets.symmetric(horizontal: 8),
            alignment: Alignment.centerLeft,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _tabs.length,
              separatorBuilder: (context, _) => const SizedBox(width: 8),
              itemBuilder: (context, idx) {
                final tab = _tabs[idx];
                final isSelected = _currentIndex == idx;

                return GestureDetector(
                  onTap: () => setState(() => _currentIndex = idx),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.gold.withValues(alpha: 0.1)
                          : Colors.transparent,
                      border: Border.all(
                        color: isSelected
                            ? AppColors.gold.withValues(alpha: 0.2)
                            : Colors.transparent,
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          tab['icon'] as IconData,
                          size: 16,
                          color: isSelected ? AppColors.gold : AppColors.inkMuted,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          tab['title'] as String,
                          style: GoogleFonts.inter(
                            color: isSelected ? AppColors.gold : AppColors.inkMuted,
                            fontSize: 13,
                            fontWeight:
                                isSelected ? FontWeight.w600 : FontWeight.w400,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ),
      body: _tabs[_currentIndex]['screen'] as Widget,
    );
  }
}
