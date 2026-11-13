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

class AdminSchedulesScreen extends ConsumerStatefulWidget {
  const AdminSchedulesScreen({super.key});

  @override
  ConsumerState<AdminSchedulesScreen> createState() =>
      _AdminSchedulesScreenState();
}

class _AdminSchedulesScreenState extends ConsumerState<AdminSchedulesScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _status = 'pending';
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

  void _refresh() => ref.invalidate(adminSchedulesProvider(_query));

  Future<void> _runAction(Future<void> Function() task, String successMsg) async {
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
          SnackBar(content: Text(apiErrorMessage(e, 'Thao tác thất bại.'))),
        );
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _pickAndReschedule(AdminScheduleItem item) async {
    final baseLocal = item.publishAt?.toLocal() ??
        DateTime.now().add(const Duration(hours: 1));
    final pickedDate = await showDatePicker(
      context: context,
      initialDate: baseLocal.isBefore(DateTime.now()) ? DateTime.now() : baseLocal,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365 * 2)),
    );
    if (pickedDate == null || !mounted) return;

    final pickedTime = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(baseLocal),
    );
    if (pickedTime == null || !mounted) return;

    final newDt = DateTime(
      pickedDate.year,
      pickedDate.month,
      pickedDate.day,
      pickedTime.hour,
      pickedTime.minute,
    );
    await _runAction(
      () => ref.read(adminApiProvider).rescheduleChapter(item.id, newDt),
      'Đã đổi lịch đăng sang ${_dateFormat.format(newDt)}',
    );
  }

  Future<void> _confirmCancel(AdminScheduleItem item) async {
    bool deleteChapter = false;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Hủy lịch xuất bản'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Chương ${item.chapterNumber}: ${item.title}',
                style: GoogleFonts.inter(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 10),
              CheckboxListTile(
                contentPadding: EdgeInsets.zero,
                value: deleteChapter,
                onChanged: (v) => setDialogState(() => deleteChapter = v ?? false),
                title: Text(
                  'Xóa luôn chương này (nếu không chọn, chương sẽ xuất bản ngay)',
                  style: GoogleFonts.inter(fontSize: 12.5),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Đóng'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx, true),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.red400,
                foregroundColor: Colors.white,
              ),
              child: const Text('Xác nhận'),
            ),
          ],
        ),
      ),
    );

    if (confirmed == true) {
      await _runAction(
        () => ref
            .read(adminApiProvider)
            .cancelSchedule(item.id, deleteChapter: deleteChapter),
        deleteChapter
            ? 'Đã xóa chương hẹn giờ.'
            : 'Đã hủy lịch hẹn và xuất bản chương.',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final schedulesAsync = ref.watch(adminSchedulesProvider(_query));

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
                        'Lịch đăng chương',
                        style: GoogleFonts.notoSerif(
                          color: AppColors.inkText,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Theo dõi, xuất bản sớm hoặc đổi giờ hẹn đăng chương',
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

            if (schedulesAsync.asData?.value case final loaded?) ...[
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
                hintText: 'Tìm tên truyện hoặc tiêu đề chương...',
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
                  _buildFilterChip('Chờ đăng', 'pending'),
                  const SizedBox(width: 8),
                  _buildFilterChip('Đã đăng', 'published'),
                  const SizedBox(width: 8),
                  _buildFilterChip('Tất cả', 'all'),
                ],
              ),
            ),
            const SizedBox(height: 12),

            Expanded(
              child: schedulesAsync.when(
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
                      icon: Icons.event_available_outlined,
                      title: 'Không có chương nào',
                      subtitle: 'Chưa có lịch hẹn đăng chương khớp bộ lọc hiện tại.',
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
                          itemBuilder: (_, idx) => _buildScheduleCard(res.items[idx]),
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

  Widget _buildStatsBar(AdminScheduleStats stats) {
    return Row(
      children: [
        _statPill('Chờ đăng', '${stats.pendingCount}', AppColors.amber400),
        const SizedBox(width: 8),
        _statPill('Hôm nay', '${stats.publishedTodayCount}', AppColors.emerald),
        const SizedBox(width: 8),
        _statPill('Số truyện', '${stats.storiesCount}', AppColors.blue400),
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
    final selected = _status == value;
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      selectedColor: AppColors.goldLight,
      onSelected: (_) => setState(() {
        _status = value;
        _page = 1;
      }),
    );
  }

  Widget _buildScheduleCard(AdminScheduleItem item) {
    final badgeColor = item.isPublished ? AppColors.emerald : AppColors.amber400;
    final publishText = item.publishAt != null
        ? _dateFormat.format(item.publishAt!.toLocal())
        : 'Chưa xác định';

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
                child: Text(
                  item.storyTitle,
                  style: GoogleFonts.inter(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.gold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: badgeColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  item.isPublished ? 'Đã xuất bản' : 'Đang chờ',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: badgeColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'Chương ${item.chapterNumber}: ${item.title}',
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.inkText,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Lịch phát hành: $publishText',
            style: GoogleFonts.inter(fontSize: 12, color: AppColors.inkMuted),
          ),
          if (!item.isPublished) ...[
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                ElevatedButton.icon(
                  onPressed: _busy
                      ? null
                      : () => _runAction(
                            () => ref
                                .read(adminApiProvider)
                                .publishScheduleNow(item.id),
                            'Đã xuất bản chương ngay lập tức!',
                          ),
                  icon: const Icon(Icons.publish, size: 15),
                  label: const Text('Đăng ngay'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.emerald,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  ),
                ),
                OutlinedButton.icon(
                  onPressed: _busy ? null : () => _pickAndReschedule(item),
                  icon: const Icon(Icons.schedule, size: 15),
                  label: const Text('Đổi lịch'),
                ),
                TextButton.icon(
                  onPressed: _busy ? null : () => _confirmCancel(item),
                  icon: const Icon(Icons.cancel_outlined, size: 15, color: AppColors.red400),
                  label: const Text(
                    'Hủy lịch',
                    style: TextStyle(color: AppColors.red400),
                  ),
                ),
              ],
            ),
          ],
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
