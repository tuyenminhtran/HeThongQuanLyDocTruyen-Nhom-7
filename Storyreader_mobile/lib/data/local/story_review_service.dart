import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/story_review_model.dart';

class StoryReviewService {
  static String _key(String storyId) => 'story_reviews_$storyId';

  /// Lấy danh sách đánh giá của truyện từ bộ nhớ cục bộ
  static Future<List<StoryReview>> getReviews(String storyId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_key(storyId));
      if (raw == null || raw.isEmpty) return [];

      final list = jsonDecode(raw);
      if (list is List) {
        return list
            .map((e) => StoryReview.fromJson(e is Map ? Map<String, dynamic>.from(e) : null))
            .toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  /// Thêm hoặc lưu đánh giá mới vào đầu danh sách
  static Future<List<StoryReview>> addReview(String storyId, StoryReview review) async {
    try {
      final current = await getReviews(storyId);
      final updated = [review, ...current];
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        _key(storyId),
        jsonEncode(updated.map((e) => e.toJson()).toList()),
      );
      return updated;
    } catch (_) {
      return [review];
    }
  }

  /// Lưu đánh giá (alias tương thích)
  static Future<void> saveReview(StoryReview review) async {
    await addReview(review.storyId, review);
  }

  /// Tính điểm đánh giá trung bình (1.0 -> 5.0)
  static Future<double> getAverageRating(String storyId) async {
    final list = await getReviews(storyId);
    if (list.isEmpty) return 5.0;
    final sum = list.fold<int>(0, (prev, r) => prev + r.rating);
    return sum / list.length;
  }

  /// Xóa đánh giá theo id
  static Future<List<StoryReview>> deleteReview(String storyId, String reviewId) async {
    try {
      final current = await getReviews(storyId);
      final updated = current.where((r) => r.id != reviewId).toList();
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        _key(storyId),
        jsonEncode(updated.map((e) => e.toJson()).toList()),
      );
      return updated;
    } catch (_) {
      return [];
    }
  }
}
