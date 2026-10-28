import 'package:flutter/material.dart';

class AppColors {
  // Bảng màu chuẩn 1-1 với Web StoryReader (Tailwind TruyenQQ Palette)
  static const Color inkBg = Color(0xFFF4F6F9);            // Nền Slate sáng sạch sẽ
  static const Color inkCard = Color(0xFFFFFFFF);          // Khung card trắng tinh, nổi khối rõ nét
  static const Color inkElevated = Color(0xFFF8FAFC);      // Khối nổi nhẹ / hover
  static const Color inkBorder = Color(0xFFE2E8F0);        // Viền Slate-200 sáng nét
  static const Color inkBorderLight = Color(0xFFCBD5E1);   // Viền Slate-300
  static const Color inkText = Color(0xFF0F172A);          // Chữ Slate-900 đen đậm, cực kỳ dễ đọc
  static const Color inkMuted = Color(0xFF64748B);         // Chữ phụ Slate-500

  // Màu Cam thương hiệu TruyenQQ của Web
  static const Color gold = Color(0xFFEA580C);             // Cam đậm chuẩn Web
  static const Color goldDim = Color(0xFFC2410C);          // Cam đậm
  static const Color goldLight = Color(0xFFFFEDD5);        // Cam nhạt background
  static const Color brandOrange = Color(0xFFF37021);      // Cam thanh menu đặc trưng Web
  static const Color brandBlue = Color(0xFF2563EB);        // Xanh dương nút Đăng nhập Web
  static const Color brandSky = Color(0xFF0284C7);         // Xanh da trời nút Đăng ký Web

  // Status & accent colors
  static const Color red400 = Color(0xFFEF4444);           // Đỏ cảnh báo / HOT badge
  static const Color green400 = Color(0xFF10B981);         // Xanh lá Miễn phí (Emerald)
  static const Color emerald = Color(0xFF10B981);          // Xanh lá thành công (Emerald)
  static const Color amber400 = Color(0xFFF59E0B);         // Vàng cảnh báo / Chờ xử lý
  static const Color sky400 = Color(0xFF0284C7);           // Xanh tranh (Sky)
  static const Color blue400 = Color(0xFF2563EB);          // Xanh dương
  static const Color purple400 = Color(0xFF8B5CF6);        // Tím Comic

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

  // Gradients chuẩn Web
  static const LinearGradient goldGradient = LinearGradient(
    colors: [Color(0xFFF59E0B), Color(0xFFEA580C)], // Amber sang Orange như Web
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
