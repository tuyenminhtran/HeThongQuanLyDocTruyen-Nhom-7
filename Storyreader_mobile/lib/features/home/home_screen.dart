import 'dart:async';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/constants/app_colors.dart';
import '../../data/models/story_model.dart';
import '../../providers/story_provider.dart';
import '../../widgets/app_header.dart';
import '../../widgets/loading_skeleton.dart';
import '../../widgets/request_error.dart';
import '../../widgets/story_card.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();
  Timer? _debounce;

  String _keyword = '';
  String? _selectedGenreId;
  int? _selectedType; // null = all, 0 = novel, 1 = comic
  int? _selectedStatus; // null = all, 0 = ongoing, 1 = completed, 2 = paused
  int? _selectedAccess; // null = all, 0 = free, 1 = paid, 2 = mixed

  int _visibleCount = 18;

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String val) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), () {
      setState(() {
        _keyword = val.trim();
        _visibleCount = 18;
      });
    });
  }

  void _clearSearch() {
    _searchController.clear();
    _debounce?.cancel();
    setState(() {
      _keyword = '';
      _selectedGenreId = null;
      _selectedType = null;
      _selectedStatus = null;
      _selectedAccess = null;
      _visibleCount = 18;
    });
  }

  @override
  Widget build(BuildContext context) {
    final query = StoryFilterQuery(
      keyword: _keyword.isEmpty ? null : _keyword,
      genreId: _selectedGenreId,
    );

    final storiesAsync = ref.watch(storiesFilterFamily(query));
    final genresAsync = ref.watch(genreListProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF4F6F9), // Slate sáng chuẩn Web
      appBar: const AppHeader(),
      body: RefreshIndicator(
        color: AppColors.gold,
        onRefresh: () async {
          ref.invalidate(storiesFilterFamily(query));
          ref.invalidate(genreListProvider);
        },
        child: SingleChildScrollView(
          controller: _scrollController,
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ==========================================
              // 1. BANNER THÔNG BÁO CHÀO MỪNG (TRUYENQQ)
              // ==========================================
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0F9FF), // Sky-50
                  border: Border.all(color: const Color(0xFFBAE6FD)), // Sky-200
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x06000000),
                      blurRadius: 4,
                      offset: Offset(0, 1),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: const BoxDecoration(
                        color: AppColors.gold,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.campaign,
                        color: Colors.white,
                        size: 16,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: RichText(
                        text: TextSpan(
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: const Color(0xFF082F49), // Sky-950
                            height: 1.35,
                          ),
                          children: const [
                            TextSpan(
                              text: 'Thông báo: ',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                            TextSpan(text: 'Chào mừng bạn đến với '),
                            TextSpan(
                              text: 'StoryReader',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFEA580C),
                              ),
                            ),
                            TextSpan(
                              text: ' - Hệ thống đọc truyện trực tuyến số 1!',
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // ==========================================
              // 2. THANH TÌM KIẾM PILL BO TRÒN TRUYENQQ
              // ==========================================
              Container(
                height: 42,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFFCBD5E1)),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x08000000),
                      blurRadius: 6,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: TextField(
                  controller: _searchController,
                  onChanged: _onSearchChanged,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: const Color(0xFF0F172A),
                  ),
                  decoration: InputDecoration(
                    hintText: 'Bạn muốn tìm truyện gì...',
                    hintStyle: GoogleFonts.inter(
                      fontSize: 13,
                      color: const Color(0xFF94A3B8),
                    ),
                    prefixIcon: const Icon(
                      Icons.search,
                      color: AppColors.gold,
                      size: 20,
                    ),
                    suffixIcon: _keyword.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.close, size: 16, color: Color(0xFF64748B)),
                            onPressed: _clearSearch,
                          )
                        : null,
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 11,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Thông báo khi đang lọc / tìm kiếm
              if (_keyword.isNotEmpty || _selectedGenreId != null)
                Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(
                            _keyword.isNotEmpty ? Icons.search : Icons.filter_alt,
                            color: AppColors.gold,
                            size: 16,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            _keyword.isNotEmpty
                                ? 'Kết quả cho: "$_keyword"'
                                : 'Đang lọc thể loại',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF334155),
                            ),
                          ),
                        ],
                      ),
                      GestureDetector(
                        onTap: _clearSearch,
                        child: Text(
                          'Xóa bộ lọc',
                          style: GoogleFonts.inter(
                            fontSize: 11.5,
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFFEF4444),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

              // ==========================================
              // 3. XỬ LÝ DỮ LIỆU STORIES TỪ BACKEND
              // ==========================================
              storiesAsync.when(
                loading: () => const Padding(
                  padding: EdgeInsets.symmetric(vertical: 20),
                  child: StoryGridSkeleton(count: 6),
                ),
                error: (err, _) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 30),
                  child: Center(
                    child: RequestError(
                      error: err,
                      onRetry: () => ref.invalidate(storiesFilterFamily(query)),
                    ),
                  ),
                ),
                data: (allStories) {
                  // Lọc theo Hình thức, Trạng thái, Mức phí chuẩn Web
                  final filtered = allStories.where((s) {
                    if (_selectedType != null) {
                      final storyTypeValue = s.type == StoryType.comic ? 1 : 0;
                      if (storyTypeValue != _selectedType) return false;
                    }
                    if (_selectedStatus != null && s.status != _selectedStatus) return false;
                    if (_selectedAccess != null && s.accessPolicy != _selectedAccess) return false;
                    return true;
                  }).toList();

                  // Top 6 đề cử (Truyện Hay)
                  final recommended = [...allStories]
                    ..sort((a, b) => b.viewCount.compareTo(a.viewCount));
                  final top6Recommended = recommended.take(6).toList();

                  // Top 10 Bảng xếp hạng Sidebar
                  final top10Leaderboard = recommended.take(10).toList();

                  final displayList = filtered.take(_visibleCount).toList();

                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // ==========================================
                      // 4. MỤC "★ TRUYỆN HAY" (KHI KHÔNG TÌM KIẾM)
                      // ==========================================
                      if (_keyword.isEmpty && _selectedGenreId == null) ...[
                        Row(
                          children: [
                            const Icon(
                              Icons.star,
                              color: Color(0xFFE11D48), // Rose-600
                              size: 18,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              'Truyện Hay',
                              style: GoogleFonts.lora(
                                fontSize: 17,
                                fontWeight: FontWeight.bold,
                                color: const Color(0xFFE11D48),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        // 6 Card Truyện Đề Cử Chuẩn Web
                        GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 3,
                            childAspectRatio: 0.52,
                            crossAxisSpacing: 10,
                            mainAxisSpacing: 12,
                          ),
                          itemCount: top6Recommended.length,
                          itemBuilder: (context, idx) {
                            final story = top6Recommended[idx];
                            return _buildRecommendedCard(story, idx);
                          },
                        ),
                        const SizedBox(height: 16),
                      ],

                      // ==========================================
                      // 5. KHUNG BỘ LỌC TRẮNG TINH (CHUẨN WEB)
                      // ==========================================
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x06000000),
                              blurRadius: 4,
                              offset: Offset(0, 1),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Pills chọn hình thức: [Tất cả] [Truyện chữ] [Truyện tranh]
                            Container(
                              padding: const EdgeInsets.all(3),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F5F9), // Slate-100
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                children: [
                                  _buildTypeFilterPill('Tất cả', null),
                                  _buildTypeFilterPill('Truyện chữ', 0),
                                  _buildTypeFilterPill('Truyện tranh', 1),
                                ],
                              ),
                            ),
                            const SizedBox(height: 8),

                            // Dropdowns lọc Thể loại, Trạng thái, Mức phí
                            SingleChildScrollView(
                              scrollDirection: Axis.horizontal,
                              child: Row(
                                children: [
                                  // Dropdown Thể loại
                                  genresAsync.maybeWhen(
                                    data: (genres) => _buildDropdown<String?>(
                                      value: _selectedGenreId,
                                      hint: 'Thể loại',
                                      items: [
                                        const DropdownMenuItem(
                                          value: null,
                                          child: Text('Tất cả thể loại'),
                                        ),
                                        ...genres.map(
                                          (g) => DropdownMenuItem(
                                            value: g.id,
                                            child: Text(g.name),
                                          ),
                                        ),
                                      ],
                                      onChanged: (val) {
                                        setState(() => _selectedGenreId = val);
                                      },
                                    ),
                                    orElse: () => const SizedBox.shrink(),
                                  ),
                                  const SizedBox(width: 8),

                                  // Dropdown Trạng thái
                                  _buildDropdown<int?>(
                                    value: _selectedStatus,
                                    hint: 'Trạng thái',
                                    items: const [
                                      DropdownMenuItem(
                                        value: null,
                                        child: Text('Tất cả trạng thái'),
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
                                    onChanged: (val) {
                                      setState(() => _selectedStatus = val);
                                    },
                                  ),
                                  const SizedBox(width: 8),

                                  // Dropdown Mức phí
                                  _buildDropdown<int?>(
                                    value: _selectedAccess,
                                    hint: 'Mức phí',
                                    items: const [
                                      DropdownMenuItem(
                                        value: null,
                                        child: Text('Tất cả mức phí'),
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
                                        child: Text('Hỗn hợp'),
                                      ),
                                    ],
                                    onChanged: (val) {
                                      setState(() => _selectedAccess = val);
                                    },
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // ==========================================
                      // 6. TIÊU ĐỀ SECTION & SỐ LƯỢNG TÁC PHẨM
                      // ==========================================
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            _keyword.isNotEmpty
                                ? 'Kết Quả Tìm Kiếm'
                                : (_selectedGenreId != null
                                    ? 'Danh Sách Theo Thể Loại'
                                    : 'Truyện Mới Cập Nhật'),
                            style: GoogleFonts.inter(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFF0F172A),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: Text(
                              '${filtered.length} tác phẩm',
                              style: GoogleFonts.inter(
                                fontSize: 11,
                                color: const Color(0xFF64748B),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // ==========================================
                      // 7. LƯỚI TRUYỆN CHÍNH (STORYCARD)
                      // ==========================================
                      if (filtered.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(32),
                          margin: const EdgeInsets.symmetric(vertical: 20),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Column(
                            children: [
                              const Icon(
                                Icons.menu_book,
                                size: 40,
                                color: Color(0xFFCBD5E1),
                              ),
                              const SizedBox(height: 10),
                              Text(
                                'Không tìm thấy truyện phù hợp',
                                style: GoogleFonts.inter(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: const Color(0xFF334155),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Hãy thử chọn bộ lọc khác hoặc từ khóa khác',
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  color: const Color(0xFF64748B),
                                ),
                              ),
                            ],
                          ),
                        )
                      else ...[
                        GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 0.53,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 16,
                          ),
                          itemCount: displayList.length,
                          itemBuilder: (context, index) {
                            return StoryCard(story: displayList[index]);
                          },
                        ),

                        // Nút xem thêm truyện chuẩn Web
                        if (_visibleCount < filtered.length)
                          Padding(
                            padding: const EdgeInsets.only(top: 16, bottom: 8),
                            child: OutlinedButton(
                              onPressed: () {
                                setState(() {
                                  _visibleCount += 12;
                                });
                              },
                              style: OutlinedButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: const Color(0xFF334155),
                                side: const BorderSide(color: Color(0xFFCBD5E1)),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                padding: const EdgeInsets.symmetric(vertical: 11),
                              ),
                              child: Text(
                                'Xem thêm truyện (${filtered.length - _visibleCount} còn lại)',
                                style: GoogleFonts.inter(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                      ],
                      const SizedBox(height: 24),

                      // ==========================================
                      // 8. BẢNG XẾP HẠNG TOP 10 (LEADERBOARD CHUẨN WEB)
                      // ==========================================
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x06000000),
                              blurRadius: 4,
                              offset: Offset(0, 1),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Tabs Bảng Xếp Hạng: Top Tháng / Top Tuần / Top Ngày
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.only(bottom: 6),
                                  decoration: const BoxDecoration(
                                    border: Border(
                                      bottom: BorderSide(
                                        color: AppColors.gold,
                                        width: 2,
                                      ),
                                    ),
                                  ),
                                  child: Text(
                                    'BẢNG XẾP HẠNG',
                                    style: GoogleFonts.inter(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.gold,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 14),
                                Text(
                                  'Top Tuần',
                                  style: GoogleFonts.inter(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: const Color(0xFF64748B),
                                  ),
                                ),
                                const SizedBox(width: 14),
                                Text(
                                  'Top Ngày',
                                  style: GoogleFonts.inter(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: const Color(0xFF64748B),
                                  ),
                                ),
                              ],
                            ),
                            const Divider(color: Color(0xFFE2E8F0), height: 16),

                            // Danh sách Top 10 truyện
                            ...top10Leaderboard.asMap().entries.map((entry) {
                              final rank = entry.key + 1;
                              final story = entry.value;
                              return _buildLeaderboardItem(story, rank);
                            }),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // ==========================================
                      // 9. BANNER GÓI HỘI VIÊN VIP (SIDEBAR BANNER)
                      // ==========================================
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFFFFFBEB), Color(0xFFFFEDD5)], // Amber-50 -> Orange-50
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: const Color(0xFFFDE68A)), // Amber-200
                        ),
                        child: Column(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: const BoxDecoration(
                                color: Color(0xFFFEF3C7),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.workspace_premium,
                                color: Color(0xFFD97706),
                                size: 22,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Gói Hội Viên VIP',
                              style: GoogleFonts.lora(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: const Color(0xFF0F172A),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Đọc toàn bộ truyện trả phí không giới hạn chỉ từ 49.000đ/tháng',
                              textAlign: TextAlign.center,
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                color: const Color(0xFF475569),
                              ),
                            ),
                            const SizedBox(height: 12),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () => context.push('/pricing'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.gold,
                                  foregroundColor: Colors.white,
                                  elevation: 0,
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                                child: Text(
                                  'Nâng cấp VIP ngay',
                                  style: GoogleFonts.inter(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
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

  // Card đề cử chuẩn Web "★ Truyện Hay"
  Widget _buildRecommendedCard(StoryListItem story, int idx) {
    final coverUrl = story.fullCoverUrl.isNotEmpty
        ? story.fullCoverUrl
        : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80';

    final chapterText = (story.latestChapterNumber != null && story.latestChapterNumber! > 0)
        ? 'Chương ${story.latestChapterNumber}'
        : (story.totalChapters > 0 ? 'Chương ${story.totalChapters}' : 'Mới');

    return GestureDetector(
      onTap: () => context.push('/stories/${story.id}'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          AspectRatio(
            aspectRatio: 2 / 3,
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                color: const Color(0xFFF1F5F9),
              ),
              clipBehavior: Clip.antiAlias,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  CachedNetworkImage(
                    imageUrl: coverUrl,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(color: const Color(0xFFF1F5F9)),
                    errorWidget: (context, url, error) => Container(
                      color: const Color(0xFFF1F5F9),
                      child: const Icon(Icons.book, size: 24, color: Color(0xFF94A3B8)),
                    ),
                  ),

                  // Badge HOT hoặc Mới
                  Positioned(
                    top: 5,
                    left: 5,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                      decoration: BoxDecoration(
                        color: idx < 2 ? const Color(0xFFDC2626) : const Color(0xFF0284C7),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        idx < 2 ? 'HOT' : 'Mới',
                        style: GoogleFonts.inter(
                          color: Colors.white,
                          fontSize: 8.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),

                  // Icon bookmark góc trên bên phải
                  Positioned(
                    top: 5,
                    right: 5,
                    child: Container(
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.35),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Icon(
                        Icons.bookmark_border,
                        color: Colors.white,
                        size: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 5),
          Text(
            story.title,
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF0F172A),
              height: 1.2,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            chapterText,
            style: GoogleFonts.inter(
              fontSize: 10.5,
              color: const Color(0xFF64748B),
            ),
          ),
        ],
      ),
    );
  }

  // Pill chọn hình thức
  Widget _buildTypeFilterPill(String title, int? typeVal) {
    final isSelected = _selectedType == typeVal;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedType = typeVal),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 6),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.gold : Colors.transparent,
            borderRadius: BorderRadius.circular(6),
          ),
          alignment: Alignment.center,
          child: Text(
            title,
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: isSelected ? Colors.white : const Color(0xFF475569),
            ),
          ),
        ),
      ),
    );
  }

  // Dropdown phong cách Web
  Widget _buildDropdown<T>({
    required T value,
    required String hint,
    required List<DropdownMenuItem<T>> items,
    required ValueChanged<T?> onChanged,
  }) {
    return Container(
      height: 34,
      padding: const EdgeInsets.symmetric(horizontal: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFCBD5E1)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<T>(
          value: value,
          hint: Text(
            hint,
            style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
          ),
          style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF0F172A)),
          icon: const Icon(Icons.arrow_drop_down, color: Color(0xFF64748B), size: 18),
          items: items,
          onChanged: onChanged,
        ),
      ),
    );
  }

  // Item Bảng Xếp Hạng Top 10 (Chuẩn LeaderboardItem trên Web)
  Widget _buildLeaderboardItem(StoryListItem story, int rank) {
    final formattedRank = rank < 10 ? '0$rank' : '$rank';
    Color rankColor = const Color(0xFF94A3B8);
    if (rank == 1) {
      rankColor = const Color(0xFFEA580C);
    } else if (rank == 2) {
      rankColor = const Color(0xFF64748B);
    } else if (rank == 3) {
      rankColor = const Color(0xFFD97706);
    }

    final coverUrl = story.fullCoverUrl.isNotEmpty
        ? story.fullCoverUrl
        : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80';

    final chapterText = (story.latestChapterNumber != null && story.latestChapterNumber! > 0)
        ? 'Chương ${story.latestChapterNumber}'
        : (story.totalChapters > 0 ? 'Chương ${story.totalChapters}' : 'Chương Mới');

    final formattedViews = story.viewCount >= 1000
        ? '${(story.viewCount / 1000).toStringAsFixed(0)}K'
        : '${story.viewCount}';

    return InkWell(
      onTap: () => context.push('/stories/${story.id}'),
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
        child: Row(
          children: [
            SizedBox(
              width: 26,
              child: Text(
                formattedRank,
                style: GoogleFonts.lora(
                  fontSize: rank <= 3 ? 15 : 13,
                  fontWeight: FontWeight.bold,
                  color: rankColor,
                ),
              ),
            ),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: SizedBox(
                width: 38,
                height: 50,
                child: CachedNetworkImage(
                  imageUrl: coverUrl,
                  fit: BoxFit.cover,
                  errorWidget: (context, url, error) => Container(
                    color: const Color(0xFFF1F5F9),
                    child: const Icon(Icons.book, size: 18, color: Color(0xFF94A3B8)),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    story.title,
                    style: GoogleFonts.inter(
                      fontSize: 12.5,
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF0F172A),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 3),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        chapterText,
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          color: const Color(0xFF64748B),
                        ),
                      ),
                      Row(
                        children: [
                          const Icon(
                            Icons.visibility,
                            size: 11,
                            color: AppColors.gold,
                          ),
                          const SizedBox(width: 3),
                          Text(
                            formattedViews,
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              color: const Color(0xFF64748B),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
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
  }
}
