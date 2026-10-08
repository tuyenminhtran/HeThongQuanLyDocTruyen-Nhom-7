import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/constants/app_colors.dart';

class AppFooter extends StatelessWidget {
  const AppFooter({super.key});

  @override
  Widget build(BuildContext context) {
    final currentYear = DateTime.now().year;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.inkCard.withValues(alpha: 0.3),
        border: Border(
          top: BorderSide(
            color: AppColors.inkBorder.withValues(alpha: 0.6),
            width: 1,
          ),
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 36),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Logo & Brand
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  gradient: AppColors.goldGradient,
                  borderRadius: BorderRadius.circular(8),
                ),
                alignment: Alignment.center,
                child: const Icon(
                  Icons.auto_stories,
                  size: 16,
                  color: AppColors.inkBg,
                ),
              ),
              const SizedBox(width: 10),
              Text(
                'StoryReader',
                style: GoogleFonts.notoSerif(
                  color: AppColors.inkText,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Nền tảng đọc truyện trực tuyến với hàng ngàn tác phẩm hấp dẫn từ nhiều thể loại khác nhau.',
            style: GoogleFonts.inter(
              color: AppColors.inkMuted,
              fontSize: 14,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 28),

          // Khám phá
          Text(
            'KHÁM PHÁ',
            style: GoogleFonts.inter(
              color: AppColors.inkText,
              fontSize: 12,
              fontWeight: FontWeight.w600,
              letterSpacing: 1.0,
            ),
          ),
          const SizedBox(height: 10),
          _buildFooterLink('Trang chủ', () => context.go('/')),
          _buildFooterLink('Truyện mới cập nhật', () => context.go('/')),
          _buildFooterLink('Truyện phổ biến', () => context.go('/')),
          _buildFooterLink('Thể loại', () => context.go('/')),

          const SizedBox(height: 24),

          // Tài khoản
          Text(
            'TÀI KHOẢN',
            style: GoogleFonts.inter(
              color: AppColors.inkText,
              fontSize: 12,
              fontWeight: FontWeight.w600,
              letterSpacing: 1.0,
            ),
          ),
          const SizedBox(height: 10),
          _buildFooterLink('Đăng nhập', () => context.push('/login')),
          _buildFooterLink('Đăng ký', () => context.push('/register')),

          const SizedBox(height: 24),

          // Liên hệ
          Text(
            'LIÊN HỆ',
            style: GoogleFonts.inter(
              color: AppColors.inkText,
              fontSize: 12,
              fontWeight: FontWeight.w600,
              letterSpacing: 1.0,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              const Icon(Icons.mail_outline, size: 16, color: AppColors.inkMuted),
              const SizedBox(width: 8),
              Text(
                'contact@storyreader.vn',
                style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 14),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.language, size: 16, color: AppColors.inkMuted),
              const SizedBox(width: 8),
              Text(
                'storyreader.vn',
                style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 14),
              ),
            ],
          ),

          const SizedBox(height: 32),
          Divider(color: AppColors.inkBorder.withValues(alpha: 0.4)),
          const SizedBox(height: 16),

          // Bottom Bar
          Text(
            '© $currentYear StoryReader. Tất cả quyền được bảo lưu.',
            style: GoogleFonts.inter(
              color: AppColors.inkMuted.withValues(alpha: 0.7),
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Text(
                'Điều khoản sử dụng',
                style: GoogleFonts.inter(
                  color: AppColors.inkMuted.withValues(alpha: 0.7),
                  fontSize: 12,
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Text(
                  '•',
                  style: GoogleFonts.inter(
                    color: AppColors.inkMuted.withValues(alpha: 0.4),
                    fontSize: 12,
                  ),
                ),
              ),
              Text(
                'Chính sách bảo mật',
                style: GoogleFonts.inter(
                  color: AppColors.inkMuted.withValues(alpha: 0.7),
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFooterLink(String label, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: GestureDetector(
        onTap: onTap,
        child: Text(
          label,
          style: GoogleFonts.inter(
            color: AppColors.inkMuted,
            fontSize: 14,
          ),
        ),
      ),
    );
  }
}
