import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/constants/app_colors.dart';
import '../../core/utils/chapter_sequence.dart';
import '../../data/local/reading_cache_service.dart';
import '../../providers/reader_provider.dart';
import '../../providers/story_provider.dart';
import 'chapter_discussions_sheet.dart';
import 'chapter_navigation.dart';
import 'comic_reader_view.dart';
import 'novel_reader_view.dart';
import 'reader_settings_sheet.dart';

class ChapterReadScreen extends ConsumerStatefulWidget {
  final String chapterId;
  final String? storyId;

  const ChapterReadScreen({
    super.key,
    required this.chapterId,
    this.storyId,
  });

  @override
  ConsumerState<ChapterReadScreen> createState() => _ChapterReadScreenState();
}

class _ChapterReadScreenState extends ConsumerState<ChapterReadScreen> {
  bool _showControls = true;

  @override
  void initState() {
    super.initState();
    // Đồng bộ các tiến độ đọc offline còn tồn đọng khi vào màn hình đọc
    ReadingCacheService.syncPendingProgress();
  }

  void _toggleControls() {
    setState(() => _showControls = !_showControls);
  }

  void _back(BuildContext context) {
    if (context.canPop()) {
      context.pop();
    } else {
      context.go(widget.storyId == null ? '/' : '/stories/${widget.storyId}');
    }
  }

  void _goToNextChapter(ChapterSequence? sequence) {
    final next = sequence?.next;
    if (next != null) {
      context.replace(
        Uri(
          path: '/chapters/${next.id}',
          queryParameters: widget.storyId != null ? {'storyId': widget.storyId} : null,
        ).toString(),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final chapterAsync = ref.watch(chapterContentFamily(widget.chapterId));
    final theme = ref.watch(readerThemeProvider);

    // Bảng màu cho 3 theme đọc
    Color bgColor;
    Color textColor;
    Color borderColor;

    if (theme == 'light') {
      bgColor = AppColors.readerLightBg;
      textColor = AppColors.readerLightText;
      borderColor = AppColors.readerLightBorder;
    } else if (theme == 'sepia') {
      bgColor = AppColors.readerSepiaBg;
      textColor = AppColors.readerSepiaText;
      borderColor = AppColors.readerSepiaBorder;
    } else {
      bgColor = AppColors.readerDarkBg;
      textColor = AppColors.readerDarkText;
      borderColor = AppColors.readerDarkBorder;
    }

    // Sequence của các chương trong truyện để chuyển tiếp
    ChapterSequence? sequence;
    if (widget.storyId != null) {
      final storyDetail = ref.watch(storyDetailFamily(widget.storyId!)).value;
      if (storyDetail != null) {
        sequence = ChapterSequence(storyDetail.chapters, widget.chapterId);
      }
    }

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Stack(
          children: [
            // Nội dung đọc chính
            chapterAsync.when(
              loading: () => Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const SizedBox(
                      width: 28,
                      height: 28,
                      child: CircularProgressIndicator(
                        color: AppColors.gold,
                        strokeWidth: 2.5,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      'Đang nạp nội dung chương...',
                      style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 13),
                    ),
                  ],
                ),
              ),
              error: (err, _) => _buildErrorView(context, err, textColor, borderColor),
              data: (chapter) {
                // Tự động lưu cache nội dung chương vào local storage
                ReadingCacheService.saveChapterContent(chapter);

                final isComic = chapter.isComic || chapter.imageUrls.isNotEmpty;

                if (isComic) {
                  return ComicReaderView(
                    chapter: chapter,
                    storyId: widget.storyId,
                    onToggleControls: _toggleControls,
                    onNextChapter: sequence?.next != null
                        ? () => _goToNextChapter(sequence)
                        : null,
                  );
                }

                return NovelReaderView(
                  chapter: chapter,
                  storyId: widget.storyId,
                  onToggleControls: _toggleControls,
                  onNextChapter: sequence?.next != null
                      ? () => _goToNextChapter(sequence)
                      : null,
                  textColor: textColor,
                  borderColor: borderColor,
                );
              },
            ),

            // Top Floating Toolbar (Ẩn hiện mượt mà khi chạm)
            AnimatedPositioned(
              duration: const Duration(milliseconds: 250),
              curve: Curves.easeInOut,
              top: _showControls ? 12 : -70,
              left: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: (theme == 'dark' ? AppColors.inkCard : Colors.white).withValues(alpha: 0.95),
                  borderRadius: BorderRadius.circular(30),
                  border: Border.all(color: borderColor),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.25),
                      blurRadius: 14,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    // Nút Quay lại
                    IconButton(
                      onPressed: () => _back(context),
                      icon: const Icon(Icons.arrow_back, size: 20),
                      color: textColor,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
                    ),
                    const SizedBox(width: 8),

                    // Tiêu đề chương rút gọn
                    Expanded(
                      child: chapterAsync.maybeWhen(
                        data: (chap) => Text(
                          'Chương ${chap.chapterNumber}: ${chap.title}',
                          style: GoogleFonts.inter(
                            color: textColor,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        orElse: () => const SizedBox.shrink(),
                      ),
                    ),

                    // Nút Thảo luận
                    IconButton(
                      onPressed: () {
                        final title = chapterAsync.value?.title ?? 'Chương hiện tại';
                        ChapterDiscussionsSheet.show(
                          context,
                          chapterId: widget.chapterId,
                          chapterTitle: title,
                        );
                      },
                      icon: const Icon(Icons.chat_bubble_outline, size: 20),
                      color: textColor,
                      tooltip: 'Bình luận chương',
                    ),

                    // Nút Cài đặt đọc sách
                    IconButton(
                      onPressed: () => ReaderSettingsSheet.show(context),
                      icon: const Icon(Icons.tune, size: 20),
                      color: textColor,
                      tooltip: 'Cài đặt hiển thị',
                    ),
                  ],
                ),
              ),
            ),

            // Bottom Navigation Toolbar (Ẩn hiện mượt mà)
            if (widget.storyId != null)
              AnimatedPositioned(
                duration: const Duration(milliseconds: 250),
                curve: Curves.easeInOut,
                bottom: _showControls ? 0 : -80,
                left: 0,
                right: 0,
                child: ChapterNavigation(
                  storyId: widget.storyId!,
                  chapterId: widget.chapterId,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorView(
    BuildContext context,
    Object err,
    Color textColor,
    Color borderColor,
  ) {
    final is403 = err is DioException && err.response?.statusCode == 403;

    if (is403) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.gold.withValues(alpha: 0.1),
                  border: Border.all(color: AppColors.gold.withValues(alpha: 0.2)),
                ),
                alignment: Alignment.center,
                child: const Icon(Icons.lock, size: 36, color: AppColors.gold),
              ),
              const SizedBox(height: 20),
              Text(
                'Chương này đã bị khóa',
                style: GoogleFonts.lora(
                  color: textColor,
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Bạn cần phải mua truyện hoặc đăng ký gói thành viên VIP để tiếp tục đọc chương này.',
                style: GoogleFonts.inter(
                  color: textColor.withValues(alpha: 0.7),
                  fontSize: 14,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 28),
              Wrap(
                alignment: WrapAlignment.center,
                spacing: 10,
                runSpacing: 10,
                children: [
                  OutlinedButton(
                    onPressed: () => _back(context),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: borderColor),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                    child: Text(
                      '← Quay lại',
                      style: GoogleFonts.inter(color: textColor, fontSize: 13),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () => context.push('/pricing'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.gold,
                      foregroundColor: AppColors.inkBg,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    ),
                    child: Text(
                      'Xem Gói VIP',
                      style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                  OutlinedButton(
                    onPressed: () => context.push('/login'),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.gold),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                    child: Text(
                      'Đăng nhập',
                      style: GoogleFonts.inter(
                        color: AppColors.gold,
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      );
    }

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 44, color: AppColors.red400),
            const SizedBox(height: 12),
            Text(
              'Không thể tải nội dung chương.\nVui lòng kiểm tra kết nối mạng và thử lại.',
              style: GoogleFonts.inter(color: AppColors.red400, fontSize: 14),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 18),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                OutlinedButton(
                  onPressed: () => _back(context),
                  child: const Text('Quay lại'),
                ),
                const SizedBox(width: 12),
                ElevatedButton.icon(
                  onPressed: () => ref.invalidate(chapterContentFamily(widget.chapterId)),
                  icon: const Icon(Icons.refresh, size: 16),
                  label: const Text('Thử lại'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.gold,
                    foregroundColor: AppColors.inkBg,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
