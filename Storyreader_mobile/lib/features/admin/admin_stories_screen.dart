import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../core/constants/app_colors.dart';
import '../../core/network/api_error.dart';
import '../../data/api/story_api.dart';
import '../../data/models/story_model.dart';
import '../../providers/reader_provider.dart';
import '../../providers/story_provider.dart';
import '../../providers/admin_provider.dart';
import '../../widgets/request_error.dart';

class AdminStoriesScreen extends ConsumerStatefulWidget {
  const AdminStoriesScreen({super.key});

  @override
  ConsumerState<AdminStoriesScreen> createState() => _AdminStoriesScreenState();
}

class _AdminStoriesScreenState extends ConsumerState<AdminStoriesScreen> {
  final _searchController = TextEditingController();
  String _searchKeyword = '';

  static const accessLabels = ["Miễn phí", "Trả phí", "Mixed"];
  static const statusLabels = ["Đang phát hành", "Hoàn thành", "Tạm ngưng"];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _openCreateStoryModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.inkCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => _CreateStorySheet(
        onCreated: (newId) {
          ref.invalidate(storiesFamily);
          ref.invalidate(genresProvider);
          ref.invalidate(dashboardProvider);
          _openStoryDetailSheet(newId);
        },
      ),
    );
  }

  void _openStoryDetailSheet(String storyId) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.inkCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => _AdminStoryDetailSheet(storyId: storyId),
    );
  }

  @override
  Widget build(BuildContext context) {
    final storiesAsync = ref.watch(
      storiesFamily(_searchKeyword.isEmpty ? null : _searchKeyword),
    );

    return Scaffold(
      backgroundColor: AppColors.inkBg,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Page Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Quản lý truyện',
                        style: GoogleFonts.notoSerif(
                          color: AppColors.inkText,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Quản lý toàn bộ truyện và chương trong hệ thống',
                        style: GoogleFonts.inter(
                          color: AppColors.inkMuted,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: _openCreateStoryModal,
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('Tạo truyện'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.gold,
                    foregroundColor: AppColors.inkBg,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 10,
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Stats Bar
            storiesAsync.when(
              data: (stories) {
                final totalStories = stories.length;
                final freeStories = stories
                    .where((s) => s.accessPolicy == 0)
                    .length;
                final paidStories = stories
                    .where((s) => s.accessPolicy == 1)
                    .length;
                final totalViews = stories.fold<int>(
                  0,
                  (sum, s) => sum + s.viewCount,
                );

                return Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: _buildStatItem(
                            'Tổng truyện',
                            '$totalStories',
                            AppColors.inkText,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _buildStatItem(
                            'Miễn phí',
                            '$freeStories',
                            AppColors.green400,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: _buildStatItem(
                            'Trả phí',
                            '$paidStories',
                            AppColors.gold,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _buildStatItem(
                            'Tổng lượt xem',
                            '$totalViews',
                            AppColors.inkText,
                          ),
                        ),
                      ],
                    ),
                  ],
                );
              },
              loading: () => const SizedBox.shrink(),
              error: (_, _) => const SizedBox.shrink(),
            ),

            const SizedBox(height: 16),

            // Search Bar
            Container(
              decoration: BoxDecoration(
                color: AppColors.inkCard,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.inkBorder),
              ),
              child: TextField(
                controller: _searchController,
                style: GoogleFonts.inter(
                  color: AppColors.inkText,
                  fontSize: 13,
                ),
                decoration: InputDecoration(
                  hintText: 'Tìm truyện theo tên hoặc tác giả...',
                  hintStyle: GoogleFonts.inter(
                    color: AppColors.inkMuted.withValues(alpha: 0.5),
                    fontSize: 13,
                  ),
                  prefixIcon: const Icon(
                    Icons.search,
                    size: 18,
                    color: AppColors.inkMuted,
                  ),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(
                            Icons.close,
                            size: 16,
                            color: AppColors.inkMuted,
                          ),
                          onPressed: () {
                            _searchController.clear();
                            setState(() => _searchKeyword = '');
                          },
                        )
                      : null,
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 12,
                  ),
                ),
                onSubmitted: (val) {
                  setState(() => _searchKeyword = val.trim());
                },
              ),
            ),

            const SizedBox(height: 16),

            // Stories Table / List
            storiesAsync.when(
              data: (stories) {
                if (stories.isEmpty) {
                  return Container(
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      color: AppColors.inkCard,
                      border: Border.all(color: AppColors.inkBorder),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      children: [
                        const Icon(
                          Icons.auto_stories,
                          size: 36,
                          color: AppColors.inkMuted,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Không tìm thấy truyện nào',
                          style: GoogleFonts.notoSerif(
                            color: AppColors.inkMuted,
                            fontSize: 15,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Hãy tạo truyện đầu tiên hoặc thử tìm kiếm khác',
                          style: GoogleFonts.inter(
                            color: AppColors.inkMuted.withValues(alpha: 0.6),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return Container(
                  decoration: BoxDecoration(
                    color: AppColors.inkCard,
                    border: Border.all(color: AppColors.inkBorder),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: stories.length,
                    separatorBuilder: (context, _) => Divider(
                      color: AppColors.inkBorder.withValues(alpha: 0.6),
                      height: 1,
                    ),
                    itemBuilder: (context, idx) {
                      final story = stories[idx];
                      final statusTxt = story.status < statusLabels.length
                          ? statusLabels[story.status]
                          : 'N/A';
                      final accessTxt = story.accessPolicy < accessLabels.length
                          ? accessLabels[story.accessPolicy]
                          : 'N/A';

                      return InkWell(
                        onTap: () => _openStoryDetailSheet(story.id),
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Row(
                            children: [
                              Container(
                                width: 44,
                                height: 60,
                                decoration: BoxDecoration(
                                  color: AppColors.inkBg,
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(
                                    color: AppColors.inkBorder,
                                  ),
                                ),
                                clipBehavior: Clip.antiAlias,
                                child: CachedNetworkImage(
                                  imageUrl: story.coverImageUrl.isNotEmpty
                                      ? story.coverImageUrl
                                      : 'https://placehold.co/60x84?text=N',
                                  fit: BoxFit.cover,
                                  errorWidget: (_, _, _) => const Icon(
                                    Icons.broken_image,
                                    size: 16,
                                    color: AppColors.inkMuted,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      story.title,
                                      style: GoogleFonts.inter(
                                        color: AppColors.inkText,
                                        fontWeight: FontWeight.w600,
                                        fontSize: 14,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      story.author,
                                      style: GoogleFonts.inter(
                                        color: AppColors.inkMuted,
                                        fontSize: 12,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Row(
                                      children: [
                                        _buildTag(statusTxt, AppColors.sky400),
                                        const SizedBox(width: 6),
                                        _buildTag(accessTxt, AppColors.gold),
                                        const Spacer(),
                                        Text(
                                          '${story.viewCount} views',
                                          style: GoogleFonts.inter(
                                            color: AppColors.inkMuted,
                                            fontSize: 11,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Icon(
                                Icons.chevron_right,
                                color: AppColors.inkMuted,
                                size: 20,
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                );
              },
              loading: () => const Center(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: CircularProgressIndicator(color: AppColors.gold),
                ),
              ),
              error: (err, _) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Text(
                    'Lỗi tải danh sách truyện',
                    style: GoogleFonts.inter(color: AppColors.red400),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color valueColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.inkCard,
        border: Border.all(color: AppColors.inkBorder),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 11),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: GoogleFonts.inter(
              color: valueColor,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTag(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        border: Border.all(color: color.withValues(alpha: 0.2)),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: GoogleFonts.inter(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}

/* ────────────────────────── CREATE / EDIT STORY SHEET ────────────────────────── */
class _CreateStorySheet extends ConsumerStatefulWidget {
  final Function(String id) onCreated;
  final StoryDetail? existingStory;

  const _CreateStorySheet({
    required this.onCreated,
    this.existingStory,
  });

  @override
  ConsumerState<_CreateStorySheet> createState() => _CreateStorySheetState();
}

class _CreateStorySheetState extends ConsumerState<_CreateStorySheet> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _authorController = TextEditingController();
  final _coverController = TextEditingController();
  final _descController = TextEditingController();
  final _priceController = TextEditingController();
  final _freeCountController = TextEditingController(text: '0');
  final Set<String> _selectedGenreIds = {};

  int _accessPolicy = 0; // 0: Miễn phí, 1: Trả phí, 2: Mixed
  int _releaseStatus = 0; // 0: Đang phát hành, 1: Hoàn thành
  StoryType _storyType = StoryType.novel;
  bool _genresInitialized = false;
  bool _loading = false;
  String? _error;

  bool get _isEditing => widget.existingStory != null;

  @override
  void initState() {
    super.initState();
    final existing = widget.existingStory;
    if (existing != null) {
      _titleController.text = existing.title;
      _authorController.text = existing.author;
      _coverController.text = existing.coverImageUrl;
      _descController.text = existing.description;
      _accessPolicy = existing.accessPolicy;
      _releaseStatus = existing.status;
      _storyType = existing.type;
      if (existing.price != null && existing.price! > 0) {
        _priceController.text = existing.price!.toInt().toString();
      }
      _freeCountController.text = '${existing.freeChapterCount}';
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _authorController.dispose();
    _coverController.dispose();
    _descController.dispose();
    _priceController.dispose();
    _freeCountController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _error = null);
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);
    try {
      final parsedPrice = _accessPolicy == 0
          ? null
          : double.tryParse(_priceController.text.trim());
      final parsedFree = _accessPolicy == 0
          ? 0
          : int.tryParse(_freeCountController.text.trim()) ?? 0;

      if (_isEditing) {
        final input = UpdateStoryInput(
          title: _titleController.text.trim(),
          author: _authorController.text.trim(),
          coverImageUrl: _coverController.text.trim(),
          description: _descController.text.trim(),
          status: _releaseStatus,
          genreIds: _selectedGenreIds.toList(),
          accessPolicy: _accessPolicy,
          price: parsedPrice,
          freeChapterCount: parsedFree,
          type: _storyType,
        );
        await StoryApi.updateStory(widget.existingStory!.id, input);
        if (mounted) {
          Navigator.pop(context);
          widget.onCreated(widget.existingStory!.id);
        }
      } else {
        final input = CreateStoryInput(
          title: _titleController.text.trim(),
          author: _authorController.text.trim(),
          coverImageUrl: _coverController.text.trim(),
          description: _descController.text.trim(),
          genreIds: _selectedGenreIds.toList(),
          accessPolicy: _accessPolicy,
          price: parsedPrice,
          freeChapterCount: parsedFree,
          type: _storyType,
        );

        final newId = await StoryApi.createStory(input);
        if (mounted) {
          Navigator.pop(context);
          widget.onCreated(newId);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(
          () => _error = apiErrorMessage(
            e,
            _isEditing
                ? 'Không cập nhật được truyện. Kiểm tra lại dữ liệu.'
                : 'Không tạo được truyện. Kiểm tra lại dữ liệu.',
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    _isEditing ? 'Chỉnh sửa truyện' : 'Tạo truyện mới',
                    style: GoogleFonts.notoSerif(
                      color: AppColors.inkText,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppColors.inkMuted),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              Text(
                'Tên truyện *',
                style: GoogleFonts.inter(
                  color: AppColors.inkMuted,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 4),
              TextFormField(
                controller: _titleController,
                style: GoogleFonts.inter(
                  color: AppColors.inkText,
                  fontSize: 14,
                ),
                decoration: const InputDecoration(hintText: 'Nhập tên truyện'),
                validator: (v) => v == null || v.trim().isEmpty
                    ? 'Vui lòng nhập tên truyện'
                    : null,
              ),

              const SizedBox(height: 12),
              Text(
                'Tác giả *',
                style: GoogleFonts.inter(
                  color: AppColors.inkMuted,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 4),
              TextFormField(
                controller: _authorController,
                style: GoogleFonts.inter(
                  color: AppColors.inkText,
                  fontSize: 14,
                ),
                decoration: const InputDecoration(hintText: 'Nhập tên tác giả'),
                validator: (v) => v == null || v.trim().isEmpty
                    ? 'Vui lòng nhập tên tác giả'
                    : null,
              ),

              const SizedBox(height: 12),
              Text(
                'URL ảnh bìa',
                style: GoogleFonts.inter(
                  color: AppColors.inkMuted,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 4),
              TextFormField(
                controller: _coverController,
                style: GoogleFonts.inter(
                  color: AppColors.inkText,
                  fontSize: 14,
                ),
                decoration: const InputDecoration(
                  hintText: 'https://example.com/cover.jpg',
                ),
              ),

              const SizedBox(height: 12),
              Text(
                'Mô tả',
                style: GoogleFonts.inter(
                  color: AppColors.inkMuted,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 4),
              TextFormField(
                controller: _descController,
                maxLines: 3,
                style: GoogleFonts.inter(
                  color: AppColors.inkText,
                  fontSize: 14,
                ),
                decoration: const InputDecoration(
                  hintText: 'Nhập mô tả nội dung truyện...',
                ),
              ),

              const SizedBox(height: 12),
              Text(
                'Thể loại (có thể chọn nhiều)',
                style: GoogleFonts.inter(
                  color: AppColors.inkMuted,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 8),
              ref
                  .watch(genresProvider)
                  .when(
                    loading: () => const LinearProgressIndicator(),
                    error: (error, _) => RequestError(
                      error: error,
                      onRetry: () => ref.invalidate(genresProvider),
                    ),
                    data: (genres) {
                      if (!_genresInitialized && widget.existingStory != null) {
                        _genresInitialized = true;
                        for (final g in genres) {
                          if (widget.existingStory!.genres.contains(g.name)) {
                            _selectedGenreIds.add(g.id);
                          }
                        }
                      }
                      return genres.isEmpty
                          ? const Text(
                              'Chưa có thể loại. Bạn có thể thêm trong Quản lý thể loại.',
                              style: TextStyle(color: AppColors.inkMuted),
                            )
                          : Wrap(
                              spacing: 8,
                              runSpacing: 4,
                              children: genres
                                  .map(
                                    (genre) => FilterChip(
                                      label: Text(genre.name),
                                      selected: _selectedGenreIds.contains(
                                        genre.id,
                                      ),
                                      onSelected: _loading
                                          ? null
                                          : (selected) => setState(() {
                                              if (selected) {
                                                _selectedGenreIds.add(genre.id);
                                              } else {
                                                _selectedGenreIds.remove(
                                                  genre.id,
                                                );
                                              }
                                            }),
                                    ),
                                  )
                                  .toList(),
                            );
                    },
                  ),
              const SizedBox(height: 12),
              Text(
                'Loại truyện',
                style: GoogleFonts.inter(
                  color: AppColors.inkMuted,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 4),
              DropdownButtonFormField<StoryType>(
                initialValue: _storyType,
                dropdownColor: AppColors.inkCard,
                style: GoogleFonts.inter(
                  color: AppColors.inkText,
                  fontSize: 14,
                ),
                decoration: const InputDecoration(),
                items: const [
                  DropdownMenuItem(
                    value: StoryType.novel,
                    child: Text('Truyện chữ (Novel)'),
                  ),
                  DropdownMenuItem(
                    value: StoryType.comic,
                    child: Text('Truyện tranh (Comic)'),
                  ),
                ],
                onChanged: (val) =>
                    setState(() => _storyType = val ?? StoryType.novel),
              ),
              if (_isEditing) ...[
                const SizedBox(height: 12),
                Text(
                  'Trạng thái phát hành',
                  style: GoogleFonts.inter(
                    color: AppColors.inkMuted,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 4),
                DropdownButtonFormField<int>(
                  initialValue: _releaseStatus,
                  dropdownColor: AppColors.inkCard,
                  style: GoogleFonts.inter(
                    color: AppColors.inkText,
                    fontSize: 14,
                  ),
                  decoration: const InputDecoration(),
                  items: const [
                    DropdownMenuItem(value: 0, child: Text('Đang phát hành')),
                    DropdownMenuItem(value: 1, child: Text('Đã hoàn thành')),
                  ],
                  onChanged: (val) => setState(() => _releaseStatus = val ?? 0),
                ),
              ],
              const SizedBox(height: 12),
              Text(
                'Chính sách truy cập',
                style: GoogleFonts.inter(
                  color: AppColors.inkMuted,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 4),
              DropdownButtonFormField<int>(
                initialValue: _accessPolicy,
                dropdownColor: AppColors.inkCard,
                style: GoogleFonts.inter(
                  color: AppColors.inkText,
                  fontSize: 14,
                ),
                decoration: const InputDecoration(),
                items: const [
                  DropdownMenuItem(value: 0, child: Text('Miễn phí')),
                  DropdownMenuItem(value: 1, child: Text('Trả phí')),
                  DropdownMenuItem(
                    value: 2,
                    child: Text('Mixed (một phần miễn phí)'),
                  ),
                ],
                onChanged: (val) {
                  setState(() => _accessPolicy = val ?? 0);
                },
              ),

              if (_accessPolicy != 0) ...[
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Giá (VNĐ) *',
                            style: GoogleFonts.inter(
                              color: AppColors.inkMuted,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 4),
                          TextFormField(
                            controller: _priceController,
                            keyboardType: TextInputType.number,
                            style: GoogleFonts.inter(
                              color: AppColors.inkText,
                              fontSize: 14,
                            ),
                            decoration: const InputDecoration(
                              hintText: 'VD: 50000',
                            ),
                            validator: (v) {
                              if (_accessPolicy != 0) {
                                if (v == null || v.trim().isEmpty) {
                                  return 'Vui lòng nhập giá';
                                }
                              }
                              return null;
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Số chương free',
                            style: GoogleFonts.inter(
                              color: AppColors.inkMuted,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 4),
                          TextFormField(
                            controller: _freeCountController,
                            keyboardType: TextInputType.number,
                            style: GoogleFonts.inter(
                              color: AppColors.inkText,
                              fontSize: 14,
                            ),
                            decoration: const InputDecoration(
                              hintText: 'VD: 3',
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],

              if (_error != null) ...[
                const SizedBox(height: 12),
                Text(
                  _error!,
                  style: GoogleFonts.inter(
                    color: AppColors.red400,
                    fontSize: 13,
                  ),
                ),
              ],

              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text(
                      'Hủy',
                      style: GoogleFonts.inter(color: AppColors.inkMuted),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: _loading ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.gold,
                      foregroundColor: AppColors.inkBg,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: _loading
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AppColors.inkBg,
                            ),
                          )
                        : Text(
                            _isEditing ? 'Lưu thay đổi' : 'Tạo truyện',
                            style: GoogleFonts.inter(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/* ────────────────────────── ADMIN STORY DETAIL SHEET ────────────────────────── */
class _AdminStoryDetailSheet extends ConsumerStatefulWidget {
  final String storyId;

  const _AdminStoryDetailSheet({required this.storyId});

  @override
  ConsumerState<_AdminStoryDetailSheet> createState() =>
      _AdminStoryDetailSheetState();
}

class _AdminStoryDetailSheetState
    extends ConsumerState<_AdminStoryDetailSheet> {
  void _invalidateStoryData() {
    ref.invalidate(storyDetailFamily(widget.storyId));
    ref.invalidate(storiesFamily);
    ref.invalidate(dashboardProvider);
  }

  void _openAddChapterModal(StoryDetail story) {
    showDialog(
      context: context,
      builder: (ctx) => _AddChapterDialog(
        story: story,
        onAdded: _invalidateStoryData,
      ),
    );
  }

  void _openEditStoryModal(StoryDetail story) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.inkCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => _CreateStorySheet(
        existingStory: story,
        onCreated: (_) => _invalidateStoryData(),
      ),
    );
  }

  Future<void> _confirmDeleteStory(StoryDetail story) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xóa truyện?'),
        content: Text(
          'Bạn có chắc muốn xóa "${story.title}" cùng toàn bộ chương? Thao tác không thể hoàn tác.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.red400,
              foregroundColor: Colors.white,
            ),
            child: const Text('Xóa'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    try {
      await StoryApi.deleteStory(story.id);
      ref.invalidate(storiesFamily);
      ref.invalidate(dashboardProvider);
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đã xóa truyện.')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(apiErrorMessage(e, 'Không thể xóa truyện.'))),
        );
      }
    }
  }

  Future<void> _openEditChapterModal(
    StoryDetail story,
    ChapterListItem chapter,
  ) async {
    String initialContent = '';
    try {
      final loaded = await ref
          .read(chapterRepositoryProvider)
          .getChapterContent(chapter.id, cacheOffline: false);
      initialContent = loaded.imageUrls.isNotEmpty && story.isComic
          ? loaded.imageUrls.join('\n')
          : loaded.content;
    } catch (_) {}

    if (!mounted) return;
    showDialog(
      context: context,
      builder: (ctx) => _AddChapterDialog(
        story: story,
        existingChapter: chapter,
        initialContent: initialContent,
        onAdded: _invalidateStoryData,
      ),
    );
  }

  Future<void> _confirmDeleteChapter(
    StoryDetail story,
    ChapterListItem chapter,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xóa chương?'),
        content: Text('Xóa "Chương ${chapter.chapterNumber}: ${chapter.title}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.red400,
              foregroundColor: Colors.white,
            ),
            child: const Text('Xóa'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    try {
      await StoryApi.deleteChapter(story.id, chapter.id);
      _invalidateStoryData();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đã xóa chương.')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(apiErrorMessage(e, 'Không thể xóa chương.'))),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final storyAsync = ref.watch(storyDetailFamily(widget.storyId));

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (context, scrollController) {
        return storyAsync.when(
          data: (story) {
            return SingleChildScrollView(
              controller: scrollController,
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          story.title,
                          style: GoogleFonts.notoSerif(
                            color: AppColors.inkText,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.edit_outlined, color: AppColors.gold),
                        tooltip: 'Sửa truyện',
                        onPressed: () => _openEditStoryModal(story),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete_outline, color: AppColors.red400),
                        tooltip: 'Xóa truyện',
                        onPressed: () => _confirmDeleteStory(story),
                      ),
                      IconButton(
                        icon: const Icon(
                          Icons.close,
                          color: AppColors.inkMuted,
                        ),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const Divider(color: AppColors.inkBorder),
                  const SizedBox(height: 12),

                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 80,
                        height: 120,
                        decoration: BoxDecoration(
                          color: AppColors.inkBg,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.inkBorder),
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: CachedNetworkImage(
                          imageUrl: story.fullCoverUrl.isNotEmpty
                              ? story.fullCoverUrl
                              : 'https://placehold.co/300x450?text=No+Cover',
                          fit: BoxFit.cover,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Tác giả: ${story.author}',
                              style: GoogleFonts.inter(
                                color: AppColors.inkText,
                                fontSize: 13,
                              ),
                            ),
                            const SizedBox(height: 6),
                            if (story.price != null && story.price! > 0)
                              Text(
                                'Giá: ${story.price!.toInt()}đ',
                                style: GoogleFonts.inter(
                                  color: AppColors.gold,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 13,
                                ),
                              ),
                            const SizedBox(height: 6),
                            Wrap(
                              spacing: 6,
                              children: story.genres
                                  .map(
                                    (g) => Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 6,
                                        vertical: 2,
                                      ),
                                      decoration: BoxDecoration(
                                        color: AppColors.inkBg,
                                        border: Border.all(
                                          color: AppColors.inkBorder,
                                        ),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        g,
                                        style: GoogleFonts.inter(
                                          color: AppColors.inkMuted,
                                          fontSize: 11,
                                        ),
                                      ),
                                    ),
                                  )
                                  .toList(),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  if (story.description.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    Text(
                      'Mô tả',
                      style: GoogleFonts.inter(
                        color: AppColors.inkText,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      story.description,
                      style: GoogleFonts.inter(
                        color: AppColors.inkMuted,
                        fontSize: 13,
                        height: 1.4,
                      ),
                    ),
                  ],

                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Danh sách chương (${story.chapters.length})',
                        style: GoogleFonts.inter(
                          color: AppColors.inkText,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      TextButton.icon(
                        onPressed: () => _openAddChapterModal(story),
                        icon: const Icon(
                          Icons.add,
                          size: 16,
                          color: AppColors.gold,
                        ),
                        label: Text(
                          'Thêm chương',
                          style: GoogleFonts.inter(
                            color: AppColors.gold,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  if (story.chapters.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      child: Center(
                        child: Text(
                          'Chưa có chương nào',
                          style: GoogleFonts.inter(
                            color: AppColors.inkMuted,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    )
                  else
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.inkBg,
                        border: Border.all(color: AppColors.inkBorder),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: story.chapters.length,
                        separatorBuilder: (context, _) => const Divider(
                          color: AppColors.inkBorder,
                          height: 1,
                        ),
                        itemBuilder: (context, idx) {
                          final c = story.chapters[idx];
                          return Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 10,
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 6,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.inkCard,
                                    borderRadius: BorderRadius.circular(4),
                                    border: Border.all(
                                      color: AppColors.inkBorder,
                                    ),
                                  ),
                                  child: Text(
                                    '#${c.chapterNumber}',
                                    style: GoogleFonts.robotoMono(
                                      color: AppColors.inkMuted,
                                      fontSize: 11,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        c.title,
                                        style: GoogleFonts.inter(
                                          color: AppColors.inkText,
                                          fontSize: 13,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      if (c.partName != null &&
                                          c.partName!.trim().isNotEmpty)
                                        Text(
                                          c.partName!,
                                          style: GoogleFonts.inter(
                                            color: AppColors.inkMuted,
                                            fontSize: 11,
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                                if (c.requiresAccess) ...[
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 6,
                                      vertical: 2,
                                    ),
                                    decoration: BoxDecoration(
                                      color: AppColors.gold.withValues(
                                        alpha: 0.1,
                                      ),
                                      border: Border.all(
                                        color: AppColors.gold.withValues(
                                          alpha: 0.2,
                                        ),
                                      ),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      'Trả phí',
                                      style: GoogleFonts.inter(
                                        color: AppColors.gold,
                                        fontSize: 10,
                                      ),
                                    ),
                                  ),
                                ],
                                IconButton(
                                  onPressed: () =>
                                      _openEditChapterModal(story, c),
                                  icon: const Icon(
                                    Icons.edit_outlined,
                                    size: 16,
                                    color: AppColors.inkMuted,
                                  ),
                                  tooltip: 'Sửa chương',
                                  visualDensity: VisualDensity.compact,
                                ),
                                IconButton(
                                  onPressed: () =>
                                      _confirmDeleteChapter(story, c),
                                  icon: const Icon(
                                    Icons.delete_outline,
                                    size: 16,
                                    color: AppColors.red400,
                                  ),
                                  tooltip: 'Xóa chương',
                                  visualDensity: VisualDensity.compact,
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                ],
              ),
            );
          },
          loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.gold),
          ),
          error: (_, _) => Center(
            child: Text(
              'Không tìm thấy thông tin truyện',
              style: GoogleFonts.inter(color: AppColors.inkMuted),
            ),
          ),
        );
      },
    );
  }
}

/* ────────────────────────── ADD / EDIT CHAPTER DIALOG ────────────────────────── */
class _AddChapterDialog extends StatefulWidget {
  final StoryDetail story;
  final VoidCallback onAdded;
  final ChapterListItem? existingChapter;
  final String? initialContent;

  const _AddChapterDialog({
    required this.story,
    required this.onAdded,
    this.existingChapter,
    this.initialContent,
  });

  @override
  State<_AddChapterDialog> createState() => _AddChapterDialogState();
}

class _AddChapterDialogState extends State<_AddChapterDialog> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _numController;
  final _titleController = TextEditingController();
  final _partNameController = TextEditingController();
  final _contentController = TextEditingController();
  final DateFormat _dateFormat = DateFormat('dd/MM/yyyy HH:mm');

  DateTime? _publishAt;
  bool _renderAsImages = false;
  bool _loading = false;
  String? _error;
  bool _success = false;

  bool get _isEditing => widget.existingChapter != null;

  @override
  void initState() {
    super.initState();
    final existing = widget.existingChapter;
    if (existing != null) {
      _numController = TextEditingController(text: '${existing.chapterNumber}');
      _titleController.text = existing.title;
      _partNameController.text = existing.partName ?? '';
      _contentController.text = widget.initialContent ?? '';
    } else {
      _numController = TextEditingController(
        text: '${widget.story.chapters.length + 1}',
      );
    }
  }

  @override
  void dispose() {
    _numController.dispose();
    _titleController.dispose();
    _partNameController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _pickPublishAt() async {
    final base = _publishAt ?? DateTime.now().add(const Duration(hours: 1));
    final date = await showDatePicker(
      context: context,
      initialDate: base.isBefore(DateTime.now()) ? DateTime.now() : base,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365 * 2)),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(base),
    );
    if (time == null || !mounted) return;
    setState(() {
      _publishAt = DateTime(date.year, date.month, date.day, time.hour, time.minute);
    });
  }

  Future<void> _submit() async {
    setState(() {
      _error = null;
      _success = false;
    });
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);
    try {
      final input = CreateChapterInput(
        chapterNumber: int.parse(_numController.text.trim()),
        title: _titleController.text.trim(),
        content: _contentController.text.trim(),
        partName: _partNameController.text.trim().isEmpty
            ? null
            : _partNameController.text.trim(),
        publishAt: _publishAt?.toUtc().toIso8601String(),
        renderAsImages: widget.story.isComic ? false : _renderAsImages,
      );

      if (_isEditing) {
        await StoryApi.updateChapter(
          widget.story.id,
          widget.existingChapter!.id,
          input,
        );
        if (mounted) {
          widget.onAdded();
          Navigator.pop(context);
        }
      } else {
        await StoryApi.addChapter(widget.story.id, input);
        if (mounted) {
          setState(() {
            _success = true;
            _numController.text = '${int.parse(_numController.text.trim()) + 1}';
            _titleController.clear();
            _contentController.clear();
            _publishAt = null;
            _renderAsImages = false;
          });
          widget.onAdded();
        }
      }
    } catch (e) {
      if (mounted) {
        setState(
          () => _error = apiErrorMessage(
            e,
            _isEditing
                ? 'Không thể cập nhật chương.'
                : 'Không thể thêm chương. Kiểm tra lại số chương.',
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: AppColors.inkCard,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppColors.inkBorder),
      ),
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            _isEditing ? 'Chỉnh sửa chương' : 'Thêm chương mới',
            style: GoogleFonts.notoSerif(
              color: AppColors.inkText,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            widget.story.title,
            style: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 12),
          ),
        ],
      ),
      content: SizedBox(
        width: double.maxFinite,
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    SizedBox(
                      width: 80,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Số *',
                            style: GoogleFonts.inter(
                              color: AppColors.inkMuted,
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(height: 4),
                          TextFormField(
                            controller: _numController,
                            keyboardType: TextInputType.number,
                            style: GoogleFonts.inter(
                              color: AppColors.inkText,
                              fontSize: 13,
                            ),
                            validator: (v) =>
                                v == null || v.isEmpty ? 'Bắt buộc' : null,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Tiêu đề *',
                            style: GoogleFonts.inter(
                              color: AppColors.inkMuted,
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(height: 4),
                          TextFormField(
                            controller: _titleController,
                            style: GoogleFonts.inter(
                              color: AppColors.inkText,
                              fontSize: 13,
                            ),
                            decoration: const InputDecoration(
                              hintText: 'Nhập tiêu đề',
                            ),
                            validator: (v) => v == null || v.trim().isEmpty
                                ? 'Nhập tiêu đề'
                                : null,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  'Tên phần / Tập (tùy chọn)',
                  style: GoogleFonts.inter(
                    color: AppColors.inkMuted,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 4),
                TextFormField(
                  controller: _partNameController,
                  style: GoogleFonts.inter(
                    color: AppColors.inkText,
                    fontSize: 13,
                  ),
                  decoration: const InputDecoration(
                    hintText: 'VD: Quyển 1 - Khởi đầu',
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Nội dung *',
                  style: GoogleFonts.inter(
                    color: AppColors.inkMuted,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 4),
                TextFormField(
                  controller: _contentController,
                  maxLines: 8,
                  style: GoogleFonts.notoSerif(
                    color: AppColors.inkText,
                    fontSize: 13,
                  ),
                  decoration: InputDecoration(
                    hintText: widget.story.isComic
                        ? 'Mỗi dòng là một URL ảnh trang truyện...'
                        : 'Nhập nội dung chương...',
                  ),
                  validator: (v) =>
                      v == null || v.trim().isEmpty ? 'Nhập nội dung' : null,
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _loading ? null : _pickPublishAt,
                        icon: const Icon(Icons.schedule, size: 16),
                        label: Text(
                          _publishAt == null
                              ? 'Hẹn giờ đăng (Đăng ngay)'
                              : 'Hẹn: ${_dateFormat.format(_publishAt!)}',
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                    if (_publishAt != null)
                      IconButton(
                        onPressed: () => setState(() => _publishAt = null),
                        icon: const Icon(Icons.close, size: 18),
                        tooltip: 'Bỏ hẹn giờ (Đăng ngay)',
                      ),
                  ],
                ),
                if (!widget.story.isComic)
                  CheckboxListTile(
                    contentPadding: EdgeInsets.zero,
                    value: _renderAsImages,
                    onChanged: _loading
                        ? null
                        : (v) => setState(() => _renderAsImages = v ?? false),
                    title: Text(
                      'Xuất bản dưới dạng ảnh (PNG chống copy)',
                      style: GoogleFonts.inter(
                        color: AppColors.inkText,
                        fontSize: 12.5,
                      ),
                    ),
                  ),

                if (_success) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.green400.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      'Thêm chương thành công! Bạn có thể tiếp tục thêm chương khác.',
                      style: GoogleFonts.inter(
                        color: AppColors.green400,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],

                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.red400.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      _error!,
                      style: GoogleFonts.inter(
                        color: AppColors.red400,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(
            'Đóng',
            style: GoogleFonts.inter(color: AppColors.inkMuted),
          ),
        ),
        ElevatedButton(
          onPressed: _loading ? null : _submit,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.gold,
            foregroundColor: AppColors.inkBg,
          ),
          child: _loading
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: AppColors.inkBg,
                  ),
                )
              : Text(
                  _isEditing ? 'Lưu chương' : 'Thêm chương',
                  style: GoogleFonts.inter(fontWeight: FontWeight.w600),
                ),
        ),
      ],
    );
  }
}
