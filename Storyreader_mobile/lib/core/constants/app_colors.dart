import 'package:flutter/material.dart';

class AppColors {
  // Light Theme tokens (matching web TruyenQQ Light & Orange design)
  static const Color inkBg = Color(0xFFF8FAFC); // slate-50
  static const Color inkCard = Colors.white;
  static const Color inkElevated = Colors.white;
  static const Color inkBorder = Color(0xFFE2E8F0); // slate-200
  static const Color inkBorderLight = Color(0xFFF1F5F9); // slate-100
  static const Color inkText = Color(0xFF0F172A); // slate-900
  static const Color inkMuted = Color(0xFF64748B); // slate-500

  // Brand Orange tokens (TruyenQQ signature #F37021)
  static const Color primaryOrange = Color(0xFFF37021);
  static const Color primaryOrangeDark = Color(0xFFEA580C); // orange-600
  static const Color primaryOrangeLight = Color(0xFFFFF7ED); // orange-50

  // Keep gold tokens as brand accent / VIP badge
  static const Color gold = Color(0xFFF37021);
  static const Color goldDim = Color(0xFFEA580C);
  static const Color goldLight = Color(0xFFFDE68A);

  // Status & accent colors
  static const Color red400 = Color(0xFFEF4444);
  static const Color rose600 = Color(0xFFE11D48);
  static const Color green400 = Color(0xFF10B981);
  static const Color sky400 = Color(0xFF0EA5E9);
  static const Color blue400 = Color(0xFF2563EB);
  static const Color purple400 = Color(0xFF8B5CF6);

  // Banner notification colors
  static const Color bannerBg = Color(0xFFF0F9FF); // sky-50
  static const Color bannerBorder = Color(0xFFBAE6FD); // sky-200
  static const Color bannerText = Color(0xFF0C4A6E); // sky-950

  // Reader Themes
  static const Color readerLightBg = Color(0xFFFAFAF9);
  static const Color readerLightText = Color(0xFF1E293B);
  static const Color readerLightBorder = Color(0xFFE2E8F0);

  static const Color readerSepiaBg = Color(0xFFF5EFEB);
  static const Color readerSepiaText = Color(0xFF3D2E1E);
  static const Color readerSepiaBorder = Color(0xFFE2D7C3);

  static const Color readerDarkBg = Color(0xFF0A0D14);
  static const Color readerDarkText = Color(0xFFF1F5F9);
  static const Color readerDarkBorder = Color(0xFF262E3D);

  // Gradients
  static const LinearGradient goldGradient = LinearGradient(
    colors: [primaryOrange, primaryOrangeDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient avatarGradient = LinearGradient(
    colors: [
      Color(0xFFF37021),
      Color(0xFFEA580C),
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
