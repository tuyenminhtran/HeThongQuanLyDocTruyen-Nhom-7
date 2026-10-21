import '../../data/models/story_model.dart';

/// Adjacent chapters follow their chapter number, not the API's array order.
class ChapterSequence {
  final List<ChapterListItem> chapters;
  final int currentIndex;

  ChapterSequence._(this.chapters, this.currentIndex);

  factory ChapterSequence(List<ChapterListItem> chapters, String currentId) {
    final sorted = [...chapters]
      ..sort((a, b) => a.chapterNumber.compareTo(b.chapterNumber));
    return ChapterSequence._(
      sorted,
      sorted.indexWhere((chapter) => chapter.id == currentId),
    );
  }

  ChapterListItem? get previous =>
      currentIndex > 0 ? chapters[currentIndex - 1] : null;
  ChapterListItem? get next =>
      currentIndex >= 0 && currentIndex + 1 < chapters.length
      ? chapters[currentIndex + 1]
      : null;
}
