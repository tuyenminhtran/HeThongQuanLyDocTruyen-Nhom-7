import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/constants/app_colors.dart';
import '../../core/utils/chapter_grouping.dart';
import '../../data/models/story_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/story_provider.dart';
import '../../widgets/app_header.dart';
import '../../widgets/loading_skeleton.dart';
import '../../widgets/request_error.dart';

class StoryDetailScreen extends ConsumerStatefulWidget {
  final String storyId;

  const StoryDetailScreen({super.key, required this.storyId});

  @override
  ConsumerState<StoryDetailScreen> createState() => _StoryDetailScreenState();
}

class _StoryDetailScreenState extends ConsumerState<StoryDetailScreen> {
  String _chapterSearch = '';
  bool _isAscending = true;
  final Set<String> _expandedFolders = {};

  Future<void> _openChapter(String chapterId) async {
    await context.push(
      Uri(
        path: '/chapters/$chapterId',
        queryParameters: {'storyId': widget.storyId},
      ).toString(),
    );
    if (mounted) ref.invalidate(readingHistoryProvider);
  }

  Future<void> _toggleFollow() async {
    final auth = ref.read(authProvider);
    if (!auth.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng đăng nhập để theo dõi truyện.')),
      );
      context.push('/login');
      return;
    }

    try {
      final repo = ref.read(storyRepositoryProvider);
      final isFollowing = await repo.toggleFollow(widget.storyId);
      ref.invalidate(isFollowingProvider(widget.storyId));
      ref.invalidate(bookmarksProvider);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              isFollowing
                  ? 'Đã thêm vào truyện đang theo dõi.'
                  : 'Đã bỏ theo dõi truyện.',
            ),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Không thể cập nhật theo dõi: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final storyAsync = ref.watch(storyDetailFamily(widget.storyId));
    final isFollowingAsync = ref.watch(isFollowingProvider(widget.storyId));

    return Scaffold(
      backgroundColor: const Color(0xFFF4F6F9), // Slate sáng chuẩn Web
      appBar: const AppHeader(),
      body: storyAsync.when(
        loading: () => const StoryDetailSkeleton(),
        error: (err, _) => Center(
          child: RequestError(
            error: err,
            onRetry: () => ref.invalidate(storyDetailFamily(widget.storyId)),
          ),
        ),
        data: (story) {
          final isFollowing = isFollowingAsync.value ?? false;

          // Lọc danh sách chương theo từ khóa tìm kiếm
          var filteredChapters = story.chapters.where((c) {
            if (_chapterSearch.isEmpty) return true;
            final query = _chapterSearch.toLowerCase();
            return c.title.toLowerCase().contains(query) ||
                c.chapterNumber.toString().contains(query) ||
                (c.partName != null && c.partName!.toLowerCase().contains(query));
          }).toList();

          // Sắp xếp thứ tự chương
          filteredChapters.sort((a, b) => _isAscending
              ? a.chapterNumber.compareTo(b.chapterNumber)
              : b.chapterNumber.compareTo(a.chapterNumber));

          // Nhóm chương thành các Phần / Tập (Folder cha - con)
          final chapterGroups = groupChaptersByPart(filteredChapters);

          // Mặc định mở rộng tất cả các folder khi tải lần đầu
          if (_expandedFolders.isEmpty && chapterGroups.isNotEmpty) {
            _expandedFolders.addAll(chapterGroups.map((g) => g.partName));
          }

          final coverUrl = story.fullCoverUrl.isNotEmpty
              ? story.fullCoverUrl
              : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80';

          return RefreshIndicator(
            color: AppColors.gold,
            onRefresh: () async {
              ref.invalidate(storyDetailFamily(widget.storyId));
              ref.invalidate(isFollowingProvider(widget.storyId));
            },
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Stack(
                children: [
                  // Ambient blur header giống Web
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 220,
                    child: Opacity(
                      opacity: 0.18,
                      child: CachedNetworkImage(
                        imageUrl: coverUrl,
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),

                  // Nội dung chính
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        _buildHeaderInfo(story, coverUrl),
                        const SizedBox(height: 16),
                        _buildActionButtons(story, isFollowing),
                        const SizedBox(height: 20),
                        _buildDescription(story),
                        const SizedBox(height: 24),
                        _buildChapterSection(story, chapterGroups),
                        const SizedBox(height: 32),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildHeaderInfo(StoryDetail story, String coverUrl) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Ảnh bìa sách tỉ lệ 2/3 bo góc 14px, viền Slate-200, bóng đổ
        Container(
          width: 125,
          height: 185,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
            color: Colors.white,
            boxShadow: const [
              BoxShadow(
                color: Color(0x18000000),
                blurRadius: 10,
                offset: Offset(0, 4),
              ),
            ],
          ),
          clipBehavior: Clip.antiAlias,
          child: CachedNetworkImage(
            imageUrl: coverUrl,
            fit: BoxFit.cover,
            placeholder: (context, url) => Container(color: const Color(0xFFF1F5F9)),
            errorWidget: (context, url, error) => Container(
              color: const Color(0xFFF1F5F9),
              child: const Icon(Icons.book, size: 36, color: Color(0xFF94A3B8)),
            ),
          ),
        ),
        const SizedBox(width: 14),

        // Cột thông tin chi tiết
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hàng Badges: Loại truyện + Chính sách
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                    decoration: BoxDecoration(
                      color: story.isComic
                          ? const Color(0xFFE0F2FE) // Sky-100
                          : const Color(0xFFFFEDD5), // Orange-100
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: story.isComic
                            ? const Color(0xFF7DD3FC)
                            : const Color(0xFFFDBA74),
                      ),
                    ),
                    child: Text(
                      story.isComic ? 'Truyện tranh' : 'Truyện chữ',
                      style: GoogleFonts.inter(
                        color: story.isComic
                            ? const Color(0xFF0369A1)
                            : const Color(0xFFC2410C),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                    decoration: BoxDecoration(
                      color: story.accessPolicy == 0
                          ? const Color(0xFFD1FAE5) // Emerald-100
                          : const Color(0xFFFEF3C7), // Amber-100
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: story.accessPolicy == 0
                            ? const Color(0xFF6EE7B7)
                            : const Color(0xFFFCD34D),
                      ),
                    ),
                    child: Text(
                      story.accessPolicy == 0
                          ? 'Miễn phí'
                          : (story.accessPolicy == 1 ? 'VIP' : 'Hỗn hợp'),
                      style: GoogleFonts.inter(
                        color: story.accessPolicy == 0
                            ? const Color(0xFF047857)
                            : const Color(0xFFB45309),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Tiêu đề truyện: Font Lora đậm to chuẩn Web
              Text(
                story.title,
                style: GoogleFonts.lora(
                  fontSize: 19,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF0F172A),
                  height: 1.25,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 6),

              // Tác giả với icon bút cam
              Row(
                children: [
                  const Icon(
                    Icons.edit,
                    size: 13,
                    color: AppColors.gold,
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      'Tác giả: ${story.author.isNotEmpty ? story.author : "Đang cập nhật"}',
                      style: GoogleFonts.inter(
                        color: const Color(0xFF475569),
                        fontSize: 12.5,
                        fontWeight: FontWeight.w500,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),

              // Số lượt đọc & số chương
              Row(
                children: [
                  const Icon(
                    Icons.visibility,
                    size: 13,
                    color: Color(0xFFF59E0B),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${story.viewCount} lượt đọc',
                    style: GoogleFonts.inter(
                      color: const Color(0xFF64748B),
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    '${story.chapters.length} chương',
                    style: GoogleFonts.inter(
                      color: const Color(0xFF64748B),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Thể loại Chips cam nhạt chuẩn Web (bg-orange-50 border-orange-200 text-orange-700)
              if (story.genres.isNotEmpty)
                Wrap(
                  spacing: 6,
                  runSpacing: 4,
                  children: story.genres.take(4).map((g) {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF7ED), // Orange-50
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFFFED7AA)), // Orange-200
                      ),
                      child: Text(
                        g,
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFFC2410C), // Orange-700
                        ),
                      ),
                    );
                  }).toList(),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons(StoryDetail story, bool isFollowing) {
    final firstChapter = story.chapters.firstOrNull;

    return Row(
      children: [
        // Nút "Đọc từ đầu" màu cam thương hiệu Web
        Expanded(
          flex: 3,
          child: ElevatedButton.icon(
            onPressed: firstChapter == null ? null : () => _openChapter(firstChapter.id),
            icon: const Icon(Icons.play_arrow, size: 20, color: Colors.white),
            label: Text(
              'Đọc từ đầu',
              style: GoogleFonts.inter(
                fontSize: 13.5,
                fontWeight: FontWeight.bold,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.gold,
              foregroundColor: Colors.white,
              elevation: 0,
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),

        // Nút "Theo dõi"
        Expanded(
          flex: 2,
          child: OutlinedButton.icon(
            onPressed: _toggleFollow,
            icon: Icon(
              isFollowing ? Icons.bookmark : Icons.bookmark_border,
              color: isFollowing ? AppColors.gold : const Color(0xFF475569),
              size: 18,
            ),
            label: Text(
              isFollowing ? 'Đang theo dõi' : 'Theo dõi',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: isFollowing ? AppColors.gold : const Color(0xFF334155),
              ),
            ),
            style: OutlinedButton.styleFrom(
              backgroundColor: Colors.white,
              side: BorderSide(
                color: isFollowing ? AppColors.gold : const Color(0xFFCBD5E1),
              ),
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDescription(StoryDetail story) {
    return Container(
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
          Row(
            children: [
              const Icon(
                Icons.menu_book,
                color: AppColors.gold,
                size: 18,
              ),
              const SizedBox(width: 6),
              Text(
                'Giới thiệu nội dung',
                style: GoogleFonts.lora(
                  fontSize: 15.5,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF0F172A),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            story.description.isNotEmpty
                ? story.description
                : 'Chưa có thông tin tóm tắt cho tác phẩm này.',
            style: GoogleFonts.inter(
              height: 1.6,
              fontSize: 13,
              color: const Color(0xFF334155),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChapterSection(StoryDetail story, List<ChapterGroup> groups) {
    return Container(
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
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Danh Sách Chương
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(
                    Icons.format_list_bulleted,
                    color: AppColors.gold,
                    size: 18,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'DANH SÁCH CHƯƠNG',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF0F172A),
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  // Đổi chiều Cũ/Mới
                  IconButton(
                    tooltip: _isAscending ? 'Cũ nhất trước' : 'Mới nhất trước',
                    onPressed: () => setState(() => _isAscending = !_isAscending),
                    icon: Icon(
                      _isAscending ? Icons.arrow_downward : Icons.arrow_upward,
                      size: 17,
                      color: const Color(0xFF64748B),
                    ),
                    visualDensity: VisualDensity.compact,
                  ),
                  if (groups.any((g) => g.isFolder))
                    TextButton(
                      onPressed: () {
                        setState(() {
                          if (_expandedFolders.length == groups.length) {
                            _expandedFolders.clear();
                          } else {
                            _expandedFolders.addAll(groups.map((g) => g.partName));
                          }
                        });
                      },
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        visualDensity: VisualDensity.compact,
                      ),
                      child: Text(
                        _expandedFolders.length == groups.length ? 'Thu gọn' : 'Mở tất cả',
                        style: GoogleFonts.inter(
                          color: AppColors.gold,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Ô tìm kiếm chương chuẩn Pill
          Container(
            height: 38,
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: TextField(
              onChanged: (val) => setState(() => _chapterSearch = val.trim()),
              style: GoogleFonts.inter(fontSize: 12.5),
              decoration: const InputDecoration(
                hintText: 'Nhập số hoặc tên chương để tìm...',
                hintStyle: TextStyle(color: Color(0xFF94A3B8), fontSize: 12.5),
                prefixIcon: Icon(Icons.search, size: 18, color: Color(0xFF94A3B8)),
                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                border: InputBorder.none,
              ),
            ),
          ),
          const SizedBox(height: 14),

          // Hiển thị danh sách nhóm chương
          if (groups.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: Center(
                child: Text(
                  'Không tìm thấy chương phù hợp',
                  style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: groups.length,
              separatorBuilder: (context, index) => const SizedBox(height: 10),
              itemBuilder: (context, gIndex) {
                final group = groups[gIndex];

                if (!group.isFolder) {
                  return _buildChapterListCards(group.chapters);
                }

                final isExpanded = _expandedFolders.contains(group.partName);

                return Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    children: [
                      // Folder Header
                      InkWell(
                        onTap: () {
                          setState(() {
                            if (isExpanded) {
                              _expandedFolders.remove(group.partName);
                            } else {
                              _expandedFolders.add(group.partName);
                            }
                          });
                        },
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 10,
                          ),
                          child: Row(
                            children: [
                              Icon(
                                isExpanded ? Icons.folder_open : Icons.folder,
                                color: AppColors.gold,
                                size: 18,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  group.partName,
                                  style: GoogleFonts.inter(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13.5,
                                    color: const Color(0xFF1E293B),
                                  ),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: const Color(0xFFE2E8F0)),
                                ),
                                child: Text(
                                  '${group.chapters.length} c.',
                                  style: GoogleFonts.inter(
                                    color: const Color(0xFF64748B),
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 4),
                              Icon(
                                isExpanded
                                    ? Icons.keyboard_arrow_up
                                    : Icons.keyboard_arrow_down,
                                color: const Color(0xFF94A3B8),
                                size: 18,
                              ),
                            ],
                          ),
                        ),
                      ),
                      if (isExpanded) ...[
                        const Divider(height: 1, color: Color(0xFFE2E8F0)),
                        Padding(
                          padding: const EdgeInsets.all(8),
                          child: _buildChapterListCards(group.chapters),
                        ),
                      ],
                    ],
                  ),
                );
              },
            ),
        ],
      ),
    );
  }

  // Từng Chapter Card chuẩn ChapterCard trong StoryDetailPage.tsx
  Widget _buildChapterListCards(List<ChapterListItem> chapters) {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: chapters.length,
      separatorBuilder: (context, index) => const SizedBox(height: 8),
      itemBuilder: (context, cIndex) {
        final chapter = chapters[cIndex];

        return InkWell(
          onTap: () => _openChapter(chapter.id),
          borderRadius: BorderRadius.circular(10),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x04000000),
                  blurRadius: 2,
                  offset: Offset(0, 1),
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Chương ${chapter.chapterNumber}',
                        style: GoogleFonts.spaceMono(
                          color: AppColors.gold,
                          fontSize: 11.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        chapter.title,
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF0F172A),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                if (chapter.requiresAccess)
                  Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFFBEB), // Amber-50
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFFCD34D)), // Amber-300
                    ),
                    child: const Icon(
                      Icons.lock,
                      size: 14,
                      color: Color(0xFFD97706), // Amber-600
                    ),
                  )
                else
                  const Icon(
                    Icons.chevron_right,
                    size: 18,
                    color: Color(0xFFCBD5E1),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
