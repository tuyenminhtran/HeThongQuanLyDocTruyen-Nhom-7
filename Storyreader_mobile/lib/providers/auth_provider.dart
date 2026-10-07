import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import '../core/storage/auth_storage.dart';
import '../data/api/auth_api.dart';
import '../data/models/auth_model.dart';

final authProvider = StateNotifierProvider<AuthNotifier, UserModel>((ref) {
  return AuthNotifier();
});

class AuthNotifier extends StateNotifier<UserModel> {
  AuthNotifier() : super(UserModel()) {
    init();
  }

  static const _roleClaim =
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

  Future<void> init() async {
    final token = await AuthStorage.getToken();
    final email = await AuthStorage.getEmail();
    final displayName = await AuthStorage.getDisplayName();

    if (token != null && token.isNotEmpty) {
      final roles = _extractRoles(token);
      state = UserModel(
        accessToken: token,
        email: email,
        displayName: displayName,
        roles: roles,
      );
    }
  }

  List<String> _extractRoles(String token) {
    try {
      final decoded = JwtDecoder.decode(token);
      final roleData = decoded[_roleClaim] ?? decoded['role'];
      if (roleData is List) {
        return roleData.map((e) => e.toString()).toList();
      } else if (roleData is String) {
        return [roleData];
      }
    } catch (_) {}
    return [];
  }

  Future<void> login(String email, String password) async {
    final result = await AuthApi.login(email, password);
    final roles = _extractRoles(result.accessToken);
    await AuthStorage.saveAuth(
      token: result.accessToken,
      email: email,
      displayName: email, // Web sets displayName = email on login
    );
    state = UserModel(
      accessToken: result.accessToken,
      email: email,
      displayName: email,
      roles: roles,
    );
  }

  Future<void> register(
    String email,
    String password,
    String displayName,
  ) async {
    final result = await AuthApi.register(email, password, displayName);
    final roles = _extractRoles(result.accessToken);
    await AuthStorage.saveAuth(
      token: result.accessToken,
      email: email,
      displayName: displayName,
    );
    state = UserModel(
      accessToken: result.accessToken,
      email: email,
      displayName: displayName,
      roles: roles,
    );
  }

  Future<void> logout() async {
    await AuthStorage.clearAuth();
    state = UserModel();
  }

  Future<void> updateDisplayName(String newName) async {
    if (state.accessToken != null && state.email != null) {
      await AuthStorage.saveAuth(
        token: state.accessToken!,
        email: state.email!,
        displayName: newName,
      );
      state = state.copyWith(displayName: newName);
    }
  }
}
