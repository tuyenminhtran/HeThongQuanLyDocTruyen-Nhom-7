import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:storyreader_mobile/data/api/admin_api.dart';
import 'package:storyreader_mobile/features/admin/admin_categories_screen.dart';
import 'package:storyreader_mobile/features/admin/admin_users_screen.dart';
import 'package:storyreader_mobile/features/admin/admin_dashboard_screen.dart';
import 'package:storyreader_mobile/providers/admin_provider.dart';
import 'support/api_server.dart';

void main() {
  testWidgets(
    'category forms save, reject duplicates, edit, and confirm deletion',
    (tester) async {
      final server = ApiServer();
      final api = AdminApi(dio: server.client());
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            adminApiProvider.overrideWithValue(api),
            genresProvider.overrideWith((ref) => api.getGenres()),
          ],
          child: const MaterialApp(
            home: Scaffold(body: AdminCategoriesScreen()),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Tiên Hiệp'), findsOneWidget);
      await tester.tap(find.text('Thêm'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Lưu'));
      await tester.pumpAndSettle();
      expect(find.text('Vui lòng nhập tên thể loại.'), findsOneWidget);
      await tester.enterText(find.byType(TextFormField), 'Tiên Hiệp');
      await tester.tap(find.text('Lưu'));
      await tester.pumpAndSettle();
      expect(find.text('Thể loại này đã tồn tại.'), findsOneWidget);
      await tester.enterText(find.byType(TextFormField), 'Trinh Thám');
      await tester.tap(find.text('Lưu'));
      await tester.pumpAndSettle();
      expect(find.text('Trinh Thám'), findsOneWidget);
      await tester.tap(find.byTooltip('Sửa thể loại').last);
      await tester.pumpAndSettle();
      await tester.enterText(find.byType(TextFormField), 'Trinh Thám Mới');
      await tester.tap(find.text('Lưu'));
      await tester.pumpAndSettle();
      expect(find.text('Trinh Thám Mới'), findsOneWidget);
      await tester.tap(find.byTooltip('Xóa thể loại').last);
      await tester.pumpAndSettle();
      await tester.tap(find.text('Xóa').last);
      await tester.pumpAndSettle();
      expect(find.text('Trinh Thám Mới'), findsNothing);
    },
  );

  testWidgets(
    'user screen searches server data and persists lock/unlock; admin has no lock action',
    (tester) async {
      final server = ApiServer();
      final api = AdminApi(dio: server.client());
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            adminApiProvider.overrideWithValue(api),
            adminUsersProvider.overrideWith(
              (ref, keyword) => api.getUsers(keyword),
            ),
          ],
          child: const MaterialApp(home: Scaffold(body: AdminUsersScreen())),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Administrator'), findsOneWidget);
      expect(find.text('Khóa'), findsOneWidget);
      await tester.enterText(find.byType(TextField), 'reader@');
      await tester.pump(const Duration(milliseconds: 400));
      await tester.pumpAndSettle();
      expect(find.text('Administrator'), findsNothing);
      await tester.tap(find.text('Khóa'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Xác nhận'));
      await tester.pumpAndSettle();
      expect(find.text('Đã khóa'), findsOneWidget);
      await tester.tap(find.text('Mở khóa'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Xác nhận'));
      await tester.pumpAndSettle();
      expect(find.text('Hoạt động'), findsOneWidget);
    },
  );

  testWidgets(
    'dashboard uses API values and reloads on its 30 second interval',
    (tester) async {
      final server = ApiServer();
      final api = AdminApi(dio: server.client());
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            dashboardProvider.overrideWith((ref) => api.getDashboard()),
          ],
          child: const MaterialApp(
            home: Scaffold(body: AdminDashboardScreen()),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.textContaining('49.000'), findsWidgets);
      expect(server.requests.length, 3);
      await tester.pump(const Duration(seconds: 30));
      await tester.pumpAndSettle();
      expect(server.requests.length, 6);
      await tester.pumpWidget(const SizedBox.shrink());
    },
  );

  testWidgets('server errors offer a retry and recover', (tester) async {
    final server = ApiServer()..fail = true;
    final api = AdminApi(dio: server.client());
    await tester.pumpWidget(
      ProviderScope(
        overrides: [genresProvider.overrideWith((ref) => api.getGenres())],
        child: const MaterialApp(home: Scaffold(body: AdminCategoriesScreen())),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Máy chủ đang bận'), findsOneWidget);
    server.fail = false;
    await tester.tap(find.text('Thử lại'));
    await tester.pumpAndSettle();
    expect(find.text('Tiên Hiệp'), findsOneWidget);
  });
}
