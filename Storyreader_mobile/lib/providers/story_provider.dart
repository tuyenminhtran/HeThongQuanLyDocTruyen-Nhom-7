import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/api/story_api.dart';
import '../data/models/story_model.dart';
import '../data/api/profile_api.dart';
import 'auth_provider.dart';

final storiesFamily = FutureProvider.autoDispose
    .family<List<StoryListItem>, String?>((ref, keyword) async {
      return await StoryApi.searchStories(keyword: keyword);
    });

final storyDetailFamily = FutureProvider.autoDispose
    .family<StoryDetail, String>((ref, id) async {
      ref.watch(authProvider.select((auth) => auth.accessToken));
      return await StoryApi.getStoryDetail(id);
    });

final readingHistoryProvider = FutureProvider.autoDispose<List<StoryListItem>>((
  ref,
) async {
  final token = ref.watch(authProvider.select((auth) => auth.accessToken));
  if (token == null || token.isEmpty) return [];
  return await ProfileApi.getReadingHistory();
});

final bookmarksProvider = FutureProvider.autoDispose<List<StoryListItem>>((
  ref,
) async {
  final token = ref.watch(authProvider.select((auth) => auth.accessToken));
  if (token == null || token.isEmpty) return [];
  return await ProfileApi.getBookmarks();
});

final purchasedStoriesProvider =
    FutureProvider.autoDispose<List<StoryListItem>>((ref) async {
      final token = ref.watch(authProvider.select((auth) => auth.accessToken));
      if (token == null || token.isEmpty) return [];
      return await ProfileApi.getPurchasedStories();
    });
