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
  Size get preferredSize => const Size.fromHeight(104); // 62 top bar + 42 orange nav

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
            Positioned.fill(
              child: GestureDetector(
                behavior: HitTestBehavior.translucent,
                onTap: _closeMenu,
                child: Container(color: Colors.black.withValues(alpha: 0.4)),
              ),
            ),
            Positioned(
              top: MediaQuery.of(context).padding.top + 104,
              left: 0,
              right: 0,
              child: Material(
                color: Colors.transparent,
                child: ClipRRect(
                  borderRadius: const BorderRadius.vertical(bottom: Radius.circular(20)),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.98),
                        border: const Border(
                          bottom: BorderSide(color: Color(0xFFE2E8F0), width: 1),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            blurRadius: 16,
                            offset: const Offset(0, 8),
                          ),
                        ],
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
                            title: 'Gói VIP',
                            textColor: const Color(0xFFD97706),
                            icon: Icons.auto_awesome,
                            iconColor: const Color(0xFFF59E0B),
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
                            child: Divider(color: Color(0xFFE2E8F0), height: 1),
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
                                  color: const Color(0xFFF8FAFC),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: const Color(0xFFE2E8F0)),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 36,
                                      height: 36,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        gradient: AppColors.avatarGradient,
                                      ),
                                      alignment: Alignment.center,
                                      child: Text(
                                        (auth.displayName?.isNotEmpty == true
                                                ? auth.displayName![0]
                                                : 'U')
                                            .toUpperCase(),
                                        style: GoogleFonts.inter(
                                          color: Colors.white,
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
                                              color: const Color(0xFF0F172A),
                                              fontWeight: FontWeight.w600,
                                              fontSize: 14,
                                            ),
                                          ),
                                          Text(
                                            auth.email ?? '',
                                            style: GoogleFonts.inter(
                                              color: const Color(0xFF64748B),
                                              fontSize: 12,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),
                            _buildMenuItem(
                              title: 'Đăng xuất',
                              icon: Icons.logout,
                              textColor: const Color(0xFFEF4444),
                              iconColor: const Color(0xFFEF4444),
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
                                backgroundColor: const Color(0xFFF37021),
                                foregroundColor: Colors.white,
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
              Icon(icon, size: 18, color: iconColor ?? const Color(0xFF64748B)),
              const SizedBox(width: 10),
            ],
            Text(
              title,
              style: GoogleFonts.inter(
                color: textColor ?? const Color(0xFF0F172A),
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavPill(String title, {VoidCallback? onTap, IconData? icon}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              title,
              style: GoogleFonts.inter(
                color: Colors.white,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
            if (icon != null) ...[
              const SizedBox(width: 4),
              Icon(icon, color: Colors.white.withValues(alpha: 0.9), size: 12),
            ],
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: SafeArea(
        bottom: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // 1. THANH TRÊN (WHITE TOP BAR)
            Container(
              height: 62,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(
                  bottom: BorderSide(color: Color(0xFFE2E8F0), width: 1),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Logo StoryReader (Story black, Reader orange)
                  GestureDetector(
                    onTap: () => context.go('/'),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        RichText(
                          text: TextSpan(
                            children: [
                              TextSpan(
                                text: 'Story',
                                style: GoogleFonts.lora(
                                  color: const Color(0xFF0F172A),
                                  fontSize: 22,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: -0.5,
                                ),
                              ),
                              TextSpan(
                                text: 'Reader',
                                style: GoogleFonts.lora(
                                  color: const Color(0xFFF37021),
                                  fontSize: 22,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: -0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          'ĐỌC TRUYỆN ONLINE',
                          style: GoogleFonts.inter(
                            color: const Color(0xFF64748B),
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Hamburger button
                  IconButton(
                    onPressed: _toggleMenu,
                    icon: Icon(
                      _menuOpen ? Icons.close : Icons.menu,
                      color: const Color(0xFF0F172A),
                      size: 26,
                    ),
                  ),
                ],
              ),
            ),

            // 2. THANH ĐIỀU HƯỚNG MÀU CAM RỰC RỠ (TRUYENQQ SIGNATURE BAR #F37021)
            Container(
              height: 42,
              width: double.infinity,
              color: const Color(0xFFF37021),
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                child: Row(
                  children: [
                    _buildNavPill('Trang Chủ', onTap: () => context.go('/')),
                    _buildNavPill('Thể Loại', icon: Icons.keyboard_arrow_down),
                    _buildNavPill('Xếp Hạng', icon: Icons.trending_up),
                    _buildNavPill('Lịch Sử'),
                    _buildNavPill('Theo Dõi'),
                    const SizedBox(width: 8),

                    // VIP Pill button
                    InkWell(
                      onTap: () => context.push('/pricing'),
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF3C7),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFFDE68A)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.workspace_premium,
                              color: Color(0xFFD97706),
                              size: 14,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Nâng cấp VIP',
                              style: GoogleFonts.inter(
                                color: const Color(0xFFB45309),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
