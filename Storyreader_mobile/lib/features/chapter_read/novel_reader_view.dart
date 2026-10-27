import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/constants/app_colors.dart';
import '../../data/local/reading_cache_service.dart';
import '../../data/models/chapter_model.dart';
import '../../providers/reader_provider.dart';
import 'chapter_discussions_sheet.dart';

class NovelReaderView extends ConsumerStatefulWidget {
  final ChapterContent chapter;
  final String? storyId;
  final VoidCallback onToggleControls;
  final VoidCallback? onNextChapter;
  final Color textColor;
  final Color borderColor;

  const NovelReaderView({
    super.key,
    required this.chapter,
    this.storyId,
    required this.onToggleControls,
    this.onNextChapter,
    required this.textColor,
    required this.borderColor,
  });

  @override
  ConsumerState<NovelReaderView> createState() => _NovelReaderViewState();
}

class _NovelReaderViewState extends ConsumerState<NovelReaderView> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _restoreReadingPosition();
  }

  @override
  void dispose() {
    _saveCurrentProgress();
    _scrollController.dispose();
    super.dispose();
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

  TextStyle _getTextStyle(String fontFamily, double fontSize, double lineHeight) {
    switch (fontFamily) {
      case 'Inter':
        return GoogleFonts.inter(
          color: widget.textColor.withValues(alpha: 0.92),
          fontSize: fontSize,
          height: lineHeight,
          letterSpacing: 0.2,
        );
      case 'Noto Serif':
        return GoogleFonts.notoSerif(
          color: widget.textColor.withValues(alpha: 0.92),
          fontSize: fontSize,
          height: lineHeight,
          letterSpacing: 0.1,
        );
      case 'Lora':
      default:
        return GoogleFonts.lora(
          color: widget.textColor.withValues(alpha: 0.92),
          fontSize: fontSize,
          height: lineHeight,
          letterSpacing: 0.1,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final fontSize = ref.watch(readerFontSizeProvider);
    final fontFamily = ref.watch(readerFontFamilyProvider);
    final lineHeight = ref.watch(readerLineHeightProvider);

    final paragraphs = widget.chapter.content.split('\n');
    final textStyle = _getTextStyle(fontFamily, fontSize, lineHeight);

    return GestureDetector(
      onTap: widget.onToggleControls,
      child: SingleChildScrollView(
        controller: _scrollController,
        key: ValueKey(widget.chapter.id),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 70),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Chapter Title Header
            Column(
              children: [
                Text(
                  'CHƯƠNG ${widget.chapter.chapterNumber}',
                  style: GoogleFonts.inter(
                    color: AppColors.gold,
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 2.2,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  widget.chapter.title,
                  style: GoogleFonts.lora(
                    color: widget.textColor,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    height: 1.3,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                Divider(color: widget.borderColor),
              ],
            ),
            const SizedBox(height: 28),

            // Paragraphs Body
            ...paragraphs.map((p) {
              final trimmed = p.trim();
              if (trimmed.isEmpty) {
                return const SizedBox(height: 14);
              }
              return Padding(
                padding: const EdgeInsets.only(bottom: 20),
                child: Text(
                  '        $trimmed',
                  style: textStyle,
                  textAlign: TextAlign.justify,
                ),
              );
            }),

            const SizedBox(height: 40),

            // Art Divider 3 Dots
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 5,
                  height: 5,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.gold.withValues(alpha: 0.5),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  width: 7,
                  height: 7,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.gold,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  width: 5,
                  height: 5,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.gold.withValues(alpha: 0.5),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 36),

            // End of chapter action buttons
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
                  label: const Text('Thảo luận chương'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  ),
                ),
                if (widget.onNextChapter != null) ...[
                  const SizedBox(width: 12),
                  ElevatedButton.icon(
                    onPressed: widget.onNextChapter,
                    icon: const Icon(Icons.arrow_forward, size: 16),
                    label: const Text('Chương sau'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.gold,
                      foregroundColor: AppColors.inkBg,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 60),
          ],
        ),
      ),
    );
  }
}
