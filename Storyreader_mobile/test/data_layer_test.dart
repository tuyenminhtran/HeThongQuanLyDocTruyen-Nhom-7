import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:storyreader_mobile/core/network/api_error.dart';
import 'package:storyreader_mobile/core/utils/chapter_grouping.dart';
import 'package:storyreader_mobile/data/local/reading_cache_service.dart';
import 'package:storyreader_mobile/data/models/chapter_model.dart';
import 'package:storyreader_mobile/data/models/discussion_model.dart';
import 'package:storyreader_mobile/data/models/notification_model.dart';
import 'package:storyreader_mobile/data/models/payment_model.dart';
import 'package:storyreader_mobile/data/models/story_model.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Data Models & DTO Safe Parsing', () {
    test('StoryListItem parses full data, Comic type and fallback nulls', () {
      final comicJson = {
        'id': 'story-comic-1',
        'title': 'Huyền Thoại Võ Lâm',
        'coverImageUrl': '/uploads/covers/comic1.jpg',
        'author': 'Tác Giả Comic',
        'status': 1,
        'accessPolicy': 2,
        'viewCount': 15000,
        'type': 1, // Comic
        'totalChapters': 120,
        'latestChapterNumber': 120,
      };

      final item = StoryListItem.fromJson(comicJson);
      expect(item.id, 'story-comic-1');
      expect(item.title, 'Huyền Thoại Võ Lâm');
      expect(item.isComic, isTrue);
      expect(item.type, StoryType.comic);
      expect(item.releaseStatus, ReleaseStatus.completed);
      expect(item.policy, AccessPolicy.mixed);
      expect(item.totalChapters, 120);
      expect(item.latestChapterNumber, 120);
      expect(item.fullCoverUrl, contains('/uploads/covers/comic1.jpg'));

      // Safe fallback when data is null or empty
      final emptyItem = StoryListItem.fromJson(null);
      expect(emptyItem.id, '');
      expect(emptyItem.title, '');
      expect(emptyItem.isComic, isFalse);
      expect(emptyItem.type, StoryType.novel);
    });

    test('ChapterListItem & ChapterContent parse partName and image URLs', () {
      final chapJson = {
        'id': 'chap-10',
        'chapterNumber': 10,
        'title': 'Chương 10: Đại náo Thiên cung',
        'content': 'http://example.com/img1.jpg\nhttp://example.com/img2.jpg',
        'storyType': 1,
        'imageUrls': ['/uploads/c1.jpg', 'https://cdn.example.com/c2.jpg'],
        'partName': 'Tập 1: Tiên Giới',
      };

      final chapter = ChapterContent.fromJson(chapJson);
      expect(chapter.id, 'chap-10');
      expect(chapter.chapterNumber, 10);
      expect(chapter.isComic, isTrue);
      expect(chapter.partName, 'Tập 1: Tiên Giới');
      expect(chapter.imageUrls.length, 2);
      expect(chapter.fullImageUrls[1], 'https://cdn.example.com/c2.jpg');
    });

    test('DiscussionItem parses ISO dates safely', () {
      final discussion = DiscussionItem.fromJson({
        'id': 'd-1',
        'content': 'Truyện rất cuốn hút!',
        'createdAt': '2026-10-25T14:30:00Z',
        'user': 'Nguyễn Văn A',
      });

      expect(discussion.id, 'd-1');
      expect(discussion.content, 'Truyện rất cuốn hút!');
      expect(discussion.user, 'Nguyễn Văn A');
      expect(discussion.createdAt.year, 2026);

      // Fallback khi null
      final fallback = DiscussionItem.fromJson(null);
      expect(fallback.id, '');
      expect(fallback.user, 'Độc giả');
    });

    test('NotificationPageResult parses unread count and list', () {
      final result = NotificationPageResult.fromJson({
        'unreadCount': 3,
        'items': [
          {
            'id': 'n-1',
            'title': 'Chương mới',
            'message': 'Truyện A vừa có chương 5',
            'linkUrl': '/chapters/c-5',
            'isRead': false,
            'createdAt': '2026-10-26T08:00:00Z',
          }
        ],
      });

      expect(result.unreadCount, 3);
      expect(result.items.length, 1);
      expect(result.items.first.title, 'Chương mới');
      expect(result.items.first.isRead, isFalse);
    });

    test('Payment and Subscription models parse accurately', () {
      final plan = SubscriptionPlanItem.fromJson({
        'id': 'plan-1',
        'name': 'Gói 1 tháng',
        'price': 49000,
        'durationDays': 30,
        'scope': 'all',
      });
      expect(plan.name, 'Gói 1 tháng');
      expect(plan.price, 49000.0);
      expect(plan.durationDays, 30);

      final initResult = InitiatePaymentResult.fromJson({
        'transactionId': 'tx-123',
        'paymentUrl': 'https://vnpay.vn/pay?token=xyz',
      });
      expect(initResult.transactionId, 'tx-123');
      expect(initResult.paymentUrl, contains('vnpay.vn'));
    });
  });

  group('Chapter Grouping Algorithm (Part / Folder Cha-Con)', () {
    test('groups chapters with explicit partName into folders', () {
      final chapters = [
        ChapterListItem(id: '1', chapterNumber: 1, title: 'Chương 1', requiresAccess: false, partName: 'Tập 1'),
        ChapterListItem(id: '2', chapterNumber: 2, title: 'Chương 2', requiresAccess: false, partName: 'Tập 1'),
        ChapterListItem(id: '3', chapterNumber: 3, title: 'Chương 3', requiresAccess: true, partName: 'Tập 2'),
      ];

      final groups = groupChaptersByPart(chapters);
      expect(groups.length, 2);
      expect(groups[0].partName, 'Tập 1');
      expect(groups[0].chapters.length, 2);
      expect(groups[1].partName, 'Tập 2');
      expect(groups[1].chapters.length, 1);
      expect(groups[0].isFolder, isTrue);
    });

    test('extracts part from title pattern when partName is empty', () {
      final chapters = [
        ChapterListItem(id: '1', chapterNumber: 1, title: '[Phần 1] Khởi đầu', requiresAccess: false),
        ChapterListItem(id: '2', chapterNumber: 2, title: '[Phần 1] Gặp gỡ', requiresAccess: false),
        ChapterListItem(id: '3', chapterNumber: 3, title: 'Phần 2: Xuống núi', requiresAccess: false),
      ];

      final groups = groupChaptersByPart(chapters);
      expect(groups.length, 2);
      expect(groups[0].partName, 'Phần 1');
      expect(groups[0].chapters.length, 2);
      expect(groups[1].partName, 'Phần 2: Xuống núi');
    });

    test('returns single group "Tất cả chương" without folders when no parts exist', () {
      final chapters = [
        ChapterListItem(id: '1', chapterNumber: 1, title: 'Chương 1', requiresAccess: false),
        ChapterListItem(id: '2', chapterNumber: 2, title: 'Chương 2', requiresAccess: false),
      ];

      final groups = groupChaptersByPart(chapters);
      expect(groups.length, 1);
      expect(groups[0].partName, 'Tất cả chương');
      expect(groups[0].isFolder, isFalse);
      expect(groups[0].chapters.length, 2);
    });
  });

  group('AppException Mapping & Localization', () {
    test('maps 401 to AuthException with Vietnamese message', () {
      final dioError = DioException(
        requestOptions: RequestOptions(path: '/stories'),
        response: Response(
          requestOptions: RequestOptions(path: '/stories'),
          statusCode: 401,
        ),
        type: DioExceptionType.badResponse,
      );

      final appEx = AppException.fromDio(dioError);
      expect(appEx, isA<AuthException>());
      expect(appEx.message, contains('Phiên đăng nhập đã hết hạn'));
      expect(apiErrorMessage(dioError), contains('Phiên đăng nhập đã hết hạn'));
    });

    test('maps 403 to AuthException with permission message', () {
      final dioError = DioException(
        requestOptions: RequestOptions(path: '/chapters/1'),
        response: Response(
          requestOptions: RequestOptions(path: '/chapters/1'),
          statusCode: 403,
        ),
        type: DioExceptionType.badResponse,
      );

      final appEx = AppException.fromDio(dioError);
      expect(appEx, isA<AuthException>());
      expect(appEx.message, contains('quyền truy cập'));
    });

    test('maps connectionError to NetworkException with Vietnamese message', () {
      final dioError = DioException(
        requestOptions: RequestOptions(path: '/stories'),
        type: DioExceptionType.connectionError,
      );

      final appEx = AppException.fromDio(dioError);
      expect(appEx, isA<NetworkException>());
      expect(appEx.message, contains('Không thể kết nối đến máy chủ'));
    });
  });

  group('ReadingCacheService & Offline Sync Queue', () {
    test('saves and retrieves reading progress and sync queue', () async {
      SharedPreferences.setMockInitialValues({});

      final progress = ReadingProgressItem(
        storyId: 'story-1',
        chapterId: 'chap-5',
        chapterNumber: 5,
        storyTitle: 'Tiên Nghịch',
        chapterTitle: 'Chương 5: Hóa Thần',
        scrollOffset: 1250.0,
        scrollPercentage: 0.65,
        updatedAt: DateTime.now(),
      );

      await ReadingCacheService.saveReadingProgress(progress);

      final retrieved = await ReadingCacheService.getReadingProgress('story-1');
      expect(retrieved, isNotNull);
      expect(retrieved!.chapterId, 'chap-5');
      expect(retrieved.scrollOffset, 1250.0);

      final queue = await ReadingCacheService.getSyncQueue();
      expect(queue, contains('chap-5'));

      await ReadingCacheService.removeFromSyncQueue('chap-5');
      final updatedQueue = await ReadingCacheService.getSyncQueue();
      expect(updatedQueue, isNot(contains('chap-5')));
    });

    test('caches and loads chapter content offline', () async {
      SharedPreferences.setMockInitialValues({});

      final chapter = ChapterContent(
        id: 'chap-offline-1',
        chapterNumber: 1,
        title: 'Chương 1: Mở màn',
        content: 'Nội dung truyện được lưu offline...',
      );

      await ReadingCacheService.saveChapterContent(chapter);

      final cached = await ReadingCacheService.getCachedChapterContent('chap-offline-1');
      expect(cached, isNotNull);
      expect(cached!.id, 'chap-offline-1');
      expect(cached.content, 'Nội dung truyện được lưu offline...');
    });
  });
}
