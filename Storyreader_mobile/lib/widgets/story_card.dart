import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/utils/image_utils.dart';
import '../data/models/story_model.dart';

class StoryCard extends StatelessWidget {
  final StoryListItem story;

  const StoryCard({super.key, required this.story});

  Widget _buildPolicyBadge(int policy) {
    String label;
    Color? bgColor;
    LinearGradient? gradient;

    switch (policy) {
      case 1:
        label = "VIP";
        gradient = const LinearGradient(
          colors: [Color(0xFFF59E0B), Color(0xFFEA580C)],
        );
        break;
      case 2:
        label = "Hỗn hợp";
        bgColor = const Color(0xFF3B82F6);
        break;
      case 0:
      default:
        label = "Miễn phí";
        bgColor = const Color(0xFF10B981);
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: bgColor,
        gradient: gradient,
        borderRadius: BorderRadius.circular(6),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.25),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Text(
        label,
        style: GoogleFonts.inter(
          color: Colors.white,
          fontSize: 10,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.3,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final formattedViews = story.viewCount >= 1000
        ? '${(story.viewCount / 1000).toStringAsFixed(0)}k'
        : '${story.viewCount}';

    final chapterLabel = story.latestChapterNumber > 0
        ? 'Chương ${story.latestChapterNumber}'
        : (story.totalChapters > 0 ? 'Chương ${story.totalChapters}' : 'Mới');

    return GestureDetector(
      onTap: () {
        context.push('/stories/${story.id}');
      },
      child: Container(
        color: Colors.transparent,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Cover Image with 2/3 ratio
            AspectRatio(
              aspectRatio: 2 / 3,
              child: Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE2E8F0), width: 1),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.08),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                clipBehavior: Clip.antiAlias,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.network(
                      ImageUtils.resolveUrl(story.coverImageUrl),
                      fit: BoxFit.cover,
                      loadingBuilder: (context, child, progress) {
                        if (progress == null) return child;
                        return Container(
                          color: const Color(0xFFF1F5F9),
                          child: const Center(
                            child: SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  Color(0xFFF37021),
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                      errorBuilder: (context, error, stackTrace) => Container(
                        color: const Color(0xFFF1F5F9),
                        child: const Center(
                          child: Icon(
                            Icons.auto_stories,
                            color: Color(0xFF94A3B8),
                            size: 32,
                          ),
                        ),
                      ),
                    ),

                    // Top-left access policy badge
                    Positioned(
                      top: 7,
                      left: 7,
                      child: _buildPolicyBadge(story.accessPolicy),
                    ),

                    // Top-right badge (Tranh or Bookmark)
                    Positioned(
                      top: 7,
                      right: 7,
                      child: story.type == 1
                          ? Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0EA5E9),
                                borderRadius: BorderRadius.circular(5),
                              ),
                              child: Text(
                                'Tranh',
                                style: GoogleFonts.inter(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            )
                          : Container(
                              width: 24,
                              height: 24,
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.4),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Icon(
                                Icons.bookmark_border,
                                size: 14,
                                color: Colors.white,
                              ),
                            ),
                    ),

                    // Bottom dark gradient overlay with view count
                    Positioned(
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: 48,
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.transparent,
                              Colors.black.withValues(alpha: 0.75),
                            ],
                          ),
                        ),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 6,
                        ),
                        alignment: Alignment.bottomCenter,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              story.type == 1 ? 'Truyện tranh' : 'Truyện chữ',
                              style: GoogleFonts.inter(
                                color: Colors.white.withValues(alpha: 0.9),
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(
                                  Icons.remove_red_eye_outlined,
                                  size: 11,
                                  color: Color(0xFFFDE68A),
                                ),
                                const SizedBox(width: 3),
                                Text(
                                  formattedViews,
                                  style: GoogleFonts.inter(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 8),

            // Title below cover (Black Slate-900 bold)
            Text(
              story.title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.inter(
                color: const Color(0xFF0F172A),
                fontSize: 13,
                fontWeight: FontWeight.bold,
                height: 1.25,
              ),
            ),

            const SizedBox(height: 4),

            // Author on left, Chapter on right in orange
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    story.author.isNotEmpty ? story.author : 'Đang cập nhật',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(
                      color: const Color(0xFF64748B),
                      fontSize: 11,
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  chapterLabel,
                  style: GoogleFonts.inter(
                    color: const Color(0xFFEA580C),
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
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
