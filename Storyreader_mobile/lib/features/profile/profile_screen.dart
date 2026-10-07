import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/story_provider.dart';
import '../../widgets/app_header.dart';
import '../../widgets/app_footer.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/loading_skeleton.dart';
import '../../widgets/story_card.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  int _activeTab = 0; // 0: Lịch sử đọc, 1: Đã lưu (Bookmark), 2: Truyện đã mua

  void _showEditProfileDialog() {
    final auth = ref.read(authProvider);
    final nameController = TextEditingController(text: auth.displayName ?? '');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.inkCard,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.inkBorder),
        ),
        title: Text(
          'Cập nhật hồ sơ',
          style: GoogleFonts.notoSerif(
            color: AppColors.inkText,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Tên hiển thị',
              style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 13),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: nameController,
              style: GoogleFonts.inter(color: AppColors.inkText, fontSize: 14),
            ),
            const SizedBox(height: 16),
            Text(
              'Email (Không thể đổi)',
              style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 13),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: TextEditingController(text: auth.email ?? ''),
              enabled: false,
              style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 14),
              decoration: InputDecoration(
                fillColor: AppColors.inkBg.withValues(alpha: 0.5),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              'Hủy',
              style: GoogleFonts.inter(color: AppColors.inkMuted),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              final newName = nameController.text.trim();
              if (newName.isNotEmpty) {
                await ref.read(authProvider.notifier).updateDisplayName(newName);
                if (mounted && ctx.mounted) {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Đã cập nhật tên thành: $newName'),
                      backgroundColor: AppColors.inkCard,
                    ),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.gold,
              foregroundColor: AppColors.inkBg,
            ),
            child: Text(
              'Lưu thay đổi',
              style: GoogleFonts.inter(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);

    // Redirect to login if not authenticated
    if (!auth.isAuthenticated) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.go('/login');
      });
      return const SizedBox.shrink();
    }

    final historyAsync = ref.watch(readingHistoryProvider);
    final bookmarksAsync = ref.watch(bookmarksProvider);
    final purchasedAsync = ref.watch(purchasedStoriesProvider);

    return Scaffold(
      appBar: const AppHeader(),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
              child: Column(
                children: [
                  // Profile Header Card
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppColors.inkCard,
                      border: Border.all(color: AppColors.inkBorder),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.2),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: AppColors.avatarGradient,
                            border: Border.all(
                              color: AppColors.gold.withValues(alpha: 0.3),
                              width: 2,
                            ),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            (auth.displayName?.isNotEmpty == true
                                    ? auth.displayName![0]
                                    : 'U')
                                .toUpperCase(),
                            style: GoogleFonts.notoSerif(
                              color: AppColors.gold,
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),
                        Text(
                          auth.displayName ?? 'Người dùng',
                          style: GoogleFonts.notoSerif(
                            color: AppColors.inkText,
                            fontSize: 22,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.mail_outline,
                              size: 14,
                              color: AppColors.inkMuted,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              auth.email ?? 'Chưa cập nhật email',
                              style: GoogleFonts.inter(
                                color: AppColors.inkMuted,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 18),
                        OutlinedButton.icon(
                          onPressed: _showEditProfileDialog,
                          icon: const Icon(Icons.edit_outlined, size: 16),
                          label: const Text('Chỉnh sửa'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.inkText,
                            side: const BorderSide(color: AppColors.inkBorder),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 20,
                              vertical: 10,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 28),

                  // Horizontal Tabs
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildTab(0, 'Lịch sử đọc'),
                        _buildTab(1, 'Đã lưu (Bookmark)'),
                        _buildTab(2, 'Truyện đã mua'),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Tab content
                  if (_activeTab == 0)
                    historyAsync.when(
                      data: (list) => _buildStoryList(
                        list,
                        'Chưa có lịch sử đọc',
                        Icons.history,
                      ),
                      loading: () => const StoryGridSkeleton(count: 4),
                      error: (_, _) => const EmptyState(
                        title: 'Chưa có lịch sử đọc',
                        icon: Icons.history,
                      ),
                    )
                  else if (_activeTab == 1)
                    bookmarksAsync.when(
                      data: (list) => _buildStoryList(
                        list,
                        'Chưa lưu truyện nào',
                        Icons.bookmark_outline,
                      ),
                      loading: () => const StoryGridSkeleton(count: 4),
                      error: (_, _) => const EmptyState(
                        title: 'Chưa lưu truyện nào',
                        icon: Icons.bookmark_outline,
                      ),
                    )
                  else
                    purchasedAsync.when(
                      data: (list) => _buildStoryList(
                        list,
                        'Chưa mua truyện nào',
                        Icons.shopping_bag_outlined,
                      ),
                      loading: () => const StoryGridSkeleton(count: 4),
                      error: (_, _) => const EmptyState(
                        title: 'Chưa mua truyện nào',
                        icon: Icons.shopping_bag_outlined,
                      ),
                    ),
                ],
              ),
            ),
            const AppFooter(),
          ],
        ),
      ),
    );
  }

  Widget _buildTab(int index, String title) {
    final isSelected = _activeTab == index;

    return GestureDetector(
      onTap: () => setState(() => _activeTab = index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: isSelected ? AppColors.gold : Colors.transparent,
              width: 2,
            ),
          ),
        ),
        child: Text(
          title,
          style: GoogleFonts.inter(
            color: isSelected ? AppColors.gold : AppColors.inkMuted,
            fontSize: 14,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
          ),
        ),
      ),
    );
  }

  Widget _buildStoryList(List<dynamic> stories, String emptyTitle, IconData emptyIcon) {
    if (stories.isEmpty) {
      return EmptyState(title: emptyTitle, icon: emptyIcon);
    }

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 24,
        childAspectRatio: 0.48,
      ),
      itemCount: stories.length,
      itemBuilder: (context, idx) {
        return StoryCard(story: stories[idx]);
      },
    );
  }
}
