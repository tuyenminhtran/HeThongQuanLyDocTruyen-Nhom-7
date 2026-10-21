import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/constants/app_colors.dart';
import '../../data/models/story_model.dart';
import '../../providers/story_provider.dart';
import '../../widgets/app_header.dart';
import '../../widgets/app_footer.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/loading_skeleton.dart';
import '../../widgets/story_card.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final _searchController = TextEditingController();
  Timer? _debounce;
  String _keyword = '';
  int? _statusFilter; // null = all, 0 = Đang phát hành, 1 = Hoàn thành, 2 = Tạm ngưng
  int? _accessFilter; // null = all, 0 = Miễn phí, 1 = Trả phí, 2 = Mixed
  int _visibleCount = 12;

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String val) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      setState(() {
        _keyword = val.trim();
        _visibleCount = 12;
      });
    });
  }

  void _clearSearch() {
    _searchController.clear();
    _debounce?.cancel();
    setState(() {
      _keyword = '';
      _visibleCount = 12;
    });
  }

  @override
  Widget build(BuildContext context) {
    final storiesAsync = ref.watch(
      storiesFamily(_keyword.isEmpty ? null : _keyword),
    );

    return Scaffold(
      appBar: const AppHeader(),
      body: RefreshIndicator(
        color: AppColors.gold,
        backgroundColor: AppColors.inkCard,
        onRefresh: () async {
          ref.invalidate(storiesFamily(_keyword.isEmpty ? null : _keyword));
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 24,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Search Bar
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.inkCard,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.inkBorder),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: TextField(
                        controller: _searchController,
                        onChanged: _onSearchChanged,
                        style: GoogleFonts.inter(
                          color: AppColors.inkText,
                          fontSize: 14,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Tìm truyện theo tên hoặc tác giả...',
                          hintStyle: GoogleFonts.inter(
                            color: AppColors.inkMuted.withValues(alpha: 0.5),
                            fontSize: 14,
                          ),
                          filled: false,
                          border: InputBorder.none,
                          enabledBorder: InputBorder.none,
                          focusedBorder: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 14,
                          ),
                          prefixIcon: const Icon(
                            Icons.search,
                            color: AppColors.inkMuted,
                            size: 20,
                          ),
                          suffixIcon: _searchController.text.isNotEmpty
                              ? IconButton(
                                  icon: const Icon(
                                    Icons.close,
                                    color: AppColors.inkMuted,
                                    size: 18,
                                  ),
                                  onPressed: _clearSearch,
                                )
                              : null,
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Filter dropdowns
                    Row(
                      children: [
                        // Status filter
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(
                              color: AppColors.inkBg,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.inkBorder),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<int?>(
                                value: _statusFilter,
                                dropdownColor: AppColors.inkCard,
                                isExpanded: true,
                                icon: const Icon(
                                  Icons.arrow_drop_down,
                                  color: AppColors.inkMuted,
                                ),
                                style: GoogleFonts.inter(
                                  color: AppColors.inkText,
                                  fontSize: 13,
                                ),
                                onChanged: (val) {
                                  setState(() {
                                    _statusFilter = val;
                                    _visibleCount = 12;
                                  });
                                },
                                items: const [
                                  DropdownMenuItem(
                                    value: null,
                                    child: Text('Trạng thái: Tất cả'),
                                  ),
                                  DropdownMenuItem(
                                    value: 0,
                                    child: Text('Đang phát hành'),
                                  ),
                                  DropdownMenuItem(
                                    value: 1,
                                    child: Text('Hoàn thành'),
                                  ),
                                  DropdownMenuItem(
                                    value: 2,
                                    child: Text('Tạm ngưng'),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        // Access filter
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(
                              color: AppColors.inkBg,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.inkBorder),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<int?>(
                                value: _accessFilter,
                                dropdownColor: AppColors.inkCard,
                                isExpanded: true,
                                icon: const Icon(
                                  Icons.arrow_drop_down,
                                  color: AppColors.inkMuted,
                                ),
                                style: GoogleFonts.inter(
                                  color: AppColors.inkText,
                                  fontSize: 13,
                                ),
                                onChanged: (val) {
                                  setState(() {
                                    _accessFilter = val;
                                    _visibleCount = 12;
                                  });
                                },
                                items: const [
                                  DropdownMenuItem(
                                    value: null,
                                    child: Text('Thu phí: Tất cả'),
                                  ),
                                  DropdownMenuItem(
                                    value: 0,
                                    child: Text('Miễn phí'),
                                  ),
                                  DropdownMenuItem(
                                    value: 1,
                                    child: Text('Trả phí'),
                                  ),
                                  DropdownMenuItem(
                                    value: 2,
                                    child: Text('Mixed'),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 28),

                    // Section Title + Badge
                    storiesAsync.when(
                      data: (stories) {
                        final filtered = stories.where((s) {
                          if (_statusFilter != null &&
                              s.status != _statusFilter) {
                            return false;
                          }
                          if (_accessFilter != null &&
                              s.accessPolicy != _accessFilter) {
                            return false;
                          }
                          return true;
                        }).toList();

                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            if (_keyword.isEmpty &&
                                _statusFilter == null &&
                                _accessFilter == null)
                              _buildFeaturedSection(stories),

                            Row(
                              children: [
                                Text(
                                  _keyword.isNotEmpty
                                      ? 'Kết quả tìm kiếm'
                                      : 'Tất cả truyện',
                                  style: GoogleFonts.notoSerif(
                                    color: AppColors.inkText,
                                    fontSize: 18,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Divider(
                                    color: AppColors.inkBorder.withValues(
                                      alpha: 0.5,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.inkCard,
                                    border: Border.all(
                                      color: AppColors.inkBorder,
                                    ),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    '${filtered.length} ${_keyword.isNotEmpty ? 'kết quả' : 'truyện'}',
                                    style: GoogleFonts.inter(
                                      color: AppColors.inkMuted,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ],
                            ),

                            const SizedBox(height: 20),

                            if (filtered.isEmpty)
                              const EmptyState(
                                title: 'Không tìm thấy truyện nào',
                                subtitle:
                                    'Hãy thử đổi từ khóa hoặc bộ lọc khác',
                              )
                            else ...[
                              // 2-column Grid
                              GridView.builder(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                gridDelegate:
                                    const SliverGridDelegateWithFixedCrossAxisCount(
                                      crossAxisCount: 2,
                                      crossAxisSpacing: 16,
                                      mainAxisSpacing: 24,
                                      childAspectRatio: 0.48,
                                    ),
                                itemCount: filtered.length > _visibleCount
                                    ? _visibleCount
                                    : filtered.length,
                                itemBuilder: (context, idx) {
                                  return StoryCard(story: filtered[idx]);
                                },
                              ),

                              // Load More Button
                              if (_visibleCount < filtered.length) ...[
                                const SizedBox(height: 24),
                                Center(
                                  child: OutlinedButton(
                                    onPressed: () {
                                      setState(() {
                                        _visibleCount += 12;
                                      });
                                    },
                                    style: OutlinedButton.styleFrom(
                                      side: const BorderSide(
                                        color: AppColors.inkBorder,
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 24,
                                        vertical: 12,
                                      ),
                                    ),
                                    child: Text(
                                      'Tải thêm truyện (${filtered.length - _visibleCount} còn lại)',
                                      style: GoogleFonts.inter(
                                        color: AppColors.inkText,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ],

                            const SizedBox(height: 36),

                            // Leaderboard "Đọc Nhiều Nhất"
                            _buildLeaderboard(stories),

                            const SizedBox(height: 24),

                            // Premium Banner
                            _buildPremiumBanner(context),
                          ],
                        );
                      },
                      loading: () => const StoryGridSkeleton(count: 8),
                      error: (err, _) => Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: AppColors.red400.withValues(alpha: 0.1),
                          border: Border.all(
                            color: AppColors.red400.withValues(alpha: 0.2),
                          ),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          'Không thể tải danh sách truyện. Vui lòng thử lại sau.',
                          style: GoogleFonts.inter(color: AppColors.red400),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const AppFooter(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFeaturedSection(List<StoryListItem> allStories) {
    if (allStories.isEmpty) return const SizedBox.shrink();
    final ranked = [...allStories]
      ..sort((a, b) => b.viewCount.compareTo(a.viewCount));
    final featured = ranked.take(5).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.auto_awesome, color: AppColors.gold, size: 20),
            const SizedBox(width: 8),
            Text(
              'Truyện Đề Cử',
              style: GoogleFonts.notoSerif(
                color: AppColors.inkText,
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        SizedBox(
          height: 250,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: featured.length,
            separatorBuilder: (context, index) => const SizedBox(width: 14),
            itemBuilder: (context, idx) {
              final story = featured[idx];
              return InkWell(
                onTap: () => context.push('/stories/${story.id}'),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  width: 140,
                  decoration: BoxDecoration(
                    color: AppColors.inkCard,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.inkBorder),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.25),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Book Cover with Spine effect
                      Expanded(
                        child: ClipRRect(
                          borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(16),
                          ),
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              Image.network(
                                story.coverImageUrl.isNotEmpty
                                    ? story.coverImageUrl
                                    : 'https://placehold.co/400x600?text=No+Cover',
                                fit: BoxFit.cover,
                                errorBuilder: (ctx, err, stack) => Container(
                                  color: AppColors.inkBg,
                                  child: const Icon(
                                    Icons.menu_book,
                                    color: AppColors.inkMuted,
                                  ),
                                ),
                              ),
                              // 3D Spine Highlight
                              Positioned(
                                top: 0,
                                bottom: 0,
                                left: 0,
                                width: 12,
                                child: Container(
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [
                                        Colors.white.withValues(alpha: 0.18),
                                        Colors.black.withValues(alpha: 0.35),
                                        Colors.transparent,
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(10),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              story.title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.notoSerif(
                                color: AppColors.inkText,
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              story.author,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.inter(
                                color: AppColors.inkMuted,
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 28),
      ],
    );
  }

  Widget _buildLeaderboard(List<StoryListItem> allStories) {
    final topStories = [...allStories]
      ..sort((a, b) => b.viewCount.compareTo(a.viewCount));
    final displayStories = topStories.take(10).toList();

    return Container(
      decoration: BoxDecoration(
        color: AppColors.inkCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.inkBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.local_fire_department,
                color: AppColors.gold,
                size: 22,
              ),
              const SizedBox(width: 8),
              Text(
                'Bảng Xếp Hạng Đọc Nhiều',
                style: GoogleFonts.notoSerif(
                  color: AppColors.inkText,
                  fontSize: 17,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (displayStories.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Text(
                  'Chưa có dữ liệu',
                  style: GoogleFonts.inter(
                    color: AppColors.inkMuted,
                    fontSize: 13,
                  ),
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: displayStories.length,
              separatorBuilder: (context, _) => const SizedBox(height: 10),
              itemBuilder: (context, idx) {
                final story = displayStories[idx];
                final rank = idx + 1;

                Gradient? rankGradient;
                Color rankBg = AppColors.inkBg;
                Color rankTextColor = AppColors.inkMuted;
                Border? rankBorder;

                if (rank == 1) {
                  rankGradient = const LinearGradient(
                    colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  );
                  rankTextColor = Colors.white;
                } else if (rank == 2) {
                  rankGradient = const LinearGradient(
                    colors: [Color(0xFF94A3B8), Color(0xFF64748B)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  );
                  rankTextColor = Colors.white;
                } else if (rank == 3) {
                  rankGradient = const LinearGradient(
                    colors: [Color(0xFFB45309), Color(0xFF78350F)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  );
                  rankTextColor = Colors.white;
                } else {
                  rankBorder = Border.all(color: AppColors.inkBorder);
                }

                return InkWell(
                  onTap: () => context.push('/stories/${story.id}'),
                  borderRadius: BorderRadius.circular(10),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 4,
                      vertical: 6,
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: rankGradient == null ? rankBg : null,
                            gradient: rankGradient,
                            border: rankBorder,
                            boxShadow: rank <= 3
                                ? [
                                    BoxShadow(
                                      color: rank == 1
                                          ? AppColors.gold.withValues(
                                              alpha: 0.3,
                                            )
                                          : Colors.black.withValues(alpha: 0.2),
                                      blurRadius: 6,
                                      offset: const Offset(0, 2),
                                    ),
                                  ]
                                : null,
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            '$rank',
                            style: GoogleFonts.inter(
                              color: rankTextColor,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                story.title,
                                style: GoogleFonts.inter(
                                  color: AppColors.inkText,
                                  fontSize: 13.5,
                                  fontWeight: FontWeight.w500,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              Row(
                                children: [
                                  Text(
                                    story.author,
                                    style: GoogleFonts.inter(
                                      color: AppColors.inkMuted,
                                      fontSize: 11.5,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  const Text(
                                    '•',
                                    style: TextStyle(
                                      color: AppColors.inkMuted,
                                      fontSize: 10,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  const Icon(
                                    Icons.remove_red_eye_outlined,
                                    size: 11,
                                    color: AppColors.inkMuted,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    story.viewCount >= 1000
                                        ? '${(story.viewCount / 1000).toStringAsFixed(1)}k'
                                        : '${story.viewCount}',
                                    style: GoogleFonts.inter(
                                      color: AppColors.inkMuted,
                                      fontSize: 11.5,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const Icon(
                          Icons.chevron_right,
                          color: AppColors.inkMuted,
                          size: 18,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
        ],
      ),
    );
  }

  Widget _buildPremiumBanner(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.inkCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.gold.withValues(alpha: 0.35)),
        boxShadow: [
          BoxShadow(
            color: AppColors.gold.withValues(alpha: 0.08),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.gold.withValues(alpha: 0.15),
              border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
            ),
            child: const Icon(
              Icons.workspace_premium,
              color: AppColors.gold,
              size: 28,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Nâng cấp Gói VIP Hội Viên',
            style: GoogleFonts.notoSerif(
              color: AppColors.gold,
              fontSize: 19,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Mở khóa toàn bộ chương VIP, đọc không giới hạn và trải nghiệm đọc trọn vẹn nhất.',
            style: GoogleFonts.inter(
              color: AppColors.inkText.withValues(alpha: 0.8),
              fontSize: 13.5,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 18),
          ElevatedButton.icon(
            onPressed: () => context.push('/pricing'),
            icon: const Icon(Icons.stars_rounded, size: 18),
            label: Text(
              'Xem Gói VIP Ngay',
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.gold,
              foregroundColor: AppColors.inkBg,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              elevation: 4,
            ),
          ),
        ],
      ),
    );
  }
}
