import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
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
  int? _statusFilter;
  int? _accessFilter;
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

  Widget _buildNoticeBanner() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF0F9FF),
        border: Border.all(color: const Color(0xFFBAE6FD)),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 26,
                height: 26,
                decoration: const BoxDecoration(
                  color: Color(0xFFF37021),
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: const Icon(
                  Icons.campaign,
                  color: Colors.white,
                  size: 16,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: RichText(
                  text: TextSpan(
                    style: GoogleFonts.inter(
                      color: const Color(0xFF0C4A6E),
                      fontSize: 12.5,
                      height: 1.4,
                    ),
                    children: const [
                      TextSpan(
                        text: 'Thông báo: ',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      TextSpan(
                        text:
                            'Chào mừng bạn đến với StoryReader - Hệ thống đọc truyện trực tuyến số 1 cho độc giả Việt!',
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _buildSocialChip('Facebook', const Color(0xFF2563EB), Icons.facebook),
              const SizedBox(width: 8),
              _buildSocialChip('Telegram', const Color(0xFF0EA5E9), Icons.send),
              const SizedBox(width: 8),
              _buildSocialChip('Discord', const Color(0xFF4F46E5), Icons.forum),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSocialChip(String label, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.white, size: 12),
          const SizedBox(width: 4),
          Text(
            label,
            style: GoogleFonts.inter(
              color: Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecommendedSection(List<StoryListItem> stories) {
    final recommended = [...stories]
      ..sort((a, b) => b.viewCount.compareTo(a.viewCount));
    final topList = recommended.take(8).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.star, color: Color(0xFFE11D48), size: 20),
            const SizedBox(width: 6),
            Text(
              'Truyện Hay',
              style: GoogleFonts.lora(
                color: const Color(0xFFE11D48),
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 270,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: topList.length,
            separatorBuilder: (context, index) => const SizedBox(width: 12),
            itemBuilder: (context, idx) {
              final story = topList[idx];
              return SizedBox(
                width: 130,
                child: StoryCard(story: story),
              );
            },
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final storiesAsync = ref.watch(
      storiesFamily(_keyword.isEmpty ? null : _keyword),
    );

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: const AppHeader(),
      floatingActionButton: FloatingActionButton.small(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('🐱 Meow! Chúc bạn đọc truyện vui vẻ tại StoryReader!'),
              duration: Duration(seconds: 2),
              backgroundColor: Color(0xFFF37021),
            ),
          );
        },
        backgroundColor: Colors.white,
        elevation: 3,
        shape: const CircleBorder(),
        child: const Text('🐱', style: TextStyle(fontSize: 20)),
      ),
      body: RefreshIndicator(
        color: const Color(0xFFF37021),
        backgroundColor: Colors.white,
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
                  vertical: 16,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // 1. Notice Banner (TruyenQQ signature)
                    _buildNoticeBanner(),

                    const SizedBox(height: 16),

                    // 2. Search Bar
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFFCBD5E1)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.04),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: TextField(
                        controller: _searchController,
                        onChanged: _onSearchChanged,
                        style: GoogleFonts.inter(
                          color: const Color(0xFF0F172A),
                          fontSize: 14,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Bạn muốn tìm truyện gì...',
                          hintStyle: GoogleFonts.inter(
                            color: const Color(0xFF94A3B8),
                            fontSize: 14,
                          ),
                          filled: false,
                          border: InputBorder.none,
                          enabledBorder: InputBorder.none,
                          focusedBorder: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 18,
                            vertical: 12,
                          ),
                          prefixIcon: const Icon(
                            Icons.search,
                            color: Color(0xFFF37021),
                            size: 20,
                          ),
                          suffixIcon: _searchController.text.isNotEmpty
                              ? IconButton(
                                  icon: const Icon(
                                    Icons.close,
                                    color: Color(0xFF94A3B8),
                                    size: 18,
                                  ),
                                  onPressed: _clearSearch,
                                )
                              : null,
                        ),
                      ),
                    ),

                    const SizedBox(height: 12),

                    // 3. Filter dropdowns
                    Row(
                      children: [
                        // Status filter
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFFCBD5E1)),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<int?>(
                                value: _statusFilter,
                                dropdownColor: Colors.white,
                                isExpanded: true,
                                icon: const Icon(
                                  Icons.arrow_drop_down,
                                  color: Color(0xFF64748B),
                                ),
                                style: GoogleFonts.inter(
                                  color: const Color(0xFF0F172A),
                                  fontSize: 12.5,
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
                        const SizedBox(width: 10),
                        // Access filter
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFFCBD5E1)),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<int?>(
                                value: _accessFilter,
                                dropdownColor: Colors.white,
                                isExpanded: true,
                                icon: const Icon(
                                  Icons.arrow_drop_down,
                                  color: Color(0xFF64748B),
                                ),
                                style: GoogleFonts.inter(
                                  color: const Color(0xFF0F172A),
                                  fontSize: 12.5,
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

                    const SizedBox(height: 24),

                    // Stories Data
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
                            // 4. "Truyện Hay" Section (Top views)
                            if (_keyword.isEmpty &&
                                _statusFilter == null &&
                                _accessFilter == null) ...[
                              _buildRecommendedSection(stories),
                              const SizedBox(height: 24),
                            ],

                            // 5. Section Header
                            Row(
                              children: [
                                const Icon(
                                  Icons.menu_book,
                                  color: Color(0xFFF37021),
                                  size: 18,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  _keyword.isNotEmpty
                                      ? 'Kết quả tìm kiếm'
                                      : 'Tất cả truyện',
                                  style: GoogleFonts.inter(
                                    color: const Color(0xFF0F172A),
                                    fontSize: 17,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const Spacer(),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 9,
                                    vertical: 3,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF1F5F9),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: const Color(0xFFE2E8F0),
                                    ),
                                  ),
                                  child: Text(
                                    '${filtered.length} truyện',
                                    style: GoogleFonts.inter(
                                      color: const Color(0xFF64748B),
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),

                            const SizedBox(height: 16),

                            if (filtered.isEmpty)
                              const EmptyState(
                                title: 'Không tìm thấy truyện nào',
                                subtitle: 'Hãy thử đổi từ khóa hoặc bộ lọc khác',
                              )
                            else ...[
                              // 2-column Grid of StoryCard
                              GridView.builder(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                gridDelegate:
                                    const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 2,
                                  crossAxisSpacing: 14,
                                  mainAxisSpacing: 18,
                                  childAspectRatio: 0.47,
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
                                const SizedBox(height: 20),
                                Center(
                                  child: OutlinedButton(
                                    onPressed: () {
                                      setState(() {
                                        _visibleCount += 12;
                                      });
                                    },
                                    style: OutlinedButton.styleFrom(
                                      side: const BorderSide(
                                        color: Color(0xFFCBD5E1),
                                      ),
                                      backgroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 24,
                                        vertical: 10,
                                      ),
                                    ),
                                    child: Text(
                                      'Xem thêm truyện (${filtered.length - _visibleCount} còn lại)',
                                      style: GoogleFonts.inter(
                                        color: const Color(0xFF0F172A),
                                        fontWeight: FontWeight.w600,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ],
                        );
                      },
                      loading: () => const StoryGridSkeleton(count: 8),
                      error: (err, _) => Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF2F2),
                          border: Border.all(color: const Color(0xFFFECACA)),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          'Lỗi kết nối máy chủ: $err',
                          style: GoogleFonts.inter(
                            color: const Color(0xFFDC2626),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Footer
              const AppFooter(),
            ],
          ),
        ),
      ),
    );
  }
}
