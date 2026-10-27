import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';

class AppTheme {
  static ThemeData get darkTheme {
    final baseTextTheme = GoogleFonts.interTextTheme(ThemeData.dark().textTheme);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.inkBg,
      primaryColor: AppColors.gold,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.gold,
        onPrimary: AppColors.inkBg,
        surface: AppColors.inkCard,
        onSurface: AppColors.inkText,
        error: AppColors.red400,
        outline: AppColors.inkBorder,
      ),
      cardTheme: CardThemeData(
        color: AppColors.inkCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.inkBorder, width: 1),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: AppColors.inkText),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: AppColors.inkElevated,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.inkBorder, width: 1),
        ),
      ),
      dividerColor: AppColors.inkBorder,
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.inkCard,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        hintStyle: GoogleFonts.inter(
          color: AppColors.inkMuted.withValues(alpha: 0.6),
          fontSize: 14,
        ),
        labelStyle: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.inkBorder, width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.inkBorder, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.gold, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.red400, width: 1),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.red400, width: 1.5),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.gold,
          foregroundColor: AppColors.inkBg,
          elevation: 0,
          minimumSize: const Size(48, 48),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.inkText,
          minimumSize: const Size(48, 48),
          side: const BorderSide(color: AppColors.inkBorder, width: 1),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500),
        ),
      ),
      textTheme: baseTextTheme.copyWith(
        displayLarge: GoogleFonts.lora(color: AppColors.inkText, fontWeight: FontWeight.bold),
        displayMedium: GoogleFonts.lora(color: AppColors.inkText, fontWeight: FontWeight.bold),
        displaySmall: GoogleFonts.lora(color: AppColors.inkText, fontWeight: FontWeight.bold),
        headlineLarge: GoogleFonts.lora(color: AppColors.inkText, fontWeight: FontWeight.w700),
        headlineMedium: GoogleFonts.lora(color: AppColors.inkText, fontWeight: FontWeight.w600),
        headlineSmall: GoogleFonts.lora(color: AppColors.inkText, fontWeight: FontWeight.w600),
        titleLarge: GoogleFonts.lora(color: AppColors.inkText, fontWeight: FontWeight.w600),
        titleMedium: GoogleFonts.inter(color: AppColors.inkText, fontWeight: FontWeight.w600),
        titleSmall: GoogleFonts.inter(color: AppColors.inkText, fontWeight: FontWeight.w500),
        bodyLarge: GoogleFonts.inter(color: AppColors.inkText, height: 1.5),
        bodyMedium: GoogleFonts.inter(color: AppColors.inkText, height: 1.4),
        bodySmall: GoogleFonts.inter(color: AppColors.inkMuted),
        labelLarge: GoogleFonts.inter(color: AppColors.inkText, fontWeight: FontWeight.w600),
        labelMedium: GoogleFonts.inter(color: AppColors.inkMuted),
        labelSmall: GoogleFonts.inter(color: AppColors.inkMuted),
      ),
    );
  }

  static ThemeData get lightTheme {
    final baseTextTheme = GoogleFonts.interTextTheme(ThemeData.light().textTheme);
    const lightBg = Color(0xFFF8FAFC);
    const lightCard = Color(0xFFFFFFFF);
    const lightBorder = Color(0xFFE2E8F0);
    const lightText = Color(0xFF0F172A);
    const lightMuted = Color(0xFF64748B);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: lightBg,
      primaryColor: AppColors.goldDim,
      colorScheme: const ColorScheme.light(
        primary: AppColors.goldDim,
        onPrimary: Colors.white,
        surface: lightCard,
        onSurface: lightText,
        error: AppColors.red400,
        outline: lightBorder,
      ),
      cardTheme: CardThemeData(
        color: lightCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: lightBorder, width: 1),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: lightText),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: lightCard,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: lightBorder, width: 1),
        ),
      ),
      dividerColor: lightBorder,
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: lightCard,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        hintStyle: GoogleFonts.inter(
          color: lightMuted.withValues(alpha: 0.6),
          fontSize: 14,
        ),
        labelStyle: GoogleFonts.inter(color: lightMuted, fontSize: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: lightBorder, width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: lightBorder, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.goldDim, width: 1.5),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.goldDim,
          foregroundColor: Colors.white,
          elevation: 0,
          minimumSize: const Size(48, 48),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: lightText,
          minimumSize: const Size(48, 48),
          side: const BorderSide(color: lightBorder, width: 1),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500),
        ),
      ),
      textTheme: baseTextTheme.copyWith(
        displayLarge: GoogleFonts.lora(color: lightText, fontWeight: FontWeight.bold),
        displayMedium: GoogleFonts.lora(color: lightText, fontWeight: FontWeight.bold),
        displaySmall: GoogleFonts.lora(color: lightText, fontWeight: FontWeight.bold),
        headlineLarge: GoogleFonts.lora(color: lightText, fontWeight: FontWeight.w700),
        headlineMedium: GoogleFonts.lora(color: lightText, fontWeight: FontWeight.w600),
        headlineSmall: GoogleFonts.lora(color: lightText, fontWeight: FontWeight.w600),
        titleLarge: GoogleFonts.lora(color: lightText, fontWeight: FontWeight.w600),
        titleMedium: GoogleFonts.inter(color: lightText, fontWeight: FontWeight.w600),
        titleSmall: GoogleFonts.inter(color: lightText, fontWeight: FontWeight.w500),
        bodyLarge: GoogleFonts.inter(color: lightText, height: 1.5),
        bodyMedium: GoogleFonts.inter(color: lightText, height: 1.4),
        bodySmall: GoogleFonts.inter(color: lightMuted),
        labelLarge: GoogleFonts.inter(color: lightText, fontWeight: FontWeight.w600),
        labelMedium: GoogleFonts.inter(color: lightMuted),
        labelSmall: GoogleFonts.inter(color: lightMuted),
      ),
    );
  }
}
