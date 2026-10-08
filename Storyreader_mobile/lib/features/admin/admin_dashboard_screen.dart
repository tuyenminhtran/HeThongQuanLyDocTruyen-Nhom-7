import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';

class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Tổng quan (Dashboard)',
            style: GoogleFonts.notoSerif(
              color: AppColors.inkText,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),

          // 4 Stats Cards
          _buildStatCard(
            title: 'Doanh thu hôm nay',
            value: '2,450,000đ',
            valueColor: AppColors.gold,
            badgeText: '+15% so với hôm qua',
            badgeColor: AppColors.green400,
            badgeIcon: Icons.arrow_upward,
          ),
          const SizedBox(height: 12),
          _buildStatCard(
            title: 'Người dùng mới',
            value: '124',
            badgeText: '+5% so với tuần trước',
            badgeColor: AppColors.green400,
            badgeIcon: Icons.arrow_upward,
          ),
          const SizedBox(height: 12),
          _buildStatCard(
            title: 'Truyện đang theo dõi',
            value: '8,902',
            badgeText: 'Tổng số lượt theo dõi',
            badgeColor: AppColors.inkMuted,
          ),
          const SizedBox(height: 12),
          _buildStatCard(
            title: 'Lượt đọc trang',
            value: '45,231',
            badgeText: '-2% so với hôm qua',
            badgeColor: AppColors.red400,
            badgeIcon: Icons.arrow_downward,
          ),

          const SizedBox(height: 24),

          // Giao dịch gần đây
          Container(
            decoration: BoxDecoration(
              color: AppColors.inkCard,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.inkBorder),
            ),
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Giao dịch gần đây',
                  style: GoogleFonts.inter(
                    color: AppColors.inkText,
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 24),
                Center(
                  child: Text(
                    'Chưa kết nối API Thống kê',
                    style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 13),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Hoạt động mới nhất
          Container(
            decoration: BoxDecoration(
              color: AppColors.inkCard,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.inkBorder),
            ),
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Hoạt động mới nhất',
                  style: GoogleFonts.inter(
                    color: AppColors.inkText,
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 16),
                _buildActivityItem(
                  'Truyện "Thế Giới Hoàn Mỹ" vừa thêm chương 102',
                  '5 phút trước',
                ),
                const Divider(color: AppColors.inkBorder, height: 24),
                _buildActivityItem(
                  'Truyện "Thế Giới Hoàn Mỹ" vừa thêm chương 102',
                  '5 phút trước',
                ),
                const Divider(color: AppColors.inkBorder, height: 24),
                _buildActivityItem(
                  'Truyện "Thế Giới Hoàn Mỹ" vừa thêm chương 102',
                  '5 phút trước',
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    Color? valueColor,
    required String badgeText,
    required Color badgeColor,
    IconData? badgeIcon,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.inkCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.inkBorder),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 13),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: GoogleFonts.inter(
              color: valueColor ?? AppColors.inkText,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              if (badgeIcon != null) ...[
                Icon(badgeIcon, size: 12, color: badgeColor),
                const SizedBox(width: 4),
              ],
              Text(
                badgeText,
                style: GoogleFonts.inter(color: badgeColor, fontSize: 11),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActivityItem(String text, String time) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.gold.withValues(alpha: 0.1),
          ),
          alignment: Alignment.center,
          child: const Icon(Icons.menu_book, size: 16, color: AppColors.gold),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                text,
                style: GoogleFonts.inter(color: AppColors.inkText, fontSize: 13),
              ),
              const SizedBox(height: 2),
              Text(
                time,
                style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 11),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
