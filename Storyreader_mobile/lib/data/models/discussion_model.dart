class DiscussionItem {
  final String id;
  final String content;
  final DateTime createdAt;
  final String user;

  DiscussionItem({
    required this.id,
    required this.content,
    required this.createdAt,
    required this.user,
  });

  factory DiscussionItem.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return DiscussionItem(
        id: '',
        content: '',
        createdAt: DateTime.now(),
        user: 'Độc giả',
      );
    }

    DateTime parsedDate;
    try {
      parsedDate = json['createdAt'] != null
          ? DateTime.parse(json['createdAt'].toString())
          : DateTime.now();
    } catch (_) {
      parsedDate = DateTime.now();
    }

    return DiscussionItem(
      id: json['id']?.toString() ?? '',
      content: json['content'] as String? ?? '',
      createdAt: parsedDate,
      user: json['user'] as String? ?? 'Độc giả',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'content': content,
    'createdAt': createdAt.toIso8601String(),
    'user': user,
  };
}
