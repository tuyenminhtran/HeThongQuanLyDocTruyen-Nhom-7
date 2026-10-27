import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:storyreader_mobile/core/theme/app_theme.dart';
import 'package:storyreader_mobile/data/models/story_model.dart';
import 'package:storyreader_mobile/providers/theme_provider.dart';
import 'package:storyreader_mobile/widgets/story_card.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('Giai đoạn 2 UI & Theme Tests', () {
    testWidgets('StoryCard renders Comic badge and VIP policy properly', (tester) async {
      final comicStory = StoryListItem(
        id: 'comic-1',
        title: 'Bộ Truyện Tranh Test',
        coverImageUrl: '',
        author: 'Họa sĩ A',
        type: StoryType.comic,
        status: 0,
        accessPolicy: 1, // paid -> VIP badge
        totalChapters: 42,
        viewCount: 15400,
      );

      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.darkTheme,
          home: Scaffold(
            body: StoryCard(
              story: comicStory,
              isHorizontal: true,
            ),
          ),
        ),
      );

      expect(find.text('Bộ Truyện Tranh Test'), findsOneWidget);
      expect(find.text('Tranh'), findsOneWidget);
      expect(find.text('VIP'), findsOneWidget);
      expect(find.text('Chương 42'), findsOneWidget);
      expect(find.text('15k lượt xem'), findsOneWidget);
    });

    testWidgets('StoryCard renders Novel badge and Free policy properly', (tester) async {
      final novelStory = StoryListItem(
        id: 'novel-1',
        title: 'Bộ Tiểu Thuyết Test',
        coverImageUrl: '',
        author: 'Tác giả B',
        type: StoryType.novel,
        status: 1, // completed
        accessPolicy: 0, // free
        totalChapters: 10,
        viewCount: 850,
      );

      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: Scaffold(
            body: StoryCard(
              story: novelStory,
              isHorizontal: true,
            ),
          ),
        ),
      );

      expect(find.text('Bộ Tiểu Thuyết Test'), findsOneWidget);
      expect(find.text('Chữ'), findsOneWidget);
      expect(find.text('Miễn phí'), findsOneWidget);
      expect(find.text('850 lượt xem'), findsOneWidget);
      expect(find.text('Đã hoàn thành'), findsOneWidget);
    });

    testWidgets('AppThemeModeProvider toggles Light, Dark, System mode correctly', (tester) async {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      expect(container.read(appThemeModeProvider), ThemeMode.light);

      await container.read(appThemeModeProvider.notifier).setThemeMode(ThemeMode.dark);
      expect(container.read(appThemeModeProvider), ThemeMode.dark);

      await container.read(appThemeModeProvider.notifier).setThemeMode(ThemeMode.light);
      expect(container.read(appThemeModeProvider), ThemeMode.light);

      await container.read(appThemeModeProvider.notifier).setThemeMode(ThemeMode.system);
      expect(container.read(appThemeModeProvider), ThemeMode.system);
    });
  });
}
