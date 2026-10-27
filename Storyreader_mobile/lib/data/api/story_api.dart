import '../models/story_model.dart';
import '../repositories/story_repository.dart';

class StoryApi {
  static final _repository = StoryRepository();

  static Future<List<StoryListItem>> searchStories({
    String? keyword,
    String? genreId,
    int page = 1,
    int pageSize = 100,
  }) async {
    return await _repository.getStories(
      keyword: keyword,
      genreId: genreId,
      page: page,
      pageSize: pageSize,
    );
  }

  static Future<StoryDetail> getStoryDetail(String id) async {
    return await _repository.getStoryDetail(id);
  }

  static Future<String> createStory(CreateStoryInput input) async {
    return await _repository.createStory(input);
  }

  static Future<void> addChapter(String storyId, CreateChapterInput input) async {
    await _repository.addChapter(storyId, input);
  }

  static Future<bool> toggleFollow(String id) async {
    return await _repository.toggleFollow(id);
  }

  static Future<bool> getIsFollowing(String id) async {
    return await _repository.getIsFollowing(id);
  }

  static Future<String> uploadCover(String filePath) async {
    return await _repository.uploadCover(filePath);
  }

  static Future<void> updateStory(String id, UpdateStoryInput input) async {
    await _repository.updateStory(id, input);
  }

  static Future<void> deleteStory(String id) async {
    await _repository.deleteStory(id);
  }
}
