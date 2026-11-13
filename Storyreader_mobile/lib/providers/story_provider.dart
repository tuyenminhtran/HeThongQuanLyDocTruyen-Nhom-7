import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/models/admin_model.dart';
import '../data/models/story_model.dart';
import '../data/repositories/genre_repository.dart';
import '../data/repositories/profile_repository.dart';
import '../data/repositories/story_repository.dart';
import 'auth_provider.dart';

// Repository Providers
final storyRepositoryProvider = Provider<IStoryRepository>((ref) {
  return StoryRepository();
});

final profileRepositoryProvider = Provider<IProfileRepository>((ref) {
  return ProfileRepository();
});

final genreRepositoryProvider = Provider<IGenreRepository>((ref) {
  return GenreRepository();
});

// Bộ lọc danh sách truyện
class StoryFilterQuery {
  final String? keyword;
  final String? genreId;
  final int page;
  final int pageSize;
  final String? sortBy;

  const StoryFilterQuery({
    this.keyword,
    this.genreId,
    this.page = 1,
    this.pageSize = 100,
    this.sortBy,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is StoryFilterQuery &&
          runtimeType == other.runtimeType &&
          keyword == other.keyword &&
          genreId == other.genreId &&
          page == other.page &&
          pageSize == other.pageSize &&
          sortBy == other.sortBy;

  @override
  int get hashCode =>
      keyword.hashCode ^
      genreId.hashCode ^
      page.hashCode ^
      pageSize.hashCode ^
      (sortBy?.hashCode ?? 0);
}

// Provider lấy danh sách truyện theo bộ lọc
final storiesFilterFamily = FutureProvider.autoDispose
    .family<List<StoryListItem>, StoryFilterQuery>((ref, query) async {
  final repo = ref.watch(storyRepositoryProvider);
  final cancelToken = CancelToken();
  ref.onDispose(() => cancelToken.cancel('Hủy request danh sách truyện cũ'));

  return await repo.getStories(
    keyword: query.keyword,
    genreId: query.genreId,
    page: query.page,
    pageSize: query.pageSize,
    sortBy: query.sortBy,
    cancelToken: cancelToken,
  );
});

// Provider tương thích ngược cho việc chỉ truyền keyword
final storiesFamily = FutureProvider.autoDispose
    .family<List<StoryListItem>, String?>((ref, keyword) async {
  return ref.watch(storiesFilterFamily(StoryFilterQuery(keyword: keyword)).future);
});

// Provider chi tiết truyện
final storyDetailFamily = FutureProvider.autoDispose
    .family<StoryDetail, String>((ref, id) async {
  final repo = ref.watch(storyRepositoryProvider);
  // Watch token để khi đăng nhập/đăng xuất tự nạp lại chi tiết (xác định quyền đọc)
  ref.watch(authProvider.select((auth) => auth.accessToken));

  final cancelToken = CancelToken();
  ref.onDispose(() => cancelToken.cancel('Hủy request chi tiết truyện cũ'));

  return await repo.getStoryDetail(id, cancelToken: cancelToken);
});

// Provider kiểm tra trạng thái đang theo dõi truyện
final isFollowingProvider = FutureProvider.autoDispose
    .family<bool, String>((ref, storyId) async {
  final auth = ref.watch(authProvider);
  if (!auth.isAuthenticated) return false;
  final repo = ref.watch(storyRepositoryProvider);
  return await repo.getIsFollowing(storyId);
});

// Provider danh sách thể loại
final genreListProvider = FutureProvider.autoDispose<List<Genre>>((ref) async {
  final repo = ref.watch(genreRepositoryProvider);
  return await repo.getGenres();
});

// Lịch sử đọc
final readingHistoryProvider = FutureProvider.autoDispose<List<StoryListItem>>((ref) async {
  final token = ref.watch(authProvider.select((auth) => auth.accessToken));
  if (token == null || token.isEmpty) return [];
  final repo = ref.watch(profileRepositoryProvider);
  return await repo.getReadingHistory();
});

// Danh sách Bookmark / Theo dõi
final bookmarksProvider = FutureProvider.autoDispose<List<StoryListItem>>((ref) async {
  final token = ref.watch(authProvider.select((auth) => auth.accessToken));
  if (token == null || token.isEmpty) return [];
  final repo = ref.watch(profileRepositoryProvider);
  return await repo.getBookmarks();
});

// Danh sách Truyện đã mua
final purchasedStoriesProvider = FutureProvider.autoDispose<List<StoryListItem>>((ref) async {
  final token = ref.watch(authProvider.select((auth) => auth.accessToken));
  if (token == null || token.isEmpty) return [];
  final repo = ref.watch(profileRepositoryProvider);
  return await repo.getPurchasedStories();
});
