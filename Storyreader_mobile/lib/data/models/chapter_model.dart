import '../../core/constants/api_constants.dart';

class ChapterContent {
  final String id;
  final int chapterNumber;
  final String title;
  final String content;
  final int storyType;
  final List<String> imageUrls;
  final String? partName;

  bool get isComic => storyType == 1 || imageUrls.isNotEmpty;

  /// Danh sách URL ảnh đã chuẩn hóa đầy đủ domain
  List<String> get fullImageUrls {
    return imageUrls.map((url) => ApiConstants.resolveImageUrl(url)).toList();
  }

  ChapterContent({
    required this.id,
    required this.chapterNumber,
    required this.title,
    required this.content,
    this.storyType = 0,
    this.imageUrls = const [],
    this.partName,
  });

  factory ChapterContent.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return ChapterContent(
        id: '',
        chapterNumber: 0,
        title: '',
        content: '',
      );
    }

    var rawUrls = json['imageUrls'];
    List<String> urls = [];
    if (rawUrls is List) {
      urls = rawUrls
          .map((e) => e?.toString() ?? '')
          .where((e) => e.isNotEmpty)
          .toList();
    }

    return ChapterContent(
      id: json['id']?.toString() ?? '',
      chapterNumber: (json['chapterNumber'] is num) ? (json['chapterNumber'] as num).toInt() : 0,
      title: json['title'] as String? ?? 'Chương ${json['chapterNumber'] ?? ''}',
      content: json['content'] as String? ?? '',
      storyType: (json['storyType'] is num) ? (json['storyType'] as num).toInt() : 0,
      imageUrls: urls,
      partName: json['partName'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'chapterNumber': chapterNumber,
    'title': title,
    'content': content,
    'storyType': storyType,
    'imageUrls': imageUrls,
    if (partName != null) 'partName': partName,
  };
}
