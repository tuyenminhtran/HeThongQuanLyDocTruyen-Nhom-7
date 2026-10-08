import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/constants/app_colors.dart';

class EmptyState extends StatelessWidget {
  final String title;
  final String? subtitle;
  final IconData icon;

  const EmptyState({
    super.key,
    required this.title,
    this.subtitle,
    this.icon = Icons.menu_book_outlined,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 20),
      decoration: BoxDecoration(
        color: AppColors.inkCard.withValues(alpha: 0.3),
        border: Border.all(color: AppColors.inkBorder),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.inkCard,
              border: Border.all(color: AppColors.inkBorder),
              boxShadow: [
                BoxShadow(
                  color: AppColors.gold.withValues(alpha: 0.1),
                  blurRadius: 16,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Icon(icon, size: 34, color: AppColors.gold.withValues(alpha: 0.8)),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: GoogleFonts.lora(
              color: AppColors.inkText,
              fontSize: 17,
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.center,
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 6),
            Text(
              subtitle!,
              style: GoogleFonts.inter(
                color: AppColors.inkMuted,
                fontSize: 13.5,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }
}
