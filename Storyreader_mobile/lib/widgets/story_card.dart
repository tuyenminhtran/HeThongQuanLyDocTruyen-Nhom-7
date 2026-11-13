import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/constants/app_colors.dart';
import '../data/models/story_model.dart';
import 'book_cover_fallback.dart';

class StoryCard extends StatelessWidget {
  final StoryListItem story;
  final bool isHorizontal;

  const StoryCard({
    super.key,
    required this.story,
    this.isHorizontal = false,
  });

  Widget _buildPolicyBadge(AccessPolicy policy) {
    String label;
    Color? bgColor;
    Gradient? gradient;

    switch (policy) {
      case AccessPolicy.paid:
        label = "VIP";
        gradient = AppColors.goldGradient;
        break;
      case AccessPolicy.mixed:
        label = "Hỗn hợp";
        bgColor = const Color(0xFF3B82F6); // Blue-500
        break;
      case AccessPolicy.free:
        label = "Miễn phí";
        bgColor = const Color(0xFF10B981); // Emerald-500
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: bgColor,
        gradient: gradient,
        borderRadius: BorderRadius.circular(5),
        boxShadow: const [
          BoxShadow(
            color: Colors.black26,
            blurRadius: 3,
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: Text(
        label,
        style: GoogleFonts.inter(
          color: Colors.white,
          fontSize: 9.5,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final formattedViews = story.viewCount >= 1000
        ? '${(story.viewCount / 1000).toStringAsFixed(0)}k'
        : '${story.viewCount}';

    final coverUrl = story.fullCoverUrl.isNotEmpty
        ? story.fullCoverUrl
        : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80';

    final chapterText = (story.latestChapterNumber != null && story.latestChapterNumber! > 0)
        ? 'Chương ${story.latestChapterNumber}'
        : (story.totalChapters > 0 ? 'Chương ${story.totalChapters}' : 'Mới');

    if (isHorizontal) {
      return InkWell(
        onTap: () => context.push('/stories/${story.id}'),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: const [
              BoxShadow(
                color: Color(0x08000000),
                blurRadius: 4,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: SizedBox(
                  width: 75,
                  height: 110,
                  child: CachedNetworkImage(
                    imageUrl: coverUrl,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(color: const Color(0xFFF1F5F9)),
                    errorWidget: (context, url, error) => BookCoverFallback(
                      title: story.title,
                      iconSize: 22,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        _buildPolicyBadge(story.policy),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                          decoration: BoxDecoration(
                            color: story.type == StoryType.comic
                                ? const Color(0xFF0284C7)
                                : const Color(0xFF64748B),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            story.type == StoryType.comic ? 'Tranh' : 'Chữ',
                            style: GoogleFonts.inter(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        const Spacer(),
                        Text(
                          chapterText,
                          style: GoogleFonts.inter(
                            color: AppColors.gold,
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      story.title,
                      style: GoogleFonts.inter(
                        fontSize: 14.5,
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF0F172A),
                        height: 1.25,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      story.author.isNotEmpty ? story.author : 'Đang cập nhật',
                      style: GoogleFonts.inter(
                        color: const Color(0xFF64748B),
                        fontSize: 12,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(
                          Icons.visibility,
                          size: 13,
                          color: Color(0xFFF59E0B),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '$formattedViews lượt xem',
                          style: GoogleFonts.inter(
                            color: const Color(0xFF64748B),
                            fontSize: 11.5,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Container(
                          width: 3,
                          height: 3,
                          decoration: const BoxDecoration(
                            color: Color(0xFFCBD5E1),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          story.releaseStatus.label,
                          style: GoogleFonts.inter(
                            color: story.releaseStatus == ReleaseStatus.completed
                                ? const Color(0xFF10B981)
                                : const Color(0xFF0284C7),
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                          ),
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

    // ==========================================
    // VERTICAL CARD CHUẨN 1-1 STORYCARD.TSX CỦA WEB
    // ==========================================
    return InkWell(
      onTap: () => context.push('/stories/${story.id}'),
      borderRadius: BorderRadius.circular(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Khung ảnh tỉ lệ 2/3 bo góc 12px viền Slate-200
          AspectRatio(
            aspectRatio: 2 / 3,
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x0C000000),
                    blurRadius: 4,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              clipBehavior: Clip.antiAlias,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  CachedNetworkImage(
                    imageUrl: coverUrl,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(
                      color: const Color(0xFFF1F5F9),
                      child: const Center(
                        child: SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(AppColors.gold),
                          ),
                        ),
                      ),
                    ),
                    errorWidget: (context, url, error) => BookCoverFallback(
                      title: story.title,
                    ),
                  ),

                  // Spine shadow bên trái tạo chiều sâu như sách thật
                  Positioned(
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: 12,
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.black.withValues(alpha: 0.25),
                            Colors.white.withValues(alpha: 0.08),
                            Colors.transparent,
                          ],
                        ),
                      ),
                    ),
                  ),

                  // Badge góc trên bên trái: Miễn phí / VIP / Hỗn hợp
                  Positioned(
                    top: 6,
                    left: 6,
                    child: _buildPolicyBadge(story.policy),
                  ),

                  // Badge góc trên bên phải: "Tranh" nếu comic hoặc Bookmark icon
                  Positioned(
                    top: 6,
                    right: 6,
                    child: story.type == StoryType.comic
                        ? Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 5,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0284C7),
                              borderRadius: BorderRadius.circular(4),
                              boxShadow: const [
                                BoxShadow(
                                  color: Colors.black26,
                                  blurRadius: 2,
                                  offset: Offset(0, 1),
                                ),
                              ],
                            ),
                            child: Text(
                              'Tranh',
                              style: GoogleFonts.inter(
                                color: Colors.white,
                                fontSize: 9.5,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          )
                        : Container(
                            width: 22,
                            height: 22,
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.4),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Icon(
                              Icons.bookmark_border,
                              color: Colors.white,
                              size: 13,
                            ),
                          ),
                  ),

                  // Gradient chân ảnh: bên trái loại truyện, bên phải icon mắt vàng + lượt xem
                  Positioned(
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 44,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            Colors.black.withValues(alpha: 0.3),
                            Colors.black.withValues(alpha: 0.75),
                          ],
                        ),
                      ),
                      alignment: Alignment.bottomCenter,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            story.type == StoryType.comic ? 'Truyện tranh' : 'Truyện chữ',
                            style: GoogleFonts.inter(
                              color: Colors.white.withValues(alpha: 0.95),
                              fontSize: 9.5,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.visibility,
                                color: Color(0xFFFDE047), // Amber-300
                                size: 10,
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
          const SizedBox(height: 6),

          // Tiêu đề truyện: Chữ Slate-900 đen đậm, rõ nét, font Inter
          Text(
            story.title,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF0F172A),
              height: 1.25,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 3),

          // Tác giả & Số chương màu cam (#EA580C)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  story.author.isNotEmpty ? story.author : 'Đang cập nhật',
                  style: GoogleFonts.inter(
                    color: const Color(0xFF64748B),
                    fontSize: 11,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 4),
              Text(
                chapterText,
                style: GoogleFonts.inter(
                  color: AppColors.gold,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
