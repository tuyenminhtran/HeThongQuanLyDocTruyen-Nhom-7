import 'package:dio/dio.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../models/profile_model.dart';
import '../models/story_model.dart';

abstract class IProfileRepository {
  Future<UserProfileModel> getProfile();
  Future<String> updateProfile(String displayName);
  Future<String> changePassword(String currentPassword, String newPassword);
  Future<List<StoryListItem>> getReadingHistory();
  Future<List<StoryListItem>> getBookmarks();
  Future<List<StoryListItem>> getPurchasedStories();
}

class ProfileRepository implements IProfileRepository {
  final Dio _dio;

  ProfileRepository({Dio? dio}) : _dio = dio ?? DioClient.instance;

  @override
  Future<UserProfileModel> getProfile() async {
    return DioClient.safeRequest(() async {
      final res = await _dio.get(ApiConstants.profile);
      final data = Map<String, dynamic>.from(res.data as Map);
      return UserProfileModel.fromJson(data);
    });
  }

  @override
  Future<String> updateProfile(String displayName) async {
    return DioClient.safeRequest(() async {
      final res = await _dio.put(
        ApiConstants.profile,
        data: {'displayName': displayName.trim()},
      );
      final data = Map<String, dynamic>.from(res.data as Map);
      return data['displayName'] as String? ?? displayName;
    });
  }

  @override
  Future<String> changePassword(String currentPassword, String newPassword) async {
    return DioClient.safeRequest(() async {
      final res = await _dio.post(
        ApiConstants.changePassword,
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );
      final data = Map<String, dynamic>.from(res.data as Map);
      return data['message'] as String? ?? 'Đổi mật khẩu thành công.';
    });
  }

  @override
  Future<List<StoryListItem>> getReadingHistory() async {
    return DioClient.safeRequest(() async {
      final res = await _dio.get(ApiConstants.profileHistory);
      final data = res.data;
      if (data is List) {
        return data
            .map((e) => StoryListItem.fromJson(
                  e is Map ? Map<String, dynamic>.from(e) : null,
                ))
            .toList();
      }
      return [];
    });
  }

  @override
  Future<List<StoryListItem>> getBookmarks() async {
    return DioClient.safeRequest(() async {
      final res = await _dio.get(ApiConstants.profileBookmarks);
      final data = res.data;
      if (data is List) {
        return data
            .map((e) => StoryListItem.fromJson(
                  e is Map ? Map<String, dynamic>.from(e) : null,
                ))
            .toList();
      }
      return [];
    });
  }

  @override
  Future<List<StoryListItem>> getPurchasedStories() async {
    return DioClient.safeRequest(() async {
      final res = await _dio.get(ApiConstants.profilePurchased);
      final data = res.data;
      if (data is List) {
        return data
            .map((e) => StoryListItem.fromJson(
                  e is Map ? Map<String, dynamic>.from(e) : null,
                ))
            .toList();
      }
      return [];
    });
  }
}
