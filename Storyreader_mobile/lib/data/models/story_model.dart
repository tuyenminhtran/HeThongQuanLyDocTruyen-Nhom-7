class StoryListItem {
  final String id;
  final String title;
  final String coverImageUrl;
  final String author;
  final int status;
  final int accessPolicy;
  final int viewCount;

  StoryListItem({
    required this.id,
    required this.title,
    required this.coverImageUrl,
    required this.author,
    required this.status,
    required this.accessPolicy,
    required this.viewCount,
  });

  factory StoryListItem.fromJson(Map<String, dynamic> json) {
    return StoryListItem(
      id: json['id']?.toString() ?? '',
      title: json['title'] as String? ?? '',
      coverImageUrl: json['coverImageUrl'] as String? ?? '',
      author: json['author'] as String? ?? '',
      status: json['status'] as int? ?? 0,
      accessPolicy: json['accessPolicy'] as int? ?? 0,
      viewCount: json['viewCount'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'coverImageUrl': coverImageUrl,
    'author': author,
    'status': status,
    'accessPolicy': accessPolicy,
    'viewCount': viewCount,
  };
}

class ChapterListItem {
  final String id;
  final int chapterNumber;
  final String title;
  final bool requiresAccess;

  ChapterListItem({
    required this.id,
    required this.chapterNumber,
    required this.title,
    required this.requiresAccess,
  });

  factory ChapterListItem.fromJson(Map<String, dynamic> json) {
    return ChapterListItem(
      id: json['id']?.toString() ?? '',
      chapterNumber: json['chapterNumber'] as int? ?? 0,
      title: json['title'] as String? ?? '',
      requiresAccess: json['requiresAccess'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'chapterNumber': chapterNumber,
    'title': title,
    'requiresAccess': requiresAccess,
  };
}

class StoryDetail {
  final String id;
  final String title;
  final String coverImageUrl;
  final String description;
  final String author;
  final int status;
  final int accessPolicy;
  final double? price;
  final int freeChapterCount;
  final List<String> genres;
  final List<ChapterListItem> chapters;

  StoryDetail({
    required this.id,
    required this.title,
    required this.coverImageUrl,
    required this.description,
    required this.author,
    required this.status,
    required this.accessPolicy,
    this.price,
    required this.freeChapterCount,
    required this.genres,
    required this.chapters,
  });

  factory StoryDetail.fromJson(Map<String, dynamic> json) {
    var rawGenres = json['genres'];
    List<String> parsedGenres = [];
    if (rawGenres is List) {
      parsedGenres = rawGenres.map((e) => e.toString()).toList();
    }

    var rawChapters = json['chapters'];
    List<ChapterListItem> parsedChapters = [];
    if (rawChapters is List) {
      parsedChapters = rawChapters
          .map((e) => ChapterListItem.fromJson(e as Map<String, dynamic>))
          .toList();
    }

    return StoryDetail(
      id: json['id']?.toString() ?? '',
      title: json['title'] as String? ?? '',
      coverImageUrl: json['coverImageUrl'] as String? ?? '',
      description: json['description'] as String? ?? '',
      author: json['author'] as String? ?? '',
      status: json['status'] as int? ?? 0,
      accessPolicy: json['accessPolicy'] as int? ?? 0,
      price: json['price'] != null ? (json['price'] as num).toDouble() : null,
      freeChapterCount: json['freeChapterCount'] as int? ?? 0,
      genres: parsedGenres,
      chapters: parsedChapters,
    );
  }
}

class CreateStoryInput {
  final String title;
  final String coverImageUrl;
  final String description;
  final String author;
  final int accessPolicy;
  final double? price;
  final int freeChapterCount;
  final List<String> genreIds;

  CreateStoryInput({
    required this.title,
    required this.coverImageUrl,
    required this.description,
    required this.author,
    required this.accessPolicy,
    this.price,
    this.freeChapterCount = 0,
    this.genreIds = const [],
  });

  Map<String, dynamic> toJson() => {
    'title': title,
    'coverImageUrl': coverImageUrl,
    'description': description,
    'author': author,
    'accessPolicy': accessPolicy,
    'price': accessPolicy == 0 ? null : price,
    'freeChapterCount': accessPolicy == 0 ? 0 : freeChapterCount,
    'genreIds': genreIds,
  };
}

class CreateChapterInput {
  final int chapterNumber;
  final String title;
  final String content;
  final String? publishAt;

  CreateChapterInput({
    required this.chapterNumber,
    required this.title,
    required this.content,
    this.publishAt,
  });

  Map<String, dynamic> toJson() => {
    'chapterNumber': chapterNumber,
    'title': title,
    'content': content,
    'publishAt': publishAt,
  };
}
