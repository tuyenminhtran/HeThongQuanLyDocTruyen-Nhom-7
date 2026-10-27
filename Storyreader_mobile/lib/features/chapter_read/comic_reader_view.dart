import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/constants/app_colors.dart';
import '../../data/local/reading_cache_service.dart';
import '../../data/models/chapter_model.dart';
import 'chapter_discussions_sheet.dart';

class ComicReaderView extends ConsumerStatefulWidget {
  final ChapterContent chapter;
  final String? storyId;
  final VoidCallback onToggleControls;
  final VoidCallback? onNextChapter;

  const ComicReaderView({
    super.key,
    required this.chapter,
    this.storyId,
    required this.onToggleControls,
    this.onNextChapter,
  });

  @override
  ConsumerState<ComicReaderView> createState() => _ComicReaderViewState();
}

class _ComicReaderViewState extends ConsumerState<ComicReaderView> {
  final ScrollController _scrollController = ScrollController();
  final TransformationController _transformController = TransformationController();
  int _currentVisiblePage = 1;
  final Map<int, int> _retryTokens = {}; // Tải lại ảnh từng trang

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    _restoreReadingPosition();
  }

  @override
  void dispose() {
    _saveCurrentProgress();
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    _transformController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.position.pixels;

    final totalImages = widget.chapter.fullImageUrls.length;
    if (totalImages > 0 && maxScroll > 0) {
      final page = ((currentScroll / maxScroll) * totalImages).clamp(1, totalImages).toInt();
      if (page != _currentVisiblePage) {
        setState(() => _currentVisiblePage = page);
      }
    }
  }

  Future<void> _restoreReadingPosition() async {
    if (widget.storyId == null) return;
    final progress = await ReadingCacheService.getReadingProgress(widget.storyId!);
    if (progress != null && progress.chapterId == widget.chapter.id && progress.scrollOffset > 0) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_scrollController.hasClients) {
          _scrollController.jumpTo(
            progress.scrollOffset.clamp(0.0, _scrollController.position.maxScrollExtent),
          );
        }
      });
    }
  }

  Future<void> _saveCurrentProgress() async {
    if (widget.storyId == null || !_scrollController.hasClients) return;
    final max = _scrollController.position.maxScrollExtent;
    final current = _scrollController.position.pixels;
    final percentage = max > 0 ? (current / max) * 100 : 0.0;

    await ReadingCacheService.saveReadingProgress(
      ReadingProgressItem(
        storyId: widget.storyId!,
        chapterId: widget.chapter.id,
        chapterNumber: widget.chapter.chapterNumber,
        storyTitle: '',
        chapterTitle: widget.chapter.title,
        scrollOffset: current,
        scrollPercentage: percentage,
        updatedAt: DateTime.now(),
      ),
    );
  }

  void _retryImage(int index) {
    setState(() {
      _retryTokens[index] = (_retryTokens[index] ?? 0) + 1;
    });
  }

  @override
  Widget build(BuildContext context) {
    final images = widget.chapter.fullImageUrls;

    if (images.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.broken_image_outlined, size: 48, color: AppColors.inkMuted),
              const SizedBox(height: 12),
              Text(
                'Chương này chưa có hình ảnh nào được cập nhật.',
                style: GoogleFonts.inter(color: AppColors.inkMuted),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return Stack(
      children: [
        // Zoomable Webtoon Stream
        GestureDetector(
          onTap: widget.onToggleControls,
          child: InteractiveViewer(
            transformationController: _transformController,
            minScale: 1.0,
            maxScale: 3.5,
            child: ListView.builder(
              controller: _scrollController,
              padding: EdgeInsets.zero,
              itemCount: images.length + 1, // +1 cho footer cuối chương
              itemBuilder: (context, index) {
                if (index == images.length) {
                  return _buildEndOfChapterCard(context);
                }

                final url = images[index];
                final retryKey = ValueKey('$url-${_retryTokens[index] ?? 0}');

                return CachedNetworkImage(
                  key: retryKey,
                  imageUrl: url,
                  fit: BoxFit.fitWidth,
                  width: double.infinity,
                  placeholder: (context, progressUrl) => Container(
                    height: 380,
                    color: Colors.black12,
                    child: Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AppColors.gold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Trang ${index + 1}',
                            style: GoogleFonts.inter(
                              color: AppColors.inkMuted,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  errorWidget: (context, errorUrl, error) => Container(
                    height: 220,
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.inkCard.withValues(alpha: 0.5),
                      border: Border.all(color: AppColors.inkBorder),
                    ),
                    child: Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.broken_image, size: 36, color: AppColors.red400),
                          const SizedBox(height: 6),
                          Text(
                            'Không thể tải ảnh trang ${index + 1}',
                            style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 12),
                          ),
                          const SizedBox(height: 8),
                          ElevatedButton.icon(
                            onPressed: () => _retryImage(index),
                            icon: const Icon(Icons.refresh, size: 14),
                            label: const Text('Thử lại'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.gold,
                              foregroundColor: AppColors.inkBg,
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              minimumSize: const Size(0, 32),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ),

        // Floating Page Indicator (Góc dưới bên phải)
        Positioned(
          bottom: 20,
          right: 20,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.65),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white24, width: 0.8),
            ),
            child: Text(
              '$_currentVisiblePage / ${images.length}',
              style: GoogleFonts.robotoMono(
                color: Colors.white,
                fontSize: 11.5,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEndOfChapterCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
      decoration: const BoxDecoration(
        color: AppColors.inkBg,
      ),
      child: Column(
        children: [
          const Icon(Icons.check_circle_outline, color: AppColors.gold, size: 40),
          const SizedBox(height: 12),
          Text(
            'Hết chương ${widget.chapter.chapterNumber}',
            style: GoogleFonts.lora(
              color: AppColors.inkText,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            widget.chapter.title,
            style: GoogleFonts.inter(
              color: AppColors.inkMuted,
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              OutlinedButton.icon(
                onPressed: () => ChapterDiscussionsSheet.show(
                  context,
                  chapterId: widget.chapter.id,
                  chapterTitle: widget.chapter.title,
                ),
                icon: const Icon(Icons.chat_bubble_outline, size: 16),
                label: const Text('Bình luận'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                ),
              ),
              if (widget.onNextChapter != null) ...[
                const SizedBox(width: 12),
                ElevatedButton.icon(
                  onPressed: widget.onNextChapter,
                  icon: const Icon(Icons.arrow_forward, size: 16),
                  label: const Text('Chương kế tiếp'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.gold,
                    foregroundColor: AppColors.inkBg,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}
