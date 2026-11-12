import 'dart:convert';
import 'dart:typed_data';
import 'package:dio/dio.dart';

/// In-memory HTTP responses keep regression tests independent of a running DB.
class ApiServer implements HttpClientAdapter {
  final requests = <RequestOptions>[];
  final genres = <Map<String, dynamic>>[
    {
      'id': 'genre-1',
      'name': 'Tiên Hiệp',
      'slug': 'tien-hiep',
      'storyCount': 2,
    },
  ];
  final users = <Map<String, dynamic>>[
    {
      'id': 'admin-1',
      'email': 'admin@storynest.local',
      'displayName': 'Administrator',
      'role': 'Admin',
      'isRestricted': false,
      'createdAt': '2026-10-01T00:00:00Z',
    },
    {
      'id': 'reader-1',
      'email': 'reader@storyreader.vn',
      'displayName': 'Độc Giả Mẫu',
      'role': 'VIP',
      'isRestricted': false,
      'createdAt': '2026-10-02T00:00:00Z',
    },
  ];
  bool fail = false;

  Dio client() =>
      Dio(BaseOptions(baseUrl: 'http://localhost:5066/api'))
        ..httpClientAdapter = this;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    requests.add(options);
    if (fail) return _response({'message': 'Máy chủ đang bận'}, 503);
    final path = options.path;
    if (path == '/genres' && options.method == 'GET') return _response(genres);
    if (path == '/genres' && options.method == 'POST') {
      final name = (options.data as Map)['name'] as String;
      if (genres.any((genre) => genre['name'] == name)) {
        return _response({'message': 'Thể loại này đã tồn tại.'}, 400);
      }
      final genre = {
        'id': 'genre-${genres.length + 1}',
        'name': name,
        'slug': 'new-genre',
        'storyCount': 0,
      };
      genres.add(genre);
      return _response(genre, 201);
    }
    if (path.startsWith('/genres/')) {
      final genre = genres.firstWhere(
        (genre) => genre['id'] == path.split('/').last,
      );
      if (options.method == 'PUT') {
        genre['name'] = (options.data as Map)['name'];
        return _response(genre);
      }
      if (options.method == 'DELETE') {
        genres.remove(genre);
        return _response({'message': 'Đã xóa'});
      }
    }
    if (path == '/admin/users') {
      final keyword = (options.queryParameters['keyword'] as String? ?? '')
          .toLowerCase();
      return _response(
        users
            .where(
              (user) => '${user['email']} ${user['displayName']}'
                  .toLowerCase()
                  .contains(keyword),
            )
            .toList(),
      );
    }
    if (path.endsWith('/toggle-restriction')) {
      final user = users.firstWhere((user) => user['id'] == path.split('/')[3]);
      user['isRestricted'] = !(user['isRestricted'] as bool);
      return _response({
        'id': user['id'],
        'isRestricted': user['isRestricted'],
      });
    }
    if (path == '/admin/stats/overview') {
      return _response({
        'todayRevenue': 49000,
        'revenueGrowthPercent': 12.5,
        'totalUsers': 2,
        'newUsersThisWeek': 1,
        'totalFollows': 5,
        'totalChapterViews': 1500,
        'totalStories': 3,
      });
    }
    if (path == '/admin/stats/recent-transactions') {
      return _response([
        {
          'id': 'tx-1',
          'userName': 'Độc Giả Mẫu',
          'userEmail': 'reader@storyreader.vn',
          'amount': 49000,
          'type': 'VIP Subscription',
          'status': 'Success',
          'provider': 'VNPay',
          'createdAt': '2026-10-21T00:00:00Z',
        },
      ]);
    }
    if (path == '/admin/stats/recent-activities') {
      return _response([
        {
          'id': 'activity-1',
          'type': 'chapter_added',
          'title': 'Đã thêm chương 2',
          'description': 'Truyện thử',
          'timestamp': '2026-10-21T00:00:00Z',
        },
      ]);
    }
    if (path.startsWith('/profile/')) return _response([]);
    return _response({'message': 'Unknown test endpoint $path'}, 404);
  }

  ResponseBody _response(Object data, [int status = 200]) =>
      ResponseBody.fromString(
        jsonEncode(data),
        status,
        headers: {
          Headers.contentTypeHeader: [Headers.jsonContentType],
        },
      );
  @override
  void close({bool force = false}) {}
}
