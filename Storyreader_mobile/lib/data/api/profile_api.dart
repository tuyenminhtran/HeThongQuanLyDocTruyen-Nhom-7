import 'package:dio/dio.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../models/profile_model.dart';
import '../models/story_model.dart';

class ProfileApi {
  static Future<UserProfileModel> getProfile() async {
    final res = await DioClient.instance.get(ApiConstants.profile);
    return UserProfileModel.fromJson(res.data as Map<String, dynamic>);
  }

  static Future<String> updateProfile(String displayName) async {
    final res = await DioClient.instance.put(
      ApiConstants.profile,
      data: {'displayName': displayName},
    );
    final data = res.data as Map<String, dynamic>;
    return data['displayName'] as String? ?? displayName;
  }

  static Future<String> changePassword(String currentPassword, String newPassword) async {
    try {
      final res = await DioClient.instance.post(
        ApiConstants.changePassword,
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );
      final data = res.data as Map<String, dynamic>;
      return data['message'] as String? ?? 'Đổi mật khẩu thành công.';
    } on DioException catch (e) {
      if (e.response?.data is Map && e.response!.data['message'] != null) {
        throw Exception(e.response!.data['message']);
      }
      throw Exception('Không thể đổi mật khẩu. Vui lòng kiểm tra lại kết nối.');
    }
  }

  static Future<List<StoryListItem>> getReadingHistory() async {
    try {
      final res = await DioClient.instance.get(ApiConstants.profileHistory);
      final list = (res.data as List)
          .map((e) => StoryListItem.fromJson(e as Map<String, dynamic>))
          .toList();
      return list;
    } catch (_) {
      return [];
    }
  }

  static Future<List<StoryListItem>> getBookmarks() async {
    try {
      final res = await DioClient.instance.get(ApiConstants.profileBookmarks);
      final list = (res.data as List)
          .map((e) => StoryListItem.fromJson(e as Map<String, dynamic>))
          .toList();
      return list;
    } catch (_) {
      return [];
    }
  }

  static Future<List<StoryListItem>> getPurchasedStories() async {
    try {
      final res = await DioClient.instance.get(ApiConstants.profilePurchased);
      final list = (res.data as List)
          .map((e) => StoryListItem.fromJson(e as Map<String, dynamic>))
          .toList();
      return list;
    } catch (_) {
      return [];
    }
  }
}
