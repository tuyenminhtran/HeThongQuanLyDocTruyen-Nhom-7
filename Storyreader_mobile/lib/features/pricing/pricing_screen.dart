import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/app_header.dart';
import '../../widgets/app_footer.dart';

class PricingScreen extends ConsumerStatefulWidget {
  const PricingScreen({super.key});

  @override
  ConsumerState<PricingScreen> createState() => _PricingScreenState();
}

class _PricingScreenState extends ConsumerState<PricingScreen> {
  String _billingCycle = 'monthly'; // 'monthly' | 'yearly'

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);

    final plans = [
      {
        'id': 'basic',
        'name': 'Gói Đọc Thử',
        'price': _billingCycle == 'monthly' ? '19.000đ' : '190.000đ',
        'period': _billingCycle == 'monthly' ? '/tháng' : '/năm',
        'description': 'Phù hợp cho người mới bắt đầu khám phá nền tảng.',
        'features': [
          'Đọc tối đa 10 truyện VIP mỗi tháng',
          'Mở khóa các chương ẩn',
          'Không có quảng cáo',
          'Lưu lịch sử đọc cơ bản',
        ],
        'recommended': false,
        'isCoin': false,
      },
      {
        'id': 'premium',
        'name': 'Gói Premium',
        'price': _billingCycle == 'monthly' ? '49.000đ' : '490.000đ',
        'period': _billingCycle == 'monthly' ? '/tháng' : '/năm',
        'description': 'Trải nghiệm đọc truyện không giới hạn mọi lúc mọi nơi.',
        'features': [
          'Đọc KHÔNG GIỚI HẠN toàn bộ truyện VIP',
          'Tải truyện đọc offline',
          'Huy hiệu VIP trên avatar',
          'Tùy chỉnh giao diện đọc chuyên sâu',
          'Hỗ trợ tác giả yêu thích',
        ],
        'recommended': true,
        'isCoin': false,
      },
      {
        'id': 'coin',
        'name': 'Mua Xu Lẻ',
        'price': 'Từ 10.000đ',
        'period': '',
        'description': 'Dành cho người đọc ít, chỉ mua những truyện muốn xem.',
        'features': [
          '10.000đ = 1.000 xu',
          'Xu không có thời hạn sử dụng',
          'Thanh toán dễ dàng qua Momo, ZaloPay',
          'Mở khóa từng chương tùy thích',
        ],
        'recommended': false,
        'isCoin': true,
      },
    ];

    return Scaffold(
      appBar: const AppHeader(),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 32),
              child: Column(
                children: [
                  // Header
                  Text(
                    'Nâng cấp trải nghiệm đọc',
                    style: GoogleFonts.notoSerif(
                      color: AppColors.inkText,
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Chọn gói phù hợp nhất với bạn để mở khóa toàn bộ kho tàng truyện chất lượng cao trên StoryReader.',
                    style: GoogleFonts.inter(
                      color: AppColors.inkMuted,
                      fontSize: 14,
                      height: 1.5,
                    ),
                    textAlign: TextAlign.center,
                  ),

                  const SizedBox(height: 24),

                  // Toggle Billing Cycle
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.inkCard,
                      border: Border.all(color: AppColors.inkBorder),
                      borderRadius: BorderRadius.circular(30),
                    ),
                    padding: const EdgeInsets.all(4),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        GestureDetector(
                          onTap: () => setState(() => _billingCycle = 'monthly'),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 18,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: _billingCycle == 'monthly'
                                  ? AppColors.gold
                                  : Colors.transparent,
                              borderRadius: BorderRadius.circular(24),
                            ),
                            child: Text(
                              'Theo tháng',
                              style: GoogleFonts.inter(
                                color: _billingCycle == 'monthly'
                                    ? AppColors.inkBg
                                    : AppColors.inkMuted,
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ),
                        GestureDetector(
                          onTap: () => setState(() => _billingCycle = 'yearly'),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 18,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: _billingCycle == 'yearly'
                                  ? AppColors.gold
                                  : Colors.transparent,
                              borderRadius: BorderRadius.circular(24),
                            ),
                            child: Row(
                              children: [
                                Text(
                                  'Theo năm',
                                  style: GoogleFonts.inter(
                                    color: _billingCycle == 'yearly'
                                        ? AppColors.inkBg
                                        : AppColors.inkMuted,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 13,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 6,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: _billingCycle == 'yearly'
                                        ? AppColors.inkBg.withValues(alpha: 0.2)
                                        : AppColors.gold.withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    'Giảm 15%',
                                    style: GoogleFonts.inter(
                                      color: _billingCycle == 'yearly'
                                          ? AppColors.inkBg
                                          : AppColors.gold,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
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

                  const SizedBox(height: 36),

                  // Plans cards stacked vertically
                  ...plans.map((p) {
                    final recommended = p['recommended'] as bool;
                    final isCoin = p['isCoin'] as bool;
                    final features = p['features'] as List<String>;

                    return Container(
                      margin: const EdgeInsets.only(bottom: 24),
                      decoration: BoxDecoration(
                        color: AppColors.inkCard,
                        border: Border.all(
                          color: recommended ? AppColors.gold : AppColors.inkBorder,
                          width: recommended ? 1.5 : 1.0,
                        ),
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: recommended
                                ? AppColors.gold.withValues(alpha: 0.1)
                                : Colors.black.withValues(alpha: 0.2),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          if (recommended)
                            Align(
                              alignment: Alignment.center,
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 12),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 14,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.gold,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  'PHỔ BIẾN NHẤT',
                                  style: GoogleFonts.inter(
                                    color: AppColors.inkBg,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.8,
                                  ),
                                ),
                              ),
                            ),

                          Text(
                            p['name'] as String,
                            style: GoogleFonts.notoSerif(
                              color: AppColors.inkText,
                              fontSize: 20,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            p['description'] as String,
                            style: GoogleFonts.inter(
                              color: AppColors.inkMuted,
                              fontSize: 13,
                              height: 1.4,
                            ),
                          ),

                          const SizedBox(height: 20),

                          Row(
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              Text(
                                p['price'] as String,
                                style: GoogleFonts.inter(
                                  color: AppColors.inkText,
                                  fontSize: 28,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              if ((p['period'] as String).isNotEmpty) ...[
                                const SizedBox(width: 4),
                                Text(
                                  p['period'] as String,
                                  style: GoogleFonts.inter(
                                    color: AppColors.inkMuted,
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ],
                          ),

                          const SizedBox(height: 24),

                          // Features
                          Column(
                            children: features.map((f) {
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Icon(
                                      Icons.check,
                                      size: 18,
                                      color: AppColors.gold,
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Text(
                                        f,
                                        style: GoogleFonts.inter(
                                          color: AppColors.inkText.withValues(alpha: 0.85),
                                          fontSize: 13,
                                          height: 1.4,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                          ),

                          const SizedBox(height: 20),

                          // Action Button
                          ElevatedButton(
                            onPressed: () {
                              if (!auth.isAuthenticated) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Vui lòng đăng nhập trước khi thanh toán!'),
                                    backgroundColor: AppColors.inkCard,
                                  ),
                                );
                                return;
                              }
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    isCoin
                                        ? 'Chuyển đến trang mua xu...'
                                        : 'Đang xử lý đăng ký ${p['name']}...',
                                  ),
                                  backgroundColor: AppColors.inkCard,
                                ),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor:
                                  recommended ? AppColors.gold : AppColors.inkBg,
                              foregroundColor:
                                  recommended ? AppColors.inkBg : AppColors.inkText,
                              side: BorderSide(
                                color: recommended
                                    ? Colors.transparent
                                    : AppColors.inkBorder,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                            ),
                            child: Text(
                              isCoin ? 'Nạp Xu Ngay' : 'Đăng Ký Ngay',
                              style: GoogleFonts.inter(
                                fontWeight: FontWeight.w600,
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),

                  const SizedBox(height: 36),
                  Divider(color: AppColors.inkBorder),
                  const SizedBox(height: 24),

                  // Payment logos
                  Text(
                    'Thanh toán an toàn & tiện lợi',
                    style: GoogleFonts.notoSerif(
                      color: AppColors.inkText,
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    alignment: WrapAlignment.center,
                    spacing: 16,
                    runSpacing: 12,
                    children: [
                      Text(
                        'MOMO',
                        style: GoogleFonts.inter(
                          color: AppColors.inkMuted,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'ZaloPay',
                        style: GoogleFonts.inter(
                          color: Colors.blue.shade400,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'VNPay',
                        style: GoogleFonts.inter(
                          color: Colors.red.shade400,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Visa / Mastercard',
                        style: GoogleFonts.inter(
                          color: Colors.green.shade400,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
            const AppFooter(),
          ],
        ),
      ),
    );
  }
}
