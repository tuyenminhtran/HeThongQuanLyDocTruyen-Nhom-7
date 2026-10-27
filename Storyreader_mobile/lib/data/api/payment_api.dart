import '../models/payment_model.dart';
import '../repositories/subscription_repository.dart';

class PaymentApi {
  static final _repository = SubscriptionRepository();

  static Future<InitiatePaymentResult> buyStory(String storyId) async {
    return await _repository.buyStory(storyId);
  }

  static Future<InitiatePaymentResult> buySubscription(String planId) async {
    return await _repository.buySubscription(planId);
  }

  static Future<List<SubscriptionPlanItem>> getPlans() async {
    return await _repository.getPlans();
  }

  static Future<List<MySubscriptionItem>> getMySubscriptions() async {
    return await _repository.getMySubscriptions();
  }

  static Future<List<MyPurchaseItem>> getMyPurchases() async {
    return await _repository.getMyPurchases();
  }
}
