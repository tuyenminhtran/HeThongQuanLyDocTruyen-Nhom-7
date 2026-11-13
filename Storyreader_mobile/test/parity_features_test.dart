import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:storyreader_mobile/core/constants/api_constants.dart';
import 'package:storyreader_mobile/core/network/api_error.dart';
import 'package:storyreader_mobile/core/utils/formatters.dart';
import 'package:storyreader_mobile/core/utils/image_utils.dart';
import 'package:storyreader_mobile/core/utils/tts_chunker.dart';
import 'package:storyreader_mobile/data/api/admin_api.dart';
import 'package:storyreader_mobile/data/models/auth_model.dart';
import 'package:storyreader_mobile/data/models/chapter_model.dart';
import 'package:storyreader_mobile/data/models/discussion_model.dart';
import 'package:storyreader_mobile/data/models/story_model.dart';
import 'package:storyreader_mobile/data/repositories/discussion_repository.dart';
import 'package:storyreader_mobile/features/admin/admin_layout_screen.dart';
import 'package:storyreader_mobile/features/admin/admin_reported_comments_screen.dart';
import 'package:storyreader_mobile/features/admin/admin_schedules_screen.dart';
import 'package:storyreader_mobile/features/chapter_read/audio_reader_bar.dart';
import 'package:storyreader_mobile/features/chapter_read/chapter_discussions_sheet.dart';
import 'package:storyreader_mobile/features/chapter_read/chapter_read_screen.dart';
import 'package:storyreader_mobile/providers/admin_provider.dart';
import 'package:storyreader_mobile/providers/auth_provider.dart';
import 'package:storyreader_mobile/providers/reader_provider.dart';
import 'package:storyreader_mobile/providers/story_provider.dart';

import 'support/api_server.dart';

class _FakeAudioTrackPlayer implements AudioTrackPlayer {
  final _completeController = StreamController<void>.broadcast();
  final List<String> playedUrls = [];
  final List<double> rates = [];
  bool paused = false;
  bool resumed = false;
  bool stopped = false;

  @override
  Stream<void> get onComplete => _completeController.stream;

  @override
  Future<void> playUrl(String url) async {
    playedUrls.add(url);
  }

  @override
  Future<void> pause() async => paused = true;

  @override
  Future<void> resume() async => resumed = true;

  @override
  Future<void> stop() async => stopped = true;

  @override
  Future<void> setPlaybackRate(double rate) async => rates.add(rate);

  void emitComplete() => _completeController.add(null);

  @override
  Future<void> dispose() async => _completeController.close();
}

class _FakeDiscussionRepository implements IDiscussionRepository {
  String? reportedChapterId;
  String? reportedDiscussionId;
  String? reportedReason;

  @override
  Future<List<DiscussionItem>> getDiscussions(String chapterId) async => [
        DiscussionItem(
          id: 'disc-1',
          content: 'Bình luận thử nghiệm',
          createdAt: DateTime.now(),
          user: 'Độc giả Alpha',
        ),
      ];

  @override
  Future<void> hideDiscussion(String chapterId, String discussionId) async {}

  @override
  Future<void> postDiscussion(String chapterId, String content) async {}

  @override
  Future<String> reportDiscussion(
    String chapterId,
    String discussionId, {
    String? reason,
  }) async {
    reportedChapterId = chapterId;
    reportedDiscussionId = discussionId;
    reportedReason = reason;
    return 'Đã ghi nhận báo cáo bình luận.';
  }
}

class _TestAuthNotifier extends AuthNotifier {
  final UserModel _fixedState;
  _TestAuthNotifier(this._fixedState) {
    state = _fixedState;
  }

  @override
  set state(UserModel value) {
    // Giữ trạng thái cố định khi _loadAuthStatus bất đồng bộ hoàn tất
    super.state = _fixedState;
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(
      const MethodChannel('plugins.it_nomads.com/flutter_secure_storage'),
      (_) async => null,
    );
  });

  group('Image URL CORS & Formatters & StoryDetail parity', () {
    test('resolveImageUrl proxies pinimg on web and blocks dangerous schemes', () {
      const pinUrl = 'https://i.pinimg.com/564x/aa/bb/cc.jpg';
      expect(ApiConstants.resolveImageUrl(pinUrl, isWeb: false), pinUrl);
      final webProxied = ApiConstants.resolveImageUrl(pinUrl, isWeb: true);
      expect(webProxied, startsWith('https://images.weserv.nl/?url='));
      expect(webProxied, contains(Uri.encodeComponent(pinUrl)));

      expect(ApiConstants.resolveImageUrl('javascript:alert(1)'), '');
      expect(ApiConstants.resolveImageUrl('vbscript:msgbox'), '');
      expect(ImageUtils.resolveUrl('javascript:alert(1)'), contains('unsplash.com'));
    });

    test('ttsAudioUrl encodes text and lang accurately', () {
      final prevBase = ApiConstants.baseUrl;
      addTearDown(() => ApiConstants.baseUrl = prevBase);
      ApiConstants.baseUrl = 'http://localhost:5066/api';

      final url = ApiConstants.ttsAudioUrl('Xin chào thế giới');
      expect(
        url,
        'http://localhost:5066/api/tts?text=Xin+ch%C3%A0o+th%E1%BA%BF+gi%E1%BB%9Bi&lang=vi',
      );
    });

    test('StoryDetail parses access flags and formatVnd formats Vietnamese currency', () {
      final detail = StoryDetail.fromJson({
        'id': 's-1',
        'title': 'Truyện VIP',
        'accessPolicy': 1,
        'price': 25000,
        'hasPurchased': true,
        'hasActiveVip': false,
        'hasFullAccess': true,
        'genres': ['Tiên Hiệp'],
        'chapters': [],
      });

      expect(detail.hasPurchased, isTrue);
      expect(detail.hasActiveVip, isFalse);
      expect(detail.hasFullAccess, isTrue);
      expect(detail.isUnlockedForUser, isTrue);
      expect(formatVnd(detail.price), '25.000 VNĐ');
    });
  });

  group('Vietnamese TTS Chunker & AudioReaderBar', () {
    test('buildChapterTtsChunks deduplicates heading and enforces 180 char cap', () {
      final longSentence = List.filled(45, 'từ ngữ').join(' ');
      final chunks = buildChapterTtsChunks(
        chapterNumber: 5,
        title: 'Chương 5: Cuộc chiến mới',
        content: 'Chương 5: Cuộc chiến mới\n$longSentence.\nĐoạn hai ngắn.',
      );

      expect(chunks.first, 'Chương 5: Cuộc chiến mới');
      expect(chunks.where((c) => c == 'Chương 5: Cuộc chiến mới').length, 1);
      expect(chunks.last, 'Đoạn hai ngắn.');
      for (final chunk in chunks) {
        expect(chunk.length, lessThanOrEqualTo(180));
      }
    });

    testWidgets('AudioReaderBar plays chunks, changes speed, and auto-advances', (tester) async {
      final fakePlayer = _FakeAudioTrackPlayer();
      final chapter = ChapterContent(
        id: 'chap-tts-1',
        chapterNumber: 1,
        title: 'Khởi đầu',
        content: 'Câu một ngắn gọn.\nCâu hai tiếp theo.',
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AudioReaderBar(
              chapter: chapter,
              surfaceColor: Colors.white,
              textColor: Colors.black,
              borderColor: Colors.grey,
              onClose: () {},
              playerFactory: () => fakePlayer,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Chunk 1: Chương 1: Khởi đầu., Chunk 2: Câu một ngắn gọn., Chunk 3: Câu hai tiếp theo.
      expect(find.text('Đoạn 1/3'), findsOneWidget);

      await tester.tap(find.byIcon(Icons.play_arrow_rounded));
      await tester.pumpAndSettle();

      expect(fakePlayer.playedUrls.length, 1);
      expect(fakePlayer.playedUrls.single, contains('/tts?text='));

      // Change speed 1.0x -> 1.25x
      await tester.tap(find.text('1.0x'));
      await tester.pumpAndSettle();
      expect(find.text('1.25x'), findsOneWidget);
      expect(fakePlayer.rates.last, 1.25);

      // Auto advance on track completion
      fakePlayer.emitComplete();
      await tester.pumpAndSettle();
      expect(find.text('Đoạn 2/3'), findsOneWidget);
      expect(fakePlayer.playedUrls.length, 2);

      // Verify pause works and persisted chunk index == 1
      await tester.tap(find.byIcon(Icons.pause_rounded));
      await tester.pumpAndSettle();
      expect(fakePlayer.paused, isTrue);

      final prefs = await SharedPreferences.getInstance();
      expect(prefs.getInt('tts_chunk_chap-tts-1'), 1);
    });
  });

  group('ChapterDiscussionsSheet report flow', () {
    testWidgets('authenticated reader can report a comment with preset reason', (tester) async {
      final fakeRepo = _FakeDiscussionRepository();
      final loggedInUser = UserModel(
        accessToken: 'jwt-token',
        email: 'user@example.com',
        displayName: 'Độc giả',
      );

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            discussionRepositoryProvider.overrideWithValue(fakeRepo),
            authProvider.overrideWith((_) => _TestAuthNotifier(loggedInUser)),
          ],
          child: const MaterialApp(
            home: Scaffold(
              body: ChapterDiscussionsSheet(
                chapterId: 'chap-1',
                chapterTitle: 'Chương 1',
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.flag_outlined).first);
      await tester.pumpAndSettle();

      await tester.tap(find.text('Spam / Quảng cáo'));
      await tester.pump();
      await tester.tap(find.text('Gửi báo cáo'));
      await tester.pumpAndSettle();

      expect(fakeRepo.reportedChapterId, 'chap-1');
      expect(fakeRepo.reportedDiscussionId, 'disc-1');
      expect(fakeRepo.reportedReason, 'Spam / Quảng cáo');
      expect(find.text('Đã ghi nhận báo cáo bình luận.'), findsOneWidget);
    });
  });

  group('Admin Schedules & Reported Comments screens', () {
    testWidgets('AdminSchedulesScreen displays scheduled items and publishes now', (tester) async {
      final server = ApiServer();
      final api = AdminApi(dio: server.client());

      await tester.pumpWidget(
        ProviderScope(
          overrides: [adminApiProvider.overrideWithValue(api)],
          child: const MaterialApp(home: AdminSchedulesScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Truyện Hẹn Giờ'), findsOneWidget);
      expect(find.text('Chương 12: Chương sắp đăng'), findsOneWidget);

      await tester.tap(find.text('Đăng ngay'));
      await tester.pumpAndSettle();

      expect(server.schedules.single['isPublished'], isTrue);
      expect(find.text('Đã xuất bản chương ngay lập tức!'), findsOneWidget);
    });

    testWidgets('AdminReportedCommentsScreen renders reported comments and approves', (tester) async {
      final server = ApiServer();
      final api = AdminApi(dio: server.client());

      await tester.pumpWidget(
        ProviderScope(
          overrides: [adminApiProvider.overrideWithValue(api)],
          child: const MaterialApp(home: AdminReportedCommentsScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Bình luận cần kiểm duyệt'), findsOneWidget);
      expect(find.text('Lý do báo cáo: Ngôn từ xúc phạm'), findsOneWidget);

      await tester.tap(find.text('Duyệt'));
      await tester.pumpAndSettle();

      expect(server.reportedComments.single['statusName'], 'Visible');
      expect(find.text('Đã duyệt bình luận hợp lệ.'), findsOneWidget);
    });

    testWidgets('AdminLayoutScreen exposes Lịch Đăng and Báo Cáo BL tabs for Admin', (tester) async {
      final server = ApiServer();
      final api = AdminApi(dio: server.client());
      final admin = UserModel(
        accessToken: 'admin-jwt',
        email: 'admin@storynest.local',
        displayName: 'Admin',
        roles: const ['Admin'],
      );

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authProvider.overrideWith((_) => _TestAuthNotifier(admin)),
            adminApiProvider.overrideWithValue(api),
          ],
          child: const MaterialApp(home: AdminLayoutScreen(initialIndex: 5)),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Lịch đăng chương'), findsOneWidget);
      await tester.ensureVisible(find.text('Báo Cáo BL'));
      await tester.pumpAndSettle();
      expect(find.text('Lịch Đăng'), findsOneWidget);
      expect(find.text('Báo Cáo BL'), findsOneWidget);
    });
  });

  group('ChapterReadScreen 403 locked message parity', () {
    testWidgets('renders backend 403 error message on locked chapter', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            chapterContentFamily('locked-ch').overrideWith(
              (_) => Future.error(
                const AuthException(
                  'Vui lòng mua truyện hoặc đăng ký VIP để đọc chương này.',
                  statusCode: 403,
                ),
              ),
            ),
            storyDetailFamily('s-1').overrideWith(
              (_) async => StoryDetail(
                id: 's-1',
                title: 'Truyện VIP',
                coverImageUrl: '',
                description: '',
                author: 'Tác giả',
                status: 0,
                accessPolicy: 1,
                price: 30000,
                freeChapterCount: 0,
                genres: const [],
                chapters: const [],
              ),
            ),
          ],
          child: const MaterialApp(
            home: ChapterReadScreen(chapterId: 'locked-ch', storyId: 's-1'),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Chương này đã bị khóa'), findsOneWidget);
      expect(
        find.text('Vui lòng mua truyện hoặc đăng ký VIP để đọc chương này.'),
        findsOneWidget,
      );
    });
  });
}
