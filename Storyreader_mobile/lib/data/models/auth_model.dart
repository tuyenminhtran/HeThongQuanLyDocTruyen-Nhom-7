class AuthResult {
  final String accessToken;
  final String expiresAt;
  final String? email;
  final String? displayName;
  final String? role;

  AuthResult({
    required this.accessToken,
    required this.expiresAt,
    this.email,
    this.displayName,
    this.role,
  });

  factory AuthResult.fromJson(Map<String, dynamic> json) {
    return AuthResult(
      accessToken: json['accessToken'] as String? ?? '',
      expiresAt: json['expiresAt'] as String? ?? '',
      email: json['email'] as String?,
      displayName: json['displayName'] as String?,
      role: json['role'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'accessToken': accessToken,
    'expiresAt': expiresAt,
    'email': email,
    'displayName': displayName,
    'role': role,
  };
}

class UserModel {
  final String? accessToken;
  final String? email;
  final String? displayName;
  final List<String> roles;

  UserModel({
    this.accessToken,
    this.email,
    this.displayName,
    this.roles = const [],
  });

  bool get isAuthenticated => accessToken != null && accessToken!.isNotEmpty;
  bool get isAdmin => roles.contains('Admin');

  UserModel copyWith({
    String? accessToken,
    String? email,
    String? displayName,
    List<String>? roles,
  }) {
    return UserModel(
      accessToken: accessToken ?? this.accessToken,
      email: email ?? this.email,
      displayName: displayName ?? this.displayName,
      roles: roles ?? this.roles,
    );
  }
}
