import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class BookCoverFallback extends StatelessWidget {
  final String title;
  final double iconSize;

  const BookCoverFallback({
    super.key,
    required this.title,
    this.iconSize = 28,
  });

  // Tạo màu gradient sang trọng dựa trên hash của tên truyện
  List<Color> _getGradients(String text) {
    final hash = text.hashCode.abs();
    final palette = [
      [const Color(0xFF1E293B), const Color(0xFF0F172A)], // Slate dark
      [const Color(0xFFC2410C), const Color(0xFF9A3412)], // Rust orange
      [const Color(0xFF1E3A8A), const Color(0xFF172554)], // Deep blue
      [const Color(0xFF4C1D95), const Color(0xFF2E1065)], // Deep purple
      [const Color(0xFF064E3B), const Color(0xFF022C22)], // Emerald dark
      [const Color(0xFF831843), const Color(0xFF500724)], // Rose dark
    ];
    return palette[hash % palette.length];
  }

  @override
  Widget build(BuildContext context) {
    final colors = _getGradients(title);
    final initial = title.trim().isNotEmpty ? title.trim()[0].toUpperCase() : 'S';

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: colors,
        ),
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Spine đường gáy sách bên trái
          Positioned(
            top: 0,
            bottom: 0,
            left: 0,
            width: 8,
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.black.withValues(alpha: 0.35),
                    Colors.white.withValues(alpha: 0.1),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Khung viền chỉ vàng tinh tế như sách cổ điển
          Positioned.fill(
            child: Container(
              margin: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                border: Border.all(
                  color: Colors.white.withValues(alpha: 0.15),
                  width: 1,
                ),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),

          // Nội dung bìa sách
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: iconSize + 12,
                    height: iconSize + 12,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withValues(alpha: 0.12),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      initial,
                      style: GoogleFonts.notoSerif(
                        color: Colors.white.withValues(alpha: 0.9),
                        fontSize: iconSize - 6,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                    style: GoogleFonts.notoSerif(
                      color: Colors.white.withValues(alpha: 0.95),
                      fontSize: 10.5,
                      fontWeight: FontWeight.w600,
                      height: 1.2,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

