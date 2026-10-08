import '../api/profile_api.dart';
import '../api/story_api.dart';
import '../models/story_model.dart';

/// Repository quản lý dữ liệu lịch sử đọc, đánh dấu và truyện đã mua
class UserMockRepository {
  static Future<List<StoryListItem>> getReadingHistory() async {
    try {
      final backendStories = await ProfileApi.getReadingHistory();
      if (backendStories.isNotEmpty) return backendStories;

      final stories = await StoryApi.searchStories();
      if (stories.length >= 2) {
        return stories.sublist(0, 2);
      }
      return stories;
    } catch (_) {
      return [];
    }
  }

  static Future<List<StoryListItem>> getBookmarks() async {
    try {
      final backendStories = await ProfileApi.getBookmarks();
      if (backendStories.isNotEmpty) return backendStories;

      final stories = await StoryApi.searchStories();
      if (stories.length > 3) {
        return stories.sublist(1, 4);
      } else if (stories.length > 1) {
        return stories.sublist(1);
      }
      return stories;
    } catch (_) {
      return [];
    }
  }

  static Future<List<StoryListItem>> getPurchasedStories() async {
    try {
      final backendStories = await ProfileApi.getPurchasedStories();
      if (backendStories.isNotEmpty) return backendStories;

      final stories = await StoryApi.searchStories();
      return stories.where((s) => s.accessPolicy != 0).toList();
    } catch (_) {
      return [];
    }
  }
}
