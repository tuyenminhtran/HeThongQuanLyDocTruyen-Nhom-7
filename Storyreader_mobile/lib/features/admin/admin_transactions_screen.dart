import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../core/constants/app_colors.dart';
import '../../data/models/admin_model.dart';
import '../../providers/admin_provider.dart';

class AdminTransactionsScreen extends ConsumerStatefulWidget {
  const AdminTransactionsScreen({super.key});

  @override
  ConsumerState<AdminTransactionsScreen> createState() =>
      _AdminTransactionsScreenState();
}

class _AdminTransactionsScreenState
    extends ConsumerState<AdminTransactionsScreen> {
  final TextEditingController _searchCtrl = TextEditingController();
  String _keyword = '';
  String? _statusFilter;
  int _currentPage = 1;
  final int _pageSize = 15;

  final NumberFormat _currencyFormat =
      NumberFormat.currency(locale: 'vi_VN', symbol: 'đ', decimalDigits: 0);

  final DateFormat _dateFormat = DateFormat('dd/MM/yyyy HH:mm');

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleForceActivate(
      BuildContext context, AdminTransactionItem tx) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.inkCard,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.inkBorder),
        ),
        title: Row(
          children: [
            const Icon(Icons.bolt, color: AppColors.emerald, size: 24),
            const SizedBox(width: 8),
            Text(
              'Kích hoạt thủ công',
              style: GoogleFonts.notoSerif(
                color: AppColors.inkText,
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Bạn có chắc chắn muốn KÍCH HOẠT THỦ CÔNG cho giao dịch này?',
              style: GoogleFonts.inter(color: AppColors.inkText, fontSize: 14),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.inkBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.inkBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Mã GD: ${tx.providerTransactionRef}',
                    style: GoogleFonts.firaCode(
                      color: AppColors.gold,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Khách hàng: ${tx.userDisplayName.isNotEmpty ? tx.userDisplayName : tx.userEmail}',
                    style: GoogleFonts.inter(
                      color: AppColors.inkText,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Số tiền: ${_currencyFormat.format(tx.amount)}',
                    style: GoogleFonts.inter(
                      color: AppColors.emerald,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Hệ thống sẽ cấp bù quyền đọc/gói VIP ngay lập tức cho độc giả.',
              style: GoogleFonts.inter(
                color: AppColors.inkMuted,
                fontSize: 12,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text(
              'Đóng',
              style: GoogleFonts.inter(color: AppColors.inkMuted),
            ),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.emerald,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: Text(
              'Xác nhận kích hoạt',
              style: GoogleFonts.inter(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      try {
        await ref.read(adminApiProvider).forceActivateTransaction(tx.id);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Đã kích hoạt bù quyền lợi thành công!'),
              backgroundColor: AppColors.emerald,
            ),
          );
        }
        ref.invalidate(adminTransactionsProvider);
        ref.invalidate(dashboardProvider);
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Lỗi khi kích hoạt: $e'),
              backgroundColor: AppColors.red400,
            ),
          );
        }
      }
    }
  }

  Future<void> _handleMarkFailed(
      BuildContext context, AdminTransactionItem tx) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.inkCard,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.inkBorder),
        ),
        title: Row(
          children: [
            const Icon(Icons.cancel_outlined, color: AppColors.red400, size: 24),
            const SizedBox(width: 8),
            Text(
              'Hủy giao dịch',
              style: GoogleFonts.notoSerif(
                color: AppColors.inkText,
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ],
        ),
        content: Text(
          'Bạn có chắc chắn muốn HỦY / ĐÁNH DẤU THẤT BẠI cho giao dịch ${tx.providerTransactionRef}?',
          style: GoogleFonts.inter(color: AppColors.inkText, fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text(
              'Quay lại',
              style: GoogleFonts.inter(color: AppColors.inkMuted),
            ),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.red400,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: Text(
              'Đánh dấu thất bại',
              style: GoogleFonts.inter(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      try {
        await ref.read(adminApiProvider).markTransactionFailed(tx.id);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Đã đánh dấu giao dịch thất bại.'),
              backgroundColor: AppColors.amber400,
            ),
          );
        }
        ref.invalidate(adminTransactionsProvider);
        ref.invalidate(dashboardProvider);
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Lỗi khi hủy: $e'),
              backgroundColor: AppColors.red400,
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final query = AdminTransactionQuery(
      status: _statusFilter,
      keyword: _keyword.trim().isEmpty ? null : _keyword.trim(),
      page: _currentPage,
      pageSize: _pageSize,
    );

    final transactionsAsync = ref.watch(adminTransactionsProvider(query));

    return Scaffold(
      backgroundColor: AppColors.inkBg,
      body: Column(
        children: [
          // Header info & Search
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            color: AppColors.inkCard,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      'Quản lý Giao dịch',
                      style: GoogleFonts.notoSerif(
                        color: AppColors.inkText,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.gold.withValues(alpha: 0.15),
                        border: Border.all(
                            color: AppColors.gold.withValues(alpha: 0.3)),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        'PB28',
                        style: GoogleFonts.inter(
                          color: AppColors.gold,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Tra cứu lịch sử nạp tiền, đối soát và kích hoạt bù quyền lợi',
                  style: GoogleFonts.inter(
                    color: AppColors.inkMuted,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 12),
                // Search bar
                TextField(
                  controller: _searchCtrl,
                  style: GoogleFonts.inter(
                    color: AppColors.inkText,
                    fontSize: 13,
                  ),
                  decoration: InputDecoration(
                    hintText: 'Tìm theo email, tên, mã GD...',
                    hintStyle: GoogleFonts.inter(
                      color: AppColors.inkMuted.withValues(alpha: 0.6),
                      fontSize: 13,
                    ),
                    prefixIcon: const Icon(
                      Icons.search,
                      size: 18,
                      color: AppColors.inkMuted,
                    ),
                    suffixIcon: _keyword.isNotEmpty
                        ? IconButton(
                            icon: const Icon(
                              Icons.clear,
                              size: 16,
                              color: AppColors.inkMuted,
                            ),
                            onPressed: () {
                              _searchCtrl.clear();
                              setState(() {
                                _keyword = '';
                                _currentPage = 1;
                              });
                            },
                          )
                        : null,
                    filled: true,
                    fillColor: AppColors.inkBg,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: AppColors.inkBorder),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: AppColors.inkBorder),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: AppColors.gold),
                    ),
                  ),
                  onSubmitted: (val) {
                    setState(() {
                      _keyword = val;
                      _currentPage = 1;
                    });
                  },
                ),
              ],
            ),
          ),

          // Status Filter Tabs
          Container(
            height: 44,
            decoration: const BoxDecoration(
              color: AppColors.inkCard,
              border: Border(
                bottom: BorderSide(color: AppColors.inkBorder),
              ),
            ),
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              children: [
                _buildStatusTab('Tất cả', null, Icons.list_alt),
                const SizedBox(width: 8),
                _buildStatusTab('Chờ xử lý', 'Pending', Icons.schedule),
                const SizedBox(width: 8),
                _buildStatusTab('Thành công', 'Success', Icons.check_circle_outline),
                const SizedBox(width: 8),
                _buildStatusTab('Thất bại', 'Failed', Icons.cancel_outlined),
              ],
            ),
          ),

          // Transaction List
          Expanded(
            child: transactionsAsync.when(
              loading: () => const Center(
                child: CircularProgressIndicator(color: AppColors.gold),
              ),
              error: (err, _) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.error_outline,
                        color: AppColors.red400,
                        size: 40,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Không thể tải dữ liệu giao dịch',
                        style: GoogleFonts.inter(
                          color: AppColors.inkText,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        err.toString(),
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          color: AppColors.inkMuted,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: () => ref.invalidate(
                            adminTransactionsProvider(query)),
                        icon: const Icon(Icons.refresh, size: 16),
                        label: const Text('Thử lại'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.gold,
                          foregroundColor: AppColors.inkBg,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              data: (resp) {
                final items = resp.items;
                final total = resp.total;
                final totalPages = (total / _pageSize).ceil();

                if (items.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.receipt_long_outlined,
                            size: 56,
                            color: AppColors.inkMuted.withValues(alpha: 0.4),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Không có giao dịch nào phù hợp',
                            style: GoogleFonts.inter(
                              color: AppColors.inkText,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Thử đổi bộ lọc hoặc từ khóa tìm kiếm',
                            style: GoogleFonts.inter(
                              color: AppColors.inkMuted,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                return RefreshIndicator(
                  color: AppColors.gold,
                  backgroundColor: AppColors.inkCard,
                  onRefresh: () async {
                    ref.invalidate(adminTransactionsProvider(query));
                  },
                  child: ListView.separated(
                    padding: const EdgeInsets.all(12),
                    itemCount: items.length + (totalPages > 1 ? 1 : 0),
                    separatorBuilder: (context, _) => const SizedBox(height: 10),
                    itemBuilder: (context, idx) {
                      if (idx == items.length) {
                        // Pagination bar
                        return _buildPaginationBar(
                          currentPage: _currentPage,
                          totalPages: totalPages > 0 ? totalPages : 1,
                          totalItems: total,
                        );
                      }

                      final tx = items[idx];
                      return _buildTransactionCard(context, tx);
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusTab(String label, String? key, IconData icon) {
    final isSelected = _statusFilter == key;
    return GestureDetector(
      onTap: () {
        setState(() {
          _statusFilter = key;
          _currentPage = 1;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.gold
              : AppColors.inkBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? AppColors.gold : AppColors.inkBorder,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 14,
              color: isSelected ? AppColors.inkBg : AppColors.inkMuted,
            ),
            const SizedBox(width: 5),
            Text(
              label,
              style: GoogleFonts.inter(
                color: isSelected ? AppColors.inkBg : AppColors.inkMuted,
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTransactionCard(BuildContext context, AdminTransactionItem tx) {
    Color statusColor;
    String statusText;
    IconData statusIcon;

    switch (tx.status) {
      case 'Success':
        statusColor = AppColors.emerald;
        statusText = 'Thành công';
        statusIcon = Icons.check_circle_outline;
        break;
      case 'Failed':
        statusColor = AppColors.red400;
        statusText = 'Thất bại';
        statusIcon = Icons.cancel_outlined;
        break;
      case 'Pending':
      default:
        statusColor = AppColors.amber400;
        statusText = 'Chờ xử lý';
        statusIcon = Icons.schedule;
    }

    final isSubscription = tx.type == 'Subscription';

    return Container(
      decoration: BoxDecoration(
        color: AppColors.inkCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: tx.status == 'Pending'
              ? AppColors.amber400.withValues(alpha: 0.3)
              : AppColors.inkBorder,
        ),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top row: Code + Status Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    const Icon(
                      Icons.receipt,
                      size: 16,
                      color: AppColors.gold,
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        tx.providerTransactionRef,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.firaCode(
                          color: AppColors.inkText,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 3,
                ),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: statusColor.withValues(alpha: 0.25),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(statusIcon, size: 12, color: statusColor),
                    const SizedBox(width: 4),
                    Text(
                      statusText,
                      style: GoogleFonts.inter(
                        color: statusColor,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // User info & Type
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tx.userDisplayName.isNotEmpty
                          ? tx.userDisplayName
                          : 'Người dùng',
                      style: GoogleFonts.inter(
                        color: AppColors.inkText,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      tx.userEmail,
                      style: GoogleFonts.inter(
                        color: AppColors.inkMuted,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 3,
                ),
                decoration: BoxDecoration(
                  color: isSubscription
                      ? AppColors.blue400.withValues(alpha: 0.1)
                      : AppColors.purple400.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isSubscription
                        ? AppColors.blue400.withValues(alpha: 0.25)
                        : AppColors.purple400.withValues(alpha: 0.25),
                  ),
                ),
                child: Text(
                  isSubscription ? 'Gói Hội Viên VIP' : 'Mua Truyện Lẻ',
                  style: GoogleFonts.inter(
                    color: isSubscription
                        ? AppColors.blue400
                        : AppColors.purple400,
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          const Divider(height: 1, color: AppColors.inkBorder),
          const SizedBox(height: 10),

          // Bottom details: Amount, Provider, Date
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _currencyFormat.format(tx.amount),
                    style: GoogleFonts.inter(
                      color: AppColors.gold,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    'Cổng: ${tx.provider.isNotEmpty ? tx.provider : "VNPay"}',
                    style: GoogleFonts.inter(
                      color: AppColors.inkMuted,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    _dateFormat.format(tx.createdAt),
                    style: GoogleFonts.inter(
                      color: AppColors.inkMuted,
                      fontSize: 11,
                    ),
                  ),
                  if (tx.completedAt != null)
                    Text(
                      'Xong: ${_dateFormat.format(tx.completedAt!)}',
                      style: GoogleFonts.inter(
                        color: AppColors.emerald,
                        fontSize: 10,
                      ),
                    ),
                ],
              ),
            ],
          ),

          // Actions for Pending state
          if (tx.status == 'Pending') ...[
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _handleMarkFailed(context, tx),
                    icon: const Icon(
                      Icons.cancel_outlined,
                      size: 15,
                      color: AppColors.red400,
                    ),
                    label: Text(
                      'Đánh dấu thất bại',
                      style: GoogleFonts.inter(
                        color: AppColors.red400,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(
                        color: AppColors.red400.withValues(alpha: 0.3),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _handleForceActivate(context, tx),
                    icon: const Icon(Icons.bolt, size: 15),
                    label: Text(
                      'Kích hoạt bù',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.emerald,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPaginationBar({
    required int currentPage,
    required int totalPages,
    required int totalItems,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Trang $currentPage / $totalPages ($totalItems GD)',
            style: GoogleFonts.inter(
              color: AppColors.inkMuted,
              fontSize: 12,
            ),
          ),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left),
                color: AppColors.inkText,
                disabledColor: AppColors.inkMuted.withValues(alpha: 0.3),
                onPressed: currentPage > 1
                    ? () => setState(() => _currentPage--)
                    : null,
              ),
              IconButton(
                icon: const Icon(Icons.chevron_right),
                color: AppColors.inkText,
                disabledColor: AppColors.inkMuted.withValues(alpha: 0.3),
                onPressed: currentPage < totalPages
                    ? () => setState(() => _currentPage++)
                    : null,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

