import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../core/constants/app_colors.dart';
import '../../data/models/story_model.dart';
import '../../providers/admin_provider.dart';
import '../../providers/story_provider.dart';
import '../../widgets/app_header.dart';
import '../../widgets/empty_state.dart';

enum RankingTimeRange { all, month, week, day }

class RankingsScreen extends ConsumerStatefulWidget {
  const RankingsScreen({super.key});

  @override
  ConsumerState<RankingsScreen> createState() => _RankingsScreenState();
}

class _RankingsScreenState extends ConsumerState<RankingsScreen> {
  RankingTimeRange _timeRange = RankingTimeRange.all;
  String? _selectedGenreId;
  StoryType? _selectedType;

  int _calculateViews(int rawViews, RankingTimeRange range) {
    switch (range) {
      case RankingTimeRange.day:
        return (rawViews * 0.08).floor();
      case RankingTimeRange.week:
        return (rawViews * 0.28).floor();
      case RankingTimeRange.month:
        return (rawViews * 0.65).floor();
      case RankingTimeRange.all:
        return rawViews;
    }
  }

  String _formatViews(int views) {
    if (views >= 1000000) {
      return '${(views / 1000000).toStringAsFixed(1)}M';
    }
    if (views >= 1000) {
      return '${(views / 1000).toStringAsFixed(1)}K';
    }
    return views.toString();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final genresAsync = ref.watch(genresProvider);

    final query = StoryFilterQuery(
      sortBy: 'top',
      genreId: _selectedGenreId,
      pageSize: 100,
    );
    final storiesAsync = ref.watch(storiesFilterFamily(query));

    return Scaffold(
      appBar: const AppHeader(),
      backgroundColor: isDark ? AppColors.inkBg : AppColors.inkBg,
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(storiesFilterFamily(query));
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Banner Vinh Danh
              _buildBanner(isDark),
              const SizedBox(height: 16),

              // Bộ lọc thời gian & Thể loại
              _buildFilterSection(isDark, genresAsync),
              const SizedBox(height: 16),

              // Danh sách / Podium
              storiesAsync.when(
                loading: () => _buildLoadingState(),
                error: (err, _) => _buildErrorState(err, query),
                data: (stories) {
                  var filtered = List<StoryListItem>.from(stories);
                  if (_selectedType != null) {
                    filtered = filtered.where((s) => s.type == _selectedType).toList();
                  }

                  filtered.sort((a, b) {
                    final viewA = _calculateViews(a.viewCount, _timeRange);
                    final viewB = _calculateViews(b.viewCount, _timeRange);
                    return viewB.compareTo(viewA);
                  });

                  if (filtered.isEmpty) {
                    return const Padding(
                      padding: EdgeInsets.symmetric(vertical: 40),
                      child: EmptyState(
                        title: 'Chưa có dữ liệu xếp hạng',
                        subtitle: 'Không tìm thấy tác phẩm nào phù hợp với bộ lọc.',
                        icon: Icons.emoji_events_outlined,
                      ),
                    );
                  }

                  return Column(
                    children: [
                      // Podium Top 3
                      if (filtered.length >= 3)
                        _buildPodium(filtered.sublist(0, 3), isDark),

                      const SizedBox(height: 20),

                      // Danh sách từ Top 4 trở đi (hoặc từ đầu nếu < 3)
                      _buildRankList(
                        filtered.length >= 3 ? filtered.sublist(3) : filtered,
                        startIndex: filtered.length >= 3 ? 4 : 1,
                        isDark: isDark,
                      ),
                    ],
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBanner(bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFEA580C), Color(0xFFF59E0B), Color(0xFFEAB308)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.orange.withValues(alpha: 0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.emoji_events, color: Colors.amberAccent, size: 16),
                    SizedBox(width: 6),
                    Text(
                      'VINH DANH ĐỘC GIẢ & TÁC PHẨM',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            'BẢNG XẾP HẠNG TRUYỆN HOT',
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w900,
              fontFamily: 'Serif',
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Những bộ tiểu thuyết và truyện tranh dẫn đầu về lượt đọc, được cộng đồng săn đón nhiều nhất.',
            style: TextStyle(
              color: Colors.orange.shade50,
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterSection(bool isDark, AsyncValue<List<dynamic>> genresAsync) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.inkCard : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.inkBorder,
        ),
      ),
      child: Column(
        children: [
          // Time range chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildTimeChip('Toàn thời gian', RankingTimeRange.all, Icons.all_inclusive),
                const SizedBox(width: 8),
                _buildTimeChip('Top Tháng', RankingTimeRange.month, Icons.calendar_month),
                const SizedBox(width: 8),
                _buildTimeChip('Top Tuần', RankingTimeRange.week, Icons.bolt),
                const SizedBox(width: 8),
                _buildTimeChip('Top Ngày', RankingTimeRange.day, Icons.local_fire_department),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // Type filter & Genre
          Row(
            children: [
              // Type segment
              Expanded(
                child: SegmentedButton<StoryType?>(
                  segments: const [
                    ButtonSegment<StoryType?>(
                      value: null,
                      label: Text('Tất cả', style: TextStyle(fontSize: 11)),
                    ),
                    ButtonSegment<StoryType?>(
                      value: StoryType.novel,
                      label: Text('Chữ', style: TextStyle(fontSize: 11)),
                    ),
                    ButtonSegment<StoryType?>(
                      value: StoryType.comic,
                      label: Text('Tranh', style: TextStyle(fontSize: 11)),
                    ),
                  ],
                  selected: {_selectedType},
                  onSelectionChanged: (set) {
                    setState(() {
                      _selectedType = set.first;
                    });
                  },
                  style: ButtonStyle(
                    visualDensity: VisualDensity.compact,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    backgroundColor: WidgetStateProperty.resolveWith((states) {
                      if (states.contains(WidgetState.selected)) {
                        return AppColors.gold;
                      }
                      return Colors.transparent;
                    }),
                    foregroundColor: WidgetStateProperty.resolveWith((states) {
                      if (states.contains(WidgetState.selected)) {
                        return Colors.white;
                      }
                      return isDark ? Colors.white70 : Colors.black87;
                    }),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Genre dropdown
              genresAsync.maybeWhen(
                data: (genres) => DropdownButton<String?>(
                  value: _selectedGenreId,
                  hint: Text(
                    'Thể loại',
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.white70 : Colors.black87,
                    ),
                  ),
                  dropdownColor: isDark ? AppColors.inkCard : Colors.white,
                  underline: const SizedBox.shrink(),
                  items: [
                    const DropdownMenuItem<String?>(
                      value: null,
                      child: Text('Tất cả thể loại', style: TextStyle(fontSize: 12)),
                    ),
                    ...genres.map(
                      (g) => DropdownMenuItem<String?>(
                        value: g.id.toString(),
                        child: Text(g.name.toString(), style: const TextStyle(fontSize: 12)),
                      ),
                    ),
                  ],
                  onChanged: (val) {
                    setState(() {
                      _selectedGenreId = val;
                    });
                  },
                ),
                orElse: () => const SizedBox.shrink(),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTimeChip(String label, RankingTimeRange range, IconData icon) {
    final isSelected = _timeRange == range;
    return ChoiceChip(
      selected: isSelected,
      label: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 14,
            color: isSelected ? Colors.white : AppColors.gold,
          ),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
      selectedColor: AppColors.gold,
      backgroundColor: Colors.transparent,
      onSelected: (_) {
        setState(() {
          _timeRange = range;
        });
      },
    );
  }

  Widget _buildPodium(List<StoryListItem> top3, bool isDark) {
    final top1 = top3[0];
    final top2 = top3[1];
    final top3rd = top3[2];

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // Top 2 (Silver)
          Expanded(
            child: _buildPodiumItem(
              story: top2,
              rank: 2,
              rankLabel: 'Á Quân',
              badgeColor: Colors.grey.shade400,
              medal: '🥈',
              height: 180,
              isDark: isDark,
            ),
          ),
          const SizedBox(width: 8),
          // Top 1 (Gold - Taller)
          Expanded(
            child: _buildPodiumItem(
              story: top1,
              rank: 1,
              rankLabel: 'Quán Quân',
              badgeColor: Colors.amber,
              medal: '👑',
              height: 215,
              isDark: isDark,
            ),
          ),
          const SizedBox(width: 8),
          // Top 3 (Bronze)
          Expanded(
            child: _buildPodiumItem(
              story: top3rd,
              rank: 3,
              rankLabel: 'Quý Quân',
              badgeColor: const Color(0xFFCD7F32),
              medal: '🥉',
              height: 170,
              isDark: isDark,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPodiumItem({
    required StoryListItem story,
    required int rank,
    required String rankLabel,
    required Color badgeColor,
    required String medal,
    required double height,
    required bool isDark,
  }) {
    final views = _calculateViews(story.viewCount, _timeRange);

    return InkWell(
      onTap: () => context.push('/stories/${story.id}'),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: isDark ? AppColors.inkCard : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: rank == 1
                ? Colors.amber.withValues(alpha: 0.8)
                : AppColors.inkBorder,
            width: rank == 1 ? 2 : 1,
          ),
          boxShadow: [
            if (rank == 1)
              BoxShadow(
                color: Colors.amber.withValues(alpha: 0.2),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
          ],
        ),
        child: Column(
          children: [
            // Rank crown / medal
            CircleAvatar(
              radius: 14,
              backgroundColor: badgeColor.withValues(alpha: 0.2),
              child: Text(medal, style: const TextStyle(fontSize: 14)),
            ),
            const SizedBox(height: 6),
            // Cover Image
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: SizedBox(
                width: double.infinity,
                height: height - 110,
                child: CachedNetworkImage(
                  imageUrl: story.fullCoverUrl,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Container(color: Colors.grey.shade300),
                  errorWidget: (context, url, error) => Container(
                    color: Colors.grey.shade400,
                    child: const Icon(Icons.book, color: Colors.white),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 6),
            // Title
            Text(
              story.title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            // Views
            Text(
              '${_formatViews(views)} lượt',
              style: const TextStyle(
                fontSize: 10,
                color: AppColors.gold,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRankList(List<StoryListItem> stories, {required int startIndex, required bool isDark}) {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: stories.length,
      separatorBuilder: (context, index) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final story = stories[index];
        final rank = startIndex + index;
        final views = _calculateViews(story.viewCount, _timeRange);

        return InkWell(
          onTap: () => context.push('/stories/${story.id}'),
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: isDark ? AppColors.inkCard : Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: AppColors.inkBorder,
              ),
            ),
            child: Row(
              children: [
                // Rank number
                SizedBox(
                  width: 32,
                  child: Text(
                    '#$rank',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w900,
                      color: isDark ? Colors.white70 : Colors.black54,
                    ),
                  ),
                ),
                // Cover
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: SizedBox(
                    width: 44,
                    height: 58,
                    child: CachedNetworkImage(
                      imageUrl: story.fullCoverUrl,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(color: Colors.grey.shade300),
                      errorWidget: (context, url, error) => Container(
                        color: Colors.grey.shade300,
                        child: const Icon(Icons.book, size: 20),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // Story details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        story.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: story.isComic
                                  ? Colors.purple.withValues(alpha: 0.15)
                                  : Colors.blue.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              story.isComic ? 'Tranh' : 'Chữ',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: story.isComic ? Colors.purple : Colors.blue,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              story.author.isEmpty ? 'Chưa rõ tác giả' : story.author,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 11,
                                color: isDark ? Colors.white60 : Colors.black54,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                // View count badge
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.visibility, size: 14, color: AppColors.gold),
                    const SizedBox(width: 4),
                    Text(
                      _formatViews(views),
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.gold,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildLoadingState() {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: 40),
      child: Center(
        child: CircularProgressIndicator(color: AppColors.gold),
      ),
    );
  }

  Widget _buildErrorState(Object err, StoryFilterQuery query) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 30),
      child: Center(
        child: Column(
          children: [
            const Icon(Icons.error_outline, color: AppColors.red400, size: 40),
            const SizedBox(height: 8),
            Text('Lỗi khi tải bảng xếp hạng: $err'),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () => ref.invalidate(storiesFilterFamily(query)),
              child: const Text('Thử lại'),
            ),
          ],
        ),
      ),
    );
  }
}
