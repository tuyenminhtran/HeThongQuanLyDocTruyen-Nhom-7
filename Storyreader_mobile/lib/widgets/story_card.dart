import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/constants/app_colors.dart';
import '../data/models/story_model.dart';

class StoryCard extends StatelessWidget {
  final StoryListItem story;

  const StoryCard({super.key, required this.story});

  Widget _buildBadge(int policy) {
    String label;
    Color bgColor;
    Color textColor;
    bool isGradient = false;

    switch (policy) {
      case 1:
        label = "VIP";
        bgColor = AppColors.gold;
        textColor = Colors.white;
        isGradient = true;
        break;
      case 2:
        label = "Hỗn hợp";
        bgColor = const Color(0xFF3B82F6);
        textColor = Colors.white;
        break;
      case 0:
      default:
        label = "Miễn phí";
        bgColor = const Color(0xFF10B981);
        textColor = Colors.white;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: isGradient ? null : bgColor.withValues(alpha: 0.9),
        gradient: isGradient
            ? const LinearGradient(
                colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
              )
            : null,
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
          color: textColor,
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

    return GestureDetector(
      onTap: () {
        context.push('/stories/${story.id}');
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Cover Image with aspect ratio 2/3 and 3D spine
          AspectRatio(
            aspectRatio: 2 / 3,
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.inkCard,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.inkBorder, width: 1),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.45),
                    blurRadius: 12,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              clipBehavior: Clip.antiAlias,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  CachedNetworkImage(
                    imageUrl: story.coverImageUrl.isNotEmpty
                        ? story.coverImageUrl
                        : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80',
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(
                      color: AppColors.inkCard,
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
                      color: AppColors.inkCard,
                      child: const Center(
                        child: Icon(Icons.auto_stories, color: AppColors.inkMuted, size: 28),
                      ),
                    ),
                  ),

                  // 3D Book spine shadow on left edge
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
                    height: 40,
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
                    ),
                  ),

                  // Top-left access badge
                  Positioned(
                    top: 8,
                    left: 8,
                    child: _buildBadge(story.accessPolicy),
                  ),

                  // Bottom-right views chip
                  Positioned(
                    bottom: 6,
                    right: 8,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.visibility_outlined,
                          color: Colors.white70,
                          size: 12,
                        ),
                        const SizedBox(width: 3),
                        Text(
                          formattedViews,
                          style: GoogleFonts.inter(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
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
              color: AppColors.inkText,
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
                    fontSize: 12,
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
