class UserProfileModel {
  final String id;
  final String email;
  final String displayName;
  final String role;
  final bool isRestricted;
  final DateTime createdAt;
  final String? activePlanName;
  final DateTime? subscriptionEndAt;

  UserProfileModel({
    required this.id,
    required this.email,
    required this.displayName,
    required this.role,
    required this.isRestricted,
    required this.createdAt,
    this.activePlanName,
    this.subscriptionEndAt,
  });

  bool get isVip => role.toUpperCase() == 'VIP';
  bool get isAdmin => role.toUpperCase() == 'ADMIN';

  factory UserProfileModel.fromJson(Map<String, dynamic> json) {
    return UserProfileModel(
      id: json['id']?.toString() ?? '',
      email: json['email'] as String? ?? '',
      displayName: json['displayName'] as String? ?? '',
      role: json['role'] as String? ?? 'Member',
      isRestricted: json['isRestricted'] as bool? ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      activePlanName: json['activePlanName'] as String?,
      subscriptionEndAt: json['subscriptionEndAt'] != null
          ? DateTime.tryParse(json['subscriptionEndAt'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'displayName': displayName,
    'role': role,
    'isRestricted': isRestricted,
    'createdAt': createdAt.toIso8601String(),
    'activePlanName': activePlanName,
    'subscriptionEndAt': subscriptionEndAt?.toIso8601String(),
  };
}
