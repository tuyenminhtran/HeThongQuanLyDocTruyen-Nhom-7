import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/constants/app_colors.dart';
import '../../core/utils/chapter_grouping.dart';
import '../../data/local/story_review_service.dart';
import '../../data/models/story_model.dart';
import '../../data/models/story_review_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/reader_provider.dart';
import '../../providers/story_provider.dart';
import '../../providers/subscription_provider.dart';
import '../../widgets/app_header.dart';
import '../../widgets/loading_skeleton.dart';
import '../../widgets/request_error.dart';

class StoryDetailScreen extends ConsumerStatefulWidget {
  final String storyId;

  const StoryDetailScreen({super.key, required this.storyId});

  @override
  ConsumerState<StoryDetailScreen> createState() => _StoryDetailScreenState();
}

class _StoryDetailScreenState extends ConsumerState<StoryDetailScreen> {
  String _chapterSearch = '';
  bool _isAscending = true;
  final Set<String> _expandedFolders = {};

  // Review & Rating state
  List<StoryReview> _reviews = [];
  int _selectedRating = 5;
  final TextEditingController _reviewController = TextEditingController();
  bool _isSubmittingReview = false;
  double _averageRating = 5.0;

  @override
  void initState() {
    super.initState();
    _loadReviews();
  }

  @override
  void dispose() {
    _reviewController.dispose();
    super.dispose();
  }

  Future<void> _loadReviews() async {
    final list = await StoryReviewService.getReviews(widget.storyId);
    final avg = await StoryReviewService.getAverageRating(widget.storyId);
    if (mounted) {
      setState(() {
        _reviews = list;
        _averageRating = avg;
      });
    }
  }

  Future<void> _openChapter(String chapterId) async {
    await context.push(
      Uri(
        path: '/chapters/$chapterId',
        queryParameters: {'storyId': widget.storyId},
      ).toString(),
    );
    if (mounted) ref.invalidate(readingHistoryProvider);
  }

  Future<void> _toggleFollow() async {
    final auth = ref.read(authProvider);
    if (!auth.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng đăng nhập để theo dõi truyện.')),
      );
      context.push('/login');
      return;
    }

    try {
      final repo = ref.read(storyRepositoryProvider);
      final isFollowing = await repo.toggleFollow(widget.storyId);
      ref.invalidate(isFollowingProvider(widget.storyId));
      ref.invalidate(bookmarksProvider);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              isFollowing
                  ? 'Đã thêm vào truyện đang theo dõi.'
                  : 'Đã bỏ theo dõi truyện.',
            ),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Không thể cập nhật theo dõi: $e')),
        );
      }
    }
  }

  Future<void> _submitReview(StoryDetail story) async {
    final auth = ref.read(authProvider);
    if (!auth.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng đăng nhập để gửi đánh giá.')),
      );
      context.push('/login');
      return;
    }

    final comment = _reviewController.text.trim();
    if (comment.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập nội dung đánh giá của bạn.')),
      );
      return;
    }

    setState(() => _isSubmittingReview = true);
    try {
      final newRev = StoryReview(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        storyId: widget.storyId,
        userId: auth.email ?? '',
        userName: auth.displayName?.isNotEmpty == true ? auth.displayName! : 'Độc giả',
        rating: _selectedRating,
        content: comment,
        createdAt: DateTime.now(),
      );

      final updated = await StoryReviewService.addReview(widget.storyId, newRev);
      final avg = await StoryReviewService.getAverageRating(widget.storyId);

      // Nếu truyện có chapter, cũng đồng thời gửi discussion lên API
      if (story.chapters.isNotEmpty) {
        try {
          final discRepo = ref.read(discussionRepositoryProvider);
          await discRepo.postDiscussion(
            story.chapters.first.id,
            '[Đánh giá $_selectedRating sao] $comment',
          );
        } catch (_) {}
      }

      if (mounted) {
        _reviewController.clear();
        setState(() {
          _reviews = updated;
          _averageRating = avg;
          _selectedRating = 5;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cảm ơn bạn! Đánh giá đã được ghi nhận thành công.'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Không thể gửi đánh giá: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmittingReview = false);
    }
  }

  Future<void> _deleteReview(String reviewId) async {
    final updated = await StoryReviewService.deleteReview(widget.storyId, reviewId);
    final avg = await StoryReviewService.getAverageRating(widget.storyId);
    if (mounted) {
      setState(() {
        _reviews = updated;
        _averageRating = avg;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đã xóa đánh giá thành công.')),
      );
    }
  }

  void _showBuyStoryDialog(StoryDetail story) {
    final auth = ref.read(authProvider);
    if (!auth.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng đăng nhập để mua truyện.')),
      );
      context.push('/login');
      return;
    }

    showDialog(
      context: context,
      builder: (ctx) {
        bool isSimulating = false;

        return StatefulBuilder(
          builder: (dialogContext, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: Row(
                children: [
                  const Icon(Icons.shopping_bag_outlined, color: AppColors.gold, size: 22),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Mua Bản Quyền Truyện',
                      style: GoogleFonts.lora(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      story.title,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Mở khóa vĩnh viễn toàn bộ chương VIP',
                      style: GoogleFonts.inter(fontSize: 12, color: AppColors.inkMuted),
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.amber.shade50,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.amber.shade300),
                      ),
                      child: Text(
                        'Giá: 25.000 VNĐ',
                        style: GoogleFonts.inter(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: const Color(0xFFB45309),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Mock QR Container
                    Container(
                      width: 170,
                      height: 170,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.shade300, width: 2),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.qr_code_2, size: 100, color: Color(0xFF0F172A)),
                          const SizedBox(height: 4),
                          Text(
                            'VNPay Sandbox QR',
                            style: GoogleFonts.spaceMono(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Colors.blue.shade700,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Quét mã trên hoặc bấm nút xác nhận mô phỏng để kích hoạt tức thì mà không cần thanh toán thật.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(fontSize: 11, color: AppColors.inkMuted),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: isSimulating ? null : () => Navigator.pop(ctx),
                  child: const Text('Hủy'),
                ),
                ElevatedButton(
                  onPressed: isSimulating
                      ? null
                      : () async {
                          setDialogState(() => isSimulating = true);
                          try {
                            final subRepo = ref.read(subscriptionRepositoryProvider);
                            final initRes = await subRepo.buyStory(story.id);

                            String refCode = initRes.transactionId;
                            try {
                              final uri = Uri.parse(initRes.paymentUrl);
                              final qRef = uri.queryParameters['ref'];
                              if (qRef != null && qRef.isNotEmpty) {
                                refCode = qRef;
                              }
                            } catch (_) {}

                            await subRepo.simulatePaymentCallback(refCode, success: true);
                            ref.invalidate(storyDetailFamily(story.id));
                            ref.invalidate(purchasedStoriesProvider);

                            if (!mounted) return;
                            if (ctx.mounted) Navigator.pop(ctx);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('🎉 Chúc mừng! Bạn đã mua truyện thành công.'),
                                backgroundColor: Colors.green,
                              ),
                            );
                          } catch (e) {
                            if (!mounted) return;
                            setDialogState(() => isSimulating = false);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Lỗi khi kích hoạt mua truyện: $e')),
                            );
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.gold,
                    foregroundColor: Colors.white,
                  ),
                  child: isSimulating
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('Xác nhận đã thanh toán (Mô phỏng)'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final storyAsync = ref.watch(storyDetailFamily(widget.storyId));
    final isFollowingAsync = ref.watch(isFollowingProvider(widget.storyId));

    return Scaffold(
      backgroundColor: const Color(0xFFF4F6F9), // Slate sáng chuẩn Web
      appBar: const AppHeader(),
      body: storyAsync.when(
        loading: () => const StoryDetailSkeleton(),
        error: (err, _) => Center(
          child: RequestError(
            error: err,
            onRetry: () => ref.invalidate(storyDetailFamily(widget.storyId)),
          ),
        ),
        data: (story) {
          final isFollowing = isFollowingAsync.value ?? false;

          // Lọc danh sách chương theo từ khóa tìm kiếm
          var filteredChapters = story.chapters.where((c) {
            if (_chapterSearch.isEmpty) return true;
            final query = _chapterSearch.toLowerCase();
            return c.title.toLowerCase().contains(query) ||
                c.chapterNumber.toString().contains(query) ||
                (c.partName != null && c.partName!.toLowerCase().contains(query));
          }).toList();

          // Sắp xếp thứ tự chương
          filteredChapters.sort((a, b) => _isAscending
              ? a.chapterNumber.compareTo(b.chapterNumber)
              : b.chapterNumber.compareTo(a.chapterNumber));

          // Nhóm chương thành các Phần / Tập (Folder cha - con)
          final chapterGroups = groupChaptersByPart(filteredChapters);

          // Mặc định mở rộng tất cả các folder khi tải lần đầu
          if (_expandedFolders.isEmpty && chapterGroups.isNotEmpty) {
            _expandedFolders.addAll(chapterGroups.map((g) => g.partName));
          }

          final coverUrl = story.fullCoverUrl.isNotEmpty
              ? story.fullCoverUrl
              : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80';

          return RefreshIndicator(
            color: AppColors.gold,
            onRefresh: () async {
              ref.invalidate(storyDetailFamily(widget.storyId));
              ref.invalidate(isFollowingProvider(widget.storyId));
              await _loadReviews();
            },
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Stack(
                children: [
                  // Ambient blur header giống Web
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 220,
                    child: Opacity(
                      opacity: 0.18,
                      child: CachedNetworkImage(
                        imageUrl: coverUrl,
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),

                  // Nội dung chính
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        _buildHeaderInfo(story, coverUrl),
                        const SizedBox(height: 16),
                        _buildActionButtons(story, isFollowing),
                        const SizedBox(height: 20),
                        _buildDescription(story),
                        const SizedBox(height: 24),
                        _buildChapterSection(story, chapterGroups),
                        const SizedBox(height: 28),
                        _buildReviewsSection(story),
                        const SizedBox(height: 32),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildHeaderInfo(StoryDetail story, String coverUrl) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Ảnh bìa sách tỉ lệ 2/3 bo góc 14px, viền Slate-200, bóng đổ
        Container(
          width: 125,
          height: 185,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
            color: Colors.white,
            boxShadow: const [
              BoxShadow(
                color: Color(0x18000000),
                blurRadius: 10,
                offset: Offset(0, 4),
              ),
            ],
          ),
          clipBehavior: Clip.antiAlias,
          child: CachedNetworkImage(
            imageUrl: coverUrl,
            fit: BoxFit.cover,
            placeholder: (context, url) => Container(color: const Color(0xFFF1F5F9)),
            errorWidget: (context, url, error) => Container(
              color: const Color(0xFFF1F5F9),
              child: const Icon(Icons.book, size: 36, color: Color(0xFF94A3B8)),
            ),
          ),
        ),
        const SizedBox(width: 14),

        // Cột thông tin chi tiết
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hàng Badges: Loại truyện + Chính sách
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                    decoration: BoxDecoration(
                      color: story.isComic
                          ? const Color(0xFFE0F2FE) // Sky-100
                          : const Color(0xFFFFEDD5), // Orange-100
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: story.isComic
                            ? const Color(0xFF7DD3FC)
                            : const Color(0xFFFDBA74),
                      ),
                    ),
                    child: Text(
                      story.isComic ? 'Truyện tranh' : 'Truyện chữ',
                      style: GoogleFonts.inter(
                        color: story.isComic
                            ? const Color(0xFF0369A1)
                            : const Color(0xFFC2410C),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                    decoration: BoxDecoration(
                      color: story.accessPolicy == 0
                          ? const Color(0xFFD1FAE5) // Emerald-100
                          : const Color(0xFFFEF3C7), // Amber-100
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: story.accessPolicy == 0
                            ? const Color(0xFF6EE7B7)
                            : const Color(0xFFFCD34D),
                      ),
                    ),
                    child: Text(
                      story.accessPolicy == 0
                          ? 'Miễn phí'
                          : (story.accessPolicy == 1 ? 'VIP' : 'Hỗn hợp'),
                      style: GoogleFonts.inter(
                        color: story.accessPolicy == 0
                            ? const Color(0xFF047857)
                            : const Color(0xFFB45309),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Tiêu đề truyện: Font Lora đậm to chuẩn Web
              Text(
                story.title,
                style: GoogleFonts.lora(
                  fontSize: 19,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF0F172A),
                  height: 1.25,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 6),

              // Tác giả với icon bút cam
              Row(
                children: [
                  const Icon(
                    Icons.edit,
                    size: 13,
                    color: AppColors.gold,
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      'Tác giả: ${story.author.isNotEmpty ? story.author : "Đang cập nhật"}',
                      style: GoogleFonts.inter(
                        color: const Color(0xFF475569),
                        fontSize: 12.5,
                        fontWeight: FontWeight.w500,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),

              // Số lượt đọc, số chương & Đánh giá sao
              Row(
                children: [
                  const Icon(
                    Icons.visibility,
                    size: 13,
                    color: Color(0xFFF59E0B),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${story.viewCount} lượt đọc',
                    style: GoogleFonts.inter(
                      color: const Color(0xFF64748B),
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${story.chapters.length} chương',
                    style: GoogleFonts.inter(
                      color: const Color(0xFF64748B),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),

              // Điểm đánh giá trung bình
              Row(
                children: [
                  const Icon(Icons.star, size: 14, color: Colors.amber),
                  const SizedBox(width: 4),
                  Text(
                    '${_averageRating.toStringAsFixed(1)} / 5.0',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFFB45309),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '(${_reviews.length} đánh giá)',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: const Color(0xFF64748B),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Thể loại Chips cam nhạt chuẩn Web
              if (story.genres.isNotEmpty)
                Wrap(
                  spacing: 6,
                  runSpacing: 4,
                  children: story.genres.take(4).map((g) {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF7ED), // Orange-50
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFFFED7AA)), // Orange-200
                      ),
                      child: Text(
                        g,
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFFC2410C), // Orange-700
                        ),
                      ),
                    );
                  }).toList(),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons(StoryDetail story, bool isFollowing) {
    final firstChapter = story.chapters.firstOrNull;
    final lastChapter = story.chapters.lastOrNull;

    return Column(
      children: [
        Row(
          children: [
            // Nút "Đọc từ đầu"
            Expanded(
              flex: 3,
              child: ElevatedButton.icon(
                onPressed: firstChapter == null ? null : () => _openChapter(firstChapter.id),
                icon: const Icon(Icons.play_arrow, size: 18, color: Colors.white),
                label: Text(
                  'Đọc từ đầu',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.gold,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),

            // Nút "Đọc mới nhất"
            Expanded(
              flex: 3,
              child: OutlinedButton.icon(
                onPressed: lastChapter == null ? null : () => _openChapter(lastChapter.id),
                icon: const Icon(Icons.fast_forward, size: 18, color: Color(0xFF334155)),
                label: Text(
                  'Đọc mới nhất',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF334155),
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  backgroundColor: Colors.white,
                  side: const BorderSide(color: Color(0xFFCBD5E1)),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),

        Row(
          children: [
            // Nút "Theo dõi"
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _toggleFollow,
                icon: Icon(
                  isFollowing ? Icons.bookmark : Icons.bookmark_border,
                  color: isFollowing ? AppColors.gold : const Color(0xFF475569),
                  size: 18,
                ),
                label: Text(
                  isFollowing ? 'Đang theo dõi' : 'Theo dõi',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: isFollowing ? AppColors.gold : const Color(0xFF334155),
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  backgroundColor: Colors.white,
                  side: BorderSide(
                    color: isFollowing ? AppColors.gold : const Color(0xFFCBD5E1),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ),

            // Nút "Mua truyện" (nếu có phí)
            if (story.accessPolicy > 0) ...[
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _showBuyStoryDialog(story),
                  icon: const Icon(Icons.shopping_cart_outlined, size: 18, color: Colors.white),
                  label: Text(
                    'Mua truyện',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFD97706), // Amber-600
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ],
    );
  }

  Widget _buildDescription(StoryDetail story) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 4,
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.menu_book,
                color: AppColors.gold,
                size: 18,
              ),
              const SizedBox(width: 6),
              Text(
                'GIỚI THIỆU TÁC PHẨM',
                style: GoogleFonts.inter(
                  fontSize: 12.5,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF334155),
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const Divider(height: 18, color: Color(0xFFF1F5F9)),
          Text(
            story.description.isNotEmpty
                ? story.description
                : 'Tác phẩm hiện chưa có tóm tắt chi tiết.',
            style: GoogleFonts.inter(
              fontSize: 13.5,
              height: 1.6,
              color: const Color(0xFF334155),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChapterSection(StoryDetail story, List<ChapterGroup> chapterGroups) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 4,
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Danh sách chương
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(
                    Icons.format_list_bulleted,
                    color: AppColors.gold,
                    size: 18,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'DANH SÁCH CHƯƠNG',
                    style: GoogleFonts.inter(
                      fontSize: 12.5,
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF334155),
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
              IconButton(
                icon: Icon(
                  _isAscending ? Icons.arrow_upward : Icons.arrow_downward,
                  size: 18,
                  color: AppColors.gold,
                ),
                tooltip: _isAscending ? 'Cũ nhất trước' : 'Mới nhất trước',
                onPressed: () => setState(() => _isAscending = !_isAscending),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Search chương
          Container(
            height: 38,
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: TextField(
              onChanged: (val) => setState(() => _chapterSearch = val),
              style: GoogleFonts.inter(fontSize: 12.5),
              decoration: InputDecoration(
                hintText: 'Tìm kiếm số chương, tên chương...',
                hintStyle: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF94A3B8)),
                prefixIcon: const Icon(Icons.search, size: 16, color: Color(0xFF94A3B8)),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 9),
              ),
            ),
          ),
          const SizedBox(height: 14),

          // Danh sách các tập/phần
          if (chapterGroups.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 20),
              child: Center(
                child: Text(
                  'Không tìm thấy chương nào.',
                  style: GoogleFonts.inter(fontSize: 13, color: AppColors.inkMuted),
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: chapterGroups.length,
              separatorBuilder: (context, index) => const SizedBox(height: 10),
              itemBuilder: (context, gIndex) {
                final group = chapterGroups[gIndex];
                final isExpanded = _expandedFolders.contains(group.partName);

                if (!group.isFolder) {
                  return _buildChapterListCards(group.chapters);
                }

                return Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    children: [
                      InkWell(
                        onTap: () {
                          setState(() {
                            if (isExpanded) {
                              _expandedFolders.remove(group.partName);
                            } else {
                              _expandedFolders.add(group.partName);
                            }
                          });
                        },
                        borderRadius: BorderRadius.circular(10),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Icon(
                                    isExpanded ? Icons.folder_open : Icons.folder,
                                    size: 18,
                                    color: AppColors.gold,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    group.partName,
                                    style: GoogleFonts.inter(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFF1E293B),
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    '(${group.chapters.length})',
                                    style: GoogleFonts.inter(
                                      fontSize: 12,
                                      color: AppColors.inkMuted,
                                    ),
                                  ),
                                ],
                              ),
                              Icon(
                                isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                                size: 18,
                                color: const Color(0xFF64748B),
                              ),
                            ],
                          ),
                        ),
                      ),
                      if (isExpanded)
                        Padding(
                          padding: const EdgeInsets.only(left: 8, right: 8, bottom: 8),
                          child: _buildChapterListCards(group.chapters),
                        ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
    );
  }

  Widget _buildChapterListCards(List<ChapterListItem> chapters) {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: chapters.length,
      separatorBuilder: (context, index) => const SizedBox(height: 8),
      itemBuilder: (context, cIndex) {
        final chapter = chapters[cIndex];

        return InkWell(
          onTap: () => _openChapter(chapter.id),
          borderRadius: BorderRadius.circular(10),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x04000000),
                  blurRadius: 2,
                  offset: Offset(0, 1),
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Chương ${chapter.chapterNumber}',
                        style: GoogleFonts.spaceMono(
                          color: AppColors.gold,
                          fontSize: 11.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        chapter.title,
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF0F172A),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                if (chapter.requiresAccess)
                  Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFFBEB),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFFCD34D)),
                    ),
                    child: const Icon(
                      Icons.lock,
                      size: 14,
                      color: Color(0xFFD97706),
                    ),
                  )
                else
                  const Icon(
                    Icons.chevron_right,
                    size: 18,
                    color: Color(0xFFCBD5E1),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  // ============================================================
  // KHU VỰC ĐÁNH GIÁ & BÌNH LUẬN TRUYỆN (PARITY 100% VỚI WEB)
  // ============================================================
  Widget _buildReviewsSection(StoryDetail story) {
    final auth = ref.watch(authProvider);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 4,
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.star, color: Colors.amber, size: 20),
                  const SizedBox(width: 6),
                  Text(
                    'ĐÁNH GIÁ & BÌNH LUẬN',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF334155),
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.amber.shade50,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: Colors.amber.shade300),
                ),
                child: Text(
                  '${_averageRating.toStringAsFixed(1)} / 5.0 ⭐',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFFB45309),
                  ),
                ),
              ),
            ],
          ),
          const Divider(height: 20, color: Color(0xFFF1F5F9)),

          // Form Đánh Giá
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      'Đánh giá của bạn: ',
                      style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(width: 6),
                    Row(
                      children: List.generate(5, (index) {
                        final star = index + 1;
                        return GestureDetector(
                          onTap: () => setState(() => _selectedRating = star),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 2),
                            child: Icon(
                              star <= _selectedRating ? Icons.star : Icons.star_border,
                              color: Colors.amber,
                              size: 22,
                            ),
                          ),
                        );
                      }),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: _reviewController,
                  maxLines: 3,
                  style: GoogleFonts.inter(fontSize: 13),
                  decoration: InputDecoration(
                    hintText: 'Viết nhận xét của bạn về nội dung truyện...',
                    hintStyle: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF94A3B8)),
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                    ),
                    contentPadding: const EdgeInsets.all(10),
                  ),
                ),
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerRight,
                  child: ElevatedButton.icon(
                    onPressed: _isSubmittingReview ? null : () => _submitReview(story),
                    icon: _isSubmittingReview
                        ? const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : const Icon(Icons.send, size: 14),
                    label: Text(
                      'Gửi đánh giá',
                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.gold,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Danh Sách Đánh Giá
          if (_reviews.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: Center(
                child: Text(
                  'Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ cảm nhận!',
                  style: GoogleFonts.inter(fontSize: 12.5, color: AppColors.inkMuted),
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _reviews.length,
              separatorBuilder: (context, index) => const Divider(
                height: 16,
                color: Color(0xFFF1F5F9),
              ),
              itemBuilder: (context, index) {
                final rev = _reviews[index];
                final canDelete = auth.isAdmin ||
                    (auth.email != null && auth.email!.isNotEmpty && rev.userId == auth.email) ||
                    rev.userName == auth.displayName;

                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: AppColors.gold.withValues(alpha: 0.15),
                      child: Text(
                        rev.userName.isNotEmpty ? rev.userName[0].toUpperCase() : 'U',
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.bold,
                          color: AppColors.gold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                rev.userName,
                                style: GoogleFonts.inter(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: const Color(0xFF0F172A),
                                ),
                              ),
                              Row(
                                children: [
                                  Row(
                                    children: List.generate(5, (sIdx) {
                                      return Icon(
                                        sIdx < rev.rating ? Icons.star : Icons.star_border,
                                        size: 13,
                                        color: Colors.amber,
                                      );
                                    }),
                                  ),
                                  if (canDelete) ...[
                                    const SizedBox(width: 4),
                                    InkWell(
                                      onTap: () => _deleteReview(rev.id),
                                      child: const Icon(
                                        Icons.delete_outline,
                                        size: 15,
                                        color: AppColors.red400,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            rev.content,
                            style: GoogleFonts.inter(
                              fontSize: 12.5,
                              color: const Color(0xFF334155),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${rev.createdAt.day}/${rev.createdAt.month}/${rev.createdAt.year}',
                            style: GoogleFonts.inter(
                              fontSize: 10.5,
                              color: AppColors.inkMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              },
            ),
        ],
      ),
    );
  }
}
