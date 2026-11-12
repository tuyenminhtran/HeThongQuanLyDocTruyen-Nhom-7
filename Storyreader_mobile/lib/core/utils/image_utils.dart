import 'package:flutter/foundation.dart' show kIsWeb;
import '../constants/api_constants.dart';

class ImageUtils {
  static String resolveUrl(String? url) {
    if (url == null || url.trim().isEmpty) {
      return 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80';
    }

    final trimmed = url.trim();
    final lower = trimmed.toLowerCase();

    // Dangerous protocols
    if (lower.startsWith('javascript:') || lower.startsWith('vbscript:')) {
      return 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80';
    }

    String fullUrl = trimmed;
    if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
      final base = ApiConstants.baseUrl.replaceAll(RegExp(r'/api/?$'), '');
      fullUrl = '$base${trimmed.startsWith('/') ? '' : '/'}$trimmed';
    }

    // Fix Pinterest CORS on Flutter Web using fast global image CDN proxy
    if (kIsWeb && fullUrl.contains('pinimg.com')) {
      return 'https://images.weserv.nl/?url=${Uri.encodeComponent(fullUrl)}&default=https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80';
    }

    return fullUrl;
  }
}
