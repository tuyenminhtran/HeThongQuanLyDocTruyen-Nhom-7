import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../data/api/payment_api.dart';
import '../../providers/auth_provider.dart';
import '../../providers/story_provider.dart';
import '../../widgets/app_header.dart';
import '../../widgets/app_footer.dart';

class StoryDetailScreen extends ConsumerStatefulWidget {
  final String storyId;

  const StoryDetailScreen({super.key, required this.storyId});

  @override
  ConsumerState<StoryDetailScreen> createState() => _StoryDetailScreenState();
}

class _StoryDetailScreenState extends ConsumerState<StoryDetailScreen> {
  bool _isBuying = false;
  String? _buyError;

  static const accessLabels = ["Miễn phí", "Trả phí", "Mixed"];

  Future<void> _handleBuyStory() async {
    setState(() {
      _isBuying = true;
      _buyError = null;
    });

    try {
      final res = await PaymentApi.buyStory(widget.storyId);
      if (mounted) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            backgroundColor: AppColors.inkCard,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: AppColors.inkBorder),
            ),
            title: Text(
              'Đã tạo giao dịch',
              style: GoogleFonts.notoSerif(
                color: AppColors.inkText,
                fontWeight: FontWeight.w600,
              ),
            ),
            content: Text(
              'Trong thực tế bạn sẽ được chuyển tới:\n${res.paymentUrl}',
              style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 14),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: Text('Đóng', style: GoogleFonts.inter(color: AppColors.inkMuted)),
              ),
              if (res.paymentUrl.isNotEmpty)
                ElevatedButton(
                  onPressed: () async {
                    Navigator.pop(ctx);
                    final uri = Uri.tryParse(res.paymentUrl);
                    if (uri != null) {
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.gold,
                    foregroundColor: AppColors.inkBg,
                  ),
                  child: Text('Mở liên kết', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                ),
            ],
          ),
        );
        ref.invalidate(storyDetailFamily(widget.storyId));
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _buyError = 'Không thể khởi tạo giao dịch. Vui lòng thử lại.';
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isBuying = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final storyAsync = ref.watch(storyDetailFamily(widget.storyId));
    final auth = ref.watch(authProvider);

    return Scaffold(
      appBar: const AppHeader(),
      body: storyAsync.when(
        data: (story) {
          final accessLabel = (story.accessPolicy >= 0 &&
                  story.accessPolicy < accessLabels.length)
              ? accessLabels[story.accessPolicy]
              : 'N/A';

          String statusLabel = 'Đang ra';
          if (story.status == 1) statusLabel = 'Hoàn thành';
          if (story.status == 2) statusLabel = 'Tạm ngưng';

          return SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Large Cover Image centered
                      Center(
                        child: Container(
                          width: 220,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.inkBorder),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.4),
                                blurRadius: 20,
                                offset: const Offset(0, 10),
                              ),
                            ],
                          ),
                          clipBehavior: Clip.antiAlias,
                          child: AspectRatio(
                            aspectRatio: 2 / 3,
                            child: CachedNetworkImage(
                              imageUrl: story.coverImageUrl.isNotEmpty
                                  ? story.coverImageUrl
                                  : 'https://placehold.co/400x600?text=No+Cover',
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Status & Policy Chips
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.inkCard,
                              border: Border.all(color: AppColors.inkBorder),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              statusLabel,
                              style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 12),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.inkCard,
                              border: Border.all(color: AppColors.inkBorder),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              accessLabel,
                              style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 12),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 16),

                      // Story Title
                      Text(
                        story.title,
                        style: GoogleFonts.notoSerif(
                          color: AppColors.inkText,
                          fontSize: 26,
                          fontWeight: FontWeight.bold,
                          height: 1.25,
                        ),
                        textAlign: TextAlign.center,
                      ),

                      const SizedBox(height: 8),

                      // Author
                      RichText(
                        textAlign: TextAlign.center,
                        text: TextSpan(
                          style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 16),
                          children: [
                            const TextSpan(text: 'Tác giả: '),
                            TextSpan(
                              text: story.author,
                              style: GoogleFonts.inter(
                                color: AppColors.inkText,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Genre chips
                      if (story.genres.isNotEmpty)
                        Wrap(
                          alignment: WrapAlignment.center,
                          spacing: 8,
                          runSpacing: 8,
                          children: story.genres.map((g) {
                            return Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: AppColors.gold.withValues(alpha: 0.1),
                                border: Border.all(
                                  color: AppColors.gold.withValues(alpha: 0.2),
                                ),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                g,
                                style: GoogleFonts.inter(
                                  color: AppColors.gold,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            );
                          }).toList(),
                        ),

                      const SizedBox(height: 24),

                      // Description Box
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Giới thiệu',
                            style: GoogleFonts.notoSerif(
                              color: AppColors.inkText,
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            story.description,
                            style: GoogleFonts.inter(
                              color: AppColors.inkText.withValues(alpha: 0.8),
                              fontSize: 14,
                              height: 1.6,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 24),
                      Divider(color: AppColors.inkBorder.withValues(alpha: 0.5)),
                      const SizedBox(height: 20),

                      // Pricing & CTA Box
                      if (story.accessPolicy != 0) ...[
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.inkCard,
                            border: Border.all(color: AppColors.inkBorder),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        '${story.price?.toInt() ?? 0}đ',
                                        style: GoogleFonts.inter(
                                          color: AppColors.inkText,
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      Text(
                                        '${story.freeChapterCount} chương đầu đọc miễn phí',
                                        style: GoogleFonts.inter(
                                          color: AppColors.inkMuted,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              if (auth.isAuthenticated)
                                ElevatedButton(
                                  onPressed: _isBuying ? null : _handleBuyStory,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.gold,
                                    foregroundColor: AppColors.inkBg,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                  ),
                                  child: _isBuying
                                      ? const Row(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            SizedBox(
                                              width: 16,
                                              height: 16,
                                              child: CircularProgressIndicator(
                                                strokeWidth: 2,
                                                color: AppColors.inkBg,
                                              ),
                                            ),
                                            SizedBox(width: 8),
                                            Text('Đang xử lý...'),
                                          ],
                                        )
                                      : Text(
                                          'Mua ngay',
                                          style: GoogleFonts.inter(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 14,
                                          ),
                                        ),
                                )
                              else
                                OutlinedButton(
                                  onPressed: () => context.push('/login'),
                                  style: OutlinedButton.styleFrom(
                                    side: const BorderSide(color: AppColors.gold),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                  ),
                                  child: Text(
                                    'Đăng nhập để mua',
                                    style: GoogleFonts.inter(
                                      color: AppColors.gold,
                                      fontWeight: FontWeight.w500,
                                      fontSize: 14,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                        if (_buyError != null) ...[
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.red400.withValues(alpha: 0.1),
                              border: Border.all(
                                color: AppColors.red400.withValues(alpha: 0.2),
                              ),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.error_outline,
                                    size: 18, color: AppColors.red400),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    _buyError!,
                                    style: GoogleFonts.inter(
                                      color: AppColors.red400,
                                      fontSize: 13,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                        const SizedBox(height: 16),
                      ],

                      // "Đọc từ đầu" Button
                      if (story.chapters.isNotEmpty) ...[
                        ElevatedButton(
                          onPressed: () {
                            context.push('/chapters/${story.chapters.first.id}');
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.inkText,
                            foregroundColor: AppColors.inkBg,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            elevation: 4,
                          ),
                          child: Text(
                            'Đọc từ đầu',
                            style: GoogleFonts.inter(
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                          ),
                        ),
                        const SizedBox(height: 36),
                      ],

                      // Chapters Section
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Text(
                                'Danh sách chương',
                                style: GoogleFonts.notoSerif(
                                  color: AppColors.inkText,
                                  fontSize: 18,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(width: 10),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 3,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.inkCard,
                                  border: Border.all(color: AppColors.inkBorder),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  '${story.chapters.length} chương',
                                  style: GoogleFonts.inter(
                                    color: AppColors.inkMuted,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),

                      const SizedBox(height: 16),

                      if (story.chapters.isEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(vertical: 36),
                          decoration: BoxDecoration(
                            color: AppColors.inkCard,
                            border: Border.all(color: AppColors.inkBorder),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            'Truyện này chưa có chương nào.',
                            style: GoogleFonts.inter(
                              color: AppColors.inkMuted,
                              fontSize: 14,
                            ),
                          ),
                        )
                      else
                        ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: story.chapters.length,
                          separatorBuilder: (context, _) => const SizedBox(height: 8),
                          itemBuilder: (context, idx) {
                            final c = story.chapters[idx];
                            return InkWell(
                              onTap: () {
                                context.push('/chapters/${c.id}');
                              },
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: AppColors.inkCard,
                                  border: Border.all(color: AppColors.inkBorder),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            'Chương ${c.chapterNumber}',
                                            style: GoogleFonts.robotoMono(
                                              color: AppColors.inkMuted,
                                              fontSize: 12,
                                            ),
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            c.title,
                                            style: GoogleFonts.inter(
                                              color: AppColors.inkText,
                                              fontSize: 14,
                                              fontWeight: FontWeight.w500,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ],
                                      ),
                                    ),
                                    if (c.requiresAccess) ...[
                                      const SizedBox(width: 8),
                                      Container(
                                        width: 32,
                                        height: 32,
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: AppColors.gold.withValues(alpha: 0.1),
                                        ),
                                        alignment: Alignment.center,
                                        child: const Icon(
                                          Icons.lock,
                                          size: 16,
                                          color: AppColors.gold,
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            );
                          },
                        ),

                      const SizedBox(height: 36),
                      Divider(color: AppColors.inkBorder.withValues(alpha: 0.5)),
                      const SizedBox(height: 24),

                      // Reviews & Comments Section
                      _buildReviewsSection(),
                    ],
                  ),
                ),
                const AppFooter(),
              ],
            ),
          );
        },
        loading: () => const Center(
          child: Padding(
            padding: EdgeInsets.symmetric(vertical: 80),
            child: CircularProgressIndicator(color: AppColors.gold),
          ),
        ),
        error: (_, _) => Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Không tìm thấy truyện',
                  style: GoogleFonts.notoSerif(
                    color: AppColors.inkMuted,
                    fontSize: 18,
                  ),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => context.go('/'),
                  child: Text(
                    '← Quay lại trang chủ',
                    style: GoogleFonts.inter(color: AppColors.gold),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildReviewsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Đánh giá & Bình luận',
          style: GoogleFonts.notoSerif(
            color: AppColors.inkText,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 16),

        // Input comment card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.inkCard,
            border: Border.all(color: AppColors.inkBorder),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            children: [
              TextField(
                maxLines: 3,
                style: GoogleFonts.inter(color: AppColors.inkText, fontSize: 13),
                decoration: InputDecoration(
                  hintText: 'Viết đánh giá của bạn về truyện này...',
                  hintStyle: GoogleFonts.inter(
                    color: AppColors.inkMuted.withValues(alpha: 0.5),
                    fontSize: 13,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: List.generate(
                      5,
                      (index) => const Icon(
                        Icons.star,
                        color: AppColors.gold,
                        size: 20,
                      ),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Đã gửi đánh giá thành công!'),
                          backgroundColor: AppColors.inkCard,
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.gold,
                      foregroundColor: AppColors.inkBg,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 10,
                      ),
                    ),
                    child: Text(
                      'Gửi đánh giá',
                      style: GoogleFonts.inter(fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 24),

        // Mock Comment 1: Anh Tuấn
        _buildCommentItem(
          initial: 'A',
          name: 'Anh Tuấn',
          time: '2 giờ trước',
          rating: 5,
          content: 'Truyện rất hay, mong tác giả ra nhanh chương mới. Plot twist đoạn cuối quá bất ngờ!',
        ),

        const SizedBox(height: 16),

        // Mock Comment 2: Minh Phượng
        _buildCommentItem(
          initial: 'M',
          name: 'Minh Phượng',
          time: '1 ngày trước',
          rating: 4,
          content: 'Khá ổn, nhịp độ hơi chậm đoạn đầu nhưng về sau rất cuốn.',
        ),
      ],
    );
  }

  Widget _buildCommentItem({
    required String initial,
    required String name,
    required String time,
    required int rating,
    required String content,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.inkBg,
            border: Border.all(color: AppColors.inkBorder),
          ),
          alignment: Alignment.center,
          child: Text(
            initial,
            style: GoogleFonts.inter(
              color: AppColors.inkMuted,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.inkCard,
              border: Border.all(color: AppColors.inkBorder),
              borderRadius: const BorderRadius.only(
                topRight: Radius.circular(16),
                bottomLeft: Radius.circular(16),
                bottomRight: Radius.circular(16),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      name,
                      style: GoogleFonts.inter(
                        color: AppColors.inkText,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      time,
                      style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 12),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: List.generate(
                    5,
                    (i) => Icon(
                      Icons.star,
                      size: 14,
                      color: i < rating ? AppColors.gold : AppColors.inkBorder,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  content,
                  style: GoogleFonts.inter(
                    color: AppColors.inkText.withValues(alpha: 0.8),
                    fontSize: 13,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
