import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/constants/app_colors.dart';
import '../../providers/reader_provider.dart';

class ReaderSettingsSheet extends ConsumerWidget {
  const ReaderSettingsSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const ReaderSettingsSheet(),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ref.watch(readerThemeProvider);
    final fontSize = ref.watch(readerFontSizeProvider);
    final fontFamily = ref.watch(readerFontFamilyProvider);
    final lineHeight = ref.watch(readerLineHeightProvider);

    final isDark = theme == 'dark';
    final sheetBg = isDark ? AppColors.inkCard : const Color(0xFFF9FAFB);
    final textColor = isDark ? AppColors.inkText : const Color(0xFF1E293B);
    final dividerColor = isDark ? AppColors.inkBorder : Colors.black12;

    return Container(
      decoration: BoxDecoration(
        color: sheetBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 14,
        bottom: MediaQuery.of(context).padding.bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.withValues(alpha: 0.4),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Cài đặt giao diện đọc',
                style: GoogleFonts.lora(
                  color: textColor,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close, size: 20),
                color: textColor.withValues(alpha: 0.7),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // 1. Chế độ màu nền
          Text(
            'MÀU NỀN TRANG ĐỌC',
            style: GoogleFonts.inter(
              color: AppColors.gold,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _buildThemeOption(
                context: context,
                ref: ref,
                themeKey: 'dark',
                label: 'Tối',
                bg: AppColors.readerDarkBg,
                fg: AppColors.readerDarkText,
                border: AppColors.readerDarkBorder,
                isSelected: theme == 'dark',
              ),
              const SizedBox(width: 10),
              _buildThemeOption(
                context: context,
                ref: ref,
                themeKey: 'sepia',
                label: 'Giấy ngà',
                bg: AppColors.readerSepiaBg,
                fg: AppColors.readerSepiaText,
                border: AppColors.readerSepiaBorder,
                isSelected: theme == 'sepia',
              ),
              const SizedBox(width: 10),
              _buildThemeOption(
                context: context,
                ref: ref,
                themeKey: 'light',
                label: 'Sáng',
                bg: AppColors.readerLightBg,
                fg: AppColors.readerLightText,
                border: AppColors.readerLightBorder,
                isSelected: theme == 'light',
              ),
            ],
          ),
          const SizedBox(height: 20),
          Divider(color: dividerColor, height: 1),
          const SizedBox(height: 16),

          // 2. Cỡ chữ
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'CỠ CHỮ',
                style: GoogleFonts.inter(
                  color: AppColors.gold,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.2,
                ),
              ),
              Text(
                '${fontSize.toInt()} pt',
                style: GoogleFonts.robotoMono(
                  color: textColor.withValues(alpha: 0.8),
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              IconButton(
                onPressed: fontSize > 14
                    ? () => ref.read(readerFontSizeProvider.notifier).decrease()
                    : null,
                icon: const Icon(Icons.text_decrease),
                color: textColor,
              ),
              Expanded(
                child: Slider(
                  value: fontSize,
                  min: 14,
                  max: 32,
                  divisions: 9,
                  activeColor: AppColors.gold,
                  inactiveColor: dividerColor,
                  onChanged: (val) => ref.read(readerFontSizeProvider.notifier).setFontSize(val),
                ),
              ),
              IconButton(
                onPressed: fontSize < 32
                    ? () => ref.read(readerFontSizeProvider.notifier).increase()
                    : null,
                icon: const Icon(Icons.text_increase),
                color: textColor,
              ),
            ],
          ),
          const SizedBox(height: 14),
          Divider(color: dividerColor, height: 1),
          const SizedBox(height: 16),

          // 3. Phông chữ
          Text(
            'PHÔNG CHỮ',
            style: GoogleFonts.inter(
              color: AppColors.gold,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildFontOption(ref, fontFamily, 'Lora', 'Lora (Có chân)'),
              _buildFontOption(ref, fontFamily, 'Inter', 'Inter (Hiện đại)'),
              _buildFontOption(ref, fontFamily, 'Noto Serif', 'Noto (Truyền thống)'),
            ],
          ),
          const SizedBox(height: 20),
          Divider(color: dividerColor, height: 1),
          const SizedBox(height: 16),

          // 4. Giãn dòng (Line Height)
          Text(
            'KHOẢNG CÁCH DÒNG',
            style: GoogleFonts.inter(
              color: AppColors.gold,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _buildLineHeightOption(ref, lineHeight, 1.5, 'Gọn (1.5)'),
              const SizedBox(width: 8),
              _buildLineHeightOption(ref, lineHeight, 1.8, 'Chuẩn (1.8)'),
              const SizedBox(width: 8),
              _buildLineHeightOption(ref, lineHeight, 2.2, 'Thoáng (2.2)'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildThemeOption({
    required BuildContext context,
    required WidgetRef ref,
    required String themeKey,
    required String label,
    required Color bg,
    required Color fg,
    required Color border,
    required bool isSelected,
  }) {
    return Expanded(
      child: InkWell(
        onTap: () => ref.read(readerThemeProvider.notifier).setTheme(themeKey),
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected ? AppColors.gold : border,
              width: isSelected ? 2 : 1,
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: AppColors.gold.withValues(alpha: 0.3),
                      blurRadius: 6,
                    ),
                  ]
                : null,
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: GoogleFonts.inter(
              color: fg,
              fontSize: 13,
              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFontOption(
    WidgetRef ref,
    String currentFont,
    String targetFont,
    String label,
  ) {
    final isSelected = currentFont == targetFont;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) => ref.read(readerFontFamilyProvider.notifier).setFontFamily(targetFont),
      selectedColor: AppColors.gold.withValues(alpha: 0.25),
      labelStyle: GoogleFonts.inter(
        fontSize: 12.5,
        color: isSelected ? AppColors.gold : null,
        fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
      ),
      side: BorderSide(
        color: isSelected ? AppColors.gold : Colors.grey.withValues(alpha: 0.3),
      ),
    );
  }

  Widget _buildLineHeightOption(
    WidgetRef ref,
    double currentHeight,
    double targetHeight,
    String label,
  ) {
    final isSelected = (currentHeight - targetHeight).abs() < 0.05;
    return Expanded(
      child: OutlinedButton(
        onPressed: () => ref.read(readerLineHeightProvider.notifier).setLineHeight(targetHeight),
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 10),
          backgroundColor: isSelected ? AppColors.gold.withValues(alpha: 0.15) : null,
          side: BorderSide(
            color: isSelected ? AppColors.gold : Colors.grey.withValues(alpha: 0.3),
            width: isSelected ? 1.5 : 1,
          ),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 12,
            color: isSelected ? AppColors.gold : null,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}
