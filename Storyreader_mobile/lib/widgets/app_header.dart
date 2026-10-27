import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/constants/app_colors.dart';
import '../providers/auth_provider.dart';

class AppHeader extends ConsumerStatefulWidget implements PreferredSizeWidget {
  const AppHeader({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(64);

  @override
  ConsumerState<AppHeader> createState() => _AppHeaderState();
}

class _AppHeaderState extends ConsumerState<AppHeader> {
  bool _menuOpen = false;
  OverlayEntry? _overlayEntry;

  void _toggleMenu() {
    if (_menuOpen) {
      _closeMenu();
    } else {
      _openMenu();
    }
  }

  void _openMenu() {
    setState(() => _menuOpen = true);
    _overlayEntry = _createOverlayEntry();
    Overlay.of(context).insert(_overlayEntry!);
  }

  void _closeMenu() {
    _overlayEntry?.remove();
    _overlayEntry = null;
    if (mounted) {
      setState(() => _menuOpen = false);
    }
  }

  @override
  void dispose() {
    _overlayEntry?.remove();
    super.dispose();
  }

  OverlayEntry _createOverlayEntry() {
    final auth = ref.read(authProvider);

    return OverlayEntry(
      builder: (context) {
        return Stack(
          children: [
            // Modal barrier to close on tap outside
            Positioned.fill(
              child: GestureDetector(
                behavior: HitTestBehavior.translucent,
                onTap: _closeMenu,
                child: Container(color: Colors.black.withValues(alpha: 0.5)),
              ),
            ),
            // Dropdown menu right below header
            Positioned(
              top: MediaQuery.of(context).padding.top + 64,
              left: 0,
              right: 0,
              child: Material(
                color: Colors.transparent,
                child: ClipRRect(
                  borderRadius: const BorderRadius.vertical(bottom: Radius.circular(20)),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppColors.inkElevated.withValues(alpha: 0.95),
                        border: const Border(
                          bottom: BorderSide(
                            color: AppColors.inkBorder,
                            width: 1,
                          ),
                        ),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _buildMenuItem(
                            title: 'Trang chủ',
                            icon: Icons.home_outlined,
                            onTap: () {
                              _closeMenu();
                              context.go('/');
                            },
                          ),
                          _buildMenuItem(
                            title: 'Tủ sách',
                            icon: Icons.bookmarks_outlined,
                            onTap: () {
                              _closeMenu();
                              context.push('/library');
                            },
                          ),
                          _buildMenuItem(
                            title: 'Gói VIP',
                            textColor: AppColors.gold,
                            icon: Icons.auto_awesome,
                            iconColor: AppColors.gold,
                            onTap: () {
                              _closeMenu();
                              context.push('/pricing');
                            },
                          ),
                          if (auth.isAdmin)
                            _buildMenuItem(
                              title: 'Trang quản trị',
                              icon: Icons.admin_panel_settings_outlined,
                              onTap: () {
                                _closeMenu();
                                context.push('/admin');
                              },
                            ),
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 8),
                            child: Divider(color: AppColors.inkBorder, height: 1),
                          ),
                          if (auth.isAuthenticated) ...[
                            InkWell(
                              onTap: () {
                                _closeMenu();
                                context.push('/profile');
                              },
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 10,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.inkCard,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: AppColors.inkBorder),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 36,
                                      height: 36,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        gradient: AppColors.avatarGradient,
                                        border: Border.all(
                                          color: AppColors.gold.withValues(alpha: 0.4),
                                        ),
                                      ),
                                      alignment: Alignment.center,
                                      child: Text(
                                        (auth.displayName?.isNotEmpty == true
                                                ? auth.displayName![0]
                                                : 'U')
                                            .toUpperCase(),
                                        style: GoogleFonts.inter(
                                          color: AppColors.gold,
                                          fontSize: 14,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            auth.displayName ?? 'Người dùng',
                                            style: GoogleFonts.inter(
                                              color: AppColors.inkText,
                                              fontSize: 14,
                                              fontWeight: FontWeight.w600,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          Text(
                                            'Xem hồ sơ cá nhân',
                                            style: GoogleFonts.inter(
                                              color: AppColors.inkMuted,
                                              fontSize: 11,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const Icon(
                                      Icons.chevron_right,
                                      color: AppColors.inkMuted,
                                      size: 18,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),
                            _buildMenuItem(
                              title: 'Đăng xuất',
                              icon: Icons.logout,
                              textColor: AppColors.red400,
                              iconColor: AppColors.red400,
                              onTap: () async {
                                _closeMenu();
                                await ref.read(authProvider.notifier).logout();
                                if (context.mounted) {
                                  context.go('/login');
                                }
                              },
                            ),
                          ] else ...[
                            _buildMenuItem(
                              title: 'Đăng nhập',
                              icon: Icons.login,
                              onTap: () {
                                _closeMenu();
                                context.push('/login');
                              },
                            ),
                            const SizedBox(height: 8),
                            ElevatedButton(
                              onPressed: () {
                                _closeMenu();
                                context.push('/register');
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.gold,
                                foregroundColor: AppColors.inkBg,
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                padding: const EdgeInsets.symmetric(vertical: 13),
                              ),
                              child: Text(
                                'Đăng ký tài khoản',
                                style: GoogleFonts.inter(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildMenuItem({
    required String title,
    required VoidCallback onTap,
    Color? textColor,
    IconData? icon,
    Color? iconColor,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
        child: Row(
          children: [
            if (icon != null) ...[
              Icon(icon, size: 18, color: iconColor ?? AppColors.inkMuted),
              const SizedBox(width: 10),
            ],
            Text(
              title,
              style: GoogleFonts.inter(
                color: textColor ?? AppColors.inkText,
                fontSize: 14,
                fontWeight: textColor == AppColors.gold ? FontWeight.w600 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.inkBg.withValues(alpha: 0.85),
        border: const Border(
          bottom: BorderSide(
            color: AppColors.inkBorder,
            width: 1,
          ),
        ),
      ),
      child: ClipRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
          child: SafeArea(
            bottom: false,
            child: Container(
              height: 64,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Logo
                  GestureDetector(
                    onTap: () => context.go('/'),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 38,
                          height: 38,
                          decoration: BoxDecoration(
                            gradient: AppColors.goldGradient,
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.gold.withValues(alpha: 0.25),
                                blurRadius: 10,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          alignment: Alignment.center,
                          child: const Icon(
                            Icons.auto_stories,
                            size: 20,
                            color: AppColors.inkBg,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'StoryReader',
                              style: GoogleFonts.lora(
                                color: AppColors.inkText,
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.3,
                              ),
                            ),
                            Text(
                              'ĐỌC TRUYỆN ONLINE',
                              style: GoogleFonts.inter(
                                color: AppColors.inkMuted,
                                fontSize: 8.5,
                                fontWeight: FontWeight.w600,
                                letterSpacing: 1.2,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Hamburger button
                  IconButton(
                    onPressed: _toggleMenu,
                    icon: Icon(
                      _menuOpen ? Icons.close : Icons.menu,
                      color: AppColors.inkText,
                      size: 24,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
