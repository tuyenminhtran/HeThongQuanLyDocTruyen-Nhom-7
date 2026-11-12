import 'package:dio/dio.dart';

String apiErrorMessage(Object error, String fallback) {
  if (error is DioException) {
    final data = error.response?.data;
    if (data is Map && data['message'] is String) {
      return data['message'] as String;
    }
    if (error.response?.statusCode == 403) {
      return 'Bạn không có quyền thực hiện thao tác này.';
    }
    if (error.response?.statusCode == 401) {
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }
    if (error.response == null) {
      return 'Không kết nối được máy chủ. Vui lòng kiểm tra kết nối và thử lại.';
    }
  }
  return fallback;
}
