import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/storage/auth_storage.dart';
import '../data/models/chapter_model.dart';
import '../data/models/discussion_model.dart';
import '../data/repositories/chapter_repository.dart';
import '../data/repositories/discussion_repository.dart';
import 'auth_provider.dart';

// Repository Providers
final chapterRepositoryProvider = Provider<IChapterRepository>((ref) {
  return ChapterRepository();
});

final discussionRepositoryProvider = Provider<IDiscussionRepository>((ref) {
  return DiscussionRepository();
});

// Provider nạp nội dung chương (có hỗ trợ offline-fallback)
final chapterContentFamily = FutureProvider.autoDispose
    .family<ChapterContent, String>((ref, id) async {
  final repo = ref.watch(chapterRepositoryProvider);
  // Watch token để khi login có thể mở khóa chương VIP
  ref.watch(authProvider.select((auth) => auth.accessToken));

  final cancelToken = CancelToken();
  ref.onDispose(() => cancelToken.cancel('Hủy request nội dung chương cũ'));

  return await repo.getChapterContent(id, cancelToken: cancelToken);
});

// Provider nạp bình luận chương
final chapterDiscussionsFamily = FutureProvider.autoDispose
    .family<List<DiscussionItem>, String>((ref, chapterId) async {
  final repo = ref.watch(discussionRepositoryProvider);
  return await repo.getDiscussions(chapterId);
});

// Theme đọc truyện (dark, light, sepia)
final readerThemeProvider = StateNotifierProvider<ReaderThemeNotifier, String>((ref) {
  return ReaderThemeNotifier();
});

class ReaderThemeNotifier extends StateNotifier<String> {
  ReaderThemeNotifier() : super('dark') {
    _load();
  }

  Future<void> _load() async {
    state = await ReaderPreferences.getTheme();
  }

  Future<void> setTheme(String theme) async {
    state = theme;
    await ReaderPreferences.saveTheme(theme);
  }
}

// Cỡ chữ đọc truyện
final readerFontSizeProvider = StateNotifierProvider<ReaderFontSizeNotifier, double>((ref) {
  return ReaderFontSizeNotifier();
});

class ReaderFontSizeNotifier extends StateNotifier<double> {
  ReaderFontSizeNotifier() : super(20.0) {
    _load();
  }

  Future<void> _load() async {
    state = await ReaderPreferences.getFontSize();
  }

  Future<void> setFontSize(double size) async {
    final clamped = size.clamp(14.0, 32.0);
    state = clamped;
    await ReaderPreferences.saveFontSize(clamped);
  }

  Future<void> increase() async => setFontSize(state + 2);
  Future<void> decrease() async => setFontSize(state - 2);
}
