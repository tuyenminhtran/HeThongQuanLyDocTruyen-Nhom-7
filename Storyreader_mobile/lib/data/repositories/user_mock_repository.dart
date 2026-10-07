import '../api/story_api.dart';
import '../models/story_model.dart';

/// Repository mô phỏng các tính năng thư viện cá nhân giống hệt web
/// (Web lấy từ /stories và cắt mảng hoặc lọc)
class UserMockRepository {
  // TODO: thay bằng API thật khi backend triển khai GET /users/me/history
  static Future<List<StoryListItem>> getReadingHistory() async {
    try {
      final stories = await StoryApi.searchStories();
      if (stories.length >= 2) {
        return stories.sublist(0, 2);
      }
      return stories;
    } catch (_) {
      return [];
    }
  }

  // TODO: thay bằng API thật khi backend triển khai GET /users/me/bookmarks
  static Future<List<StoryListItem>> getBookmarks() async {
    try {
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

  // TODO: thay bằng API thật khi backend triển khai GET /users/me/purchased
  static Future<List<StoryListItem>> getPurchasedStories() async {
    try {
      final stories = await StoryApi.searchStories();
      return stories.where((s) => s.accessPolicy != 0).toList();
    } catch (_) {
      return [];
    }
  }
}
