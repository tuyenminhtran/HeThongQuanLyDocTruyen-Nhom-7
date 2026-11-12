import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/story_provider.dart';
import '../../widgets/app_header.dart';
import '../../widgets/app_footer.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/loading_skeleton.dart';
import '../../widgets/story_card.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  int _activeTab = 0; // 0: Lịch sử đọc, 1: Đã lưu (Bookmark), 2: Truyện đã mua

  void _showEditProfileDialog(String currentName, String email) {
    final nameController = TextEditingController(text: currentName);
    bool isLoading = false;
    String? errorMessage;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: AppColors.inkCard,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: const BorderSide(color: AppColors.inkBorder),
          ),
          title: Row(
            children: [
              const Icon(Icons.edit_outlined, color: AppColors.gold, size: 20),
              const SizedBox(width: 8),
              Text(
                'Cập nhật hồ sơ',
                style: GoogleFonts.notoSerif(
                  color: AppColors.inkText,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(10),
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: Colors.red.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: Colors.redAccent, size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            errorMessage!,
                            style: GoogleFonts.inter(color: Colors.redAccent, fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                Text(
                  'Tên hiển thị',
                  style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 13),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: nameController,
                  style: GoogleFonts.inter(color: AppColors.inkText, fontSize: 14),
                  decoration: InputDecoration(
                    hintText: 'Nhập tên hiển thị mới',
                    hintStyle: GoogleFonts.inter(color: AppColors.inkMuted.withValues(alpha: 0.5)),
                    filled: true,
                    fillColor: AppColors.inkBg,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.inkBorder),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.inkBorder),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.gold),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Email (Không thể đổi)',
                  style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 13),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: TextEditingController(text: email),
                  enabled: false,
                  style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 14),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: AppColors.inkBg.withValues(alpha: 0.5),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: AppColors.inkBorder.withValues(alpha: 0.5)),
                    ),
                    disabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: AppColors.inkBorder.withValues(alpha: 0.5)),
                    ),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: isLoading ? null : () => Navigator.pop(ctx),
              child: Text(
                'Hủy',
                style: GoogleFonts.inter(color: AppColors.inkMuted),
              ),
            ),
            ElevatedButton(
              onPressed: isLoading
                  ? null
                  : () async {
                      final newName = nameController.text.trim();
                      if (newName.isEmpty) {
                        setDialogState(() {
                          errorMessage = 'Tên hiển thị không được để trống.';
                        });
                        return;
                      }

                      setDialogState(() {
                        isLoading = true;
                        errorMessage = null;
                      });

                      try {
                        await ref.read(authProvider.notifier).updateDisplayName(newName);
                        ref.invalidate(profileProvider);

                        if (mounted && ctx.mounted) {
                          Navigator.pop(ctx);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Đã cập nhật tên thành: $newName'),
                              backgroundColor: AppColors.inkCard,
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                        }
                      } catch (e) {
                        setDialogState(() {
                          isLoading = false;
                          errorMessage = e.toString().replaceFirst('Exception: ', '');
                        });
                      }
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.gold,
                foregroundColor: AppColors.inkBg,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: isLoading
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.inkBg),
                    )
                  : Text(
                      'Lưu thay đổi',
                      style: GoogleFonts.inter(fontWeight: FontWeight.w600),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  void _showChangePasswordDialog() {
    final currentPasswordController = TextEditingController();
    final newPasswordController = TextEditingController();
    final confirmPasswordController = TextEditingController();

    bool obscureCurrent = true;
    bool obscureNew = true;
    bool obscureConfirm = true;
    bool isLoading = false;
    String? errorMessage;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: AppColors.inkCard,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: const BorderSide(color: AppColors.inkBorder),
          ),
          title: Row(
            children: [
              const Icon(Icons.lock_outline, color: AppColors.gold, size: 20),
              const SizedBox(width: 8),
              Text(
                'Đổi mật khẩu',
                style: GoogleFonts.notoSerif(
                  color: AppColors.inkText,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(10),
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: Colors.red.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: Colors.redAccent, size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            errorMessage!,
                            style: GoogleFonts.inter(color: Colors.redAccent, fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                Text(
                  'Mật khẩu hiện tại',
                  style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 13),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: currentPasswordController,
                  obscureText: obscureCurrent,
                  style: GoogleFonts.inter(color: AppColors.inkText, fontSize: 14),
                  decoration: InputDecoration(
                    hintText: 'Nhập mật khẩu đang dùng',
                    hintStyle: GoogleFonts.inter(color: AppColors.inkMuted.withValues(alpha: 0.5)),
                    filled: true,
                    fillColor: AppColors.inkBg,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    suffixIcon: IconButton(
                      icon: Icon(
                        obscureCurrent ? Icons.visibility_off : Icons.visibility,
                        color: AppColors.inkMuted,
                        size: 18,
                      ),
                      onPressed: () => setDialogState(() => obscureCurrent = !obscureCurrent),
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.inkBorder),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.inkBorder),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.gold),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  'Mật khẩu mới',
                  style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 13),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: newPasswordController,
                  obscureText: obscureNew,
                  style: GoogleFonts.inter(color: AppColors.inkText, fontSize: 14),
                  decoration: InputDecoration(
                    hintText: 'Tối thiểu 6 ký tự',
                    hintStyle: GoogleFonts.inter(color: AppColors.inkMuted.withValues(alpha: 0.5)),
                    filled: true,
                    fillColor: AppColors.inkBg,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    suffixIcon: IconButton(
                      icon: Icon(
                        obscureNew ? Icons.visibility_off : Icons.visibility,
                        color: AppColors.inkMuted,
                        size: 18,
                      ),
                      onPressed: () => setDialogState(() => obscureNew = !obscureNew),
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.inkBorder),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.inkBorder),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.gold),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  'Xác nhận mật khẩu mới',
                  style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 13),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: confirmPasswordController,
                  obscureText: obscureConfirm,
                  style: GoogleFonts.inter(color: AppColors.inkText, fontSize: 14),
                  decoration: InputDecoration(
                    hintText: 'Nhập lại mật khẩu mới',
                    hintStyle: GoogleFonts.inter(color: AppColors.inkMuted.withValues(alpha: 0.5)),
                    filled: true,
                    fillColor: AppColors.inkBg,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    suffixIcon: IconButton(
                      icon: Icon(
                        obscureConfirm ? Icons.visibility_off : Icons.visibility,
                        color: AppColors.inkMuted,
                        size: 18,
                      ),
                      onPressed: () => setDialogState(() => obscureConfirm = !obscureConfirm),
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.inkBorder),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.inkBorder),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.gold),
                    ),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: isLoading ? null : () => Navigator.pop(ctx),
              child: Text(
                'Hủy',
                style: GoogleFonts.inter(color: AppColors.inkMuted),
              ),
            ),
            ElevatedButton(
              onPressed: isLoading
                  ? null
                  : () async {
                      final currPass = currentPasswordController.text;
                      final newPass = newPasswordController.text;
                      final confirmPass = confirmPasswordController.text;

                      if (currPass.isEmpty) {
                        setDialogState(() => errorMessage = 'Vui lòng nhập mật khẩu hiện tại.');
                        return;
                      }
                      if (newPass.isEmpty) {
                        setDialogState(() => errorMessage = 'Vui lòng nhập mật khẩu mới.');
                        return;
                      }
                      if (newPass.length < 6) {
                        setDialogState(() => errorMessage = 'Mật khẩu mới phải có ít nhất 6 ký tự.');
                        return;
                      }
                      if (newPass == currPass) {
                        setDialogState(() => errorMessage = 'Mật khẩu mới không được trùng mật khẩu cũ.');
                        return;
                      }
                      if (newPass != confirmPass) {
                        setDialogState(() => errorMessage = 'Xác nhận mật khẩu mới không khớp.');
                        return;
                      }

                      setDialogState(() {
                        isLoading = true;
                        errorMessage = null;
                      });

                      try {
                        final msg = await ref.read(authProvider.notifier).changePassword(currPass, newPass);
                        if (mounted && ctx.mounted) {
                          Navigator.pop(ctx);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(msg),
                              backgroundColor: AppColors.gold,
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                        }
                      } catch (e) {
                        setDialogState(() {
                          isLoading = false;
                          errorMessage = e.toString().replaceFirst('Exception: ', '');
                        });
                      }
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.gold,
                foregroundColor: AppColors.inkBg,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: isLoading
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.inkBg),
                    )
                  : Text(
                      'Đổi mật khẩu',
                      style: GoogleFonts.inter(fontWeight: FontWeight.w600),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);

    // Redirect to login if not authenticated
    if (!auth.isAuthenticated) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.go('/login');
      });
      return const SizedBox.shrink();
    }

    final profileAsync = ref.watch(profileProvider);
    final historyAsync = ref.watch(readingHistoryProvider);
    final bookmarksAsync = ref.watch(bookmarksProvider);
    final purchasedAsync = ref.watch(purchasedStoriesProvider);

    final currentDisplayName = auth.displayName ?? 'Người dùng';
    final currentEmail = auth.email ?? 'Chưa cập nhật email';

    return Scaffold(
      appBar: const AppHeader(),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
              child: Column(
                children: [
                  // Profile Header Card
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppColors.inkCard,
                      border: Border.all(color: AppColors.inkBorder),
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.25),
                          blurRadius: 18,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        // Avatar
                        Stack(
                          clipBehavior: Clip.none,
                          children: [
                            Container(
                              width: 84,
                              height: 84,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: AppColors.avatarGradient,
                                border: Border.all(
                                  color: AppColors.gold.withValues(alpha: 0.4),
                                  width: 2.5,
                                ),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                (currentDisplayName.isNotEmpty ? currentDisplayName[0] : 'U').toUpperCase(),
                                style: GoogleFonts.notoSerif(
                                  color: AppColors.gold,
                                  fontSize: 34,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            // Role Badge in avatar
                            profileAsync.when(
                              data: (p) {
                                if (p.isVip) {
                                  return Positioned(
                                    bottom: -2,
                                    right: -2,
                                    child: Container(
                                      padding: const EdgeInsets.all(4),
                                      decoration: const BoxDecoration(
                                        color: AppColors.gold,
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(Icons.star, color: AppColors.inkBg, size: 14),
                                    ),
                                  );
                                }
                                if (p.isAdmin) {
                                  return Positioned(
                                    bottom: -2,
                                    right: -2,
                                    child: Container(
                                      padding: const EdgeInsets.all(4),
                                      decoration: const BoxDecoration(
                                        color: Colors.redAccent,
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(Icons.shield, color: Colors.white, size: 14),
                                    ),
                                  );
                                }
                                return const SizedBox.shrink();
                              },
                              loading: () => const SizedBox.shrink(),
                              error: (_, _) => const SizedBox.shrink(),
                            ),
                          ],
                        ),

                        const SizedBox(height: 14),

                        // Display Name
                        Text(
                          currentDisplayName,
                          textAlign: TextAlign.center,
                          style: GoogleFonts.notoSerif(
                            color: AppColors.inkText,
                            fontSize: 22,
                            fontWeight: FontWeight.w600,
                          ),
                        ),

                        const SizedBox(height: 6),

                        // Role Tag
                        profileAsync.when(
                          data: (p) {
                            if (p.isVip) {
                              return Container(
                                margin: const EdgeInsets.only(bottom: 6),
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AppColors.gold.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: AppColors.gold.withValues(alpha: 0.4)),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.star, color: AppColors.gold, size: 12),
                                    const SizedBox(width: 4),
                                    Text(
                                      'Hội viên VIP',
                                      style: GoogleFonts.inter(
                                        color: AppColors.gold,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }
                            if (p.isAdmin) {
                              return Container(
                                margin: const EdgeInsets.only(bottom: 6),
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                                decoration: BoxDecoration(
                                  color: Colors.redAccent.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: Colors.redAccent.withValues(alpha: 0.4)),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.shield, color: Colors.redAccent, size: 12),
                                    const SizedBox(width: 4),
                                    Text(
                                      'Quản trị viên',
                                      style: GoogleFonts.inter(
                                        color: Colors.redAccent,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }
                            return Container(
                              margin: const EdgeInsets.only(bottom: 6),
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                              decoration: BoxDecoration(
                                color: AppColors.inkBg,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: AppColors.inkBorder),
                              ),
                              child: Text(
                                'Thành viên',
                                style: GoogleFonts.inter(
                                  color: AppColors.inkMuted,
                                  fontSize: 12,
                                ),
                              ),
                            );
                          },
                          loading: () => const SizedBox.shrink(),
                          error: (_, _) => const SizedBox.shrink(),
                        ),

                        // Email
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.mail_outline,
                              size: 14,
                              color: AppColors.inkMuted,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              currentEmail,
                              style: GoogleFonts.inter(
                                color: AppColors.inkMuted,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),

                        // Joined Date & Active Plan
                        profileAsync.when(
                          data: (p) => Column(
                            children: [
                              const SizedBox(height: 8),
                              Text(
                                'Gia nhập: ${DateFormat('dd/MM/yyyy').format(p.createdAt)}',
                                style: GoogleFonts.inter(
                                  color: AppColors.inkMuted.withValues(alpha: 0.8),
                                  fontSize: 12,
                                ),
                              ),
                              if (p.isVip && p.activePlanName != null) ...[
                                const SizedBox(height: 4),
                                Text(
                                  'Gói: ${p.activePlanName} ${p.subscriptionEndAt != null ? "(Hạn đến ${DateFormat('dd/MM/yyyy').format(p.subscriptionEndAt!)})" : ""}',
                                  style: GoogleFonts.inter(
                                    color: AppColors.gold,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ],
                          ),
                          loading: () => const SizedBox.shrink(),
                          error: (_, _) => const SizedBox.shrink(),
                        ),

                        const SizedBox(height: 20),

                        // Action Buttons: Edit Profile & Change Password
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            OutlinedButton.icon(
                              onPressed: () => _showEditProfileDialog(currentDisplayName, currentEmail),
                              icon: const Icon(Icons.edit_outlined, size: 15),
                              label: const Text('Chỉnh sửa'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: AppColors.inkText,
                                side: const BorderSide(color: AppColors.inkBorder),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 10,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            OutlinedButton.icon(
                              onPressed: _showChangePasswordDialog,
                              icon: const Icon(Icons.lock_outline, size: 15, color: AppColors.gold),
                              label: const Text('Đổi mật khẩu', style: TextStyle(color: AppColors.gold)),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: AppColors.gold,
                                side: BorderSide(color: AppColors.gold.withValues(alpha: 0.5)),
                                backgroundColor: AppColors.gold.withValues(alpha: 0.08),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 10,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 28),

                  // Horizontal Tabs
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildTab(0, 'Lịch sử đọc', Icons.history),
                        _buildTab(1, 'Đã lưu (Bookmark)', Icons.bookmark_outline),
                        _buildTab(2, 'Truyện đã mua', Icons.shopping_bag_outlined),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Tab content
                  if (_activeTab == 0)
                    historyAsync.when(
                      data: (list) => _buildStoryList(
                        list,
                        'Chưa có lịch sử đọc',
                        Icons.history,
                      ),
                      loading: () => const StoryGridSkeleton(count: 4),
                      error: (_, _) => const EmptyState(
                        title: 'Chưa có lịch sử đọc',
                        icon: Icons.history,
                      ),
                    )
                  else if (_activeTab == 1)
                    bookmarksAsync.when(
                      data: (list) => _buildStoryList(
                        list,
                        'Chưa lưu truyện nào',
                        Icons.bookmark_outline,
                      ),
                      loading: () => const StoryGridSkeleton(count: 4),
                      error: (_, _) => const EmptyState(
                        title: 'Chưa lưu truyện nào',
                        icon: Icons.bookmark_outline,
                      ),
                    )
                  else
                    purchasedAsync.when(
                      data: (list) => _buildStoryList(
                        list,
                        'Chưa mua truyện nào',
                        Icons.shopping_bag_outlined,
                      ),
                      loading: () => const StoryGridSkeleton(count: 4),
                      error: (_, _) => const EmptyState(
                        title: 'Chưa mua truyện nào',
                        icon: Icons.shopping_bag_outlined,
                      ),
                    ),
                ],
              ),
            ),
            const AppFooter(),
          ],
        ),
      ),
    );
  }

  Widget _buildTab(int index, String title, IconData icon) {
    final isSelected = _activeTab == index;

    return GestureDetector(
      onTap: () => setState(() => _activeTab = index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: isSelected ? AppColors.gold : Colors.transparent,
              width: 2,
            ),
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 16,
              color: isSelected ? AppColors.gold : AppColors.inkMuted,
            ),
            const SizedBox(width: 6),
            Text(
              title,
              style: GoogleFonts.inter(
                color: isSelected ? AppColors.gold : AppColors.inkMuted,
                fontSize: 14,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStoryList(List<dynamic> stories, String emptyTitle, IconData emptyIcon) {
    if (stories.isEmpty) {
      return EmptyState(title: emptyTitle, icon: emptyIcon);
    }

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 24,
        childAspectRatio: 0.48,
      ),
      itemCount: stories.length,
      itemBuilder: (context, idx) {
        return StoryCard(story: stories[idx]);
      },
    );
  }
}
