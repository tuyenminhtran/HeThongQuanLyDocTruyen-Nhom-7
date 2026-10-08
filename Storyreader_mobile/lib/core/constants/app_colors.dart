import 'package:flutter/material.dart';

class AppColors {
  // Ink tokens from tailwind.config.js
  static const Color inkBg = Color(0xFF1C1815);
  static const Color inkCard = Color(0xFF262019);
  static const Color inkBorder = Color(0xFF3A322A);
  static const Color inkText = Color(0xFFEDE6D6);
  static const Color inkMuted = Color(0xFF9C9284);

  // Gold tokens
  static const Color gold = Color(0xFFC9A227);
  static const Color goldDim = Color(0xFF8A7020);

  // Status & accent colors
  static const Color red400 = Color(0xFFF87171);
  static const Color green400 = Color(0xFF4ADE80);
  static const Color sky400 = Color(0xFF38BDF8);
  static const Color blue400 = Color(0xFF60A5FA);

  // Reader Themes
  static const Color readerLightBg = Color(0xFFF8F9FA);
  static const Color readerLightText = Color(0xFF1A1D20);
  static const Color readerLightBorder = Color(0xFFD1D5DB);

  static const Color readerSepiaBg = Color(0xFFF4ECD8);
  static const Color readerSepiaText = Color(0xFF433422);
  static const Color readerSepiaBorder = Color(0xFFD6C5A5);

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
      Color(0x33C9A227), // gold 20%
      Color(0x0DC9A227), // gold ~5%
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
