import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/constants/app_colors.dart';
import '../../data/models/payment_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/subscription_provider.dart';
import '../../widgets/app_header.dart';
import '../../widgets/app_footer.dart';

class PricingScreen extends ConsumerStatefulWidget {
  const PricingScreen({super.key});

  @override
  ConsumerState<PricingScreen> createState() => _PricingScreenState();
}

class _PricingScreenState extends ConsumerState<PricingScreen> {
  String _formatPrice(double price) {
    final intPrice = price.toInt();
    final formatted = intPrice.toString().replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (Match m) => '${m[1]}.',
        );
    return '$formatted VNĐ';
  }

  void _showPaymentModal(SubscriptionPlanItem plan) {
    final auth = ref.read(authProvider);
    if (!auth.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng đăng nhập trước khi đăng ký gói VIP!')),
      );
      context.push('/login');
      return;
    }

    showDialog(
      context: context,
      builder: (ctx) {
        bool isSimulating = false;
        String? errorMessage;

        return StatefulBuilder(
          builder: (dialogContext, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: Row(
                children: [
                  const Icon(Icons.workspace_premium, color: AppColors.gold, size: 24),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Thanh Toán Gói VIP',
                      style: GoogleFonts.lora(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      plan.name,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Thời hạn: ${plan.durationDays} ngày',
                      style: GoogleFonts.inter(fontSize: 12, color: AppColors.inkMuted),
                    ),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.amber.shade50,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.amber.shade300),
                      ),
                      child: Text(
                        _formatPrice(plan.price),
                        style: GoogleFonts.inter(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: const Color(0xFFB45309),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    // QR Code
                    Container(
                      width: 170,
                      height: 170,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.shade300, width: 2),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.qr_code_2, size: 100, color: Color(0xFF0F172A)),
                          const SizedBox(height: 4),
                          Text(
                            'VNPay Sandbox QR',
                            style: GoogleFonts.spaceMono(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Colors.blue.shade700,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Quét mã trên app ngân hàng hoặc bấm nút xác nhận mô phỏng để kích hoạt gói VIP ngay lập tức.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(fontSize: 11, color: AppColors.inkMuted),
                    ),
                    if (errorMessage != null) ...[
                      const SizedBox(height: 10),
                      Text(
                        errorMessage!,
                        style: const TextStyle(color: AppColors.red400, fontSize: 12),
                      ),
                    ],
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: isSimulating ? null : () => Navigator.pop(ctx),
                  child: const Text('Hủy'),
                ),
                ElevatedButton(
                  onPressed: isSimulating
                      ? null
                      : () async {
                          setDialogState(() {
                            isSimulating = true;
                            errorMessage = null;
                          });
                          try {
                            final subRepo = ref.read(subscriptionRepositoryProvider);
                            final initRes = await subRepo.buySubscription(plan.id);

                            String refCode = initRes.transactionId;
                            try {
                              final uri = Uri.parse(initRes.paymentUrl);
                              final qRef = uri.queryParameters['ref'];
                              if (qRef != null && qRef.isNotEmpty) {
                                refCode = qRef;
                              }
                            } catch (_) {}

                            await subRepo.simulatePaymentCallback(refCode, success: true);
                            ref.invalidate(profileProvider);
                            ref.invalidate(mySubscriptionsProvider);

                            if (!mounted) return;
                            if (ctx.mounted) Navigator.pop(ctx);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('🎉 Chúc mừng! Gói VIP đã được kích hoạt thành công.'),
                                backgroundColor: Colors.green,
                              ),
                            );
                          } catch (e) {
                            if (!mounted) return;
                            setDialogState(() {
                              isSimulating = false;
                              errorMessage = 'Lỗi kích hoạt thanh toán: $e';
                            });
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.gold,
                    foregroundColor: Colors.white,
                  ),
                  child: isSimulating
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('Xác nhận đã thanh toán (Mô phỏng)'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final plansAsync = ref.watch(subscriptionPlansProvider);

    return Scaffold(
      appBar: const AppHeader(),
      backgroundColor: AppColors.inkBg,
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 32),
              child: Column(
                children: [
                  // Header
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.gold.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.gold.withValues(alpha: 0.2)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.workspace_premium, color: AppColors.gold, size: 16),
                        SizedBox(width: 6),
                        Text(
                          'HỘI VIÊN STORYREADER VIP',
                          style: TextStyle(
                            color: AppColors.gold,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Nâng Cấp Trải Nghiệm Đọc',
                    style: GoogleFonts.notoSerif(
                      color: AppColors.inkText,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Mở khóa không giới hạn toàn bộ kho tàng tiểu thuyết và truyện tranh VIP trên StoryReader.',
                    style: GoogleFonts.inter(
                      color: AppColors.inkMuted,
                      fontSize: 13.5,
                      height: 1.5,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),

                  // Danh sách các gói cước
                  plansAsync.when(
                    loading: () => const Padding(
                      padding: EdgeInsets.symmetric(vertical: 40),
                      child: Center(child: CircularProgressIndicator(color: AppColors.gold)),
                    ),
                    error: (err, _) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 20),
                      child: Column(
                        children: [
                          const Icon(Icons.error_outline, color: AppColors.red400, size: 36),
                          const SizedBox(height: 8),
                          Text('Không thể tải danh sách gói: $err'),
                          const SizedBox(height: 8),
                          ElevatedButton(
                            onPressed: () => ref.invalidate(subscriptionPlansProvider),
                            child: const Text('Thử lại'),
                          ),
                        ],
                      ),
                    ),
                    data: (plansList) {
                      // Nếu API trả về list rỗng thì dùng fallback plans chuẩn
                      final items = plansList.isNotEmpty
                          ? List<SubscriptionPlanItem>.from(plansList)
                          : [
                              SubscriptionPlanItem(
                                id: 'sub-1m',
                                name: 'Gói 1 Tháng',
                                price: 49000,
                                durationDays: 30,
                                scope: 'all',
                              ),
                              SubscriptionPlanItem(
                                id: 'sub-3m',
                                name: 'Gói 3 Tháng',
                                price: 129000,
                                durationDays: 90,
                                scope: 'all',
                              ),
                              SubscriptionPlanItem(
                                id: 'sub-1y',
                                name: 'Gói 1 Năm',
                                price: 399000,
                                durationDays: 365,
                                scope: 'all',
                              ),
                            ];

                      items.sort((a, b) => a.durationDays.compareTo(b.durationDays));

                      return Column(
                        children: items.map((plan) {
                          final isRecommended = plan.durationDays == 90;
                          final isYearly = plan.durationDays >= 365;

                          final features = [
                            'Đọc KHÔNG GIỚI HẠN toàn bộ truyện VIP',
                            'Truy cập sớm các chương truyện mới nhất',
                            'Chế độ đọc không quảng cáo',
                            'Tải và lưu trữ ngoại tuyến',
                            isRecommended || isYearly
                                ? 'Huy hiệu VIP Hoàng Kim trên hồ sơ cá nhân'
                                : 'Huy hiệu VIP trên hồ sơ cá nhân',
                          ];

                          return Container(
                            margin: const EdgeInsets.only(bottom: 20),
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isRecommended
                                    ? AppColors.gold
                                    : (isYearly ? Colors.amber.shade400 : AppColors.inkBorder),
                                width: isRecommended || isYearly ? 2 : 1,
                              ),
                              boxShadow: [
                                if (isRecommended)
                                  BoxShadow(
                                    color: AppColors.gold.withValues(alpha: 0.15),
                                    blurRadius: 16,
                                    offset: const Offset(0, 4),
                                  ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                if (isRecommended)
                                  Align(
                                    alignment: Alignment.topRight,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: AppColors.gold,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: const Text(
                                        'PHỔ BIẾN NHẤT',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ),
                                if (isYearly)
                                  Align(
                                    alignment: Alignment.topRight,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFD97706),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: const Text(
                                        'TIẾT KIỆM 30%',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ),

                                Text(
                                  plan.name,
                                  style: GoogleFonts.inter(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.inkText,
                                  ),
                                ),
                                const SizedBox(height: 8),

                                Text(
                                  _formatPrice(plan.price),
                                  style: GoogleFonts.spaceMono(
                                    fontSize: 22,
                                    fontWeight: FontWeight.w900,
                                    color: AppColors.gold,
                                  ),
                                ),
                                Text(
                                  'Thời hạn ${plan.durationDays} ngày',
                                  style: GoogleFonts.inter(
                                    fontSize: 12,
                                    color: AppColors.inkMuted,
                                  ),
                                ),
                                const Divider(height: 24, color: AppColors.inkBorder),

                                // Features
                                Column(
                                  children: features.map((f) {
                                    return Padding(
                                      padding: const EdgeInsets.only(bottom: 10),
                                      child: Row(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          const Icon(Icons.check_circle, size: 16, color: AppColors.gold),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text(
                                              f,
                                              style: GoogleFonts.inter(
                                                fontSize: 12.5,
                                                color: const Color(0xFF334155),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                  }).toList(),
                                ),
                                const SizedBox(height: 16),

                                // Button
                                ElevatedButton(
                                  onPressed: () => _showPaymentModal(plan),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: isRecommended ? AppColors.gold : const Color(0xFF0F172A),
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                  ),
                                  child: const Text(
                                    'Đăng Ký Ngay',
                                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      );
                    },
                  ),

                  const SizedBox(height: 20),
                  const Divider(color: AppColors.inkBorder),
                  const SizedBox(height: 20),

                  // Thanh toán an toàn
                  Text(
                    'Phương Thức Thanh Toán Hỗ Trợ',
                    style: GoogleFonts.inter(
                      color: AppColors.inkText,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    alignment: WrapAlignment.center,
                    spacing: 16,
                    runSpacing: 8,
                    children: [
                      _buildPaymentBadge('VNPay QR', Colors.red.shade700),
                      _buildPaymentBadge('MoMo', Colors.pink.shade700),
                      _buildPaymentBadge('ZaloPay', Colors.blue.shade700),
                      _buildPaymentBadge('Thẻ ATM / Visa', Colors.green.shade700),
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

  Widget _buildPaymentBadge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.inkBorder),
      ),
      child: Text(
        label,
        style: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: color,
        ),
      ),
    );
  }
}
