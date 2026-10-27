class NotificationItem {
  final String id;
  final String title;
  final String message;
  final String linkUrl;
  final bool isRead;
  final DateTime createdAt;

  NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.linkUrl,
    required this.isRead,
    required this.createdAt,
  });

  factory NotificationItem.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return NotificationItem(
        id: '',
        title: '',
        message: '',
        linkUrl: '',
        isRead: false,
        createdAt: DateTime.now(),
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

    return NotificationItem(
      id: json['id']?.toString() ?? '',
      title: json['title'] as String? ?? '',
      message: json['message'] as String? ?? '',
      linkUrl: json['linkUrl'] as String? ?? '',
      isRead: json['isRead'] as bool? ?? false,
      createdAt: parsedDate,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'message': message,
    'linkUrl': linkUrl,
    'isRead': isRead,
    'createdAt': createdAt.toIso8601String(),
  };
}

class NotificationPageResult {
  final int unreadCount;
  final List<NotificationItem> items;

  NotificationPageResult({
    required this.unreadCount,
    required this.items,
  });

  factory NotificationPageResult.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return NotificationPageResult(unreadCount: 0, items: const []);
    }
    final rawItems = json['items'];
    final parsedItems = <NotificationItem>[];
    if (rawItems is List) {
      for (final item in rawItems) {
        if (item is Map) {
          parsedItems.add(NotificationItem.fromJson(Map<String, dynamic>.from(item)));
        }
      }
    }
    return NotificationPageResult(
      unreadCount: (json['unreadCount'] is num) ? (json['unreadCount'] as num).toInt() : 0,
      items: parsedItems,
    );
  }
}
