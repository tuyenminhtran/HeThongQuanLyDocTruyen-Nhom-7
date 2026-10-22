class ChapterContent {
  final String id;
  final int chapterNumber;
  final String title;
  final String content;
  final int storyType;
  final List<String> imageUrls;

  bool get isComic => storyType == 1 || imageUrls.isNotEmpty;

  ChapterContent({
    required this.id,
    required this.chapterNumber,
    required this.title,
    required this.content,
    this.storyType = 0,
    this.imageUrls = const [],
  });

  factory ChapterContent.fromJson(Map<String, dynamic> json) {
    var rawUrls = json['imageUrls'];
    List<String> urls = [];
    if (rawUrls is List) {
      urls = rawUrls.map((e) => e.toString()).toList();
    }
    return ChapterContent(
      id: json['id']?.toString() ?? '',
      chapterNumber: json['chapterNumber'] as int? ?? 0,
      title: json['title'] as String? ?? '',
      content: json['content'] as String? ?? '',
      storyType: json['storyType'] as int? ?? 0,
      imageUrls: urls,
    );
  }
}

