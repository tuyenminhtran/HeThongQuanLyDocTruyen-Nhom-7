import 'package:dio/dio.dart';

/// Lớp ngoại lệ cơ sở cho toàn bộ ứng dụng Mobile
class AppException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic details;

  const AppException(
    this.message, {
    this.statusCode,
    this.details,
  });

  @override
  String toString() => message;

  /// Chuyển đổi từ DioException sang AppException với thông báo tiếng Việt chuẩn mực
  factory AppException.fromDio(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const NetworkException(
          'Kết nối đến máy chủ quá thời gian quy định. Vui lòng kiểm tra lại mạng.',
        );

      case DioExceptionType.connectionError:
        return const NetworkException(
          'Không thể kết nối đến máy chủ. Vui lòng đảm bảo máy chủ đang chạy và thiết bị đã kết nối mạng.',
        );

      case DioExceptionType.badResponse:
        final status = error.response?.statusCode;
        final data = error.response?.data;
        String? serverMsg;

        if (data is Map) {
          if (data['message'] is String && (data['message'] as String).isNotEmpty) {
            serverMsg = data['message'] as String;
          } else if (data['errors'] is Map) {
            // Lỗi validation của ASP.NET Core: { errors: { Field: ["error"] } }
            final errorsMap = data['errors'] as Map;
            final firstKey = errorsMap.keys.firstOrNull;
            if (firstKey != null && errorsMap[firstKey] is List && (errorsMap[firstKey] as List).isNotEmpty) {
              serverMsg = errorsMap[firstKey][0].toString();
            }
          }
        }

        switch (status) {
          case 400:
            return ValidationException(
              serverMsg ?? 'Dữ liệu yêu cầu không hợp lệ. Vui lòng kiểm tra lại.',
              statusCode: 400,
            );
          case 401:
            return AuthException(
              serverMsg ?? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
              statusCode: 401,
            );
          case 403:
            return AuthException(
              serverMsg ?? 'Bạn không có quyền truy cập nội dung này.',
              statusCode: 403,
            );
          case 404:
            return NotFoundException(
              serverMsg ?? 'Nội dung bạn tìm kiếm không tồn tại.',
              statusCode: 404,
            );
          case 500:
          case 502:
          case 503:
            return ServerException(
              serverMsg ?? 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau ít phút.',
              statusCode: status,
            );
          default:
            return AppException(
              serverMsg ?? 'Đã xảy ra lỗi không xác định ($status).',
              statusCode: status,
            );
        }

      case DioExceptionType.cancel:
        return const AppException('Yêu cầu đã bị hủy.');

      default:
        return AppException(
          error.message ?? 'Đã xảy ra sự cố kết nối. Vui lòng thử lại.',
        );
    }
  }
}

class NetworkException extends AppException {
  const NetworkException(super.message, {super.statusCode, super.details});
}

class AuthException extends AppException {
  const AuthException(super.message, {super.statusCode, super.details});
}

class ValidationException extends AppException {
  const ValidationException(super.message, {super.statusCode, super.details});
}

class NotFoundException extends AppException {
  const NotFoundException(super.message, {super.statusCode, super.details});
}

class ServerException extends AppException {
  const ServerException(super.message, {super.statusCode, super.details});
}

/// Helper trích xuất thông điệp lỗi cho UI
String apiErrorMessage(Object error, [String fallback = 'Đã có lỗi xảy ra. Vui lòng thử lại.']) {
  if (error is AppException) {
    return error.message;
  }
  if (error is DioException) {
    return AppException.fromDio(error).message;
  }
  if (error is Exception) {
    final str = error.toString();
    if (str.startsWith('Exception: ')) {
      return str.substring(11);
    }
    return str;
  }
  return fallback;
}
