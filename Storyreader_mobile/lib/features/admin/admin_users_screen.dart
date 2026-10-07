import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';

class AdminUsersScreen extends StatefulWidget {
  const AdminUsersScreen({super.key});

  @override
  State<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends State<AdminUsersScreen> {
  final _searchController = TextEditingController();

  final List<Map<String, dynamic>> _users = [
    {
      'id': 1,
      'name': 'Anh Tuấn',
      'email': 'tuan@example.com',
      'role': 'User',
      'status': 'Active',
      'joinDate': '2023-10-01',
    },
    {
      'id': 2,
      'name': 'Minh Phượng',
      'email': 'phuong@example.com',
      'role': 'User',
      'status': 'Active',
      'joinDate': '2023-10-05',
    },
    {
      'id': 3,
      'name': 'Hải Đăng',
      'email': 'dang@example.com',
      'role': 'VIP',
      'status': 'Active',
      'joinDate': '2023-10-10',
    },
    {
      'id': 4,
      'name': 'Spammer123',
      'email': 'spam@example.com',
      'role': 'User',
      'status': 'Blocked',
      'joinDate': '2023-10-15',
    },
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Quản lý Người dùng',
                style: GoogleFonts.notoSerif(
                  color: AppColors.inkText,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'Xem và quản lý tài khoản thành viên',
                style: GoogleFonts.inter(
                  color: AppColors.inkMuted,
                  fontSize: 12,
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Search bar
          Container(
            decoration: BoxDecoration(
              color: AppColors.inkCard,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.inkBorder),
            ),
            child: TextField(
              controller: _searchController,
              style: GoogleFonts.inter(color: AppColors.inkText, fontSize: 13),
              decoration: const InputDecoration(
                hintText: 'Tìm theo email hoặc tên...',
                prefixIcon: Icon(Icons.search, size: 18, color: AppColors.inkMuted),
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Users Table
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
                      'THÀNH VIÊN',
                      style: GoogleFonts.inter(
                        color: AppColors.inkMuted,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  DataColumn(
                    label: Text(
                      'NGÀY THAM GIA',
                      style: GoogleFonts.inter(
                        color: AppColors.inkMuted,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  DataColumn(
                    label: Text(
                      'VAI TRÒ',
                      style: GoogleFonts.inter(
                        color: AppColors.inkMuted,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  DataColumn(
                    label: Text(
                      'TRẠNG THÁI',
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
                rows: _users.map((u) {
                  final isVip = u['role'] == 'VIP';
                  final isActive = u['status'] == 'Active';

                  return DataRow(
                    cells: [
                      DataCell(Text('#${u['id']}', style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 13))),
                      DataCell(
                        Row(
                          children: [
                            Container(
                              width: 28,
                              height: 28,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.inkBg,
                                border: Border.all(color: AppColors.inkBorder),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                (u['name'] as String)[0],
                                style: GoogleFonts.inter(
                                  color: AppColors.inkText,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('${u['name']}', style: GoogleFonts.inter(color: AppColors.inkText, fontWeight: FontWeight.w500, fontSize: 13)),
                                Text('${u['email']}', style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 11)),
                              ],
                            ),
                          ],
                        ),
                      ),
                      DataCell(Text('${u['joinDate']}', style: GoogleFonts.inter(color: AppColors.inkText, fontSize: 13))),
                      DataCell(
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: isVip
                                ? AppColors.gold.withValues(alpha: 0.1)
                                : AppColors.inkBg,
                            border: Border.all(
                              color: isVip
                                  ? AppColors.gold.withValues(alpha: 0.2)
                                  : AppColors.inkBorder,
                            ),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '${u['role']}',
                            style: GoogleFonts.inter(
                              color: isVip ? AppColors.gold : AppColors.inkMuted,
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ),
                      DataCell(
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: isActive
                                ? AppColors.green400.withValues(alpha: 0.1)
                                : AppColors.red400.withValues(alpha: 0.1),
                            border: Border.all(
                              color: isActive
                                  ? AppColors.green400.withValues(alpha: 0.2)
                                  : AppColors.red400.withValues(alpha: 0.2),
                            ),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            isActive ? 'Hoạt động' : 'Đã khóa',
                            style: GoogleFonts.inter(
                              color: isActive ? AppColors.green400 : AppColors.red400,
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ),
                      DataCell(
                        TextButton(
                          onPressed: () {
                            setState(() {
                              u['status'] = isActive ? 'Blocked' : 'Active';
                            });
                          },
                          child: Text(
                            isActive ? 'Khóa' : 'Mở khóa',
                            style: GoogleFonts.inter(color: AppColors.gold, fontSize: 12),
                          ),
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
