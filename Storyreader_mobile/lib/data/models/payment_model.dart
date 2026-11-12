class InitiatePaymentResult {
  final String transactionId;
  final String paymentUrl;

  InitiatePaymentResult({
    required this.transactionId,
    required this.paymentUrl,
  });

  factory InitiatePaymentResult.fromJson(Map<String, dynamic> json) {
    return InitiatePaymentResult(
      transactionId: json['transactionId']?.toString() ?? '',
      paymentUrl: json['paymentUrl'] as String? ?? '',
    );
  }
}
