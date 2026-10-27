class InitiatePaymentResult {
  final String transactionId;
  final String paymentUrl;

  InitiatePaymentResult({
    required this.transactionId,
    required this.paymentUrl,
  });

  factory InitiatePaymentResult.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return InitiatePaymentResult(transactionId: '', paymentUrl: '');
    }
    return InitiatePaymentResult(
      transactionId: json['transactionId']?.toString() ?? '',
      paymentUrl: json['paymentUrl'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'transactionId': transactionId,
    'paymentUrl': paymentUrl,
  };
}

class SubscriptionPlanItem {
  final String id;
  final String name;
  final double price;
  final int durationDays;
  final String scope;

  SubscriptionPlanItem({
    required this.id,
    required this.name,
    required this.price,
    required this.durationDays,
    required this.scope,
  });

  factory SubscriptionPlanItem.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return SubscriptionPlanItem(
        id: '',
        name: '',
        price: 0,
        durationDays: 0,
        scope: '',
      );
    }
    return SubscriptionPlanItem(
      id: json['id']?.toString() ?? '',
      name: json['name'] as String? ?? '',
      price: (json['price'] is num) ? (json['price'] as num).toDouble() : 0.0,
      durationDays: (json['durationDays'] is num) ? (json['durationDays'] as num).toInt() : 0,
      scope: json['scope'] as String? ?? 'all',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'price': price,
    'durationDays': durationDays,
    'scope': scope,
  };
}

class MySubscriptionItem {
  final String planId;
  final String planName;
  final DateTime startAt;
  final DateTime endAt;
  final bool isActive;

  MySubscriptionItem({
    required this.planId,
    required this.planName,
    required this.startAt,
    required this.endAt,
    required this.isActive,
  });

  factory MySubscriptionItem.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return MySubscriptionItem(
        planId: '',
        planName: '',
        startAt: DateTime.now(),
        endAt: DateTime.now(),
        isActive: false,
      );
    }
    DateTime parseDate(dynamic val) {
      try {
        return val != null ? DateTime.parse(val.toString()) : DateTime.now();
      } catch (_) {
        return DateTime.now();
      }
    }

    return MySubscriptionItem(
      planId: json['planId']?.toString() ?? '',
      planName: json['planName'] as String? ?? '',
      startAt: parseDate(json['startAt']),
      endAt: parseDate(json['endAt']),
      isActive: json['isActive'] as bool? ?? false,
    );
  }
}

class MyPurchaseItem {
  final String storyId;
  final String storyTitle;
  final double pricePaid;
  final DateTime purchasedAt;

  MyPurchaseItem({
    required this.storyId,
    required this.storyTitle,
    required this.pricePaid,
    required this.purchasedAt,
  });

  factory MyPurchaseItem.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return MyPurchaseItem(
        storyId: '',
        storyTitle: '',
        pricePaid: 0,
        purchasedAt: DateTime.now(),
      );
    }
    DateTime parseDate(dynamic val) {
      try {
        return val != null ? DateTime.parse(val.toString()) : DateTime.now();
      } catch (_) {
        return DateTime.now();
      }
    }

    return MyPurchaseItem(
      storyId: json['storyId']?.toString() ?? '',
      storyTitle: json['storyTitle'] as String? ?? '',
      pricePaid: (json['pricePaid'] is num) ? (json['pricePaid'] as num).toDouble() : 0.0,
      purchasedAt: parseDate(json['purchasedAt']),
    );
  }
}
