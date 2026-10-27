import 'package:dio/dio.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../../core/storage/auth_storage.dart';
import '../models/auth_model.dart';

abstract class IAuthRepository {
  Future<AuthResult> login(String email, String password);
  Future<AuthResult> register(String email, String password, String displayName);
  Future<UserModel?> restoreSession();
  Future<void> logout();
}

class AuthRepository implements IAuthRepository {
  final Dio _dio;

  AuthRepository({Dio? dio}) : _dio = dio ?? DioClient.instance;

  @override
  Future<AuthResult> login(String email, String password) async {
    return DioClient.safeRequest(() async {
      final res = await _dio.post(
        ApiConstants.authLogin,
        data: {
          'email': email.trim(),
          'password': password,
        },
      );

      final data = Map<String, dynamic>.from(res.data as Map);
      final result = AuthResult.fromJson(data);

      await AuthStorage.saveAuth(
        token: result.accessToken,
        email: result.email ?? email.trim(),
        displayName: result.displayName ?? email.trim(),
      );

      return result;
    });
  }

  @override
  Future<AuthResult> register(String email, String password, String displayName) async {
    return DioClient.safeRequest(() async {
      final res = await _dio.post(
        ApiConstants.authRegister,
        data: {
          'email': email.trim(),
          'password': password,
          'displayName': displayName.trim(),
        },
      );

      final data = Map<String, dynamic>.from(res.data as Map);
      final result = AuthResult.fromJson(data);

      await AuthStorage.saveAuth(
        token: result.accessToken,
        email: result.email ?? email.trim(),
        displayName: result.displayName ?? displayName.trim(),
      );

      return result;
    });
  }

  @override
  Future<UserModel?> restoreSession() async {
    final token = await AuthStorage.getToken();
    if (token == null || token.isEmpty) return null;

    final email = await AuthStorage.getEmail();
    final displayName = await AuthStorage.getDisplayName();

    return UserModel(
      accessToken: token,
      email: email,
      displayName: displayName,
    );
  }

  @override
  Future<void> logout() async {
    await AuthStorage.clearAuth();
  }
}
