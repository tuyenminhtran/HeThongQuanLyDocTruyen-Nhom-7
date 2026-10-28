import 'package:dio/dio.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../models/story_model.dart';

abstract class IStoryRepository {
  Future<List<StoryListItem>> getStories({
    String? keyword,
    String? genreId,
    int page = 1,
    int pageSize = 100,
    String? sortBy,
    CancelToken? cancelToken,
  });

  Future<StoryDetail> getStoryDetail(String id, {CancelToken? cancelToken});

  Future<bool> toggleFollow(String id);
  Future<bool> getIsFollowing(String id);

  Future<String> uploadCover(String filePath);
  Future<String> createStory(CreateStoryInput input);
  Future<void> updateStory(String id, UpdateStoryInput input);
  Future<void> deleteStory(String id);

  Future<void> addChapter(String storyId, CreateChapterInput input);
  Future<void> updateChapter(String storyId, String chapterId, CreateChapterInput input);
  Future<void> deleteChapter(String storyId, String chapterId);
}

class StoryRepository implements IStoryRepository {
  final Dio _dio;

  StoryRepository({Dio? dio}) : _dio = dio ?? DioClient.instance;

  @override
  Future<List<StoryListItem>> getStories({
    String? keyword,
    String? genreId,
    int page = 1,
    int pageSize = 100,
    String? sortBy,
    CancelToken? cancelToken,
  }) async {
    return DioClient.safeRequest(() async {
      final query = <String, dynamic>{
        'page': page,
        'pageSize': pageSize,
      };
      if (keyword != null && keyword.trim().isNotEmpty) {
        query['keyword'] = keyword.trim();
      }
      if (genreId != null && genreId.isNotEmpty) {
        query['genreId'] = genreId;
      }
      if (sortBy != null && sortBy.trim().isNotEmpty) {
        query['sortBy'] = sortBy.trim();
      }

      final res = await _dio.get(
        ApiConstants.stories,
        queryParameters: query,
        cancelToken: cancelToken,
      );

      final data = res.data;
      if (data is List) {
        return data
            .map((item) => StoryListItem.fromJson(
                  item is Map ? Map<String, dynamic>.from(item) : null,
                ))
            .toList();
      }
      return [];
    });
  }

  @override
  Future<StoryDetail> getStoryDetail(String id, {CancelToken? cancelToken}) async {
    return DioClient.safeRequest(() async {
      final res = await _dio.get(
        ApiConstants.storyDetail(id),
        cancelToken: cancelToken,
      );
      final data = Map<String, dynamic>.from(res.data as Map);
      return StoryDetail.fromJson(data);
    });
  }

  @override
  Future<bool> toggleFollow(String id) async {
    return DioClient.safeRequest(() async {
      final res = await _dio.post(ApiConstants.storyFollow(id));
      if (res.data is Map && res.data['isFollowing'] is bool) {
        return res.data['isFollowing'] as bool;
      }
      return false;
    });
  }

  @override
  Future<bool> getIsFollowing(String id) async {
    return DioClient.safeRequest(() async {
      final res = await _dio.get(ApiConstants.storyIsFollowing(id));
      if (res.data is Map && res.data['isFollowing'] is bool) {
        return res.data['isFollowing'] as bool;
      }
      return false;
    });
  }

  @override
  Future<String> uploadCover(String filePath) async {
    return DioClient.safeRequest(() async {
      final fileName = filePath.split(RegExp(r'[\\/]')).last;
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath, filename: fileName),
      });

      final res = await _dio.post(
        ApiConstants.uploadCover,
        data: formData,
      );

      if (res.data is Map && res.data['url'] != null) {
        return res.data['url'].toString();
      }
      return '';
    });
  }

  @override
  Future<String> createStory(CreateStoryInput input) async {
    return DioClient.safeRequest(() async {
      final res = await _dio.post(
        ApiConstants.stories,
        data: input.toJson(),
      );
      if (res.data is Map && res.data['id'] != null) {
        return res.data['id'].toString();
      }
      return '';
    });
  }

  @override
  Future<void> updateStory(String id, UpdateStoryInput input) async {
    return DioClient.safeRequest(() async {
      await _dio.put(
        ApiConstants.storyDetail(id),
        data: input.toJson(),
      );
    });
  }

  @override
  Future<void> deleteStory(String id) async {
    return DioClient.safeRequest(() async {
      await _dio.delete(ApiConstants.storyDetail(id));
    });
  }

  @override
  Future<void> addChapter(String storyId, CreateChapterInput input) async {
    return DioClient.safeRequest(() async {
      await _dio.post(
        ApiConstants.storyChapters(storyId),
        data: input.toJson(),
      );
    });
  }

  @override
  Future<void> updateChapter(
    String storyId,
    String chapterId,
    CreateChapterInput input,
  ) async {
    return DioClient.safeRequest(() async {
      await _dio.put(
        ApiConstants.storyChapterDetail(storyId, chapterId),
        data: input.toJson(),
      );
    });
  }

  @override
  Future<void> deleteChapter(String storyId, String chapterId) async {
    return DioClient.safeRequest(() async {
      await _dio.delete(ApiConstants.storyChapterDetail(storyId, chapterId));
    });
  }
}
