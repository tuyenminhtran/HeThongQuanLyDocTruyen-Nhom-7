import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';

class AdminCategoriesScreen extends StatelessWidget {
  const AdminCategoriesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final categories = [
      {'id': 1, 'name': 'Tiên Hiệp', 'slug': 'tien-hiep', 'storyCount': 1540},
      {'id': 2, 'name': 'Kiếm Hiệp', 'slug': 'kiem-hiep', 'storyCount': 890},
      {'id': 3, 'name': 'Ngôn Tình', 'slug': 'ngon-tinh', 'storyCount': 3200},
      {'id': 4, 'name': 'Đô Thị', 'slug': 'do-thi', 'storyCount': 1205},
      {'id': 5, 'name': 'Xuyên Không', 'slug': 'xuyen-khong', 'storyCount': 950},
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Quản lý Thể loại',
                    style: GoogleFonts.notoSerif(
                      color: AppColors.inkText,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Thêm, sửa, xóa các thể loại truyện',
                    style: GoogleFonts.inter(
                      color: AppColors.inkMuted,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Chức năng thêm thể loại mới'),
                      backgroundColor: AppColors.inkCard,
                    ),
                  );
                },
                icon: const Icon(Icons.add, size: 16),
                label: const Text('Thêm'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.gold,
                  foregroundColor: AppColors.inkBg,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Categories table
          Container(
            decoration: BoxDecoration(
              color: AppColors.inkCard,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.inkBorder),
            ),
            clipBehavior: Clip.antiAlias,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                headingRowColor: WidgetStateProperty.all(
                  AppColors.inkBg.withValues(alpha: 0.5),
                ),
                columns: [
                  DataColumn(
                    label: Text(
                      'ID',
                      style: GoogleFonts.inter(
                        color: AppColors.inkMuted,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  DataColumn(
                    label: Text(
                      'TÊN THỂ LOẠI',
                      style: GoogleFonts.inter(
                        color: AppColors.inkMuted,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  DataColumn(
                    label: Text(
                      'SLUG',
                      style: GoogleFonts.inter(
                        color: AppColors.inkMuted,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  DataColumn(
                    label: Text(
                      'SỐ TRUYỆN',
                      style: GoogleFonts.inter(
                        color: AppColors.inkMuted,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  DataColumn(
                    label: Text(
                      'HÀNH ĐỘNG',
                      style: GoogleFonts.inter(
                        color: AppColors.inkMuted,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
                rows: categories.map((cat) {
                  return DataRow(
                    cells: [
                      DataCell(Text('#${cat['id']}', style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 13))),
                      DataCell(Text('${cat['name']}', style: GoogleFonts.inter(color: AppColors.inkText, fontWeight: FontWeight.w500, fontSize: 13))),
                      DataCell(Text('${cat['slug']}', style: GoogleFonts.robotoMono(color: AppColors.inkMuted, fontSize: 12))),
                      DataCell(Text('${cat['storyCount']}', style: GoogleFonts.inter(color: AppColors.inkText, fontSize: 13))),
                      DataCell(
                        Row(
                          children: [
                            TextButton(
                              onPressed: () {},
                              child: Text('Sửa', style: GoogleFonts.inter(color: AppColors.gold, fontSize: 12)),
                            ),
                            TextButton(
                              onPressed: () {},
                              child: Text('Xóa', style: GoogleFonts.inter(color: AppColors.red400, fontSize: 12)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  );
                }).toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
