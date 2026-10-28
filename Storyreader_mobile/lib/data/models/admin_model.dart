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
