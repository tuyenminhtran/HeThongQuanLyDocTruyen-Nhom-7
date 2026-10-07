class ChapterContent {
  final String id;
  final int chapterNumber;
  final String title;
  final String content;

  ChapterContent({
    required this.id,
    required this.chapterNumber,
    required this.title,
    required this.content,
  });

  factory ChapterContent.fromJson(Map<String, dynamic> json) {
    return ChapterContent(
      id: json['id']?.toString() ?? '',
      chapterNumber: json['chapterNumber'] as int? ?? 0,
      title: json['title'] as String? ?? '',
      content: json['content'] as String? ?? '',
    );
  }
}
