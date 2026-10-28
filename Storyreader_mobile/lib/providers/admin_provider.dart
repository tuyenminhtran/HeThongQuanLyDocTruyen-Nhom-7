import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/api/admin_api.dart';
import '../data/models/admin_model.dart';
import 'auth_provider.dart';

final adminApiProvider = Provider<AdminApi>((ref) => AdminApi());

final genresProvider = FutureProvider.autoDispose<List<Genre>>((ref) {
  ref.watch(authProvider.select((auth) => auth.accessToken));
  return ref.watch(adminApiProvider).getGenres();
});

final adminUsersProvider = FutureProvider.autoDispose
    .family<List<AdminUser>, String>((ref, keyword) {
      ref.watch(authProvider.select((auth) => auth.accessToken));
      return ref.watch(adminApiProvider).getUsers(keyword);
    });

final dashboardProvider = FutureProvider.autoDispose<DashboardData>((ref) {
  ref.watch(authProvider.select((auth) => auth.accessToken));
  return ref.watch(adminApiProvider).getDashboard();
});

class AdminTransactionQuery {
  final String? status;
  final String? keyword;
  final int page;
  final int pageSize;

  const AdminTransactionQuery({
    this.status,
    this.keyword,
    this.page = 1,
    this.pageSize = 20,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AdminTransactionQuery &&
          runtimeType == other.runtimeType &&
          status == other.status &&
          keyword == other.keyword &&
          page == other.page &&
          pageSize == other.pageSize;

  @override
  int get hashCode =>
      (status?.hashCode ?? 0) ^
      (keyword?.hashCode ?? 0) ^
      page.hashCode ^
      pageSize.hashCode;
}

final adminTransactionsProvider = FutureProvider.autoDispose
    .family<AdminTransactionsResponse, AdminTransactionQuery>((ref, query) {
  ref.watch(authProvider.select((auth) => auth.accessToken));
  return ref.watch(adminApiProvider).getAdminTransactions(
        status: query.status,
        keyword: query.keyword,
        page: query.page,
        pageSize: query.pageSize,
      );
});
