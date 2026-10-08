import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../models/chapter_model.dart';

class ChapterApi {
  static Future<ChapterContent> getChapterContent(String id) async {
    final res = await DioClient.instance.get(ApiConstants.chapterDetail(id));
    return ChapterContent.fromJson(res.data as Map<String, dynamic>);
  }
}
