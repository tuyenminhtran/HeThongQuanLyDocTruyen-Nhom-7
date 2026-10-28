import 'package:flutter/material.dart';

class AppColors {
  // Báº£ng mÃ u chuáº©n 1-1 vá»›i Web StoryReader (Tailwind TruyenQQ Palette)
  static const Color inkBg = Color(0xFFF4F6F9);            // Ná»n Slate sÃ¡ng sáº¡ch sáº½
  static const Color inkCard = Color(0xFFFFFFFF);          // Khung card tráº¯ng tinh, ná»•i khá»‘i rÃµ nÃ©t
  static const Color inkElevated = Color(0xFFF8FAFC);      // Khá»‘i ná»•i nháº¹ / hover
  static const Color inkBorder = Color(0xFFE2E8F0);        // Viá»n Slate-200 sÃ¡ng nÃ©t
  static const Color inkBorderLight = Color(0xFFCBD5E1);   // Viá»n Slate-300
  static const Color inkText = Color(0xFF0F172A);          // Chá»¯ Slate-900 Ä‘en Ä‘áº­m, cá»±c ká»³ dá»… Ä‘á»c
  static const Color inkMuted = Color(0xFF64748B);         // Chá»¯ phá»¥ Slate-500

  // MÃ u Cam thÆ°Æ¡ng hiá»‡u TruyenQQ cá»§a Web
  static const Color gold = Color(0xFFEA580C);             // Cam Ä‘áº­m chuáº©n Web
  static const Color goldDim = Color(0xFFC2410C);          // Cam Ä‘áº­m
  static const Color goldLight = Color(0xFFFFEDD5);        // Cam nháº¡t background
  static const Color brandOrange = Color(0xFFF37021);      // Cam thanh menu Ä‘áº·c trÆ°ng Web
  static const Color brandBlue = Color(0xFF2563EB);        // Xanh dÆ°Æ¡ng nÃºt ÄÄƒng nháº­p Web
  static const Color brandSky = Color(0xFF0284C7);         // Xanh da trá»i nÃºt ÄÄƒng kÃ½ Web

  // Status & accent colors
  static const Color red400 = Color(0xFFEF4444);           // Äá» cáº£nh bÃ¡o / HOT badge
  static const Color green400 = Color(0xFF10B981);         // Xanh lÃ¡ Miá»…n phÃ­ (Emerald)
  static const Color emerald = Color(0xFF10B981);          // Xanh lÃ¡ thÃ nh cÃ´ng (Emerald)
  static const Color amber400 = Color(0xFFF59E0B);         // VÃ ng cáº£nh bÃ¡o / Chá» xá»­ lÃ½
  static const Color sky400 = Color(0xFF0284C7);           // Xanh tranh (Sky)
  static const Color blue400 = Color(0xFF2563EB);          // Xanh dÆ°Æ¡ng
  static const Color purple400 = Color(0xFF8B5CF6);        // TÃ­m Comic

  // Reader Themes
  static const Color readerLightBg = Color(0xFFFFFFFF);
  static const Color readerLightText = Color(0xFF0F172A);
  static const Color readerLightBorder = Color(0xFFE2E8F0);

  static const Color readerSepiaBg = Color(0xFFFBF0D9);
  static const Color readerSepiaText = Color(0xFF433422);
  static const Color readerSepiaBorder = Color(0xFFEADBCE);

  static const Color readerDarkBg = Color(0xFF0D1117);
  static const Color readerDarkText = Color(0xFFE6EDF3);
  static const Color readerDarkBorder = Color(0xFF30363D);

  // Gradients chuáº©n Web
  static const LinearGradient goldGradient = LinearGradient(
    colors: [Color(0xFFF59E0B), Color(0xFFEA580C)], // Amber sang Orange nhÆ° Web
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient orangeBarGradient = LinearGradient(
    colors: [brandOrange, Color(0xFFEA580C)],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const LinearGradient avatarGradient = LinearGradient(
    colors: [
      Color(0xFFF37021),
      Color(0xFFF59E0B),
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

