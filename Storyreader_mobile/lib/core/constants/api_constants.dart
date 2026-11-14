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
  static const String authRefresh = '/auth/refresh';
  static const String authLogout = '/auth/logout';

  // Story endpoints
  static const String stories = '/stories';
  static String storyDetail(String id) => '/stories/$id';
  static String storyChapters(String storyId) => '/stories/$storyId/chapters';
  static String storyChapterDetail(String storyId, String chapterId) => '/stories/$storyId/chapters/$chapterId';
  static String storyFollow(String id) => '/stories/$id/follow';
  static String storyIsFollowing(String id) => '/stories/$id/is-following';
  static const String uploadCover = '/stories/upload-cover';

  // Chapter & Discussion endpoints
  static String chapterDetail(String id) => '/chapters/$id';
  static String chapterDiscussions(String chapterId) => '/chapters/$chapterId/discussions';
  static String hideDiscussion(String chapterId, String discussionId) =>
      '/chapters/$chapterId/discussions/$discussionId/hide';
  static String reportDiscussion(String chapterId, String discussionId) =>
      '/chapters/$chapterId/discussions/$discussionId/report';

  // Text-to-Speech (TTS) audio proxy
  static String ttsAudioUrl(String text, {String lang = 'vi'}) {
    final normalizedBase = baseUrl.replaceAll(RegExp(r'/$'), '');
    return '$normalizedBase/tts?text=${Uri.encodeQueryComponent(text)}&lang=${Uri.encodeQueryComponent(lang)}';
  }

  // Genre endpoints
  static const String genres = '/genres';
  static String genreDetail(String id) => '/genres/$id';

  // Payment & Subscription endpoints
  static String buyStory(String storyId) => '/payments/story/$storyId';
  static String buySubscription(String planId) => '/payments/subscription/$planId';
  static const String subscriptionPlans = '/subscriptions/plans';
  static const String mySubscriptions = '/subscriptions/me';
  static const String myPurchases = '/subscriptions/me/purchases';
  static const String paymentCallback = '/payments/callback';
  static const String paymentDevConfirm = '/payments/dev-confirm';

  // Profile endpoints
  static const String profile = '/profile';
  static const String changePassword = '/profile/change-password';
  static const String profileHistory = '/profile/history';
  static const String profileBookmarks = '/profile/bookmarks';
  static const String profilePurchased = '/profile/purchased';

  // Notification endpoints
  static const String notifications = '/notifications';
  static const String notificationsUnreadCount = '/notifications/unread-count';
  static String notificationRead(String id) => '/notifications/$id/read';
  static const String notificationReadAll = '/notifications/read-all';

  // Admin endpoints
  static const String adminStatsOverview = '/admin/stats/overview';
  static const String adminRecentTransactions = '/admin/stats/recent-transactions';
  static const String adminRecentActivities = '/admin/stats/recent-activities';
  static const String adminUsers = '/admin/users';
  static String adminUserToggleRestriction(String id) => '/admin/users/$id/toggle-restriction';
  static const String adminTransactions = '/admin/transactions';
  static String adminForceActivate(String id) => '/admin/transactions/$id/force-activate';
  static String adminMarkFailed(String id) => '/admin/transactions/$id/mark-failed';

  // Admin Schedules endpoints
  static const String adminSchedules = '/admin/schedules';
  static String adminSchedulePublishNow(String chapterId) => '/admin/schedules/$chapterId/publish-now';
  static String adminScheduleReschedule(String chapterId) => '/admin/schedules/$chapterId/reschedule';
  static String adminScheduleCancel(String chapterId) => '/admin/schedules/$chapterId';

  // Admin Reported Comments endpoints
  static const String adminReportedComments = '/admin/reported-comments';
  static String adminReportedCommentApprove(String id) => '/admin/reported-comments/$id/approve';
  static String adminReportedCommentHide(String id) => '/admin/reported-comments/$id/hide';
  static String adminReportedCommentDelete(String id) => '/admin/reported-comments/$id';
  static String adminReportedCommentRestrictUser(String id) => '/admin/reported-comments/$id/restrict-user';

  /// Phân giải URL ảnh tương đối thành URL đầy đủ nếu cần (kèm bảo vệ CORS cho Pinterest trên Web)
  static String resolveImageUrl(String? url, {bool isWeb = kIsWeb}) {
    if (url == null) return '';
    final trimmed = url.trim();
    if (trimmed.isEmpty) return '';

    final lower = trimmed.toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('vbscript:')) {
      return '';
    }

    String resolved = trimmed;
    if (lower.startsWith('http://') || lower.startsWith('https://')) {
      // Nếu host là localhost và app đang chạy trên Android emulator, map về 10.0.2.2
      if (!isWeb && Platform.isAndroid && resolved.contains('localhost:5066')) {
        resolved = resolved.replaceAll('localhost:5066', '10.0.2.2:5066');
      }
    } else {
      final host = baseUrl.replaceAll(RegExp(r'/api/?$'), '');
      final cleanPath = trimmed.startsWith('/') ? trimmed : '/$trimmed';
      resolved = '$host$cleanPath';
    }

    if (isWeb && resolved.contains('pinimg.com')) {
      return 'https://images.weserv.nl/?url=${Uri.encodeComponent(resolved)}&default=${Uri.encodeComponent('https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80')}';
    }
    return resolved;
  }
}
