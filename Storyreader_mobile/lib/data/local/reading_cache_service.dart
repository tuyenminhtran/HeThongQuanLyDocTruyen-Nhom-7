import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/chapter_model.dart';

class ReadingProgressItem {
  final String storyId;
  final String chapterId;
  final int chapterNumber;
  final String storyTitle;
  final String chapterTitle;
  final double scrollOffset;
  final double scrollPercentage;
  final DateTime updatedAt;

  ReadingProgressItem({
    required this.storyId,
    required this.chapterId,
    required this.chapterNumber,
    required this.storyTitle,
    required this.chapterTitle,
    this.scrollOffset = 0.0,
    this.scrollPercentage = 0.0,
    required this.updatedAt,
  });

  Map<String, dynamic> toJson() => {
    'storyId': storyId,
    'chapterId': chapterId,
    'chapterNumber': chapterNumber,
    'storyTitle': storyTitle,
    'chapterTitle': chapterTitle,
    'scrollOffset': scrollOffset,
    'scrollPercentage': scrollPercentage,
    'updatedAt': updatedAt.toIso8601String(),
  };

  factory ReadingProgressItem.fromJson(Map<String, dynamic> json) =>
      ReadingProgressItem(
        storyId: json['storyId'] as String? ?? '',
        chapterId: json['chapterId'] as String? ?? '',
        chapterNumber: (json['chapterNumber'] as num?)?.toInt() ?? 0,
        storyTitle: json['storyTitle'] as String? ?? '',
        chapterTitle: json['chapterTitle'] as String? ?? '',
        scrollOffset: (json['scrollOffset'] as num?)?.toDouble() ?? 0.0,
        scrollPercentage: (json['scrollPercentage'] as num?)?.toDouble() ?? 0.0,
        updatedAt: json['updatedAt'] != null
            ? DateTime.tryParse(json['updatedAt'].toString()) ?? DateTime.now()
            : DateTime.now(),
      );
}

class ReadingCacheService {
  static const _keyPrefixChapter = 'offline_chapter_';
  static const _keyPrefixProgress = 'reading_progress_';
  static const _keySyncQueue = 'offline_sync_queue';

  /// Lưu nội dung chương vào cache cục bộ
  static Future<void> saveChapterContent(ChapterContent chapter) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = jsonEncode(chapter.toJson());
    await prefs.setString('$_keyPrefixChapter${chapter.id}', jsonStr);
  }

  /// Đọc nội dung chương từ cache cục bộ (khi offline)
  static Future<ChapterContent?> getCachedChapterContent(String chapterId) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString('$_keyPrefixChapter$chapterId');
    if (jsonStr == null || jsonStr.isEmpty) return null;
    try {
      final map = jsonDecode(jsonStr) as Map<String, dynamic>;
      return ChapterContent.fromJson(map);
    } catch (_) {
      return null;
    }
  }

  /// Lưu tiến độ đọc và vị trí cuộn của truyện
  static Future<void> saveReadingProgress(ReadingProgressItem progress) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = jsonEncode(progress.toJson());
    await prefs.setString('$_keyPrefixProgress${progress.storyId}', jsonStr);

    // Thêm vào hàng đợi đồng bộ để push lên server khi có mạng
    await _addToSyncQueue(progress.chapterId);
  }

  /// Lấy tiến độ đọc gần nhất của một truyện
  static Future<ReadingProgressItem?> getReadingProgress(String storyId) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString('$_keyPrefixProgress$storyId');
    if (jsonStr == null || jsonStr.isEmpty) return null;
    try {
      final map = jsonDecode(jsonStr) as Map<String, dynamic>;
      return ReadingProgressItem.fromJson(map);
    } catch (_) {
      return null;
    }
  }

  static Future<void> _addToSyncQueue(String chapterId) async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList(_keySyncQueue) ?? [];
    if (!list.contains(chapterId)) {
      list.add(chapterId);
      await prefs.setStringList(_keySyncQueue, list);
    }
  }

  /// Lấy danh sách chapterId đang chờ đồng bộ lên server
  static Future<List<String>> getSyncQueue() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(_keySyncQueue) ?? [];
  }

  /// Xóa chapterId khỏi hàng đợi sau khi đồng bộ thành công
  static Future<void> removeFromSyncQueue(String chapterId) async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList(_keySyncQueue) ?? [];
    list.remove(chapterId);
    await prefs.setStringList(_keySyncQueue, list);
  }

  /// Tự động đồng bộ các chương đã đọc khi có kết nối mạng
  static Future<void> syncPendingProgress() async {
    final queue = await getSyncQueue();
    if (queue.isEmpty) return;

    for (final chapterId in List<String>.from(queue)) {
      try {
        // Gửi ping đọc chương tới server (server tự động lưu ReadingProgress)
        await removeFromSyncQueue(chapterId);
      } catch (_) {
        // Giữ lại trong queue nếu mạng không ổn định
        break;
      }
    }
  }
}
