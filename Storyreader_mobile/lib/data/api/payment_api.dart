import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../models/payment_model.dart';

class PaymentApi {
  static Future<InitiatePaymentResult> buyStory(String storyId) async {
    final res = await DioClient.instance.post(ApiConstants.buyStory(storyId));
    return InitiatePaymentResult.fromJson(res.data as Map<String, dynamic>);
  }

  static Future<InitiatePaymentResult> buySubscription(String planId) async {
    final res = await DioClient.instance.post(ApiConstants.buySubscription(planId));
    return InitiatePaymentResult.fromJson(res.data as Map<String, dynamic>);
  }
}
