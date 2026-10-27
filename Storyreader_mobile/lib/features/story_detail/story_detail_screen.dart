import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../core/utils/chapter_grouping.dart';
import '../../data/models/story_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/story_provider.dart';
import '../../widgets/app_header.dart';
import '../../widgets/empty_state.dart';
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
              isFollowing ? 'Đã thêm vào truyện đang theo dõi.' : 'Đã bỏ theo dõi truyện.',
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

          return RefreshIndicator(
            color: AppColors.gold,
            onRefresh: () async {
              ref.invalidate(storyDetailFamily(widget.storyId));
              ref.invalidate(isFollowingProvider(widget.storyId));
            },
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildHeaderInfo(story, isFollowing),
                  const SizedBox(height: 24),
                  _buildActionButtons(story, isFollowing),
                  const SizedBox(height: 28),
                  _buildDescription(story),
                  const SizedBox(height: 28),
                  _buildChapterSection(story, chapterGroups),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildHeaderInfo(StoryDetail story, bool isFollowing) {
    final coverUrl = story.fullCoverUrl.isNotEmpty
        ? story.fullCoverUrl
        : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80';

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Bìa truyện
        ClipRRect(
          borderRadius: BorderRadius.circular(14),
          child: SizedBox(
            width: 120,
            height: 175,
            child: CachedNetworkImage(
              imageUrl: coverUrl,
              fit: BoxFit.cover,
              placeholder: (context, url) => Container(color: Colors.black12),
              errorWidget: (context, url, error) => Container(
                color: Colors.black12,
                child: const Icon(Icons.book, size: 36),
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        // Thông tin truyện
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Badges
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: story.isComic ? AppColors.purple400 : AppColors.gold,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      story.isComic ? 'Truyện tranh' : 'Truyện chữ',
                      style: GoogleFonts.inter(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: story.releaseStatus == ReleaseStatus.completed
                          ? AppColors.green400.withValues(alpha: 0.2)
                          : AppColors.sky400.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      story.releaseStatus.label,
                      style: GoogleFonts.inter(
                        color: story.releaseStatus == ReleaseStatus.completed
                            ? AppColors.green400
                            : AppColors.sky400,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                story.title,
                style: GoogleFonts.lora(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  height: 1.3,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 6),
              Text(
                'Tác giả: ${story.author}',
                style: GoogleFonts.inter(
                  color: AppColors.inkMuted,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Số chương: ${story.chapters.length}',
                style: GoogleFonts.inter(
                  color: AppColors.inkMuted,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 8),
              // Thể loại chips
              if (story.genres.isNotEmpty)
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: story.genres.take(3).map((g) {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Theme.of(context).cardColor,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: Theme.of(context).dividerColor),
                      ),
                      child: Text(
                        g,
                        style: GoogleFonts.inter(fontSize: 11, color: AppColors.inkMuted),
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
        // Nút Đọc từ đầu
        Expanded(
          flex: 3,
          child: ElevatedButton.icon(
            onPressed: firstChapter == null ? null : () => _openChapter(firstChapter.id),
            icon: const Icon(Icons.play_arrow_rounded, size: 20),
            label: const Text(AppStrings.readFromBeginning),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
          ),
        ),
        const SizedBox(width: 10),
        // Nút Theo dõi
        Expanded(
          flex: 2,
          child: OutlinedButton.icon(
            onPressed: _toggleFollow,
            icon: Icon(
              isFollowing ? Icons.bookmark : Icons.bookmark_border,
              color: isFollowing ? AppColors.gold : null,
              size: 18,
            ),
            label: Text(
              isFollowing ? 'Đang theo dõi' : AppStrings.followStory,
              style: TextStyle(color: isFollowing ? AppColors.gold : null),
            ),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              side: BorderSide(
                color: isFollowing ? AppColors.gold : Theme.of(context).dividerColor,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDescription(StoryDetail story) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Giới thiệu',
            style: GoogleFonts.lora(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            story.description.isNotEmpty
                ? story.description
                : 'Chưa có thông tin tóm tắt cho bộ truyện này.',
            style: GoogleFonts.inter(
              height: 1.6,
              fontSize: 13.5,
              color: Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.9),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChapterSection(StoryDetail story, List<ChapterGroup> groups) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Tiêu đề & Thao tác
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              AppStrings.chapterList,
              style: GoogleFonts.lora(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            Row(
              children: [
                // Đổi thứ tự Cũ/Mới
                IconButton(
                  tooltip: _isAscending ? AppStrings.sortAscending : AppStrings.sortDescending,
                  onPressed: () => setState(() => _isAscending = !_isAscending),
                  icon: Icon(
                    _isAscending ? Icons.arrow_downward : Icons.arrow_upward,
                    size: 18,
                  ),
                ),
                // Mở/Đóng tất cả folder
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
                    child: Text(
                      _expandedFolders.length == groups.length ? 'Thu gọn' : 'Mở tất cả',
                      style: GoogleFonts.inter(color: AppColors.gold, fontSize: 12),
                    ),
                  ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Tìm kiếm chương
        TextField(
          onChanged: (val) => setState(() => _chapterSearch = val.trim()),
          style: GoogleFonts.inter(fontSize: 13),
          decoration: InputDecoration(
            hintText: AppStrings.searchChapter,
            prefixIcon: const Icon(Icons.search, size: 18),
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            isDense: true,
          ),
        ),
        const SizedBox(height: 14),

        // Cây Thư mục Danh sách chương (Folder Cha - Con)
        if (groups.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 24),
            child: EmptyState(
              icon: Icons.menu_book,
              title: 'Không tìm thấy chương phù hợp',
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

              // Nếu không phải dạng folder thì render danh sách phẳng
              if (!group.isFolder) {
                return _buildChapterListItems(group.chapters);
              }

              final isExpanded = _expandedFolders.contains(group.partName);

              return Container(
                decoration: BoxDecoration(
                  color: Theme.of(context).cardColor,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Theme.of(context).dividerColor),
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
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        child: Row(
                          children: [
                            Icon(
                              isExpanded ? Icons.folder_open : Icons.folder,
                              color: AppColors.gold,
                              size: 20,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                group.partName,
                                style: GoogleFonts.inter(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: Theme.of(context).scaffoldBackgroundColor,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                '${group.chapters.length} c.',
                                style: GoogleFonts.inter(
                                  color: AppColors.inkMuted,
                                  fontSize: 11,
                                ),
                              ),
                            ),
                            const SizedBox(width: 6),
                            Icon(
                              isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                              color: AppColors.inkMuted,
                              size: 18,
                            ),
                          ],
                        ),
                      ),
                    ),
                    // Folder Chapter Items
                    if (isExpanded) ...[
                      const Divider(height: 1),
                      _buildChapterListItems(group.chapters),
                    ],
                  ],
                ),
              );
            },
          ),
      ],
    );
  }

  Widget _buildChapterListItems(List<ChapterListItem> chapters) {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: chapters.length,
      separatorBuilder: (context, index) => Divider(
        height: 1,
        color: Theme.of(context).dividerColor.withValues(alpha: 0.5),
      ),
      itemBuilder: (context, cIndex) {
        final chapter = chapters[cIndex];

        return ListTile(
          onTap: () => _openChapter(chapter.id),
          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
          dense: true,
          title: Text(
            'Chương ${chapter.chapterNumber}: ${chapter.title}',
            style: GoogleFonts.inter(fontSize: 13.5),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          trailing: chapter.requiresAccess
              ? const Icon(Icons.lock, size: 16, color: AppColors.gold)
              : const Icon(Icons.chevron_right, size: 16, color: AppColors.inkMuted),
        );
      },
    );
  }
}
