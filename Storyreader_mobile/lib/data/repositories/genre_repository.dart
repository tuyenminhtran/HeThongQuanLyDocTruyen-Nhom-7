import 'package:dio/dio.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../models/admin_model.dart';

abstract class IGenreRepository {
  Future<List<Genre>> getGenres();
  Future<Genre> createGenre(String name);
  Future<Genre> updateGenre(String id, String name);
  Future<void> deleteGenre(String id);
}

class GenreRepository implements IGenreRepository {
  final Dio _dio;

  GenreRepository({Dio? dio}) : _dio = dio ?? DioClient.instance;

  @override
  Future<List<Genre>> getGenres() async {
    return DioClient.safeRequest(() async {
      final res = await _dio.get(ApiConstants.genres);
      final data = res.data;
      if (data is List) {
        return data
            .map((e) => Genre.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList();
      }
      return [];
    });
  }

  @override
  Future<Genre> createGenre(String name) async {
    return DioClient.safeRequest(() async {
      final res = await _dio.post(
        ApiConstants.genres,
        data: {'name': name.trim()},
      );
      final data = Map<String, dynamic>.from(res.data as Map);
      return Genre.fromJson(data);
    });
  }

  @override
  Future<Genre> updateGenre(String id, String name) async {
    return DioClient.safeRequest(() async {
      final res = await _dio.put(
        ApiConstants.genreDetail(id),
        data: {'name': name.trim()},
      );
      final data = Map<String, dynamic>.from(res.data as Map);
      return Genre.fromJson(data);
    });
  }

  @override
  Future<void> deleteGenre(String id) async {
    return DioClient.safeRequest(() async {
      await _dio.delete(ApiConstants.genreDetail(id));
    });
  }
}
