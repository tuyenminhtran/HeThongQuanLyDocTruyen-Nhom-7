import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:storyreader_mobile/data/models/chapter_model.dart';
import 'package:storyreader_mobile/data/models/discussion_model.dart';
import 'package:storyreader_mobile/features/chapter_read/comic_reader_view.dart';
import 'package:storyreader_mobile/features/chapter_read/novel_reader_view.dart';
import 'package:storyreader_mobile/features/chapter_read/reader_settings_sheet.dart';
import 'package:storyreader_mobile/providers/reader_provider.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('Giai đoạn 3 Reader & Discussions Tests', () {
    testWidgets('NovelReaderView renders chapter content, title, and buttons', (tester) async {
      final novelChapter = ChapterContent(
        id: 'chap-novel-1',
        chapterNumber: 1,
        title: 'Mở đầu hành trình',
        content: 'Đêm đông lạnh lẽo trên đỉnh núi tuyết.\nMột bóng hình cô độc bước đi.',
        storyType: 0,
        imageUrls: [],
      );

      bool toggleControlsCalled = false;

      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: NovelReaderView(
                chapter: novelChapter,
                storyId: 'story-1',
                onToggleControls: () => toggleControlsCalled = true,
                textColor: Colors.white,
                borderColor: Colors.grey,
              ),
            ),
          ),
        ),
      );

      // Kiểm tra tiêu đề và nội dung
      expect(find.text('CHƯƠNG 1'), findsOneWidget);
      expect(find.text('Mở đầu hành trình'), findsOneWidget);
      expect(find.textContaining('Đêm đông lạnh lẽo'), findsOneWidget);
      expect(find.text('Thảo luận chương'), findsOneWidget);

      // Chạm để ẩn/hiện điều khiển
      await tester.tap(find.text('CHƯƠNG 1'));
      expect(toggleControlsCalled, isTrue);
    });

    testWidgets('ComicReaderView renders webtoon stream and page indicator', (tester) async {
      final comicChapter = ChapterContent(
        id: 'chap-comic-1',
        chapterNumber: 5,
        title: 'Trận chiến đỉnh phong',
        content: '',
        storyType: 1,
        imageUrls: [
          'https://example.com/page1.jpg',
          'https://example.com/page2.jpg',
        ],
      );

      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: ComicReaderView(
                chapter: comicChapter,
                storyId: 'story-comic-1',
                onToggleControls: () {},
              ),
            ),
          ),
        ),
      );

      // Kiểm tra chỉ số trang ban đầu
      expect(find.text('1 / 2'), findsOneWidget);
      // Kiểm tra InteractiveViewer hỗ trợ pinch-to-zoom
      expect(find.byType(InteractiveViewer), findsOneWidget);
    });

    testWidgets('ReaderSettingsSheet can be opened and change reading preferences', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: Builder(
                builder: (ctx) => ElevatedButton(
                  onPressed: () => ReaderSettingsSheet.show(ctx),
                  child: const Text('Open Settings'),
                ),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Open Settings'));
      await tester.pumpAndSettle();

      expect(find.text('Cài đặt giao diện đọc'), findsOneWidget);
      expect(find.text('MÀU NỀN TRANG ĐỌC'), findsOneWidget);
      expect(find.text('Giấy ngà'), findsOneWidget);
      expect(find.text('PHÔNG CHỮ'), findsOneWidget);
      expect(find.text('KHOẢNG CÁCH DÒNG'), findsOneWidget);

      // Chọn nền giấy ngà
      await tester.tap(find.text('Giấy ngà'));
      await tester.pumpAndSettle();
    });

    test('DiscussionItem correctly parses json from API', () {
      final json = {
        'id': 'disc-1',
        'content': 'Truyện hay quá tác giả ơi!',
        'createdAt': '2026-03-20T10:00:00Z',
        'user': 'Nguyễn Văn A',
      };

      final item = DiscussionItem.fromJson(json);
      expect(item.id, 'disc-1');
      expect(item.content, 'Truyện hay quá tác giả ơi!');
      expect(item.user, 'Nguyễn Văn A');
      expect(item.createdAt.year, 2026);
    });
  });
}
