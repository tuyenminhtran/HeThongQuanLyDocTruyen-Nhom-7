import '../models/chapter_model.dart';
import '../repositories/chapter_repository.dart';

class ChapterApi {
  static final _repository = ChapterRepository();

  static Future<ChapterContent> getChapterContent(String id) async {
    return await _repository.getChapterContent(id);
  }
}
