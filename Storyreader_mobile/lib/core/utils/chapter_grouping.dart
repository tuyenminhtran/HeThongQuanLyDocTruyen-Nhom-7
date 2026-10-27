import '../../data/models/story_model.dart';

class ChapterGroup {
  final String partName;
  final bool isFolder;
  final List<ChapterListItem> chapters;

  ChapterGroup({
    required this.partName,
    required this.isFolder,
    required this.chapters,
  });
}

/// Thuật toán nhóm danh sách chương thành các Phần/Tập (Cây thư mục cha-con)
/// Tương thích 100% với logic nhóm trên Backend và Storyreader Web
List<ChapterGroup> groupChaptersByPart(List<ChapterListItem> chapters) {
  if (chapters.isEmpty) return [];

  final groupsMap = <String, List<ChapterListItem>>{};
  bool hasExplicitPart = false;

  final partRegex = RegExp(
    r'(?:\[|\()?((?:Phần|Tập|Quyển)\s*\d+[^\]\)]*)(?:\]|\))?',
    caseSensitive: false,
  );

  for (final c in chapters) {
    String part = (c.partName ?? '').trim();
    if (part.isNotEmpty) {
      hasExplicitPart = true;
    } else {
      final match = partRegex.firstMatch(c.title);
      if (match != null && match.group(1) != null) {
        part = match.group(1)!.trim();
      } else {
        part = 'Chương chung';
      }
    }

    groupsMap.putIfAbsent(part, () => []).add(c);
  }

  // Nếu chỉ có 1 nhóm "Chương chung" và không có partName cụ thể nào thì không cần hiện folder
  if (groupsMap.length <= 1 && !hasExplicitPart && groupsMap.containsKey('Chương chung')) {
    return [
      ChapterGroup(
        partName: 'Tất cả chương',
        isFolder: false,
        chapters: chapters,
      ),
    ];
  }

  final result = <ChapterGroup>[];
  for (final entry in groupsMap.entries) {
    final sortedChapters = List<ChapterListItem>.from(entry.value)
      ..sort((a, b) => a.chapterNumber.compareTo(b.chapterNumber));

    result.add(
      ChapterGroup(
        partName: entry.key,
        isFolder: true,
        chapters: sortedChapters,
      ),
    );
  }

  return result;
}
