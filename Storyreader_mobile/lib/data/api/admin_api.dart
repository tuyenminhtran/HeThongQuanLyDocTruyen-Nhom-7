import 'package:dio/dio.dart';

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
}
