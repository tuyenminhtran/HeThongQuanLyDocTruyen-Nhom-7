import '../constants/api_constants.dart';

class ImageUtils {
  static const String _fallbackCoverUrl =
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80';

  static String resolveUrl(String? url) {
    final resolved = ApiConstants.resolveImageUrl(url);
    return resolved.isEmpty ? _fallbackCoverUrl : resolved;
  }
}
