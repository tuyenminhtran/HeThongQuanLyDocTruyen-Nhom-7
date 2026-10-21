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
