import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../data/models/story_model.dart';
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

  // Bookmarks filter state
  String _keyword = '';
  StoryType? _typeFilter;
  String _sortBy = 'newest'; // 'newest' | 'views' | 'title'

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

  Future<void> _unfollowStory(StoryListItem story) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Bỏ theo dõi?'),
        content: Text('Bạn có chắc chắn muốn bỏ theo dõi "${story.title}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.red400),
            child: const Text('Bỏ theo dõi', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final repo = ref.read(storyRepositoryProvider);
        await repo.toggleFollow(story.id);
        ref.invalidate(bookmarksProvider);
        ref.invalidate(isFollowingProvider(story.id));

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Đã bỏ theo dõi "${story.title}".')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Lỗi khi bỏ theo dõi: $e')),
          );
        }
      }
    }
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
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: EmptyState(
                  icon: Icons.bookmark_border,
                  title: 'Chưa có truyện theo dõi',
                  subtitle: 'Nhấn "Theo dõi" ở trang chi tiết truyện để nhận thông báo chương mới.',
                ),
              ),
            );
          }

          // Lọc & sắp xếp
          var filtered = List<StoryListItem>.from(stories);
          if (_keyword.trim().isNotEmpty) {
            final q = _keyword.trim().toLowerCase();
            filtered = filtered
                .where((s) =>
                    s.title.toLowerCase().contains(q) ||
                    s.author.toLowerCase().contains(q))
                .toList();
          }

          if (_typeFilter != null) {
            filtered = filtered.where((s) => s.type == _typeFilter).toList();
          }

          if (_sortBy == 'views') {
            filtered.sort((a, b) => b.viewCount.compareTo(a.viewCount));
          } else if (_sortBy == 'title') {
            filtered.sort((a, b) => a.title.compareTo(b.title));
          }

          return Column(
            children: [
              // Thanh công cụ lọc & tìm kiếm
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  border: Border(bottom: BorderSide(color: AppColors.inkBorder)),
                ),
                child: Column(
                  children: [
                    // Ô tìm kiếm
                    SizedBox(
                      height: 38,
                      child: TextField(
                        onChanged: (val) => setState(() => _keyword = val),
                        style: GoogleFonts.inter(fontSize: 12.5),
                        decoration: InputDecoration(
                          hintText: 'Tìm kiếm trong tủ sách...',
                          hintStyle: GoogleFonts.inter(fontSize: 12, color: AppColors.inkMuted),
                          prefixIcon: const Icon(Icons.search, size: 16, color: AppColors.inkMuted),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(color: AppColors.inkBorder),
                          ),
                          contentPadding: const EdgeInsets.symmetric(vertical: 8),
                          filled: true,
                          fillColor: const Color(0xFFF8FAFC),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Lọc loại truyện & Sắp xếp
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Type filter
                        Row(
                          children: [
                            _buildFilterChip('Tất cả', null),
                            const SizedBox(width: 6),
                            _buildFilterChip('Chữ', StoryType.novel),
                            const SizedBox(width: 6),
                            _buildFilterChip('Tranh', StoryType.comic),
                          ],
                        ),

                        // Sort dropdown
                        DropdownButton<String>(
                          value: _sortBy,
                          underline: const SizedBox.shrink(),
                          style: GoogleFonts.inter(fontSize: 12, color: AppColors.inkText),
                          items: const [
                            DropdownMenuItem(value: 'newest', child: Text('Mới nhất')),
                            DropdownMenuItem(value: 'views', child: Text('Lượt đọc')),
                            DropdownMenuItem(value: 'title', child: Text('Tên A-Z')),
                          ],
                          onChanged: (val) {
                            if (val != null) setState(() => _sortBy = val);
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Danh sách
              Expanded(
                child: filtered.isEmpty
                    ? const Center(
                        child: Text('Không tìm thấy truyện phù hợp bộ lọc.'),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: filtered.length,
                        separatorBuilder: (context, index) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final story = filtered[index];
                          return Stack(
                            children: [
                              StoryCard(
                                story: story,
                                isHorizontal: true,
                              ),
                              Positioned(
                                top: 6,
                                right: 6,
                                child: IconButton(
                                  icon: const Icon(
                                    Icons.bookmark_remove_outlined,
                                    color: AppColors.red400,
                                    size: 20,
                                  ),
                                  tooltip: 'Bỏ theo dõi',
                                  onPressed: () => _unfollowStory(story),
                                ),
                              ),
                            ],
                          );
                        },
                      ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildFilterChip(String label, StoryType? type) {
    final isSelected = _typeFilter == type;
    return GestureDetector(
      onTap: () => setState(() => _typeFilter = type),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.gold : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11.5,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            color: isSelected ? Colors.white : AppColors.inkText,
          ),
        ),
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
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
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
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
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
