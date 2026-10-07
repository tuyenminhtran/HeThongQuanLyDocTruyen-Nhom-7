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
            ),
            child: Icon(icon, size: 36, color: AppColors.inkMuted),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: GoogleFonts.notoSerif(
              color: AppColors.inkMuted,
              fontSize: 18,
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 6),
            Text(
              subtitle!,
              style: GoogleFonts.inter(
                color: AppColors.inkMuted.withValues(alpha: 0.6),
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }
}
