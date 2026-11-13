import 'package:dio/dio.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../models/discussion_model.dart';

abstract class IDiscussionRepository {
  Future<List<DiscussionItem>> getDiscussions(String chapterId);
  Future<void> postDiscussion(String chapterId, String content);
  Future<void> hideDiscussion(String chapterId, String discussionId);
  Future<String> reportDiscussion(String chapterId, String discussionId, {String? reason});
}

class DiscussionRepository implements IDiscussionRepository {
  final Dio _dio;

  DiscussionRepository({Dio? dio}) : _dio = dio ?? DioClient.instance;

  @override
  Future<List<DiscussionItem>> getDiscussions(String chapterId) async {
    return DioClient.safeRequest(() async {
      final res = await _dio.get(ApiConstants.chapterDiscussions(chapterId));
      final data = res.data;
      if (data is List) {
        return data
            .map((e) => DiscussionItem.fromJson(
                  e is Map ? Map<String, dynamic>.from(e) : null,
                ))
            .toList();
      }
      return [];
    });
  }

  @override
  Future<void> postDiscussion(String chapterId, String content) async {
    return DioClient.safeRequest(() async {
      await _dio.post(
        ApiConstants.chapterDiscussions(chapterId),
        data: {'content': content.trim()},
      );
    });
  }

  @override
  Future<void> hideDiscussion(String chapterId, String discussionId) async {
    return DioClient.safeRequest(() async {
      await _dio.put(ApiConstants.hideDiscussion(chapterId, discussionId));
    });
  }

  @override
  Future<String> reportDiscussion(
    String chapterId,
    String discussionId, {
    String? reason,
  }) async {
    return DioClient.safeRequest(() async {
      final cleanReason = reason?.trim() ?? '';
      final res = await _dio.post(
        ApiConstants.reportDiscussion(chapterId, discussionId),
        data: {if (cleanReason.isNotEmpty) 'reason': cleanReason},
      );
      if (res.data is Map && res.data['message'] is String) {
        return res.data['message'] as String;
      }
      return 'Đã báo cáo bình luận để quản trị viên xem xét.';
    });
  }
}
