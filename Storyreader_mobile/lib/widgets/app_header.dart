import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/constants/app_colors.dart';
import '../providers/auth_provider.dart';
import '../providers/story_provider.dart';

class AppHeader extends ConsumerStatefulWidget implements PreferredSizeWidget {
  const AppHeader({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(96);

  @override
  ConsumerState<AppHeader> createState() => _AppHeaderState();
}

class _AppHeaderState extends ConsumerState<AppHeader> {
  bool _menuOpen = false;
  bool _genreAccordionOpen = false;
  final TextEditingController _searchController = TextEditingController();
  OverlayEntry? _overlayEntry;

  @override
  void dispose() {
    _searchController.dispose();
    _overlayEntry?.remove();
    super.dispose();
  }

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
      setState(() {
        _menuOpen = false;
        _genreAccordionOpen = false;
      });
    }
  }

  void _submitSearch(String query) {
    _closeMenu();
    final trimmed = query.trim();
    if (trimmed.isNotEmpty) {
      context.go('/?q=${Uri.encodeComponent(trimmed)}');
    } else {
      context.go('/');
    }
  }

  void _showGenreBottomSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Consumer(
          builder: (context, ref, child) {
            final genresAsync = ref.watch(genreListProvider);
            return Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'TẤT CẢ THỂ LOẠI',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: AppColors.inkMuted,
                          letterSpacing: 0.5,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, size: 20),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  const Divider(color: AppColors.inkBorder, height: 1),
                  const SizedBox(height: 12),
                  Flexible(
                    child: genresAsync.when(
                      data: (genres) => SingleChildScrollView(
                        child: Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            ActionChip(
                              label: const Text('Tất cả'),
                              backgroundColor: AppColors.inkElevated,
                              labelStyle: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: AppColors.gold,
                              ),
                              onPressed: () {
                                Navigator.pop(ctx);
                                context.go('/');
                              },
                            ),
                            ...genres.map(
                              (g) => ActionChip(
                                label: Text(g.name),
                                backgroundColor: Colors.white,
                                side: const BorderSide(color: AppColors.inkBorder),
                                labelStyle: GoogleFonts.inter(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: AppColors.inkText,
                                ),
                                onPressed: () {
                                  Navigator.pop(ctx);
                                  context.go('/?genre=${g.id}');
                                },
                              ),
                            ),
                          ],
                        ),
                      ),
                      loading: () => const Center(
                        child: Padding(
                          padding: EdgeInsets.all(20),
                          child: CircularProgressIndicator(color: AppColors.gold),
                        ),
                      ),
                      error: (error, stack) => Center(
                        child: Text(
                          'Không thể tải thể loại',
                          style: GoogleFonts.inter(color: AppColors.red400),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  OverlayEntry _createOverlayEntry() {
    return OverlayEntry(
      builder: (context) {
        return Consumer(
          builder: (context, ref, _) {
            final auth = ref.watch(authProvider);
            final genresAsync = ref.watch(genreListProvider);

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
                  top: MediaQuery.of(context).padding.top + 96,
                  left: 0,
                  right: 0,
                  child: Material(
                    color: Colors.transparent,
                    child: Container(
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.vertical(bottom: Radius.circular(20)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black12,
                            blurRadius: 16,
                            offset: Offset(0, 8),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.all(16),
                      constraints: BoxConstraints(
                        maxHeight: MediaQuery.of(context).size.height * 0.75,
                      ),
                      child: SingleChildScrollView(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Thanh tìm kiếm Pill bo tròn chuẩn Web
                            Container(
                              height: 42,
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(24),
                                border: Border.all(color: const Color(0xFFCBD5E1)),
                              ),
                              child: TextField(
                                controller: _searchController,
                                textInputAction: TextInputAction.search,
                                onSubmitted: _submitSearch,
                                style: GoogleFonts.inter(
                                  fontSize: 13,
                                  color: AppColors.inkText,
                                ),
                                decoration: InputDecoration(
                                  hintText: 'Bạn muốn tìm truyện gì...',
                                  hintStyle: GoogleFonts.inter(
                                    fontSize: 13,
                                    color: AppColors.inkMuted,
                                  ),
                                  border: InputBorder.none,
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 10,
                                  ),
                                  suffixIcon: IconButton(
                                    icon: const Icon(
                                      Icons.search,
                                      color: AppColors.gold,
                                      size: 20,
                                    ),
                                    onPressed: () => _submitSearch(_searchController.text),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 12),

                            // Các liên kết
                            _buildMenuItem(
                              title: 'Trang chủ',
                              icon: Icons.home_outlined,
                              onTap: () {
                                _closeMenu();
                                context.go('/');
                              },
                            ),

                            // Accordion Thể loại
                            InkWell(
                              onTap: () {
                                setState(() {
                                  _genreAccordionOpen = !_genreAccordionOpen;
                                });
                                _overlayEntry?.markNeedsBuild();
                              },
                              borderRadius: BorderRadius.circular(10),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 10,
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(
                                          Icons.category_outlined,
                                          size: 18,
                                          color: AppColors.inkMuted,
                                        ),
                                        const SizedBox(width: 10),
                                        Text(
                                          'Thể loại',
                                          style: GoogleFonts.inter(
                                            color: AppColors.inkText,
                                            fontSize: 14,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                      ],
                                    ),
                                    Icon(
                                      _genreAccordionOpen
                                          ? Icons.keyboard_arrow_up
                                          : Icons.keyboard_arrow_down,
                                      size: 18,
                                      color: AppColors.inkMuted,
                                    ),
                                  ],
                                ),
                              ),
                            ),

                            if (_genreAccordionOpen)
                              genresAsync.when(
                                data: (genres) => Container(
                                  padding: const EdgeInsets.all(10),
                                  margin: const EdgeInsets.symmetric(vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.inkElevated,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: AppColors.inkBorder),
                                  ),
                                  child: Wrap(
                                    spacing: 6,
                                    runSpacing: 6,
                                    children: [
                                      ActionChip(
                                        label: const Text('Tất cả'),
                                        backgroundColor: Colors.white,
                                        labelStyle: GoogleFonts.inter(
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.gold,
                                        ),
                                        onPressed: () {
                                          _closeMenu();
                                          context.go('/');
                                        },
                                      ),
                                      ...genres.map(
                                        (g) => ActionChip(
                                          label: Text(g.name),
                                          backgroundColor: Colors.white,
                                          side: const BorderSide(
                                            color: AppColors.inkBorder,
                                          ),
                                          labelStyle: GoogleFonts.inter(
                                            fontSize: 11,
                                            color: AppColors.inkText,
                                          ),
                                          onPressed: () {
                                            _closeMenu();
                                            context.go('/?genre=${g.id}');
                                          },
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                loading: () => const Padding(
                                  padding: EdgeInsets.all(8),
                                  child: Center(
                                    child: CircularProgressIndicator(
                                      color: AppColors.gold,
                                      strokeWidth: 2,
                                    ),
                                  ),
                                ),
                                error: (error, stack) => const SizedBox.shrink(),
                              ),

                            _buildMenuItem(
                              title: 'Gói VIP',
                              icon: Icons.workspace_premium,
                              iconColor: const Color(0xFFD97706),
                              textColor: const Color(0xFFB45309),
                              onTap: () {
                                _closeMenu();
                                context.push('/pricing');
                              },
                            ),
                            _buildMenuItem(
                              title: 'Tủ sách của tôi',
                              icon: Icons.bookmarks_outlined,
                              onTap: () {
                                _closeMenu();
                                context.push('/library');
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
                                    color: AppColors.inkElevated,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: AppColors.inkBorder),
                                  ),
                                  child: Row(
                                    children: [
                                      Container(
                                        width: 36,
                                        height: 36,
                                        decoration: const BoxDecoration(
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
                                                color: AppColors.inkText,
                                                fontSize: 14,
                                                fontWeight: FontWeight.w600,
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            Text(
                                              'Xem hồ sơ & tài khoản',
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
                              Row(
                                children: [
                                  Expanded(
                                    child: ElevatedButton(
                                      onPressed: () {
                                        _closeMenu();
                                        context.push('/register');
                                      },
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.brandSky,
                                        foregroundColor: Colors.white,
                                        elevation: 0,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        padding: const EdgeInsets.symmetric(vertical: 12),
                                      ),
                                      child: Text(
                                        'Đăng ký',
                                        style: GoogleFonts.inter(
                                          fontSize: 13,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: ElevatedButton(
                                      onPressed: () {
                                        _closeMenu();
                                        context.push('/login');
                                      },
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.brandBlue,
                                        foregroundColor: Colors.white,
                                        elevation: 0,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        padding: const EdgeInsets.symmetric(vertical: 12),
                                      ),
                                      child: Text(
                                        'Đăng nhập',
                                        style: GoogleFonts.inter(
                                          fontSize: 13,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
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
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
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
                fontWeight: textColor != null ? FontWeight.w600 : FontWeight.w500,
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

    return Container(
      color: Colors.white,
      child: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // ==========================================
            // TẦNG 1 (WHITE TOP BAR) - CAO 56PX
            // ==========================================
            Container(
              height: 56,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(
                  bottom: BorderSide(
                    color: AppColors.inkBorder,
                    width: 1,
                  ),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Logo chuẩn Web StoryReader
                  GestureDetector(
                    onTap: () => context.go('/'),
                    child: Row(
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
                                  color: AppColors.brandOrange,
                                  fontSize: 22,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: -0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 5,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'ONLINE',
                            style: GoogleFonts.inter(
                              color: AppColors.inkMuted,
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Nút phải: Đăng nhập hoặc Avatar & Hamburger
                  Row(
                    children: [
                      if (!auth.isAuthenticated) ...[
                        ElevatedButton(
                          onPressed: () => context.push('/login'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.brandBlue,
                            foregroundColor: Colors.white,
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 7,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          child: Text(
                            'Đăng nhập',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ] else ...[
                        GestureDetector(
                          onTap: () => context.push('/profile'),
                          child: Container(
                            width: 32,
                            height: 32,
                            decoration: const BoxDecoration(
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
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ],

                      const SizedBox(width: 6),
                      IconButton(
                        onPressed: _toggleMenu,
                        icon: Icon(
                          _menuOpen ? Icons.close : Icons.menu,
                          color: const Color(0xFF334155),
                          size: 24,
                        ),
                        visualDensity: VisualDensity.compact,
                        splashRadius: 20,
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // ==========================================
            // TẦNG 2 (THANH CAM TRUYENQQ SIGNATURE) - CAO 40PX
            // ==========================================
            Container(
              height: 40,
              decoration: const BoxDecoration(
                color: AppColors.brandOrange,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 4,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Row(
                  children: [
                    _buildNavButton(
                      label: 'Trang Chủ',
                      onTap: () => context.go('/'),
                    ),
                    _buildNavButton(
                      label: 'Thể Loại',
                      icon: Icons.keyboard_arrow_down,
                      onTap: _showGenreBottomSheet,
                    ),
                    _buildNavButton(
                      label: 'Xếp Hạng',
                      icon: Icons.trending_up,
                      onTap: () => context.go('/?sort=top'),
                    ),
                    _buildNavButton(
                      label: 'Tủ Sách',
                      onTap: () {
                        if (auth.isAuthenticated) {
                          context.push('/library');
                        } else {
                          context.push('/login');
                        }
                      },
                    ),
                    // Nút VIP nổi bật viền trắng mờ
                    GestureDetector(
                      onTap: () => context.push('/pricing'),
                      child: Container(
                        margin: const EdgeInsets.only(left: 6),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.22),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.45),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.workspace_premium,
                              color: Color(0xFFFDE68A),
                              size: 14,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Gói VIP',
                              style: GoogleFonts.inter(
                                color: Colors.white,
                                fontSize: 12,
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

  Widget _buildNavButton({
    required String label,
    IconData? icon,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: GoogleFonts.inter(
                color: Colors.white,
                fontSize: 12.5,
                fontWeight: FontWeight.w600,
              ),
            ),
            if (icon != null) ...[
              const SizedBox(width: 2),
              Icon(icon, color: Colors.white, size: 14),
            ],
          ],
        ),
      ),
    );
  }
}
