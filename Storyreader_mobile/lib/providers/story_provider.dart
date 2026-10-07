import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/api/story_api.dart';
import '../data/models/story_model.dart';
import '../data/repositories/user_mock_repository.dart';

final storiesFamily = FutureProvider.autoDispose.family<List<StoryListItem>, String?>((ref, keyword) async {
  return await StoryApi.searchStories(keyword: keyword);
});

final storyDetailFamily = FutureProvider.autoDispose.family<StoryDetail, String>((ref, id) async {
  return await StoryApi.getStoryDetail(id);
});

final readingHistoryProvider = FutureProvider.autoDispose<List<StoryListItem>>((ref) async {
  return await UserMockRepository.getReadingHistory();
});

final bookmarksProvider = FutureProvider.autoDispose<List<StoryListItem>>((ref) async {
  return await UserMockRepository.getBookmarks();
});

final purchasedStoriesProvider = FutureProvider.autoDispose<List<StoryListItem>>((ref) async {
  return await UserMockRepository.getPurchasedStories();
});
