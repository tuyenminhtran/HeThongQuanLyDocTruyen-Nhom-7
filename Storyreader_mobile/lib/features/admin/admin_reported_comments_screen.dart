import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../core/constants/app_colors.dart';
import '../../core/network/api_error.dart';
import '../../data/models/admin_model.dart';
import '../../providers/admin_provider.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/request_error.dart';

class AdminReportedCommentsScreen extends ConsumerStatefulWidget {
  const AdminReportedCommentsScreen({super.key});

  @override
  ConsumerState<AdminReportedCommentsScreen> createState() =>
      _AdminReportedCommentsScreenState();
}

class _AdminReportedCommentsScreenState
    extends ConsumerState<AdminReportedCommentsScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _status = 'reported';
  String _search = '';
  int _page = 1;
  bool _busy = false;
  final DateFormat _dateFormat = DateFormat('dd/MM/yyyy HH:mm');

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  AdminPagedQuery get _query =>
      AdminPagedQuery(status: _status, keyword: _search, page: _page);

  void _refresh() => ref.invalidate(adminReportedCommentsProvider(_query));

  Future<void> _moderate(
    Future<void> Function() task,
    String successMsg,
  ) async {
    setState(() => _busy = true);
    try {
      await task();
      _refresh();
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(successMsg)));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(apiErrorMessage(e, 'Không thể xử lý bình luận.'))),
        );
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _confirmDelete(AdminReportedCommentItem item) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xóa vĩnh viễn bình luận?'),
        content: Text(
          'Hành động này sẽ xóa bình luận của "${item.userName}" và không thể khôi phục.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.red400,
              foregroundColor: Colors.white,
            ),
            child: const Text('Xóa'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await _moderate(
        () => ref.read(adminApiProvider).deleteReportedComment(item.id),
        'Đã xóa bình luận.',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final commentsAsync = ref.watch(adminReportedCommentsProvider(_query));

    return Scaffold(
      backgroundColor: AppColors.inkBg,
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Kiểm duyệt bình luận',
                        style: GoogleFonts.notoSerif(
                          color: AppColors.inkText,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Duyệt, ẩn, xóa bình luận bị báo cáo hoặc hạn chế tài khoản vi phạm',
                        style: GoogleFonts.inter(
                          color: AppColors.inkMuted,
                          fontSize: 12.5,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: _busy ? null : _refresh,
                  icon: const Icon(Icons.refresh, color: AppColors.gold),
                  tooltip: 'Làm mới',
                ),
              ],
            ),
            const SizedBox(height: 12),

            if (commentsAsync.asData?.value case final loaded?) ...[
              _buildStatsBar(loaded.stats),
              const SizedBox(height: 12),
            ],

            TextField(
              controller: _searchController,
              onSubmitted: (val) => setState(() {
                _search = val.trim();
                _page = 1;
              }),
              decoration: InputDecoration(
                hintText: 'Tìm nội dung, lý do, người dùng hoặc truyện...',
                prefixIcon: const Icon(Icons.search, size: 18),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {
                            _search = '';
                            _page = 1;
                          });
                        },
                      )
                    : null,
                isDense: true,
              ),
            ),
            const SizedBox(height: 10),

            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('Bị báo cáo', 'reported'),
                  const SizedBox(width: 8),
                  _buildFilterChip('Đã ẩn', 'hidden'),
                  const SizedBox(width: 8),
                  _buildFilterChip('Hiển thị', 'visible'),
                  const SizedBox(width: 8),
                  _buildFilterChip('Tất cả', 'all'),
                ],
              ),
            ),
            const SizedBox(height: 12),

            Expanded(
              child: commentsAsync.when(
                loading: () => const Center(
                  child: CircularProgressIndicator(color: AppColors.gold),
                ),
                error: (err, _) => RequestError(
                  error: err,
                  onRetry: _refresh,
                ),
                data: (res) {
                  if (res.items.isEmpty) {
                    return const EmptyState(
                      icon: Icons.verified_user_outlined,
                      title: 'Không có bình luận nào',
                      subtitle: 'Chưa có bình luận khớp trạng thái lọc hiện tại.',
                    );
                  }
                  final totalPages =
                      (res.totalCount / res.pageSize).ceil().clamp(1, 9999);
                  return Column(
                    children: [
                      Expanded(
                        child: ListView.separated(
                          itemCount: res.items.length,
                          separatorBuilder: (_, _) => const SizedBox(height: 10),
                          itemBuilder: (_, idx) => _buildCommentCard(res.items[idx]),
                        ),
                      ),
                      if (totalPages > 1)
                        _buildPagination(res.page, totalPages),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsBar(AdminReportedCommentStats stats) {
    return Row(
      children: [
        _statPill('Chờ duyệt', '${stats.reportedCount}', AppColors.amber400),
        const SizedBox(width: 8),
        _statPill('Đã ẩn', '${stats.hiddenCount}', AppColors.red400),
        const SizedBox(width: 8),
        _statPill('TK bị khóa', '${stats.restrictedUsersCount}', AppColors.purple400),
      ],
    );
  }

  Widget _statPill(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.inkCard,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.inkBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: GoogleFonts.inter(fontSize: 11, color: AppColors.inkMuted),
            ),
            Text(
              value,
              style: GoogleFonts.spaceMono(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    return ChoiceChip(
      label: Text(label),
      selected: _status == value,
      selectedColor: AppColors.goldLight,
      onSelected: (_) => setState(() {
        _status = value;
        _page = 1;
      }),
    );
  }

  Widget _buildCommentCard(AdminReportedCommentItem item) {
    final api = ref.read(adminApiProvider);
    final isHidden = item.statusName.toLowerCase() == 'hidden';
    final isVisible = item.statusName.toLowerCase() == 'visible';
    final statusColor = isHidden
        ? AppColors.red400
        : (isVisible ? AppColors.emerald : AppColors.amber400);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.inkCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.inkBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Row(
                  children: [
                    Flexible(
                      child: Text(
                        item.userName,
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.bold,
                          fontSize: 13.5,
                          color: AppColors.inkText,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (item.isUserRestricted) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.red400.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'Bị hạn chế',
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: AppColors.red400,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  isHidden
                      ? 'Đã ẩn'
                      : (isVisible ? 'Hiển thị' : 'Báo cáo (${item.reportCount})'),
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            '${item.storyTitle} · Chương ${item.chapterNumber}'
            '${item.createdAt != null ? ' · ${_dateFormat.format(item.createdAt!.toLocal())}' : ''}',
            style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.inkMuted),
          ),
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.inkElevated,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.inkBorder),
            ),
            child: Text(
              item.content,
              style: GoogleFonts.inter(fontSize: 13, color: AppColors.inkText),
            ),
          ),
          if (item.reportReason != null && item.reportReason!.trim().isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              'Lý do báo cáo: ${item.reportReason}',
              style: GoogleFonts.inter(
                fontSize: 12,
                color: AppColors.red400,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              if (!isVisible)
                ElevatedButton.icon(
                  onPressed: _busy
                      ? null
                      : () => _moderate(
                            () => api.approveReportedComment(item.id),
                            'Đã duyệt bình luận hợp lệ.',
                          ),
                  icon: const Icon(Icons.check_circle_outline, size: 15),
                  label: const Text('Duyệt'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.emerald,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  ),
                ),
              if (!isHidden)
                OutlinedButton.icon(
                  onPressed: _busy
                      ? null
                      : () => _moderate(
                            () => api.hideReportedComment(item.id),
                            'Đã ẩn bình luận.',
                          ),
                  icon: const Icon(Icons.visibility_off_outlined, size: 15),
                  label: const Text('Ẩn'),
                ),
              OutlinedButton.icon(
                onPressed: _busy
                    ? null
                    : () => _moderate(
                          () => api.restrictReportedCommentUser(item.id),
                          item.isUserRestricted
                              ? 'Đã bỏ hạn chế tài khoản.'
                              : 'Đã hạn chế tài khoản bình luận.',
                        ),
                icon: Icon(
                  item.isUserRestricted
                      ? Icons.lock_open_outlined
                      : Icons.block_outlined,
                  size: 15,
                  color: AppColors.purple400,
                ),
                label: Text(
                  item.isUserRestricted ? 'Mở khóa TK' : 'Khóa TK',
                  style: const TextStyle(color: AppColors.purple400),
                ),
              ),
              TextButton.icon(
                onPressed: _busy ? null : () => _confirmDelete(item),
                icon: const Icon(Icons.delete_outline, size: 15, color: AppColors.red400),
                label: const Text(
                  'Xóa',
                  style: TextStyle(color: AppColors.red400),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPagination(int page, int totalPages) {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          IconButton(
            onPressed: page > 1 ? () => setState(() => _page--) : null,
            icon: const Icon(Icons.chevron_left),
          ),
          Text('Trang $page / $totalPages', style: GoogleFonts.inter(fontSize: 12.5)),
          IconButton(
            onPressed: page < totalPages ? () => setState(() => _page++) : null,
            icon: const Icon(Icons.chevron_right),
          ),
        ],
      ),
    );
  }
}
