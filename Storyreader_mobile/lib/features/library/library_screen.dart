import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../providers/auth_provider.dart';
import '../../providers/story_provider.dart';
import '../../widgets/app_header.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/loading_skeleton.dart';
import '../../widgets/request_error.dart';
import '../../widgets/story_card.dart';

class LibraryScreen extends ConsumerStatefulWidget {
  final int initialTab;

  const LibraryScreen({super.key, this.initialTab = 0});

  @override
  ConsumerState<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends ConsumerState<LibraryScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 3,
      vsync: this,
      initialIndex: widget.initialTab.clamp(0, 2),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);

    return Scaffold(
      appBar: const AppHeader(),
      body: !auth.isAuthenticated
          ? _buildGuestView(context)
          : Column(
              children: [
                // Tab bar header
                Container(
                  color: Theme.of(context).cardColor,
                  child: TabBar(
                    controller: _tabController,
                    indicatorColor: AppColors.gold,
                    indicatorWeight: 3,
                    labelColor: AppColors.gold,
                    unselectedLabelColor: AppColors.inkMuted,
                    labelStyle: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                    unselectedLabelStyle: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                    tabs: const [
                      Tab(text: AppStrings.tabFollowing),
                      Tab(text: AppStrings.tabHistory),
                      Tab(text: AppStrings.tabPurchased),
                    ],
                  ),
                ),
                // Tab views
                Expanded(
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      _buildFollowingTab(),
                      _buildHistoryTab(),
                      _buildPurchasedTab(),
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildGuestView(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.inkCard,
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.inkBorder),
              ),
              child: const Icon(
                Icons.bookmarks_outlined,
                size: 38,
                color: AppColors.gold,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Tủ sách cá nhân',
              style: GoogleFonts.lora(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Vui lòng đăng nhập để lưu trữ truyện theo dõi và đồng bộ lịch sử đọc của bạn trên mọi thiết bị.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                color: AppColors.inkMuted,
                fontSize: 14,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => context.push('/login'),
              icon: const Icon(Icons.login),
              label: const Text(AppStrings.loginTitle),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(200, 48),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFollowingTab() {
    final bookmarksAsync = ref.watch(bookmarksProvider);

    return RefreshIndicator(
      color: AppColors.gold,
      onRefresh: () async => ref.invalidate(bookmarksProvider),
      child: bookmarksAsync.when(
        loading: () => const StoryGridSkeleton(count: 6),
        error: (err, _) => Center(
          child: RequestError(
            error: err,
            onRetry: () => ref.invalidate(bookmarksProvider),
          ),
        ),
        data: (stories) {
          if (stories.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: EmptyState(
                  icon: Icons.bookmark_border,
                  title: 'Chưa có truyện theo dõi',
                  subtitle: 'Nhấn "Theo dõi" ở trang chi tiết truyện để nhận thông báo chương mới.',
                ),
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: stories.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              return StoryCard(
                story: stories[index],
                isHorizontal: true,
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildHistoryTab() {
    final historyAsync = ref.watch(readingHistoryProvider);

    return RefreshIndicator(
      color: AppColors.gold,
      onRefresh: () async => ref.invalidate(readingHistoryProvider),
      child: historyAsync.when(
        loading: () => const StoryGridSkeleton(count: 6),
        error: (err, _) => Center(
          child: RequestError(
            error: err,
            onRetry: () => ref.invalidate(readingHistoryProvider),
          ),
        ),
        data: (stories) {
          if (stories.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: EmptyState(
                  icon: Icons.history,
                  title: 'Chưa có lịch sử đọc',
                  subtitle: 'Những bộ truyện bạn đã đọc sẽ tự động xuất hiện tại đây.',
                ),
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: stories.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              return StoryCard(
                story: stories[index],
                isHorizontal: true,
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildPurchasedTab() {
    final purchasedAsync = ref.watch(purchasedStoriesProvider);

    return RefreshIndicator(
      color: AppColors.gold,
      onRefresh: () async => ref.invalidate(purchasedStoriesProvider),
      child: purchasedAsync.when(
        loading: () => const StoryGridSkeleton(count: 6),
        error: (err, _) => Center(
          child: RequestError(
            error: err,
            onRetry: () => ref.invalidate(purchasedStoriesProvider),
          ),
        ),
        data: (stories) {
          if (stories.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: EmptyState(
                  icon: Icons.shopping_bag_outlined,
                  title: 'Chưa có truyện mua bản quyền',
                  subtitle: 'Các bộ truyện bạn mua trọn gói sẽ được lưu vĩnh viễn tại đây.',
                ),
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: stories.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              return StoryCard(
                story: stories[index],
                isHorizontal: true,
              );
            },
          );
        },
      ),
    );
  }
}
