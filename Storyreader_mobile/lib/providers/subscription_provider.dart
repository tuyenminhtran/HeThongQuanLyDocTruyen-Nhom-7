import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/models/payment_model.dart';
import '../data/repositories/subscription_repository.dart';
import 'auth_provider.dart';

final subscriptionRepositoryProvider = Provider<ISubscriptionRepository>((ref) {
  return SubscriptionRepository();
});

/// Danh sách gói cước VIP kích hoạt từ API backend
final subscriptionPlansProvider = FutureProvider.autoDispose<List<SubscriptionPlanItem>>((ref) async {
  final repo = ref.watch(subscriptionRepositoryProvider);
  return await repo.getPlans();
});

/// Danh sách gói cước người dùng hiện tại đang đăng ký
final mySubscriptionsProvider = FutureProvider.autoDispose<List<MySubscriptionItem>>((ref) async {
  final auth = ref.watch(authProvider);
  if (!auth.isAuthenticated) return [];
  final repo = ref.watch(subscriptionRepositoryProvider);
  return await repo.getMySubscriptions();
});

/// Danh sách truyện đã mua của người dùng
final myPurchasesProvider = FutureProvider.autoDispose<List<MyPurchaseItem>>((ref) async {
  final auth = ref.watch(authProvider);
  if (!auth.isAuthenticated) return [];
  final repo = ref.watch(subscriptionRepositoryProvider);
  return await repo.getMyPurchases();
});
