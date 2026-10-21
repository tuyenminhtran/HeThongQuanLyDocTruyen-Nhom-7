import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/constants/app_colors.dart';
import '../../core/network/api_error.dart';
import '../../data/models/admin_model.dart';
import '../../providers/admin_provider.dart';
import '../../widgets/request_error.dart';

class AdminUsersScreen extends ConsumerStatefulWidget {
  const AdminUsersScreen({super.key});
  @override
  ConsumerState<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends ConsumerState<AdminUsersScreen> {
  final _search = TextEditingController();
  final Set<String> _pending = {};
  Timer? _debounce;
  String _keyword = '';

  @override
  void dispose() {
    _debounce?.cancel();
    _search.dispose();
    super.dispose();
  }

  void _searchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), () {
      if (mounted) setState(() => _keyword = value.trim());
    });
  }

  Future<void> _toggle(AdminUser user) async {
    if (user.isAdmin || _pending.contains(user.id)) return;
    final action = user.isRestricted ? 'mở khóa' : 'khóa';
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Xác nhận $action tài khoản'),
        content: Text('Bạn muốn $action tài khoản ${user.name}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Xác nhận'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    setState(() => _pending.add(user.id));
    try {
      await ref.read(adminApiProvider).toggleUserRestriction(user.id);
      if (!mounted) return;
      ref.invalidate(adminUsersProvider);
      ref.invalidate(dashboardProvider);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Đã $action tài khoản ${user.name}.')),
      );
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              apiErrorMessage(
                error,
                'Không thay đổi được trạng thái tài khoản.',
              ),
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _pending.remove(user.id));
    }
  }

  @override
  Widget build(BuildContext context) {
    final users = ref.watch(adminUsersProvider(_keyword));
    return RefreshIndicator(
      onRefresh: () => ref
          .refresh(adminUsersProvider(_keyword).future)
          .then<void>((_) {}, onError: (Object error, StackTrace stack) {}),
      child: ListView(
        padding: const EdgeInsets.all(16),
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          const Text(
            'Quản lý người dùng',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _search,
            onChanged: _searchChanged,
            decoration: const InputDecoration(
              hintText: 'Tìm theo email hoặc tên...',
              prefixIcon: Icon(Icons.search),
            ),
          ),
          const SizedBox(height: 16),
          users.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, _) => RequestError(
              error: error,
              onRetry: () => ref.invalidate(adminUsersProvider(_keyword)),
            ),
            data: (items) => items.isEmpty
                ? const Padding(
                    padding: EdgeInsets.all(24),
                    child: Text('Không tìm thấy người dùng phù hợp.'),
                  )
                : Column(
                    children: items
                        .map(
                          (user) => Card(
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    user.name,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  Text(user.email),
                                  const SizedBox(height: 6),
                                  Text(
                                    'Tham gia: ${DateFormat('dd/MM/yyyy').format(user.createdAt.toLocal())}',
                                    style: const TextStyle(
                                      color: AppColors.inkMuted,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Wrap(
                                    spacing: 10,
                                    runSpacing: 4,
                                    crossAxisAlignment:
                                        WrapCrossAlignment.center,
                                    children: [
                                      Chip(label: Text(user.role)),
                                      Text(
                                        user.isRestricted
                                            ? 'Đã khóa'
                                            : 'Hoạt động',
                                        style: TextStyle(
                                          color: user.isRestricted
                                              ? AppColors.red400
                                              : AppColors.green400,
                                        ),
                                      ),
                                      if (user.isAdmin)
                                        const Text(
                                          'Tài khoản quản trị',
                                          style: TextStyle(
                                            color: AppColors.inkMuted,
                                          ),
                                        )
                                      else
                                        OutlinedButton.icon(
                                          onPressed: _pending.contains(user.id)
                                              ? null
                                              : () => _toggle(user),
                                          icon: Icon(
                                            user.isRestricted
                                                ? Icons.lock_open
                                                : Icons.lock_outline,
                                            size: 18,
                                          ),
                                          label: Text(
                                            _pending.contains(user.id)
                                                ? 'Đang lưu...'
                                                : user.isRestricted
                                                ? 'Mở khóa'
                                                : 'Khóa',
                                          ),
                                        ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        )
                        .toList(),
                  ),
          ),
        ],
      ),
    );
  }
}
