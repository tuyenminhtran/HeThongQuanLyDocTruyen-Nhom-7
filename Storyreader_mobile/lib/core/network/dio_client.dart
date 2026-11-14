import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../constants/api_constants.dart';
import '../storage/auth_storage.dart';
import 'api_error.dart';

class DioClient {
  static Dio? _instance;
  static VoidCallback? onUnauthorized;
  static Future<String?>? _refreshInFlight;

  static Dio get instance {
    _instance ??= _createDio();
    return _instance!;
  }

  /// Khởi tạo lại instance nếu đổi cấu hình Base URL
  static void reset() {
    _instance = null;
    _refreshInFlight = null;
  }

  static Future<String?> _refreshAccessToken(Dio dio) {
    _refreshInFlight ??= () async {
      try {
        final refreshToken = await AuthStorage.getRefreshToken();
        if (refreshToken == null || refreshToken.isEmpty) return null;

        final res = await dio.post(
          ApiConstants.authRefresh,
          data: {'refreshToken': refreshToken},
          options: Options(extra: {'skip_auth_refresh': true}),
        );
        final data = Map<String, dynamic>.from(res.data as Map);
        final nextAccess = data['accessToken'] as String? ?? '';
        if (nextAccess.isEmpty) return null;

        final email = data['email'] as String? ?? (await AuthStorage.getEmail() ?? '');
        final displayName =
            data['displayName'] as String? ?? (await AuthStorage.getDisplayName() ?? '');
        final nextRefresh = data['refreshToken'] as String? ?? refreshToken;

        await AuthStorage.saveAuth(
          token: nextAccess,
          email: email,
          displayName: displayName,
          refreshToken: nextRefresh,
        );
        return nextAccess;
      } catch (_) {
        return null;
      } finally {
        _refreshInFlight = null;
      }
    }();
    return _refreshInFlight!;
  }

  static bool _isAuthPath(String path) =>
      path.contains(ApiConstants.authLogin) ||
      path.contains(ApiConstants.authRegister) ||
      path.contains(ApiConstants.authRefresh) ||
      path.contains(ApiConstants.authLogout);

  static Dio _createDio() {
    final dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 30),
        sendTimeout: const Duration(seconds: 20),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // 1. Interceptor gắn Token và bắt 401 (xoay vòng refreshToken trước khi đăng xuất)
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Luôn cập nhật baseUrl mới nhất nếu có thay đổi
          if (options.baseUrl != ApiConstants.baseUrl) {
            options.baseUrl = ApiConstants.baseUrl;
          }

          final token = await AuthStorage.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          final requestOptions = error.requestOptions;
          final skipRefresh = requestOptions.extra['skip_auth_refresh'] == true;
          final alreadyRetried = requestOptions.extra['_auth_retried'] == true;

          if (error.response?.statusCode == 401) {
            if (!skipRefresh && !alreadyRetried && !_isAuthPath(requestOptions.path)) {
              final nextToken = await _refreshAccessToken(dio);
              if (nextToken != null) {
                final retryOptions = Options(
                  method: requestOptions.method,
                  headers: {
                    ...requestOptions.headers,
                    'Authorization': 'Bearer $nextToken',
                  },
                  extra: {...requestOptions.extra, '_auth_retried': true},
                );
                try {
                  final response = await dio.request<dynamic>(
                    requestOptions.path,
                    data: requestOptions.data,
                    queryParameters: requestOptions.queryParameters,
                    options: retryOptions,
                  );
                  return handler.resolve(response);
                } catch (_) {}
              }
            }

            if (!requestOptions.path.contains(ApiConstants.authLogout)) {
              await AuthStorage.clearAuth();
              onUnauthorized?.call();
            }
          }

          // Tự động retry tối đa 1 lần đối với GET request khi timeout/connection error
          if (_shouldRetry(error)) {
            try {
              final response = await _retryRequest(dio, error.requestOptions);
              return handler.resolve(response);
            } catch (_) {
              // Nếu retry vẫn thất bại thì trả về error ban đầu
            }
          }

          return handler.next(error);
        },
      ),
    );

    // 2. Logging Interceptor ở chế độ Debug
    if (kDebugMode) {
      dio.interceptors.add(
        LogInterceptor(
          requestHeader: false,
          requestBody: false,
          responseHeader: false,
          responseBody: false,
          error: true,
          logPrint: (obj) => debugPrint('[DIO] $obj'),
        ),
      );
    }

    return dio;
  }

  static bool _shouldRetry(DioException error) {
    final method = error.requestOptions.method.toUpperCase();
    final isGet = method == 'GET';
    final isNetworkIssue = error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.connectionError;

    final retryCount = error.requestOptions.extra['retry_count'] as int? ?? 0;
    return isGet && isNetworkIssue && retryCount < 1;
  }

  static Future<Response<dynamic>> _retryRequest(Dio dio, RequestOptions requestOptions) async {
    final retryCount = (requestOptions.extra['retry_count'] as int? ?? 0) + 1;
    final options = Options(
      method: requestOptions.method,
      headers: requestOptions.headers,
      extra: {...requestOptions.extra, 'retry_count': retryCount},
    );

    await Future.delayed(const Duration(milliseconds: 800));

    return dio.request<dynamic>(
      requestOptions.path,
      data: requestOptions.data,
      queryParameters: requestOptions.queryParameters,
      options: options,
    );
  }

  /// Tiện ích bọc lệnh gọi Dio để tự động ném ra AppException tiếng Việt
  static Future<T> safeRequest<T>(Future<T> Function() call) async {
    try {
      return await call();
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    } catch (e) {
      if (e is AppException) rethrow;
      throw AppException(e.toString());
    }
  }
}
