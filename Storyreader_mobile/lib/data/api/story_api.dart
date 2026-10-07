import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../models/story_model.dart';

class StoryApi {
  static Future<List<StoryListItem>> searchStories({String? keyword}) async {
    final res = await DioClient.instance.get(
      ApiConstants.stories,
      queryParameters: keyword != null && keyword.isNotEmpty ? {'keyword': keyword} : null,
    );
    final data = res.data;
    if (data is List) {
      return data
          .map((item) => StoryListItem.fromJson(item as Map<String, dynamic>))
          .toList();
    }
    return [];
  }

  static Future<StoryDetail> getStoryDetail(String id) async {
    final res = await DioClient.instance.get(ApiConstants.storyDetail(id));
    return StoryDetail.fromJson(res.data as Map<String, dynamic>);
  }

  static Future<String> createStory(CreateStoryInput input) async {
    final res = await DioClient.instance.post(
      ApiConstants.stories,
      data: input.toJson(),
    );
    final data = res.data;
    if (data is Map && data['id'] != null) {
      return data['id'].toString();
    }
    return '';
  }

  static Future<void> addChapter(String storyId, CreateChapterInput input) async {
    await DioClient.instance.post(
      ApiConstants.storyChapters(storyId),
      data: input.toJson(),
    );
  }
}
