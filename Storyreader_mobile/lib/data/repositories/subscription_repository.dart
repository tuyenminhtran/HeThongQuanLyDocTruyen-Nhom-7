import 'package:dio/dio.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../models/payment_model.dart';

abstract class ISubscriptionRepository {
  Future<List<SubscriptionPlanItem>> getPlans();
  Future<List<MySubscriptionItem>> getMySubscriptions();
  Future<List<MyPurchaseItem>> getMyPurchases();
  Future<InitiatePaymentResult> buyStory(String storyId);
  Future<InitiatePaymentResult> buySubscription(String planId);
}

class SubscriptionRepository implements ISubscriptionRepository {
  final Dio _dio;

  SubscriptionRepository({Dio? dio}) : _dio = dio ?? DioClient.instance;

  @override
  Future<List<SubscriptionPlanItem>> getPlans() async {
    return DioClient.safeRequest(() async {
      final res = await _dio.get(ApiConstants.subscriptionPlans);
      final data = res.data;
      if (data is List) {
        return data
            .map((e) => SubscriptionPlanItem.fromJson(
                  e is Map ? Map<String, dynamic>.from(e) : null,
                ))
            .toList();
      }
      return [];
    });
  }

  @override
  Future<List<MySubscriptionItem>> getMySubscriptions() async {
    return DioClient.safeRequest(() async {
      final res = await _dio.get(ApiConstants.mySubscriptions);
      final data = res.data;
      if (data is List) {
        return data
            .map((e) => MySubscriptionItem.fromJson(
                  e is Map ? Map<String, dynamic>.from(e) : null,
                ))
            .toList();
      }
      return [];
    });
  }

  @override
  Future<List<MyPurchaseItem>> getMyPurchases() async {
    return DioClient.safeRequest(() async {
      final res = await _dio.get(ApiConstants.myPurchases);
      final data = res.data;
      if (data is List) {
        return data
            .map((e) => MyPurchaseItem.fromJson(
                  e is Map ? Map<String, dynamic>.from(e) : null,
                ))
            .toList();
      }
      return [];
    });
  }

  @override
  Future<InitiatePaymentResult> buyStory(String storyId) async {
    return DioClient.safeRequest(() async {
      final res = await _dio.post(ApiConstants.buyStory(storyId));
      final data = Map<String, dynamic>.from(res.data as Map);
      return InitiatePaymentResult.fromJson(data);
    });
  }

  @override
  Future<InitiatePaymentResult> buySubscription(String planId) async {
    return DioClient.safeRequest(() async {
      final res = await _dio.post(ApiConstants.buySubscription(planId));
      final data = Map<String, dynamic>.from(res.data as Map);
      return InitiatePaymentResult.fromJson(data);
    });
  }
}
