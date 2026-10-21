import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/constants/app_colors.dart';
import '../../core/network/api_error.dart';
import '../../data/models/admin_model.dart';
import '../../providers/admin_provider.dart';
import '../../providers/story_provider.dart';
import '../../widgets/request_error.dart';

class AdminCategoriesScreen extends ConsumerStatefulWidget {
  const AdminCategoriesScreen({super.key});
  @override
  ConsumerState<AdminCategoriesScreen> createState() =>
      _AdminCategoriesScreenState();
}

class _AdminCategoriesScreenState extends ConsumerState<AdminCategoriesScreen> {
  final Set<String> _deleting = {};

  void _refreshGenres() {
    ref.invalidate(genresProvider);
    ref.invalidate(storyDetailFamily);
  }

  Future<void> _edit([Genre? genre]) async {
    final saved = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (_) => _GenreEditor(genre: genre),
    );
    if (saved == true && mounted) _refreshGenres();
  }

  Future<void> _delete(Genre genre) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xóa thể loại?'),
        content: Text(
          'Xóa "${genre.name}" khỏi danh mục và khỏi ${genre.storyCount} truyện đang gắn thể loại này? Các truyện vẫn được giữ lại.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Xóa'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    setState(() => _deleting.add(genre.id));
    try {
      await ref.read(adminApiProvider).deleteGenre(genre.id);
      if (!mounted) return;
      _refreshGenres();
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Đã xóa thể loại.')));
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(apiErrorMessage(error, 'Không thể xóa thể loại.')),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _deleting.remove(genre.id));
    }
  }

  @override
  Widget build(BuildContext context) {
    final genres = ref.watch(genresProvider);
    return RefreshIndicator(
      onRefresh: () => ref
          .refresh(genresProvider.future)
          .then<void>((_) {}, onError: (Object error, StackTrace stack) {}),
      child: ListView(
        padding: const EdgeInsets.all(16),
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Quản lý thể loại',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
              ),
              FilledButton.icon(
                onPressed: () => _edit(),
                icon: const Icon(Icons.add),
                label: const Text('Thêm'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          genres.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, _) => RequestError(
              error: error,
              onRetry: () => ref.invalidate(genresProvider),
            ),
            data: (items) => items.isEmpty
                ? const Padding(
                    padding: EdgeInsets.all(24),
                    child: Text(
                      'Chưa có thể loại. Nhấn Thêm để tạo thể loại đầu tiên.',
                    ),
                  )
                : Column(
                    children: items
                        .map(
                          (genre) => Card(
                            child: ListTile(
                              title: Text(genre.name),
                              subtitle: Text(
                                '${genre.slug}\n${genre.storyCount} truyện',
                              ),
                              isThreeLine: true,
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  IconButton(
                                    tooltip: 'Sửa thể loại',
                                    onPressed: _deleting.contains(genre.id)
                                        ? null
                                        : () => _edit(genre),
                                    icon: const Icon(
                                      Icons.edit_outlined,
                                      color: AppColors.gold,
                                    ),
                                  ),
                                  IconButton(
                                    tooltip: 'Xóa thể loại',
                                    onPressed: _deleting.contains(genre.id)
                                        ? null
                                        : () => _delete(genre),
                                    icon: const Icon(
                                      Icons.delete_outline,
                                      color: AppColors.red400,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        )
                        .toList(),
                  ),
          ),
        ],
      ),
    );
  }
}

class _GenreEditor extends ConsumerStatefulWidget {
  final Genre? genre;
  const _GenreEditor({this.genre});
  @override
  ConsumerState<_GenreEditor> createState() => _GenreEditorState();
}

class _GenreEditorState extends ConsumerState<_GenreEditor> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name = TextEditingController(
    text: widget.genre?.name ?? '',
  );
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final api = ref.read(adminApiProvider);
      if (widget.genre == null) {
        await api.createGenre(_name.text);
      } else {
        await api.updateGenre(widget.genre!.id, _name.text);
      }
      if (mounted) Navigator.pop(context, true);
    } catch (error) {
      if (mounted) {
        setState(
          () => _error = apiErrorMessage(error, 'Không lưu được thể loại.'),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) => PopScope(
    canPop: !_saving,
    child: AlertDialog(
      title: Text(widget.genre == null ? 'Thêm thể loại' : 'Sửa thể loại'),
      content: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextFormField(
              controller: _name,
              enabled: !_saving,
              autofocus: true,
              decoration: const InputDecoration(labelText: 'Tên thể loại'),
              validator: (value) => value == null || value.trim().isEmpty
                  ? 'Vui lòng nhập tên thể loại.'
                  : null,
              onFieldSubmitted: (_) {
                if (!_saving) _save();
              },
            ),
            if (_error != null)
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Text(
                  _error!,
                  style: const TextStyle(color: AppColors.red400),
                ),
              ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _saving ? null : () => Navigator.pop(context),
          child: const Text('Hủy'),
        ),
        FilledButton(
          onPressed: _saving ? null : _save,
          child: Text(_saving ? 'Đang lưu...' : 'Lưu'),
        ),
      ],
    ),
  );
}
