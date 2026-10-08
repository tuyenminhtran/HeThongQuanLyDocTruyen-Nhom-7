import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../models/auth_model.dart';

class AuthApi {
  static Future<AuthResult> login(String email, String password) async {
    final res = await DioClient.instance.post(
      ApiConstants.authLogin,
      data: {'email': email, 'password': password},
    );
    return AuthResult.fromJson(res.data as Map<String, dynamic>);
  }

  static Future<AuthResult> register(
    String email,
    String password,
    String displayName,
  ) async {
    final res = await DioClient.instance.post(
      ApiConstants.authRegister,
      data: {
        'email': email,
        'password': password,
        'displayName': displayName,
      },
    );
    return AuthResult.fromJson(res.data as Map<String, dynamic>);
  }
}
