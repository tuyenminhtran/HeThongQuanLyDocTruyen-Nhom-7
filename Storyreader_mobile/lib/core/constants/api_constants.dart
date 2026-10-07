import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class ApiConstants {
  /// Base URL configured for StoryReader.Api backend
  ///
  /// - Android Emulator: http://10.0.2.2:5066/api
  /// - iOS Simulator / Desktop / Web: http://localhost:5066/api
  /// - Physical device: Thay bằng địa chỉ IP LAN của máy tính chạy backend (VD: http://192.168.1.100:5066/api)
  static String get defaultBaseUrl {
    if (kIsWeb) {
      return 'http://localhost:5066/api';
    }
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:5066/api';
    }
    return 'http://localhost:5066/api';
  }

  /// Override this variable if you want to hardcode a specific IP address
  static String baseUrl = defaultBaseUrl;

  // Endpoints
  static const String authRegister = '/auth/register';
  static const String authLogin = '/auth/login';
  static const String stories = '/stories';
  static String storyDetail(String id) => '/stories/$id';
  static String storyChapters(String storyId) => '/stories/$storyId/chapters';
  static String chapterDetail(String id) => '/chapters/$id';
  static String buyStory(String storyId) => '/payments/story/$storyId';
  static String buySubscription(String planId) => '/payments/subscription/$planId';
}
