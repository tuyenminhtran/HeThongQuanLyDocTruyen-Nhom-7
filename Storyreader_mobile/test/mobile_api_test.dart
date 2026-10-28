import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:storyreader_mobile/core/utils/chapter_sequence.dart';
import 'package:storyreader_mobile/data/api/admin_api.dart';
import 'package:storyreader_mobile/data/api/profile_api.dart';
import 'package:storyreader_mobile/data/models/story_model.dart';
import 'package:storyreader_mobile/data/repositories/notification_repository.dart';
import 'package:storyreader_mobile/data/repositories/story_repository.dart';
import 'package:storyreader_mobile/data/repositories/subscription_repository.dart';
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

  group('NotificationRepository tests with ApiServer', () {
    test('fetches unread count and notifications list', () async {
      final server = ApiServer();
      final repo = NotificationRepository(dio: server.client());

      final unreadCount = await repo.getUnreadCount();
      expect(unreadCount, 2);

      final page = await repo.getNotifications();
      expect(page.unreadCount, 2);
      expect(page.items.length, 1);
      expect(page.items.first.title, 'Chương mới');
    });

    test('marks single and all notifications as read', () async {
      final server = ApiServer();
      final repo = NotificationRepository(dio: server.client());

      await expectLater(repo.markAsRead('notif-1'), completes);
      await expectLater(repo.markAllAsRead(), completes);
    });
  });

  group('SubscriptionRepository & Payment tests with ApiServer', () {
    test('fetches plans, my subscriptions and my purchases', () async {
      final server = ApiServer();
      final repo = SubscriptionRepository(dio: server.client());

      final plans = await repo.getPlans();
      expect(plans.length, 1);
      expect(plans.first.name, 'Gói 1 tháng');
      expect(plans.first.price, 49000);

      final subs = await repo.getMySubscriptions();
      expect(subs.length, 1);
      expect(subs.first.planName, 'Gói 1 tháng');
      expect(subs.first.isActive, isTrue);

      final purchases = await repo.getMyPurchases();
      expect(purchases.length, 1);
      expect(purchases.first.storyTitle, 'Truyện đã mua');
    });

    test('initiates subscription and story payment, simulates callback', () async {
      final server = ApiServer();
      final repo = SubscriptionRepository(dio: server.client());

      final subResult = await repo.buySubscription('plan-1');
      expect(subResult.transactionId, 'tx-sub-1');
      expect(subResult.paymentUrl, contains('vnpayment.vn'));

      final storyResult = await repo.buyStory('story-1');
      expect(storyResult.transactionId, 'tx-story-1');

      await expectLater(
        repo.simulatePaymentCallback('tx-story-1', success: true),
        completes,
      );
    });
  });

  group('StoryRepository sorting with ApiServer', () {
    test('passes sortBy query parameter correctly', () async {
      final server = ApiServer();
      final repo = StoryRepository(dio: server.client());

      final stories = await repo.getStories(sortBy: 'top');
      expect(stories.length, 1);
      final lastReq = server.requests.last;
      expect(lastReq.uri.path, '/api/stories');
      expect(lastReq.queryParameters['sortBy'], 'top');
    });
  });

  group('AdminApi Transactions tests with ApiServer', () {
    test('gets transactions and triggers forceActivate and markFailed', () async {
      final server = ApiServer();
      final api = AdminApi(dio: server.client());

      final res = await api.getAdminTransactions(page: 1, pageSize: 20);
      expect(res.total, 1);
      expect(res.items.first.id, 'tx-admin-1');

      await expectLater(api.forceActivateTransaction('tx-admin-1'), completes);
      await expectLater(api.markTransactionFailed('tx-admin-1'), completes);
    });
  });
}
