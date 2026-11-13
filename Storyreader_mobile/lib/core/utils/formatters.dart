import 'package:intl/intl.dart';

final NumberFormat _vnDecimalFormat = NumberFormat.decimalPattern('vi_VN');

/// Định dạng số tiền VNĐ theo chuẩn phân cách dấu chấm (VD: 25.000 VNĐ)
String formatVnd(num? amount, {String suffix = 'VNĐ'}) {
  final value = (amount ?? 0).round();
  final formatted = _vnDecimalFormat.format(value);
  return suffix.isEmpty ? formatted : '$formatted $suffix';
}
