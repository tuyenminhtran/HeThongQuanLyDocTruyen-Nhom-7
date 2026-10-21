import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/app_colors.dart';
import '../../core/utils/chapter_sequence.dart';
import '../../providers/story_provider.dart';

class ChapterNavigation extends ConsumerWidget {
  final String storyId;
  final String chapterId;
  const ChapterNavigation({
    super.key,
    required this.storyId,
    required this.chapterId,
  });

  void _go(BuildContext context, String id) {
    context.replace(
      Uri(
        path: '/chapters/$id',
        queryParameters: {'storyId': storyId},
      ).toString(),
    );
  }

  Future<void> _showContents(
    BuildContext context,
    ChapterSequence sequence,
  ) async {
    final selected = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (ctx) => SafeArea(
        child: SizedBox(
          height: MediaQuery.sizeOf(ctx).height * 0.65,
          child: Column(
            children: [
              const Padding(
                padding: EdgeInsets.all(12),
                child: Text(
                  'Mục lục',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
              ),
              Expanded(
                child: ListView.builder(
                  itemCount: sequence.chapters.length,
                  itemBuilder: (_, index) {
                    final chapter = sequence.chapters[index];
                    return ListTile(
                      selected: chapter.id == chapterId,
                      selectedColor: AppColors.gold,
                      leading: Icon(
                        chapter.requiresAccess
                            ? Icons.lock_outline
                            : Icons.menu_book_outlined,
                        size: 18,
                      ),
                      title: Text(
                        'Chương ${chapter.chapterNumber}: ${chapter.title}',
                      ),
                      trailing: chapter.id == chapterId
                          ? const Icon(Icons.check, color: AppColors.gold)
                          : null,
                      onTap: () => Navigator.pop(ctx, chapter.id),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
    if (selected != null && selected != chapterId && context.mounted) {
      _go(context, selected);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final story = ref.watch(storyDetailFamily(storyId));
    return Material(
      color: Theme.of(context).colorScheme.surface,
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: story.when(
            loading: () => const LinearProgressIndicator(),
            error: (_, _) => TextButton.icon(
              onPressed: () => ref.invalidate(storyDetailFamily(storyId)),
              icon: const Icon(Icons.refresh),
              label: const Text('Tải lại mục lục'),
            ),
            data: (value) {
              final sequence = ChapterSequence(value.chapters, chapterId);
              return Row(
                children: [
                  Expanded(
                    child: TextButton.icon(
                      onPressed: sequence.previous == null
                          ? null
                          : () => _go(context, sequence.previous!.id),
                      icon: const Icon(Icons.chevron_left),
                      label: const Text('Trước'),
                    ),
                  ),
                  Expanded(
                    child: TextButton.icon(
                      onPressed: () => _showContents(context, sequence),
                      icon: const Icon(Icons.list),
                      label: const Text('Mục lục'),
                    ),
                  ),
                  Expanded(
                    child: TextButton.icon(
                      onPressed: sequence.next == null
                          ? null
                          : () => _go(context, sequence.next!.id),
                      icon: const Icon(Icons.chevron_right),
                      label: const Text('Sau'),
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}
