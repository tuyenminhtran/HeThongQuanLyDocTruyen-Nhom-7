import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthStorage {
  static const _storage = FlutterSecureStorage();

  static const _keyToken = 'storyreader_access_token';
  static const _keyEmail = 'storyreader_email';
  static const _keyDisplayName = 'storyreader_display_name';

  static Future<void> saveAuth({
    required String token,
    required String email,
    required String displayName,
  }) async {
    await _storage.write(key: _keyToken, value: token);
    await _storage.write(key: _keyEmail, value: email);
    await _storage.write(key: _keyDisplayName, value: displayName);
  }

  static Future<String?> getToken() async => await _storage.read(key: _keyToken);
  static Future<String?> getEmail() async => await _storage.read(key: _keyEmail);
  static Future<String?> getDisplayName() async => await _storage.read(key: _keyDisplayName);

  static Future<void> clearAuth() async {
    await _storage.delete(key: _keyToken);
    await _storage.delete(key: _keyEmail);
    await _storage.delete(key: _keyDisplayName);
  }
}

class ReaderPreferences {
  static const _keyTheme = 'storyreader-theme';
  static const _keyFontSize = 'storyreader-font-size';

  static Future<void> saveTheme(String theme) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyTheme, theme);
  }

  static Future<String> getTheme() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyTheme) ?? 'dark';
  }

  static Future<void> saveFontSize(double size) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble(_keyFontSize, size);
  }

  static Future<double> getFontSize() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getDouble(_keyFontSize) ?? 20.0;
  }
}
