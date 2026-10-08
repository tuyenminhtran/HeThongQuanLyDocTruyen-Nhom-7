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
    final storiesAsync = ref.watch(storiesFamily(_keyword.isEmpty ? null : _keyword));

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
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
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
                        style: GoogleFonts.inter(color: AppColors.inkText, fontSize: 14),
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
                          if (_statusFilter != null && s.status != _statusFilter) {
                            return false;
                          }
                          if (_accessFilter != null && s.accessPolicy != _accessFilter) {
                            return false;
                          }
                          return true;
                        }).toList();

                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
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
                                    color: AppColors.inkBorder.withValues(alpha: 0.5),
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
                                    border: Border.all(color: AppColors.inkBorder),
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
                                subtitle: 'Hãy thử đổi từ khóa hoặc bộ lọc khác',
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
                                      side: const BorderSide(color: AppColors.inkBorder),
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
              const Icon(Icons.local_fire_department, color: AppColors.gold, size: 20),
              const SizedBox(width: 8),
              Text(
                'Đọc Nhiều Nhất',
                style: GoogleFonts.notoSerif(
                  color: AppColors.inkText,
                  fontSize: 16,
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
                  style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 13),
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: displayStories.length,
              separatorBuilder: (context, _) => const SizedBox(height: 8),
              itemBuilder: (context, idx) {
                final story = displayStories[idx];
                final rank = idx + 1;

                Color rankBg;
                Color rankText;
                Color rankBorder;

                if (rank == 1) {
                  rankBg = Colors.yellow.withValues(alpha: 0.2);
                  rankText = Colors.yellow.shade700;
                  rankBorder = Colors.yellow.shade700.withValues(alpha: 0.4);
                } else if (rank == 2) {
                  rankBg = Colors.blueGrey.withValues(alpha: 0.2);
                  rankText = Colors.blueGrey.shade200;
                  rankBorder = Colors.blueGrey.shade200.withValues(alpha: 0.4);
                } else if (rank == 3) {
                  rankBg = Colors.amber.shade900.withValues(alpha: 0.2);
                  rankText = Colors.amber.shade700;
                  rankBorder = Colors.amber.shade700.withValues(alpha: 0.4);
                } else {
                  rankBg = AppColors.inkBg;
                  rankText = AppColors.inkMuted;
                  rankBorder = AppColors.inkBorder;
                }

                return InkWell(
                  onTap: () => context.push('/stories/${story.id}'),
                  borderRadius: BorderRadius.circular(8),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
                    child: Row(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: rankBg,
                            border: Border.all(color: rankBorder),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            '$rank',
                            style: GoogleFonts.notoSerif(
                              color: rankText,
                              fontSize: 14,
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
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              Row(
                                children: [
                                  const Icon(
                                    Icons.remove_red_eye_outlined,
                                    size: 12,
                                    color: AppColors.inkMuted,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${story.viewCount}',
                                    style: GoogleFonts.inter(
                                      color: AppColors.inkMuted,
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
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
        ],
      ),
    );
  }

  Widget _buildPremiumBanner(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: AppColors.avatarGradient,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.gold.withValues(alpha: 0.2)),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Text(
            'Đăng ký Premium',
            style: GoogleFonts.notoSerif(
              color: AppColors.gold,
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Đọc toàn bộ truyện trả phí không giới hạn chỉ với 50.000đ/tháng',
            style: GoogleFonts.inter(
              color: AppColors.inkText.withValues(alpha: 0.8),
              fontSize: 14,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => context.push('/pricing'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.gold,
              foregroundColor: AppColors.inkBg,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              elevation: 4,
            ),
            child: Text(
              'Xem chi tiết',
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
