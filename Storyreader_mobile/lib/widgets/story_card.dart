import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/constants/app_colors.dart';
import '../data/models/story_model.dart';

class StoryCard extends StatelessWidget {
  final StoryListItem story;
  final bool isHorizontal;

  const StoryCard({
    super.key,
    required this.story,
    this.isHorizontal = false,
  });

  Widget _buildBadge(AccessPolicy policy) {
    String label;
    Color bgColor;
    bool isGradient = false;

    switch (policy) {
      case AccessPolicy.paid:
        label = "VIP";
        bgColor = AppColors.gold;
        isGradient = true;
        break;
      case AccessPolicy.mixed:
        label = "Mixed";
        bgColor = AppColors.blue400;
        break;
      case AccessPolicy.free:
        label = "Miễn phí";
        bgColor = AppColors.green400;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
      decoration: BoxDecoration(
        color: isGradient ? null : bgColor.withValues(alpha: 0.9),
        gradient: isGradient ? AppColors.goldGradient : null,
        borderRadius: BorderRadius.circular(6),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Text(
        label,
        style: GoogleFonts.inter(
          color: Colors.white,
          fontSize: 9.5,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.3,
        ),
      ),
    );
  }

  Widget _buildTypeBadge(StoryType type) {
    final isComic = type == StoryType.comic;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
      decoration: BoxDecoration(
        color: isComic ? AppColors.purple400.withValues(alpha: 0.9) : Colors.black54,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        isComic ? 'Comic' : 'Chữ',
        style: GoogleFonts.inter(
          color: Colors.white,
          fontSize: 9,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final formattedViews = story.viewCount >= 1000
        ? '${(story.viewCount / 1000).toStringAsFixed(1)}k'
        : '${story.viewCount}';

    final coverUrl = story.fullCoverUrl.isNotEmpty
        ? story.fullCoverUrl
        : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80';

    if (isHorizontal) {
      return InkWell(
        onTap: () => context.push('/stories/${story.id}'),
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Theme.of(context).dividerColor),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: SizedBox(
                  width: 75,
                  height: 110,
                  child: CachedNetworkImage(
                    imageUrl: coverUrl,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(color: Colors.black12),
                    errorWidget: (context, url, error) => Container(
                      color: Colors.black12,
                      child: const Icon(Icons.book, size: 28),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        _buildBadge(story.policy),
                        const SizedBox(width: 6),
                        _buildTypeBadge(story.type),
                        const Spacer(),
                        if (story.totalChapters > 0)
                          Text(
                            '${story.totalChapters} chương',
                            style: GoogleFonts.inter(
                              color: AppColors.inkMuted,
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      story.title,
                      style: GoogleFonts.lora(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      story.author,
                      style: GoogleFonts.inter(
                        color: AppColors.inkMuted,
                        fontSize: 12.5,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.visibility_outlined, size: 13, color: AppColors.inkMuted),
                        const SizedBox(width: 4),
                        Text(
                          '$formattedViews lượt xem',
                          style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 11.5),
                        ),
                        const SizedBox(width: 12),
                        Container(
                          width: 4,
                          height: 4,
                          decoration: const BoxDecoration(
                            color: AppColors.inkMuted,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          story.releaseStatus.label,
                          style: GoogleFonts.inter(
                            color: story.releaseStatus == ReleaseStatus.completed
                                ? AppColors.green400
                                : AppColors.sky400,
                            fontSize: 11.5,
                            fontWeight: FontWeight.w500,
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

    return InkWell(
      onTap: () => context.push('/stories/${story.id}'),
      borderRadius: BorderRadius.circular(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Cover Image với hiệu ứng gáy sách 3D và bóng đổ
          AspectRatio(
            aspectRatio: 2 / 3,
            child: Container(
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Theme.of(context).dividerColor, width: 1),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.35),
                    blurRadius: 10,
                    offset: const Offset(0, 5),
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
                      color: Colors.black12,
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
                    errorWidget: (context, url, error) => Container(
                      color: Colors.black12,
                      child: const Center(
                        child: Icon(Icons.auto_stories, color: AppColors.inkMuted, size: 28),
                      ),
                    ),
                  ),

                  // 3D Book spine shadow
                  Positioned(
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: 14,
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.black.withValues(alpha: 0.4),
                            Colors.white.withValues(alpha: 0.12),
                            Colors.black.withValues(alpha: 0.2),
                            Colors.transparent,
                          ],
                          stops: const [0.0, 0.2, 0.45, 1.0],
                        ),
                      ),
                    ),
                  ),

                  // Bottom dark vignette for contrast
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
                            Colors.black.withValues(alpha: 0.8),
                          ],
                        ),
                      ),
                    ),
                  ),

                  // Badges top-left
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _buildBadge(story.policy),
                        const SizedBox(width: 4),
                        _buildTypeBadge(story.type),
                      ],
                    ),
                  ),

                  // Bottom views & chapters count
                  Positioned(
                    bottom: 6,
                    left: 8,
                    right: 8,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        if (story.totalChapters > 0)
                          Text(
                            '${story.totalChapters} c.',
                            style: GoogleFonts.inter(
                              color: Colors.white70,
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                            ),
                          )
                        else
                          const SizedBox.shrink(),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.visibility_outlined,
                              color: Colors.white70,
                              size: 11,
                            ),
                            const SizedBox(width: 3),
                            Text(
                              formattedViews,
                              style: GoogleFonts.inter(
                                color: Colors.white,
                                fontSize: 10.5,
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
          ),
          const SizedBox(height: 8),

          // Title
          Text(
            story.title,
            style: GoogleFonts.lora(
              fontSize: 13.5,
              fontWeight: FontWeight.w600,
              height: 1.3,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 3),

          // Author
          Row(
            children: [
              const Icon(
                Icons.person_outline,
                size: 12,
                color: AppColors.inkMuted,
              ),
              const SizedBox(width: 3),
              Expanded(
                child: Text(
                  story.author,
                  style: GoogleFonts.inter(
                    color: AppColors.inkMuted,
                    fontSize: 11.5,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
