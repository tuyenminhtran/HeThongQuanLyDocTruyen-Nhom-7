import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/models/notification_model.dart';
import '../data/repositories/notification_repository.dart';
import 'auth_provider.dart';

final notificationRepositoryProvider = Provider<INotificationRepository>((ref) {
  return NotificationRepository();
});

/// Provider số lượng thông báo chưa đọc, tự động làm mới hoặc khi đăng nhập thay đổi
final unreadNotificationCountProvider = FutureProvider.autoDispose<int>((ref) async {
  final auth = ref.watch(authProvider);
  if (!auth.isAuthenticated) return 0;

  final repo = ref.watch(notificationRepositoryProvider);
  final cancelToken = CancelToken();
  ref.onDispose(() => cancelToken.cancel('Hủy polling thông báo chưa đọc'));

  return await repo.getUnreadCount(cancelToken: cancelToken);
});

/// Provider danh sách thông báo người dùng
final notificationsListProvider = FutureProvider.autoDispose<NotificationPageResult>((ref) async {
  final auth = ref.watch(authProvider);
  if (!auth.isAuthenticated) {
    return NotificationPageResult(unreadCount: 0, items: const []);
  }

  final repo = ref.watch(notificationRepositoryProvider);
  final cancelToken = CancelToken();
  ref.onDispose(() => cancelToken.cancel('Hủy tải danh sách thông báo'));

  return await repo.getNotifications(page: 1, pageSize: 20, cancelToken: cancelToken);
});

/// Controller xử lý hành động với thông báo (đánh dấu đã đọc, đánh dấu tất cả đã đọc)
class NotificationNotifier extends StateNotifier<AsyncValue<void>> {
  final Ref _ref;

  NotificationNotifier(this._ref) : super(const AsyncValue.data(null));

  Future<void> markAsRead(String id) async {
    state = const AsyncValue.loading();
    try {
      final repo = _ref.read(notificationRepositoryProvider);
      await repo.markAsRead(id);
      _ref.invalidate(unreadNotificationCountProvider);
      _ref.invalidate(notificationsListProvider);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> markAllAsRead() async {
    state = const AsyncValue.loading();
    try {
      final repo = _ref.read(notificationRepositoryProvider);
      await repo.markAllAsRead();
      _ref.invalidate(unreadNotificationCountProvider);
      _ref.invalidate(notificationsListProvider);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  void refresh() {
    _ref.invalidate(unreadNotificationCountProvider);
    _ref.invalidate(notificationsListProvider);
  }
}

final notificationNotifierProvider =
    StateNotifierProvider<NotificationNotifier, AsyncValue<void>>((ref) {
  return NotificationNotifier(ref);
});

