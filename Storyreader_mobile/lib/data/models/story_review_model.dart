class StoryReview {
  final String id;
  final String storyId;
  final String userId;
  final String userName;
  final int rating;
  final String content;
  final DateTime createdAt;

  const StoryReview({
    required this.id,
    this.storyId = '',
    this.userId = '',
    required this.userName,
    required this.rating,
    required this.content,
    required this.createdAt,
  });

  StoryReview copyWith({
    String? id,
    String? storyId,
    String? userId,
    String? userName,
    int? rating,
    String? content,
    DateTime? createdAt,
  }) {
    return StoryReview(
      id: id ?? this.id,
      storyId: storyId ?? this.storyId,
      userId: userId ?? this.userId,
      userName: userName ?? this.userName,
      rating: rating ?? this.rating,
      content: content ?? this.content,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  factory StoryReview.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return StoryReview(
        id: '',
        storyId: '',
        userId: '',
        userName: 'Bạn đọc',
        rating: 5,
        content: '',
        createdAt: DateTime.now(),
      );
    }
    DateTime parseDate(dynamic val) {
      try {
        return val != null ? DateTime.parse(val.toString()) : DateTime.now();
      } catch (_) {
        return DateTime.now();
      }
    }

    return StoryReview(
      id: json['id']?.toString() ?? '',
      storyId: json['storyId']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      userName: json['userName'] as String? ?? 'Bạn đọc',
      rating: (json['rating'] is num) ? (json['rating'] as num).toInt().clamp(1, 5) : 5,
      content: json['content'] as String? ?? '',
      createdAt: parseDate(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'storyId': storyId,
    'userId': userId,
    'userName': userName,
    'rating': rating,
    'content': content,
    'createdAt': createdAt.toIso8601String(),
  };
}
