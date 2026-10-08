import 'package:flutter/material.dart';

class AppColors {
  // Midnight Obsidian tokens (matching web Tailwind tokens)
  static const Color inkBg = Color(0xFF0A0D14);
  static const Color inkCard = Color(0xFF121722);
  static const Color inkElevated = Color(0xFF1A202E);
  static const Color inkBorder = Color(0xFF262E3D);
  static const Color inkBorderLight = Color(0xFF374357);
  static const Color inkText = Color(0xFFF1F5F9);
  static const Color inkMuted = Color(0xFF94A3B8);

  // Imperial Gold tokens
  static const Color gold = Color(0xFFF59E0B);
  static const Color goldDim = Color(0xFFD97706);
  static const Color goldLight = Color(0xFFFDE68A);

  // Status & accent colors
  static const Color red400 = Color(0xFFEF4444);
  static const Color green400 = Color(0xFF10B981);
  static const Color sky400 = Color(0xFF38BDF8);
  static const Color blue400 = Color(0xFF3B82F6);
  static const Color purple400 = Color(0xFF8B5CF6);

  // Reader Themes
  static const Color readerLightBg = Color(0xFFFAFAF9);
  static const Color readerLightText = Color(0xFF1E293B);
  static const Color readerLightBorder = Color(0xFFE2E8F0);

  static const Color readerSepiaBg = Color(0xFFF5EFEB);
  static const Color readerSepiaText = Color(0xFF3D2E1E);
  static const Color readerSepiaBorder = Color(0xFFE2D7C3);

  static const Color readerDarkBg = inkBg;
  static const Color readerDarkText = inkText;
  static const Color readerDarkBorder = inkBorder;

  // Gradients
  static const LinearGradient goldGradient = LinearGradient(
    colors: [gold, goldDim],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient avatarGradient = LinearGradient(
    colors: [
      Color(0x33F59E0B), // gold 20%
      Color(0x0DF59E0B), // gold ~5%
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
