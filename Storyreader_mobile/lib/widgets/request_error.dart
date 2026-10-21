import 'package:flutter/material.dart';

import '../core/network/api_error.dart';

class RequestError extends StatelessWidget {
  final Object error;
  final VoidCallback onRetry;
  const RequestError({super.key, required this.error, required this.onRetry});

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.all(24),
    child: Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          apiErrorMessage(error, 'Không tải được dữ liệu. Vui lòng thử lại.'),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: onRetry,
          icon: const Icon(Icons.refresh),
          label: const Text('Thử lại'),
        ),
      ],
    ),
  );
}
