import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/constants/app_colors.dart';
import '../../data/models/admin_model.dart';
import '../../providers/admin_provider.dart';
import '../../widgets/request_error.dart';

class AdminDashboardScreen extends ConsumerStatefulWidget {
  const AdminDashboardScreen({super.key});
  @override
  ConsumerState<AdminDashboardScreen> createState() =>
      _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends ConsumerState<AdminDashboardScreen> {
  Timer? _refreshTimer;
  final _currency = NumberFormat.currency(
    locale: 'vi_VN',
    symbol: 'đ',
    decimalDigits: 0,
  );
  final _number = NumberFormat.decimalPattern('vi_VN');

  @override
  void initState() {
    super.initState();
    _refreshTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (mounted) ref.invalidate(dashboardProvider);
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dashboard = ref.watch(dashboardProvider);
    return RefreshIndicator(
      onRefresh: () => ref
          .refresh(dashboardProvider.future)
          .then<void>((_) {}, onError: (Object error, StackTrace stack) {}),
      child: ListView(
        padding: const EdgeInsets.all(16),
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Tổng quan hệ thống',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
              ),
              IconButton(
                tooltip: 'Làm mới',
                onPressed: () => ref.invalidate(dashboardProvider),
                icon: const Icon(Icons.refresh),
              ),
            ],
          ),
          const Text(
            'Tự cập nhật mỗi 30 giây',
            style: TextStyle(color: AppColors.inkMuted),
          ),
          const SizedBox(height: 16),
          dashboard.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, _) => RequestError(
              error: error,
              onRetry: () => ref.invalidate(dashboardProvider),
            ),
            data: (data) => _buildDashboard(data),
          ),
        ],
      ),
    );
  }

  Widget _buildDashboard(DashboardData data) {
    final overview = data.overview;
    final growth = overview.revenueGrowthPercent;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        LayoutBuilder(
          builder: (context, constraints) {
            final width = constraints.maxWidth >= 600
                ? (constraints.maxWidth - 12) / 2
                : constraints.maxWidth;
            return Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                _stat(
                  width,
                  'Doanh thu hôm nay',
                  _currency.format(overview.todayRevenue),
                  '${growth >= 0 ? '+' : ''}${_number.format(growth)}% so với hôm qua',
                ),
                _stat(
                  width,
                  'Người dùng',
                  _number.format(overview.totalUsers),
                  '${overview.newUsersThisWeek} người mới trong 7 ngày',
                ),
                _stat(
                  width,
                  'Lượt theo dõi',
                  _number.format(overview.totalFollows),
                  '${overview.totalStories} truyện trong hệ thống',
                ),
                _stat(
                  width,
                  'Lượt đọc',
                  _number.format(overview.totalChapterViews),
                  'Tổng lượt xem các chương',
                ),
              ],
            );
          },
        ),
        const SizedBox(height: 24),
        const Text(
          'Giao dịch gần đây',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        if (data.transactions.isEmpty)
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text('Chưa có giao dịch.'),
          ),
        ...data.transactions.map((tx) {
          final status = switch (tx.status) {
            'Success' => 'Thành công',
            'Failed' => 'Thất bại',
            'Pending' => 'Đang chờ',
            _ => tx.status,
          };
          final color = tx.status == 'Success'
              ? AppColors.green400
              : tx.status == 'Failed'
              ? AppColors.red400
              : AppColors.gold;
          return Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          tx.userName.isEmpty ? tx.userEmail : tx.userName,
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _currency.format(tx.amount),
                        style: const TextStyle(
                          color: AppColors.gold,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    tx.userEmail,
                    style: const TextStyle(color: AppColors.inkMuted),
                  ),
                  const SizedBox(height: 8),
                  Text('${tx.type} · ${tx.provider}'),
                  Wrap(
                    spacing: 12,
                    runSpacing: 4,
                    children: [
                      Text(status, style: TextStyle(color: color)),
                      Text(
                        DateFormat(
                          'dd/MM/yyyy HH:mm',
                        ).format(tx.createdAt.toLocal()),
                        style: const TextStyle(color: AppColors.inkMuted),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        }),
        const SizedBox(height: 24),
        const Text(
          'Hoạt động mới nhất',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        if (data.activities.isEmpty)
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text('Chưa có hoạt động.'),
          ),
        ...data.activities.map(
          (activity) => Card(
            child: ListTile(
              leading: Icon(switch (activity.type) {
                'user_registered' => Icons.person_add_outlined,
                'subscription_created' => Icons.payments_outlined,
                _ => Icons.menu_book_outlined,
              }, color: AppColors.gold),
              title: Text(activity.title),
              subtitle: Text(
                '${activity.description}\n${DateFormat('dd/MM/yyyy HH:mm').format(activity.timestamp.toLocal())}',
              ),
              isThreeLine: true,
            ),
          ),
        ),
      ],
    );
  }

  Widget _stat(double width, String title, String value, String detail) =>
      SizedBox(
        width: width,
        child: Card(
          margin: EdgeInsets.zero,
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: AppColors.inkMuted)),
                const SizedBox(height: 8),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                    color: AppColors.gold,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  detail,
                  style: const TextStyle(
                    color: AppColors.inkMuted,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
}
