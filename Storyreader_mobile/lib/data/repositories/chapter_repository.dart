import 'package:dio/dio.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/api_error.dart';
import '../../core/network/dio_client.dart';
import '../local/reading_cache_service.dart';
import '../models/chapter_model.dart';

abstract class IChapterRepository {
  Future<ChapterContent> getChapterContent(
    String id, {
    bool cacheOffline = true,
    CancelToken? cancelToken,
  });

  Future<void> saveProgress(ReadingProgressItem progress);
  Future<ReadingProgressItem?> getLocalProgress(String storyId);
  Future<void> syncOfflineProgress();
}

class ChapterRepository implements IChapterRepository {
  final Dio _dio;

  ChapterRepository({Dio? dio}) : _dio = dio ?? DioClient.instance;

  @override
  Future<ChapterContent> getChapterContent(
    String id, {
    bool cacheOffline = true,
    CancelToken? cancelToken,
  }) async {
    try {
      final res = await _dio.get(
        ApiConstants.chapterDetail(id),
        cancelToken: cancelToken,
      );

      final data = Map<String, dynamic>.from(res.data as Map);
      final chapter = ChapterContent.fromJson(data);

      if (cacheOffline) {
        // Tự động lưu cache ngoại tuyến không chặn luồng chính
        ReadingCacheService.saveChapterContent(chapter).ignore();
      }

      return chapter;
    } on DioException catch (e) {
      // Nếu mất mạng hoặc timeout, kiểm tra xem đã có cache offline chưa
      final isNetworkError = e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout;

      if (isNetworkError) {
        final cached = await ReadingCacheService.getCachedChapterContent(id);
        if (cached != null) {
          return cached;
        }
      }

      throw AppException.fromDio(e);
    } catch (e) {
      if (e is AppException) rethrow;
      throw AppException(e.toString());
    }
  }

  @override
  Future<void> saveProgress(ReadingProgressItem progress) async {
    await ReadingCacheService.saveReadingProgress(progress);
  }

  @override
  Future<ReadingProgressItem?> getLocalProgress(String storyId) async {
    return await ReadingCacheService.getReadingProgress(storyId);
  }

  @override
  Future<void> syncOfflineProgress() async {
    final queue = await ReadingCacheService.getSyncQueue();
    if (queue.isEmpty) return;

    for (final chapterId in List<String>.from(queue)) {
      try {
        // Gọi API với Bearer token; Backend sẽ tự động cập nhật ReadingProgress
        await _dio.get(ApiConstants.chapterDetail(chapterId));
        await ReadingCacheService.removeFromSyncQueue(chapterId);
      } catch (_) {
        // Nếu vẫn chưa có mạng thì giữ lại trong hàng đợi để lần sau thử lại
        break;
      }
    }
  }
}
