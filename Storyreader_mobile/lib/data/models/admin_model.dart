class Genre {
  final String id;
  final String name;
  final String slug;
  final int storyCount;

  const Genre({
    required this.id,
    required this.name,
    required this.slug,
    required this.storyCount,
  });

  factory Genre.fromJson(Map<String, dynamic> json) => Genre(
    id: json['id'] as String,
    name: json['name'] as String,
    slug: json['slug'] as String? ?? '',
    storyCount: (json['storyCount'] as num?)?.toInt() ?? 0,
  );
}

class AdminUser {
  final String id;
  final String email;
  final String displayName;
  final String role;
  final bool isRestricted;
  final DateTime createdAt;

  const AdminUser({
    required this.id,
    required this.email,
    required this.displayName,
    required this.role,
    required this.isRestricted,
    required this.createdAt,
  });

  bool get isAdmin => role.toLowerCase() == 'admin';
  String get name => displayName.isEmpty ? email : displayName;

  factory AdminUser.fromJson(Map<String, dynamic> json) => AdminUser(
    id: json['id'] as String,
    email: json['email'] as String? ?? '',
    displayName: json['displayName'] as String? ?? '',
    role: json['role'] as String? ?? 'User',
    isRestricted: json['isRestricted'] as bool? ?? false,
    createdAt: DateTime.parse(json['createdAt'] as String),
  );
}

class DashboardOverview {
  final double todayRevenue;
  final double revenueGrowthPercent;
  final int totalUsers;
  final int newUsersThisWeek;
  final int totalFollows;
  final int totalChapterViews;
  final int totalStories;

  const DashboardOverview({
    required this.todayRevenue,
    required this.revenueGrowthPercent,
    required this.totalUsers,
    required this.newUsersThisWeek,
    required this.totalFollows,
    required this.totalChapterViews,
    required this.totalStories,
  });

  factory DashboardOverview.fromJson(Map<String, dynamic> json) =>
      DashboardOverview(
        todayRevenue: (json['todayRevenue'] as num).toDouble(),
        revenueGrowthPercent: (json['revenueGrowthPercent'] as num).toDouble(),
        totalUsers: (json['totalUsers'] as num).toInt(),
        newUsersThisWeek: (json['newUsersThisWeek'] as num).toInt(),
        totalFollows: (json['totalFollows'] as num).toInt(),
        totalChapterViews: (json['totalChapterViews'] as num).toInt(),
        totalStories: (json['totalStories'] as num).toInt(),
      );
}

class RecentTransaction {
  final String id;
  final String userName;
  final String userEmail;
  final double amount;
  final String type;
  final String status;
  final String provider;
  final DateTime createdAt;

  const RecentTransaction({
    required this.id,
    required this.userName,
    required this.userEmail,
    required this.amount,
    required this.type,
    required this.status,
    required this.provider,
    required this.createdAt,
  });

  factory RecentTransaction.fromJson(Map<String, dynamic> json) =>
      RecentTransaction(
        id: json['id'] as String,
        userName: json['userName'] as String? ?? (json['userEmail'] as String? ?? ''),
        userEmail: json['userEmail'] as String? ?? '',
        amount: (json['amount'] as num).toDouble(),
        type: json['type'] as String,
        status: json['status'] as String,
        provider: json['provider'] as String? ?? '',
        createdAt: DateTime.parse(json['createdAt'] as String),
      );
}

class RecentActivity {
  final String id;
  final String type;
  final String title;
  final String description;
  final DateTime timestamp;

  const RecentActivity({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    required this.timestamp,
  });

  factory RecentActivity.fromJson(Map<String, dynamic> json) => RecentActivity(
    id: json['id'] as String,
    type: json['type'] as String,
    title: json['title'] as String,
    description: json['description'] as String? ?? '',
    timestamp: DateTime.parse(json['timestamp'] as String),
  );
}

class DashboardData {
  final DashboardOverview overview;
  final List<RecentTransaction> transactions;
  final List<RecentActivity> activities;

  const DashboardData({
    required this.overview,
    required this.transactions,
    required this.activities,
  });
}

class AdminTransactionItem {
  final String id;
  final String userId;
  final String userEmail;
  final String userDisplayName;
  final String type;
  final String status;
  final String targetId;
  final double amount;
  final String provider;
  final String providerTransactionRef;
  final DateTime createdAt;
  final DateTime? completedAt;

  const AdminTransactionItem({
    required this.id,
    required this.userId,
    required this.userEmail,
    required this.userDisplayName,
    required this.type,
    required this.status,
    required this.targetId,
    required this.amount,
    required this.provider,
    required this.providerTransactionRef,
    required this.createdAt,
    this.completedAt,
  });

  bool get isCompleted =>
      status.toLowerCase() == 'completed' || status.toLowerCase() == 'success';
  bool get isPending => status.toLowerCase() == 'pending';

  factory AdminTransactionItem.fromJson(Map<String, dynamic> json) {
    DateTime? parseNullableDate(dynamic val) {
      if (val == null) return null;
      try {
        return DateTime.parse(val.toString());
      } catch (_) {
        return null;
      }
    }

    return AdminTransactionItem(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      userEmail: json['userEmail'] as String? ?? '',
      userDisplayName: json['userDisplayName'] as String? ?? '',
      type: json['type'] as String? ?? 'Subscription',
      status: json['status'] as String? ?? 'Pending',
      targetId: json['targetId']?.toString() ?? '',
      amount: (json['amount'] is num) ? (json['amount'] as num).toDouble() : 0.0,
      provider: json['provider'] as String? ?? '',
      providerTransactionRef: json['providerTransactionRef'] as String? ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      completedAt: parseNullableDate(json['completedAt']),
    );
  }
}

class AdminTransactionsResponse {
  final int total;
  final int page;
  final int pageSize;
  final List<AdminTransactionItem> items;

  const AdminTransactionsResponse({
    required this.total,
    required this.page,
    required this.pageSize,
    required this.items,
  });

  factory AdminTransactionsResponse.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return const AdminTransactionsResponse(
        total: 0,
        page: 1,
        pageSize: 20,
        items: [],
      );
    }
    final rawItems = json['items'];
    final parsed = <AdminTransactionItem>[];
    if (rawItems is List) {
      for (final item in rawItems) {
        if (item is Map) {
          parsed.add(AdminTransactionItem.fromJson(Map<String, dynamic>.from(item)));
        }
      }
    }
    return AdminTransactionsResponse(
      total: (json['total'] is num) ? (json['total'] as num).toInt() : 0,
      page: (json['page'] is num) ? (json['page'] as num).toInt() : 1,
      pageSize: (json['pageSize'] is num) ? (json['pageSize'] as num).toInt() : 20,
      items: parsed,
    );
  }
}

class AdminScheduleStats {
  final int pendingCount;
  final int publishedTodayCount;
  final int storiesCount;

  const AdminScheduleStats({
    this.pendingCount = 0,
    this.publishedTodayCount = 0,
    this.storiesCount = 0,
  });

  factory AdminScheduleStats.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const AdminScheduleStats();
    return AdminScheduleStats(
      pendingCount: (json['pendingCount'] is num) ? (json['pendingCount'] as num).toInt() : 0,
      publishedTodayCount:
          (json['publishedTodayCount'] is num) ? (json['publishedTodayCount'] as num).toInt() : 0,
      storiesCount: (json['storiesCount'] is num) ? (json['storiesCount'] as num).toInt() : 0,
    );
  }
}

class AdminScheduleItem {
  final String id;
  final String storyId;
  final String storyTitle;
  final String storyCoverImageUrl;
  final int storyType;
  final int chapterNumber;
  final String title;
  final DateTime? publishAt;
  final bool isPublished;
  final DateTime? createdAt;
  final int viewCount;

  const AdminScheduleItem({
    required this.id,
    required this.storyId,
    required this.storyTitle,
    this.storyCoverImageUrl = '',
    this.storyType = 0,
    required this.chapterNumber,
    required this.title,
    this.publishAt,
    required this.isPublished,
    this.createdAt,
    this.viewCount = 0,
  });

  factory AdminScheduleItem.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return const AdminScheduleItem(
        id: '',
        storyId: '',
        storyTitle: '',
        chapterNumber: 0,
        title: '',
        isPublished: false,
      );
    }
    return AdminScheduleItem(
      id: json['id']?.toString() ?? '',
      storyId: json['storyId']?.toString() ?? '',
      storyTitle: json['storyTitle'] as String? ?? '',
      storyCoverImageUrl: json['storyCoverImageUrl'] as String? ?? '',
      storyType: (json['storyType'] is num) ? (json['storyType'] as num).toInt() : 0,
      chapterNumber: (json['chapterNumber'] is num) ? (json['chapterNumber'] as num).toInt() : 0,
      title: json['title'] as String? ?? '',
      publishAt: json['publishAt'] != null ? DateTime.tryParse(json['publishAt'].toString()) : null,
      isPublished: json['isPublished'] as bool? ?? false,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
      viewCount: (json['viewCount'] is num) ? (json['viewCount'] as num).toInt() : 0,
    );
  }
}

class AdminSchedulesResponse {
  final List<AdminScheduleItem> items;
  final int totalCount;
  final int page;
  final int pageSize;
  final AdminScheduleStats stats;

  const AdminSchedulesResponse({
    this.items = const [],
    this.totalCount = 0,
    this.page = 1,
    this.pageSize = 20,
    this.stats = const AdminScheduleStats(),
  });

  factory AdminSchedulesResponse.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const AdminSchedulesResponse();
    final rawItems = json['items'];
    final parsed = <AdminScheduleItem>[];
    if (rawItems is List) {
      for (final item in rawItems) {
        if (item is Map) {
          parsed.add(AdminScheduleItem.fromJson(Map<String, dynamic>.from(item)));
        }
      }
    }
    final rawStats = json['stats'];
    return AdminSchedulesResponse(
      items: parsed,
      totalCount: (json['totalCount'] is num) ? (json['totalCount'] as num).toInt() : 0,
      page: (json['page'] is num) ? (json['page'] as num).toInt() : 1,
      pageSize: (json['pageSize'] is num) ? (json['pageSize'] as num).toInt() : 20,
      stats: AdminScheduleStats.fromJson(
        rawStats is Map ? Map<String, dynamic>.from(rawStats) : null,
      ),
    );
  }
}

class AdminReportedCommentStats {
  final int reportedCount;
  final int hiddenCount;
  final int visibleCount;
  final int restrictedUsersCount;

  const AdminReportedCommentStats({
    this.reportedCount = 0,
    this.hiddenCount = 0,
    this.visibleCount = 0,
    this.restrictedUsersCount = 0,
  });

  factory AdminReportedCommentStats.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const AdminReportedCommentStats();
    return AdminReportedCommentStats(
      reportedCount: (json['reportedCount'] is num) ? (json['reportedCount'] as num).toInt() : 0,
      hiddenCount: (json['hiddenCount'] is num) ? (json['hiddenCount'] as num).toInt() : 0,
      visibleCount: (json['visibleCount'] is num) ? (json['visibleCount'] as num).toInt() : 0,
      restrictedUsersCount:
          (json['restrictedUsersCount'] is num) ? (json['restrictedUsersCount'] as num).toInt() : 0,
    );
  }
}

class AdminReportedCommentItem {
  final String id;
  final String content;
  final int status;
  final String statusName;
  final String? reportReason;
  final int reportCount;
  final DateTime? createdAt;
  final String userId;
  final String userName;
  final String userEmail;
  final bool isUserRestricted;
  final String chapterId;
  final int chapterNumber;
  final String chapterTitle;
  final String storyId;
  final String storyTitle;

  const AdminReportedCommentItem({
    required this.id,
    required this.content,
    this.status = 0,
    this.statusName = 'Reported',
    this.reportReason,
    this.reportCount = 0,
    this.createdAt,
    required this.userId,
    required this.userName,
    this.userEmail = '',
    this.isUserRestricted = false,
    required this.chapterId,
    this.chapterNumber = 0,
    this.chapterTitle = '',
    required this.storyId,
    this.storyTitle = '',
  });

  factory AdminReportedCommentItem.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return const AdminReportedCommentItem(
        id: '',
        content: '',
        userId: '',
        userName: '',
        chapterId: '',
        storyId: '',
      );
    }
    return AdminReportedCommentItem(
      id: json['id']?.toString() ?? '',
      content: json['content'] as String? ?? '',
      status: (json['status'] is num) ? (json['status'] as num).toInt() : 0,
      statusName: json['statusName'] as String? ?? 'Reported',
      reportReason: json['reportReason'] as String?,
      reportCount: (json['reportCount'] is num) ? (json['reportCount'] as num).toInt() : 0,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
      userId: json['userId']?.toString() ?? '',
      userName: json['userName'] as String? ?? '',
      userEmail: json['userEmail'] as String? ?? '',
      isUserRestricted: json['isUserRestricted'] as bool? ?? false,
      chapterId: json['chapterId']?.toString() ?? '',
      chapterNumber: (json['chapterNumber'] is num) ? (json['chapterNumber'] as num).toInt() : 0,
      chapterTitle: json['chapterTitle'] as String? ?? '',
      storyId: json['storyId']?.toString() ?? '',
      storyTitle: json['storyTitle'] as String? ?? '',
    );
  }
}

class AdminReportedCommentsResponse {
  final List<AdminReportedCommentItem> items;
  final int totalCount;
  final int page;
  final int pageSize;
  final AdminReportedCommentStats stats;

  const AdminReportedCommentsResponse({
    this.items = const [],
    this.totalCount = 0,
    this.page = 1,
    this.pageSize = 20,
    this.stats = const AdminReportedCommentStats(),
  });

  factory AdminReportedCommentsResponse.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const AdminReportedCommentsResponse();
    final rawItems = json['items'];
    final parsed = <AdminReportedCommentItem>[];
    if (rawItems is List) {
      for (final item in rawItems) {
        if (item is Map) {
          parsed.add(AdminReportedCommentItem.fromJson(Map<String, dynamic>.from(item)));
        }
      }
    }
    final rawStats = json['stats'];
    return AdminReportedCommentsResponse(
      items: parsed,
      totalCount: (json['totalCount'] is num) ? (json['totalCount'] as num).toInt() : 0,
      page: (json['page'] is num) ? (json['page'] as num).toInt() : 1,
      pageSize: (json['pageSize'] is num) ? (json['pageSize'] as num).toInt() : 20,
      stats: AdminReportedCommentStats.fromJson(
        rawStats is Map ? Map<String, dynamic>.from(rawStats) : null,
      ),
    );
  }
}
