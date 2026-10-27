import '../../core/constants/api_constants.dart';

enum StoryType {
  novel(0, 'Truyện chữ'),
  comic(1, 'Truyện tranh');

  final int value;
  final String label;
  const StoryType(this.value, this.label);

  static StoryType fromValue(dynamic val) {
    if (val is int && val == 1) return StoryType.comic;
    if (val is String && (val.toLowerCase() == 'comic' || val == '1')) return StoryType.comic;
    return StoryType.novel;
  }
}

enum ReleaseStatus {
  ongoing(0, 'Đang phát hành'),
  completed(1, 'Đã hoàn thành');

  final int value;
  final String label;
  const ReleaseStatus(this.value, this.label);

  static ReleaseStatus fromValue(dynamic val) {
    if (val is int && val == 1) return ReleaseStatus.completed;
    if (val is String && (val.toLowerCase() == 'completed' || val == '1')) return ReleaseStatus.completed;
    return ReleaseStatus.ongoing;
  }
}

enum AccessPolicy {
  free(0, 'Miễn phí'),
  paid(1, 'Trả phí'),
  mixed(2, 'Kết hợp');

  final int value;
  final String label;
  const AccessPolicy(this.value, this.label);

  static AccessPolicy fromValue(dynamic val) {
    if (val is int) {
      if (val == 1) return AccessPolicy.paid;
      if (val == 2) return AccessPolicy.mixed;
      return AccessPolicy.free;
    }
    if (val is String) {
      if (val.toLowerCase() == 'paid' || val == '1') return AccessPolicy.paid;
      if (val.toLowerCase() == 'mixed' || val == '2') return AccessPolicy.mixed;
    }
    return AccessPolicy.free;
  }
}

class StoryListItem {
  final String id;
  final String title;
  final String coverImageUrl;
  final String author;
  final int status;
  final int accessPolicy;
  final int viewCount;
  final StoryType type;
  final int totalChapters;
  final int? latestChapterNumber;

  StoryListItem({
    required this.id,
    required this.title,
    required this.coverImageUrl,
    required this.author,
    required this.status,
    required this.accessPolicy,
    required this.viewCount,
    this.type = StoryType.novel,
    this.totalChapters = 0,
    this.latestChapterNumber,
  });

  /// URL ảnh đầy đủ đã giải quyết đường dẫn tương đối
  String get fullCoverUrl => ApiConstants.resolveImageUrl(coverImageUrl);
  bool get isComic => type == StoryType.comic;
  ReleaseStatus get releaseStatus => ReleaseStatus.fromValue(status);
  AccessPolicy get policy => AccessPolicy.fromValue(accessPolicy);

  factory StoryListItem.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return StoryListItem(
        id: '',
        title: '',
        coverImageUrl: '',
        author: '',
        status: 0,
        accessPolicy: 0,
        viewCount: 0,
      );
    }
    return StoryListItem(
      id: json['id']?.toString() ?? '',
      title: json['title'] as String? ?? 'Chưa có tiêu đề',
      coverImageUrl: json['coverImageUrl'] as String? ?? '',
      author: json['author'] as String? ?? 'Đang cập nhật',
      status: (json['status'] is num) ? (json['status'] as num).toInt() : 0,
      accessPolicy: (json['accessPolicy'] is num) ? (json['accessPolicy'] as num).toInt() : 0,
      viewCount: (json['viewCount'] is num) ? (json['viewCount'] as num).toInt() : 0,
      type: StoryType.fromValue(json['type']),
      totalChapters: (json['totalChapters'] is num) ? (json['totalChapters'] as num).toInt() : 0,
      latestChapterNumber: (json['latestChapterNumber'] is num)
          ? (json['latestChapterNumber'] as num).toInt()
          : null,
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
    'type': type.value,
    'totalChapters': totalChapters,
    'latestChapterNumber': latestChapterNumber,
  };
}

class ChapterListItem {
  final String id;
  final int chapterNumber;
  final String title;
  final bool requiresAccess;
  final String? partName;

  ChapterListItem({
    required this.id,
    required this.chapterNumber,
    required this.title,
    required this.requiresAccess,
    this.partName,
  });

  factory ChapterListItem.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return ChapterListItem(
        id: '',
        chapterNumber: 0,
        title: '',
        requiresAccess: false,
      );
    }
    return ChapterListItem(
      id: json['id']?.toString() ?? '',
      chapterNumber: (json['chapterNumber'] is num) ? (json['chapterNumber'] as num).toInt() : 0,
      title: json['title'] as String? ?? '',
      requiresAccess: json['requiresAccess'] as bool? ?? false,
      partName: json['partName'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'chapterNumber': chapterNumber,
    'title': title,
    'requiresAccess': requiresAccess,
    if (partName != null) 'partName': partName,
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
  final StoryType type;
  final int viewCount;

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
    this.type = StoryType.novel,
    this.viewCount = 0,
  });

  String get fullCoverUrl => ApiConstants.resolveImageUrl(coverImageUrl);
  bool get isComic => type == StoryType.comic;
  ReleaseStatus get releaseStatus => ReleaseStatus.fromValue(status);
  AccessPolicy get policy => AccessPolicy.fromValue(accessPolicy);

  factory StoryDetail.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return StoryDetail(
        id: '',
        title: '',
        coverImageUrl: '',
        description: '',
        author: '',
        status: 0,
        accessPolicy: 0,
        freeChapterCount: 0,
        genres: const [],
        chapters: const [],
      );
    }

    var rawGenres = json['genres'];
    List<String> parsedGenres = [];
    if (rawGenres is List) {
      parsedGenres = rawGenres.map((e) => e?.toString() ?? '').where((e) => e.isNotEmpty).toList();
    }

    var rawChapters = json['chapters'];
    List<ChapterListItem> parsedChapters = [];
    if (rawChapters is List) {
      for (final item in rawChapters) {
        if (item is Map) {
          parsedChapters.add(ChapterListItem.fromJson(Map<String, dynamic>.from(item)));
        }
      }
    }

    return StoryDetail(
      id: json['id']?.toString() ?? '',
      title: json['title'] as String? ?? 'Chưa có tiêu đề',
      coverImageUrl: json['coverImageUrl'] as String? ?? '',
      description: json['description'] as String? ?? '',
      author: json['author'] as String? ?? 'Đang cập nhật',
      status: (json['status'] is num) ? (json['status'] as num).toInt() : 0,
      accessPolicy: (json['accessPolicy'] is num) ? (json['accessPolicy'] as num).toInt() : 0,
      price: json['price'] != null && json['price'] is num ? (json['price'] as num).toDouble() : null,
      freeChapterCount: (json['freeChapterCount'] is num) ? (json['freeChapterCount'] as num).toInt() : 0,
      genres: parsedGenres,
      chapters: parsedChapters,
      type: StoryType.fromValue(json['type']),
      viewCount: (json['viewCount'] is num) ? (json['viewCount'] as num).toInt() : 0,
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
  final StoryType type;

  CreateStoryInput({
    required this.title,
    required this.coverImageUrl,
    required this.description,
    required this.author,
    required this.accessPolicy,
    this.price,
    this.freeChapterCount = 0,
    this.genreIds = const [],
    this.type = StoryType.novel,
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
    'type': type.value,
  };
}

class UpdateStoryInput {
  final String title;
  final String coverImageUrl;
  final String description;
  final String author;
  final int status;
  final int accessPolicy;
  final double? price;
  final int freeChapterCount;
  final List<String> genreIds;
  final StoryType type;

  UpdateStoryInput({
    required this.title,
    required this.coverImageUrl,
    required this.description,
    required this.author,
    required this.status,
    required this.accessPolicy,
    this.price,
    this.freeChapterCount = 0,
    this.genreIds = const [],
    this.type = StoryType.novel,
  });

  Map<String, dynamic> toJson() => {
    'title': title,
    'coverImageUrl': coverImageUrl,
    'description': description,
    'author': author,
    'status': status,
    'accessPolicy': accessPolicy,
    'price': accessPolicy == 0 ? null : price,
    'freeChapterCount': accessPolicy == 0 ? 0 : freeChapterCount,
    'genreIds': genreIds,
    'type': type.value,
  };
}

class CreateChapterInput {
  final int chapterNumber;
  final String title;
  final String content;
  final String? publishAt;
  final bool renderAsImages;
  final String? partName;

  CreateChapterInput({
    required this.chapterNumber,
    required this.title,
    required this.content,
    this.publishAt,
    this.renderAsImages = false,
    this.partName,
  });

  Map<String, dynamic> toJson() => {
    'chapterNumber': chapterNumber,
    'title': title,
    'content': content,
    if (publishAt != null) 'publishAt': publishAt,
    'renderAsImages': renderAsImages,
    if (partName != null && partName!.trim().isNotEmpty) 'partName': partName!.trim(),
  };
}
