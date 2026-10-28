import 'package:dio/dio.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../models/notification_model.dart';

abstract class INotificationRepository {
  Future<NotificationPageResult> getNotifications({
    int page = 1,
    int pageSize = 20,
    CancelToken? cancelToken,
  });

  Future<int> getUnreadCount({CancelToken? cancelToken});

  Future<void> markAsRead(String id);

  Future<void> markAllAsRead();
}

class NotificationRepository implements INotificationRepository {
  final Dio _dio;

  NotificationRepository({Dio? dio}) : _dio = dio ?? DioClient.instance;

  @override
  Future<NotificationPageResult> getNotifications({
    int page = 1,
    int pageSize = 20,
    CancelToken? cancelToken,
  }) async {
    return DioClient.safeRequest(() async {
      final res = await _dio.get(
        ApiConstants.notifications,
        queryParameters: {'page': page, 'pageSize': pageSize},
        cancelToken: cancelToken,
      );
      final data = res.data;
      if (data is Map) {
        return NotificationPageResult.fromJson(Map<String, dynamic>.from(data));
      }
      return NotificationPageResult(unreadCount: 0, items: const []);
    });
  }

  @override
  Future<int> getUnreadCount({CancelToken? cancelToken}) async {
    return DioClient.safeRequest(() async {
      final res = await _dio.get(
        ApiConstants.notificationsUnreadCount,
        cancelToken: cancelToken,
      );
      if (res.data is Map && res.data['unreadCount'] is num) {
        return (res.data['unreadCount'] as num).toInt();
      }
      return 0;
    });
  }

  @override
  Future<void> markAsRead(String id) async {
    return DioClient.safeRequest(() async {
      await _dio.put(ApiConstants.notificationRead(id));
    });
  }

  @override
  Future<void> markAllAsRead() async {
    return DioClient.safeRequest(() async {
      await _dio.put(ApiConstants.notificationReadAll);
    });
  }
}

