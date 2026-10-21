import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:storyreader_mobile/core/utils/chapter_sequence.dart';
import 'package:storyreader_mobile/data/api/admin_api.dart';
import 'package:storyreader_mobile/data/api/profile_api.dart';
import 'package:storyreader_mobile/data/models/story_model.dart';
import 'support/api_server.dart';

void main() {
  test('genres create, update, delete use API ids and trimmed names', () async {
    final server = ApiServer();
    final api = AdminApi(dio: server.client());
    final created = await api.createGenre('  Trinh Thám  ');
    expect(created.name, 'Trinh Thám');
    await api.updateGenre(created.id, '  Trinh Thám Mới ');
    expect((await api.getGenres()).last.name, 'Trinh Thám Mới');
    await api.deleteGenre(created.id);
    expect((await api.getGenres()).map((genre) => genre.id), ['genre-1']);
    expect(server.requests.first.uri.path, '/api/genres');
  });

  test(
    'search and restriction changes persist through a fresh API read',
    () async {
      final server = ApiServer();
      final api = AdminApi(dio: server.client());
      final users = await api.getUsers(' reader@ ');
      expect(users.single.role, 'VIP');
      await api.toggleUserRestriction(users.single.id);
      expect((await api.getUsers('reader@')).single.isRestricted, isTrue);
      await api.toggleUserRestriction(users.single.id);
      expect((await api.getUsers('reader@')).single.isRestricted, isFalse);
    },
  );

  test('dashboard parses all three existing API responses', () async {
    final server = ApiServer();
    final data = await AdminApi(dio: server.client()).getDashboard();
    expect(data.overview.todayRevenue, 49000);
    expect(data.overview.revenueGrowthPercent, 12.5);
    expect(data.transactions.single.provider, 'VNPay');
    expect(data.activities.single.timestamp.isUtc, isTrue);
    expect(server.requests.length, 3);
  });

  test(
    'empty personal library stays empty and does not request arbitrary stories',
    () async {
      final server = ApiServer();
      final client = server.client();
      expect(await ProfileApi.getReadingHistory(client: client), isEmpty);
      expect(await ProfileApi.getBookmarks(client: client), isEmpty);
      expect(await ProfileApi.getPurchasedStories(client: client), isEmpty);
      expect(server.requests.map((request) => request.path), [
        '/profile/history',
        '/profile/bookmarks',
        '/profile/purchased',
      ]);
    },
  );

  test(
    'library connection failures propagate instead of masquerading as empty data',
    () async {
      final server = ApiServer()..fail = true;
      await expectLater(
        ProfileApi.getReadingHistory(client: server.client()),
        throwsA(isA<DioException>()),
      );
    },
  );

  ChapterListItem chapter(int number) => ChapterListItem(
    id: 'chapter-$number',
    chapterNumber: number,
    title: 'Chương $number',
    requiresAccess: false,
  );

  test(
    'chapter navigation sorts by number, handles gaps and boundaries without changing source data',
    () {
      final source = [chapter(8), chapter(1), chapter(3)];
      final middle = ChapterSequence(source, 'chapter-3');
      expect(middle.previous?.id, 'chapter-1');
      expect(middle.next?.id, 'chapter-8');
      expect(source.first.chapterNumber, 8);
      expect(ChapterSequence(source, 'chapter-1').previous, isNull);
      expect(ChapterSequence(source, 'chapter-8').next, isNull);
      expect(ChapterSequence(source, 'unknown').next, isNull);
      expect(ChapterSequence([], 'unknown').previous, isNull);
    },
  );
}
