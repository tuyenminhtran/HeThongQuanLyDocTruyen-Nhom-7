import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:storyreader_mobile/widgets/empty_state.dart';

void main() {
  testWidgets('EmptyState widget smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: EmptyState(title: 'Không tìm thấy truyện nào'),
        ),
      ),
    );
    expect(find.text('Không tìm thấy truyện nào'), findsOneWidget);
  });
}
