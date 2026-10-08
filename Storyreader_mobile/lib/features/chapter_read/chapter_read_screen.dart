import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../data/api/chapter_api.dart';
import '../../data/models/chapter_model.dart';
import '../../providers/reader_provider.dart';

final chapterContentFamily = FutureProvider.autoDispose.family<ChapterContent, String>((ref, id) async {
  return await ChapterApi.getChapterContent(id);
});

class ChapterReadScreen extends ConsumerWidget {
  final String chapterId;

  const ChapterReadScreen({super.key, required this.chapterId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chapterAsync = ref.watch(chapterContentFamily(chapterId));
    final theme = ref.watch(readerThemeProvider);
    final fontSize = ref.watch(readerFontSizeProvider);

    // Color configs
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

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: chapterAsync.when(
          data: (chapter) {
            final paragraphs = chapter.content.split('\n');

            return Stack(
              children: [
                // Scrollable content
                SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 80),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Header
                      Column(
                        children: [
                          Text(
                            'CHƯƠNG ${chapter.chapterNumber}',
                            style: GoogleFonts.inter(
                              color: AppColors.gold,
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 2.0,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            chapter.title,
                            style: GoogleFonts.notoSerif(
                              color: textColor,
                              fontSize: 26,
                              fontWeight: FontWeight.bold,
                              height: 1.3,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 24),
                          Divider(color: borderColor),
                        ],
                      ),

                      const SizedBox(height: 32),

                      // Chapter body
                      ...paragraphs.map((p) {
                        final trimmed = p.trim();
                        if (trimmed.isEmpty) {
                          return const SizedBox(height: 16);
                        }
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 24),
                          child: Text(
                            '        $trimmed', // 32pt indent imitation
                            style: GoogleFonts.notoSerif(
                              color: textColor.withValues(alpha: 0.9),
                              fontSize: fontSize,
                              height: 1.8,
                            ),
                            textAlign: TextAlign.justify,
                          ),
                        );
                      }),

                      const SizedBox(height: 48),

                      // Footer 3 dots
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.gold.withValues(alpha: 0.5),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            width: 6,
                            height: 6,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.gold.withValues(alpha: 0.5),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            width: 6,
                            height: 6,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.gold.withValues(alpha: 0.5),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 60),
                    ],
                  ),
                ),

                // Floating Toolbar
                Positioned(
                  top: 12,
                  right: 16,
                  child: Container(
                    decoration: BoxDecoration(
                      color: theme == 'dark'
                          ? AppColors.inkCard.withValues(alpha: 0.9)
                          : Colors.white.withValues(alpha: 0.9),
                      border: Border.all(color: borderColor),
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.2),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Back button
                        IconButton(
                          onPressed: () => context.pop(),
                          icon: Icon(Icons.arrow_back, size: 18, color: textColor),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                        ),
                        Container(width: 1, height: 18, color: borderColor),
                        const SizedBox(width: 6),

                        // Light theme toggle
                        _buildThemeButton(
                          ref: ref,
                          currentTheme: theme,
                          targetTheme: 'light',
                          btnColor: AppColors.readerLightBg,
                          borderColor: AppColors.readerLightBorder,
                        ),
                        const SizedBox(width: 4),

                        // Sepia theme toggle
                        _buildThemeButton(
                          ref: ref,
                          currentTheme: theme,
                          targetTheme: 'sepia',
                          btnColor: AppColors.readerSepiaBg,
                          borderColor: AppColors.readerSepiaBorder,
                        ),
                        const SizedBox(width: 4),

                        // Dark theme toggle
                        _buildThemeButton(
                          ref: ref,
                          currentTheme: theme,
                          targetTheme: 'dark',
                          btnColor: AppColors.inkBg,
                          borderColor: AppColors.inkBorder,
                        ),

                        const SizedBox(width: 6),
                        Container(width: 1, height: 18, color: borderColor),
                        const SizedBox(width: 6),

                        // A- font size
                        GestureDetector(
                          onTap: () => ref.read(readerFontSizeProvider.notifier).decrease(),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                            child: Text(
                              'A-',
                              style: GoogleFonts.notoSerif(
                                color: textColor,
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: Text(
                            '${fontSize.toInt()}',
                            style: GoogleFonts.robotoMono(
                              color: textColor.withValues(alpha: 0.6),
                              fontSize: 12,
                            ),
                          ),
                        ),
                        // A+ font size
                        GestureDetector(
                          onTap: () => ref.read(readerFontSizeProvider.notifier).increase(),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                            child: Text(
                              'A+',
                              style: GoogleFonts.notoSerif(
                                color: textColor,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          },
          loading: () => Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    height: 24,
                    width: 180,
                    decoration: BoxDecoration(
                      color: AppColors.inkCard,
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Container(
                    height: 14,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppColors.inkCard,
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    height: 14,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppColors.inkCard,
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                ],
              ),
            ),
          ),
          error: (err, _) {
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
                          border: Border.all(
                            color: AppColors.gold.withValues(alpha: 0.2),
                          ),
                        ),
                        alignment: Alignment.center,
                        child: const Icon(
                          Icons.lock,
                          size: 36,
                          color: AppColors.gold,
                        ),
                      ),
                      const SizedBox(height: 20),
                      Text(
                        'Chương này đã bị khóa',
                        style: GoogleFonts.notoSerif(
                          color: textColor,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Bạn cần phải mua truyện hoặc đăng ký gói thành viên để tiếp tục đọc chương này.',
                        style: GoogleFonts.inter(
                          color: textColor.withValues(alpha: 0.7),
                          fontSize: 14,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 28),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          OutlinedButton(
                            onPressed: () => context.pop(),
                            style: OutlinedButton.styleFrom(
                              side: BorderSide(color: borderColor),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 20,
                                vertical: 12,
                              ),
                            ),
                            child: Text(
                              'Quay lại',
                              style: GoogleFonts.inter(color: textColor),
                            ),
                          ),
                          const SizedBox(width: 12),
                          ElevatedButton(
                            onPressed: () => context.push('/login'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.gold,
                              foregroundColor: AppColors.inkBg,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                                vertical: 12,
                              ),
                            ),
                            child: Text(
                              'Đăng nhập',
                              style: GoogleFonts.inter(fontWeight: FontWeight.w600),
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
                    Text(
                      'Không thể tải nội dung chương. Vui lòng thử lại sau.',
                      style: GoogleFonts.inter(color: AppColors.red400),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    TextButton(
                      onPressed: () => context.pop(),
                      child: Text(
                        'Quay lại',
                        style: GoogleFonts.inter(color: AppColors.gold),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildThemeButton({
    required WidgetRef ref,
    required String currentTheme,
    required String targetTheme,
    required Color btnColor,
    required Color borderColor,
  }) {
    final isSelected = currentTheme == targetTheme;

    return GestureDetector(
      onTap: () => ref.read(readerThemeProvider.notifier).setTheme(targetTheme),
      child: Container(
        width: 22,
        height: 22,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: btnColor,
          border: Border.all(
            color: isSelected ? AppColors.gold : borderColor,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.gold.withValues(alpha: 0.4),
                    blurRadius: 4,
                  ),
                ]
              : null,
        ),
      ),
    );
  }
}
