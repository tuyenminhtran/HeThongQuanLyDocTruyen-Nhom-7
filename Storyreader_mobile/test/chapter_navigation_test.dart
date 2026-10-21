import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:storyreader_mobile/data/models/story_model.dart';
import 'package:storyreader_mobile/features/chapter_read/chapter_navigation.dart';
import 'package:storyreader_mobile/providers/story_provider.dart';

void main() {
  testWidgets(
    'next, previous, and contents preserve story context and respect first/last chapter',
    (tester) async {
      final story = StoryDetail(
        id: 'story-1',
        title: 'Truyện thử',
        coverImageUrl: '',
        description: '',
        author: '',
        status: 0,
        accessPolicy: 0,
        freeChapterCount: 0,
        genres: [],
        chapters: [3, 1, 2]
            .map(
              (number) => ChapterListItem(
                id: 'c$number',
                chapterNumber: number,
                title: 'Chương $number',
                requiresAccess: false,
              ),
            )
            .toList(),
      );
      final router = GoRouter(
        initialLocation: '/chapters/c1?storyId=story-1',
        routes: [
          GoRoute(
            path: '/chapters/:id',
            builder: (_, state) => Scaffold(
              body: Text('Đang đọc ${state.pathParameters['id']}'),
              bottomNavigationBar: ChapterNavigation(
                storyId: state.uri.queryParameters['storyId']!,
                chapterId: state.pathParameters['id']!,
              ),
            ),
          ),
        ],
      );
      addTearDown(router.dispose);
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            storyDetailFamily('story-1').overrideWith((ref) async => story),
          ],
          child: MaterialApp.router(routerConfig: router),
        ),
      );
      await tester.pumpAndSettle();
      expect(
        tester
            .widget<TextButton>(find.widgetWithText(TextButton, 'Trước'))
            .onPressed,
        isNull,
      );
      await tester.tap(find.text('Sau'));
      await tester.pumpAndSettle();
      expect(find.text('Đang đọc c2'), findsOneWidget);
      expect(
        router.routeInformationProvider.value.uri.queryParameters['storyId'],
        'story-1',
      );
      await tester.tap(find.text('Trước'));
      await tester.pumpAndSettle();
      expect(find.text('Đang đọc c1'), findsOneWidget);
      await tester.tap(find.text('Mục lục'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Chương 3: Chương 3'));
      await tester.pumpAndSettle();
      expect(find.text('Đang đọc c3'), findsOneWidget);
      expect(
        tester
            .widget<TextButton>(find.widgetWithText(TextButton, 'Sau'))
            .onPressed,
        isNull,
      );
      await tester.pumpWidget(const SizedBox.shrink());
    },
  );
}
