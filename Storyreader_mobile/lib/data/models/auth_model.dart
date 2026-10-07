class AuthResult {
  final String accessToken;
  final String expiresAt;

  AuthResult({
    required this.accessToken,
    required this.expiresAt,
  });

  factory AuthResult.fromJson(Map<String, dynamic> json) {
    return AuthResult(
      accessToken: json['accessToken'] as String? ?? '',
      expiresAt: json['expiresAt'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'accessToken': accessToken,
    'expiresAt': expiresAt,
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
