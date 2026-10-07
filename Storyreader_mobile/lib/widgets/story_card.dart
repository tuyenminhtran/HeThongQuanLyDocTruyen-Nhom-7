import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/constants/app_colors.dart';
import '../data/models/story_model.dart';

class StoryCard extends StatelessWidget {
  final StoryListItem story;

  const StoryCard({super.key, required this.story});

  static const accessLabels = ["Miễn phí", "Trả phí", "Mixed"];

  @override
  Widget build(BuildContext context) {
    final accessLabel = (story.accessPolicy >= 0 && story.accessPolicy < accessLabels.length)
        ? accessLabels[story.accessPolicy]
        : "Miễn phí";

    return GestureDetector(
      onTap: () {
        context.push('/stories/${story.id}');
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Cover Image with aspect ratio 2/3
          AspectRatio(
            aspectRatio: 2 / 3,
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.inkCard,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: AppColors.inkBorder, width: 1),
              ),
              clipBehavior: Clip.antiAlias,
              child: CachedNetworkImage(
                imageUrl: story.coverImageUrl.isNotEmpty
                    ? story.coverImageUrl
                    : 'https://placehold.co/300x450?text=No+Cover',
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
                    child: Icon(Icons.broken_image, color: AppColors.inkMuted, size: 28),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          // Title
          Text(
            story.title,
            style: GoogleFonts.notoSerif(
              color: AppColors.inkText,
              fontSize: 14,
              fontWeight: FontWeight.w600,
              height: 1.3,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          // Author
          Text(
            story.author,
            style: GoogleFonts.inter(
              color: AppColors.inkMuted,
              fontSize: 13,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          // Access policy & view count
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                accessLabel,
                style: GoogleFonts.inter(
                  color: AppColors.inkMuted,
                  fontSize: 12,
                ),
              ),
              Text(
                '${story.viewCount} lượt xem',
                style: GoogleFonts.inter(
                  color: AppColors.inkMuted,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
