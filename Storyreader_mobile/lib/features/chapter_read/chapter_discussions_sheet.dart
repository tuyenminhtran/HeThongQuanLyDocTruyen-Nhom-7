import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/constants/app_colors.dart';
import '../../core/network/api_error.dart';
import '../../data/models/discussion_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/reader_provider.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/request_error.dart';

class ChapterDiscussionsSheet extends ConsumerStatefulWidget {
  final String chapterId;
  final String chapterTitle;

  const ChapterDiscussionsSheet({
    super.key,
    required this.chapterId,
    required this.chapterTitle,
  });

  static Future<void> show(BuildContext context, {required String chapterId, required String chapterTitle}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => ChapterDiscussionsSheet(
        chapterId: chapterId,
        chapterTitle: chapterTitle,
      ),
    );
  }

  @override
  ConsumerState<ChapterDiscussionsSheet> createState() => _ChapterDiscussionsSheetState();
}

class _ChapterDiscussionsSheetState extends ConsumerState<ChapterDiscussionsSheet> {
  final TextEditingController _commentController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  bool _isSending = false;

  @override
  void dispose() {
    _commentController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  Future<void> _sendComment() async {
    final text = _commentController.text.trim();
    if (text.isEmpty) return;

    final auth = ref.read(authProvider);
    if (!auth.isAuthenticated) {
      context.push('/login');
      return;
    }

    setState(() => _isSending = true);

    try {
      final repo = ref.read(discussionRepositoryProvider);
      await repo.postDiscussion(widget.chapterId, text);
      _commentController.clear();
      _focusNode.unfocus();
      ref.invalidate(chapterDiscussionsFamily(widget.chapterId));

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đã gửi bình luận thành công!'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(apiErrorMessage(e, 'Không thể gửi bình luận.'))),
        );
      }
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  Future<void> _reportDiscussion(DiscussionItem item) async {
    final auth = ref.read(authProvider);
    if (!auth.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng đăng nhập để báo cáo bình luận.')),
      );
      return;
    }

    final reasonCtrl = TextEditingController();
    const presets = ['Spam / Quảng cáo', 'Ngôn từ xúc phạm', 'Tiết lộ nội dung (Spoiler)'];

    final submittedReason = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(
          'Báo cáo bình luận',
          style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Chọn nhanh hoặc nhập lý do để quản trị viên xem xét:',
              style: GoogleFonts.inter(fontSize: 12.5, color: AppColors.inkMuted),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: presets
                  .map(
                    (preset) => ActionChip(
                      label: Text(preset, style: GoogleFonts.inter(fontSize: 11.5)),
                      onPressed: () => reasonCtrl.text = preset,
                    ),
                  )
                  .toList(),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: reasonCtrl,
              maxLength: 500,
              maxLines: 2,
              decoration: const InputDecoration(
                hintText: 'Lý do báo cáo (không bắt buộc)...',
                border: OutlineInputBorder(),
                isDense: true,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, reasonCtrl.text.trim()),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.red400,
              foregroundColor: Colors.white,
            ),
            child: const Text('Gửi báo cáo'),
          ),
        ],
      ),
    );
    reasonCtrl.dispose();

    if (submittedReason == null || !mounted) return;

    try {
      final msg = await ref
          .read(discussionRepositoryProvider)
          .reportDiscussion(widget.chapterId, item.id, reason: submittedReason);
      if (!mounted) return;
      ref.invalidate(chapterDiscussionsFamily(widget.chapterId));
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(msg)),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(apiErrorMessage(e, 'Không thể gửi báo cáo.'))),
      );
    }
  }

  String _formatTime(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inSeconds < 60) return 'Vừa xong';
    if (diff.inMinutes < 60) return '${diff.inMinutes} phút trước';
    if (diff.inHours < 24) return '${diff.inHours} giờ trước';
    if (diff.inDays < 30) return '${diff.inDays} ngày trước';
    return '${dt.day}/${dt.month}/${dt.year}';
  }

  @override
  Widget build(BuildContext context) {
    final discussionsAsync = ref.watch(chapterDiscussionsFamily(widget.chapterId));
    final auth = ref.watch(authProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final sheetBg = isDark ? AppColors.inkCard : Colors.white;
    final textColor = isDark ? AppColors.inkText : const Color(0xFF1E293B);
    final borderCol = isDark ? AppColors.inkBorder : Colors.black12;

    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: BoxDecoration(
        color: sheetBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.35),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.only(top: 12, left: 16, right: 16, bottom: 8),
            child: Column(
              children: [
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.withValues(alpha: 0.4),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Thảo luận chương',
                            style: GoogleFonts.lora(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: textColor,
                            ),
                          ),
                          Text(
                            widget.chapterTitle,
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: AppColors.inkMuted,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 20),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Divider(color: borderCol, height: 1),

          // Discussions list
          Expanded(
            child: discussionsAsync.when(
              loading: () => const Center(
                child: CircularProgressIndicator(color: AppColors.gold, strokeWidth: 2),
              ),
              error: (err, _) => Center(
                child: RequestError(
                  error: err,
                  onRetry: () => ref.invalidate(chapterDiscussionsFamily(widget.chapterId)),
                ),
              ),
              data: (discussions) {
                if (discussions.isEmpty) {
                  return const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: EmptyState(
                        icon: Icons.chat_bubble_outline,
                        title: 'Chưa có thảo luận nào',
                        subtitle: 'Hãy là người đầu tiên chia sẻ cảm nghĩ về chương này nhé!',
                      ),
                    ),
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  itemCount: discussions.length,
                  separatorBuilder: (context, index) => Divider(color: borderCol, height: 16),
                  itemBuilder: (context, index) {
                    final item = discussions[index];
                    return _buildDiscussionItem(item, textColor, isDark);
                  },
                );
              },
            ),
          ),

          // Input field docked at bottom
          Container(
            padding: EdgeInsets.only(
              left: 12,
              right: 12,
              top: 10,
              bottom: MediaQuery.of(context).viewInsets.bottom +
                  MediaQuery.of(context).padding.bottom +
                  10,
            ),
            decoration: BoxDecoration(
              color: isDark ? AppColors.inkElevated : const Color(0xFFF1F5F9),
              border: Border(top: BorderSide(color: borderCol)),
            ),
            child: auth.isAuthenticated
                ? Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _commentController,
                          focusNode: _focusNode,
                          minLines: 1,
                          maxLines: 3,
                          textInputAction: TextInputAction.send,
                          onSubmitted: (_) => _sendComment(),
                          decoration: InputDecoration(
                            hintText: 'Viết bình luận của bạn...',
                            hintStyle: GoogleFonts.inter(fontSize: 13, color: AppColors.inkMuted),
                            filled: true,
                            fillColor: isDark ? AppColors.inkCard : Colors.white,
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 10,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(20),
                              borderSide: BorderSide(color: borderCol),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(20),
                              borderSide: BorderSide(color: borderCol),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(20),
                              borderSide: const BorderSide(color: AppColors.gold),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: AppColors.goldGradient,
                        ),
                        child: IconButton(
                          onPressed: _isSending ? null : _sendComment,
                          icon: _isSending
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Icon(Icons.send_rounded, color: Colors.white, size: 18),
                        ),
                      ),
                    ],
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Đăng nhập để tham gia thảo luận',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: AppColors.inkMuted,
                        ),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.pop(context);
                          context.push('/login');
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.gold,
                          foregroundColor: AppColors.inkBg,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          minimumSize: const Size(0, 36),
                        ),
                        child: const Text('Đăng nhập'),
                      ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildDiscussionItem(DiscussionItem item, Color textColor, bool isDark) {
    final firstChar = (item.user.isNotEmpty ? item.user[0] : 'U').toUpperCase();

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Avatar
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: AppColors.avatarGradient,
            border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
          ),
          alignment: Alignment.center,
          child: Text(
            firstChar,
            style: GoogleFonts.inter(
              color: AppColors.gold,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(width: 12),
        // Nội dung
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      item.user,
                      style: GoogleFonts.inter(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w600,
                        color: textColor,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Text(
                    _formatTime(item.createdAt),
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: AppColors.inkMuted,
                    ),
                  ),
                  if (item.id.isNotEmpty) ...[
                    const SizedBox(width: 4),
                    IconButton(
                      onPressed: () => _reportDiscussion(item),
                      icon: const Icon(Icons.flag_outlined, size: 16),
                      color: AppColors.inkMuted,
                      tooltip: 'Báo cáo bình luận',
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                      visualDensity: VisualDensity.compact,
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 4),
              Text(
                item.content,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: textColor.withValues(alpha: 0.9),
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
