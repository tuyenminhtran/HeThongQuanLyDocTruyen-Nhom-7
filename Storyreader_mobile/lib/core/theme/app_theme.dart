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
        iconTheme: IconThemeData(color: AppColors.inkMuted),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: AppColors.inkCard,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.inkBorder, width: 1),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.inkBg,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        hintStyle: GoogleFonts.inter(
          color: AppColors.inkMuted.withValues(alpha: 0.5),
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
      textTheme: baseTextTheme.copyWith(
        displayLarge: GoogleFonts.notoSerif(color: AppColors.inkText, fontWeight: FontWeight.bold),
        displayMedium: GoogleFonts.notoSerif(color: AppColors.inkText, fontWeight: FontWeight.bold),
        displaySmall: GoogleFonts.notoSerif(color: AppColors.inkText, fontWeight: FontWeight.bold),
        headlineLarge: GoogleFonts.notoSerif(color: AppColors.inkText, fontWeight: FontWeight.w600),
        headlineMedium: GoogleFonts.notoSerif(color: AppColors.inkText, fontWeight: FontWeight.w600),
        headlineSmall: GoogleFonts.notoSerif(color: AppColors.inkText, fontWeight: FontWeight.w600),
        titleLarge: GoogleFonts.notoSerif(color: AppColors.inkText, fontWeight: FontWeight.w600),
        titleMedium: GoogleFonts.inter(color: AppColors.inkText, fontWeight: FontWeight.w500),
        titleSmall: GoogleFonts.inter(color: AppColors.inkText, fontWeight: FontWeight.w500),
        bodyLarge: GoogleFonts.inter(color: AppColors.inkText),
        bodyMedium: GoogleFonts.inter(color: AppColors.inkText),
        bodySmall: GoogleFonts.inter(color: AppColors.inkMuted),
        labelLarge: GoogleFonts.inter(color: AppColors.inkText, fontWeight: FontWeight.w600),
        labelMedium: GoogleFonts.inter(color: AppColors.inkMuted),
        labelSmall: GoogleFonts.inter(color: AppColors.inkMuted),
      ),
    );
  }
}
