import 'package:dio/dio.dart';

import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../models/admin_model.dart';

class AdminApi {
  final Dio _client;
  AdminApi({Dio? dio}) : _client = dio ?? DioClient.instance;

  Future<List<Genre>> getGenres() async {
    final res = await _client.get('/genres');
    return (res.data as List)
        .map((e) => Genre.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<Genre> createGenre(String name) async {
    final res = await _client.post('/genres', data: {'name': name.trim()});
    return Genre.fromJson(Map<String, dynamic>.from(res.data as Map));
  }

  Future<Genre> updateGenre(String id, String name) async {
    final res = await _client.put('/genres/$id', data: {'name': name.trim()});
    return Genre.fromJson(Map<String, dynamic>.from(res.data as Map));
  }

  Future<void> deleteGenre(String id) async => _client.delete('/genres/$id');

  Future<List<AdminUser>> getUsers(String keyword) async {
    final res = await _client.get(
      '/admin/users',
      queryParameters: {
        if (keyword.trim().isNotEmpty) 'keyword': keyword.trim(),
      },
    );
    return (res.data as List)
        .map((e) => AdminUser.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<void> toggleUserRestriction(String id) async =>
      _client.put('/admin/users/$id/toggle-restriction');

  Future<DashboardOverview> getOverview() async {
    final res = await _client.get('/admin/stats/overview');
    return DashboardOverview.fromJson(
      Map<String, dynamic>.from(res.data as Map),
    );
  }

  Future<List<RecentTransaction>> getTransactions() async {
    final res = await _client.get(
      '/admin/stats/recent-transactions',
      queryParameters: {'limit': 5},
    );
    return (res.data as List)
        .map(
          (e) =>
              RecentTransaction.fromJson(Map<String, dynamic>.from(e as Map)),
        )
        .toList();
  }

  Future<List<RecentActivity>> getActivities() async {
    final res = await _client.get(
      '/admin/stats/recent-activities',
      queryParameters: {'limit': 6},
    );
    return (res.data as List)
        .map(
          (e) => RecentActivity.fromJson(Map<String, dynamic>.from(e as Map)),
        )
        .toList();
  }

  Future<DashboardData> getDashboard() async {
    final result = await Future.wait<Object>([
      getOverview(),
      getTransactions(),
      getActivities(),
    ]);
    return DashboardData(
      overview: result[0] as DashboardOverview,
      transactions: result[1] as List<RecentTransaction>,
      activities: result[2] as List<RecentActivity>,
    );
  }

  // Quản lý giao dịch cho Admin (PB28)
  Future<AdminTransactionsResponse> getAdminTransactions({
    String? status,
    String? keyword,
    int page = 1,
    int pageSize = 20,
  }) async {
    final res = await _client.get(
      '/admin/transactions',
      queryParameters: {
        if (status != null && status.isNotEmpty) 'status': status,
        if (keyword != null && keyword.trim().isNotEmpty) 'keyword': keyword.trim(),
        'page': page,
        'pageSize': pageSize,
      },
    );
    return AdminTransactionsResponse.fromJson(Map<String, dynamic>.from(res.data as Map));
  }

  Future<void> forceActivateTransaction(String id) async =>
      _client.post('/admin/transactions/$id/force-activate');

  Future<void> markTransactionFailed(String id) async =>
      _client.post('/admin/transactions/$id/mark-failed');

  // Quản lý lịch đăng chương (AdminSchedules)
  Future<AdminSchedulesResponse> getAdminSchedules({
    String status = 'pending',
    String? search,
    String? storyId,
    int page = 1,
    int pageSize = 20,
  }) async {
    final res = await _client.get(
      ApiConstants.adminSchedules,
      queryParameters: {
        'status': status,
        if (search != null && search.trim().isNotEmpty) 'search': search.trim(),
        if (storyId != null && storyId.isNotEmpty) 'storyId': storyId,
        'page': page,
        'pageSize': pageSize,
      },
    );
    return AdminSchedulesResponse.fromJson(Map<String, dynamic>.from(res.data as Map));
  }

  Future<void> publishScheduleNow(String chapterId) async =>
      _client.post(ApiConstants.adminSchedulePublishNow(chapterId));

  Future<void> rescheduleChapter(String chapterId, DateTime publishAt) async =>
      _client.put(
        ApiConstants.adminScheduleReschedule(chapterId),
        data: {'publishAt': publishAt.toUtc().toIso8601String()},
      );

  Future<void> cancelSchedule(String chapterId, {bool deleteChapter = false}) async =>
      _client.delete(
        ApiConstants.adminScheduleCancel(chapterId),
        queryParameters: {'deleteChapter': deleteChapter},
      );

  // Quản lý bình luận bị báo cáo (AdminReportedComments)
  Future<AdminReportedCommentsResponse> getReportedComments({
    String status = 'reported',
    String? search,
    int page = 1,
    int pageSize = 20,
  }) async {
    final res = await _client.get(
      ApiConstants.adminReportedComments,
      queryParameters: {
        'status': status,
        if (search != null && search.trim().isNotEmpty) 'search': search.trim(),
        'page': page,
        'pageSize': pageSize,
      },
    );
    return AdminReportedCommentsResponse.fromJson(Map<String, dynamic>.from(res.data as Map));
  }

  Future<void> approveReportedComment(String id) async =>
      _client.put(ApiConstants.adminReportedCommentApprove(id));

  Future<void> hideReportedComment(String id) async =>
      _client.put(ApiConstants.adminReportedCommentHide(id));

  Future<void> deleteReportedComment(String id) async =>
      _client.delete(ApiConstants.adminReportedCommentDelete(id));

  Future<void> restrictReportedCommentUser(String id) async =>
      _client.post(ApiConstants.adminReportedCommentRestrictUser(id));
}
