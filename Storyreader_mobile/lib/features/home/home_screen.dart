import 'dart:async';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../data/models/story_model.dart';
import '../../providers/story_provider.dart';
import '../../widgets/app_header.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/loading_skeleton.dart';
import '../../widgets/request_error.dart';
import '../../widgets/story_card.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();
  Timer? _debounce;

  String _keyword = '';
  String? _selectedGenreId;
  StoryType? _selectedType; // null = all, 0 = novel, 1 = comic
  ReleaseStatus? _selectedStatus; // null = all, 0 = ongoing, 1 = completed
  AccessPolicy? _selectedPolicy; // null = all, 0 = free, 1 = paid, 2 = mixed

  int _visibleCount = 12;
  static const int _pageSizeIncrement = 12;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 300) {
      if (mounted) {
        setState(() {
          _visibleCount += _pageSizeIncrement;
        });
      }
    }
  }

  void _onSearchChanged(String val) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      setState(() {
        _keyword = val.trim();
        _visibleCount = 12;
      });
    });
  }

  void _clearSearch() {
    _searchController.clear();
    _debounce?.cancel();
    setState(() {
      _keyword = '';
      _visibleCount = 12;
    });
  }

  @override
  Widget build(BuildContext context) {
    final query = StoryFilterQuery(
      keyword: _keyword.isEmpty ? null : _keyword,
      genreId: _selectedGenreId,
    );

    final storiesAsync = ref.watch(storiesFilterFamily(query));
    final genresAsync = ref.watch(genreListProvider);

    return Scaffold(
      appBar: const AppHeader(),
      body: RefreshIndicator(
        color: AppColors.gold,
        onRefresh: () async {
          ref.invalidate(storiesFilterFamily(query));
          ref.invalidate(genreListProvider);
        },
        child: CustomScrollView(
          controller: _scrollController,
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // Search Bar & Filter Strip
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildSearchBar(),
                    const SizedBox(height: 14),
                    _buildTypeToggle(),
                    const SizedBox(height: 12),
                    _buildGenreChips(genresAsync),
                  ],
                ),
              ),
            ),

            // Main Content Area
            storiesAsync.when(
              loading: () => const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: StoryGridSkeleton(count: 8),
                ),
              ),
              error: (err, _) => SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: RequestError(
                    error: err,
                    onRetry: () => ref.invalidate(storiesFilterFamily(query)),
                  ),
                ),
              ),
              data: (allStories) {
                // Lọc phía Client cho các tiêu chí loại truyện, trạng thái, chính sách
                final filtered = allStories.where((s) {
                  if (_selectedType != null && s.type != _selectedType) return false;
                  if (_selectedStatus != null && s.status != _selectedStatus!.value) return false;
                  if (_selectedPolicy != null && s.accessPolicy != _selectedPolicy!.value) return false;
                  return true;
                }).toList();

                if (filtered.isEmpty) {
                  return const SliverFillRemaining(
                    hasScrollBody: false,
                    child: Center(
                      child: Padding(
                        padding: EdgeInsets.all(24),
                        child: EmptyState(
                          title: AppStrings.emptyStateTitle,
                          subtitle: AppStrings.emptyStateSubtitle,
                        ),
                      ),
                    ),
                  );
                }

                final displayStories = filtered.take(_visibleCount).toList();
                final featuredStory = _keyword.isEmpty && _selectedGenreId == null
                    ? filtered.firstOrNull
                    : null;

                final screenWidth = MediaQuery.of(context).size.width;
                final crossAxisCount = screenWidth >= 900
                    ? 4
                    : screenWidth >= 600
                        ? 3
                        : 2;

                return SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate([
                      // Hero Featured Banner nếu ở trang chủ mặc định
                      if (featuredStory != null) ...[
                        _buildFeaturedHero(featuredStory),
                        const SizedBox(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              AppStrings.sectionLatest,
                              style: GoogleFonts.lora(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              '${filtered.length} bộ truyện',
                              style: GoogleFonts.inter(
                                color: AppColors.inkMuted,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                      ],

                      // Grid Stories
                      GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: crossAxisCount,
                          childAspectRatio: 0.58,
                          crossAxisSpacing: 14,
                          mainAxisSpacing: 18,
                        ),
                        itemCount: displayStories.length,
                        itemBuilder: (context, index) {
                          return StoryCard(story: displayStories[index]);
                        },
                      ),

                      // Infinite scroll loading indicator
                      if (_visibleCount < filtered.length)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 24),
                          child: Center(
                            child: SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                strokeWidth: 2.5,
                                color: AppColors.gold,
                              ),
                            ),
                          ),
                        )
                      else
                        const SizedBox(height: 32),
                    ]),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Theme.of(context).dividerColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: TextField(
        controller: _searchController,
        onChanged: _onSearchChanged,
        style: GoogleFonts.inter(fontSize: 14),
        decoration: InputDecoration(
          hintText: AppStrings.searchPlaceholder,
          hintStyle: GoogleFonts.inter(color: AppColors.inkMuted, fontSize: 14),
          prefixIcon: const Icon(Icons.search, color: AppColors.gold, size: 22),
          suffixIcon: _keyword.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear, size: 18),
                  onPressed: _clearSearch,
                )
              : null,
          border: InputBorder.none,
          enabledBorder: InputBorder.none,
          focusedBorder: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      ),
    );
  }

  Widget _buildTypeToggle() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _buildToggleChip(
            label: AppStrings.filterAll,
            isSelected: _selectedType == null,
            onTap: () => setState(() => _selectedType = null),
          ),
          const SizedBox(width: 8),
          _buildToggleChip(
            label: '📖 ${AppStrings.filterNovel}',
            isSelected: _selectedType == StoryType.novel,
            onTap: () => setState(() => _selectedType = StoryType.novel),
          ),
          const SizedBox(width: 8),
          _buildToggleChip(
            label: '🎨 ${AppStrings.filterComic}',
            isSelected: _selectedType == StoryType.comic,
            onTap: () => setState(() => _selectedType = StoryType.comic),
          ),
        ],
      ),
    );
  }

  Widget _buildToggleChip({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.gold
              : Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.gold : Theme.of(context).dividerColor,
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            color: isSelected ? AppColors.inkBg : Theme.of(context).textTheme.bodyMedium?.color,
            fontSize: 12.5,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildGenreChips(AsyncValue<List<dynamic>> genresAsync) {
    return genresAsync.when(
      loading: () => const SizedBox(
        height: 36,
        child: Center(
          child: SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.gold),
          ),
        ),
      ),
      error: (error, stack) => const SizedBox.shrink(),
      data: (genres) {
        if (genres.isEmpty) return const SizedBox.shrink();

        return SizedBox(
          height: 34,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: genres.length + 1,
            separatorBuilder: (context, index) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              if (index == 0) {
                final isSelected = _selectedGenreId == null;
                return ChoiceChip(
                  label: const Text('Tất cả thể loại'),
                  selected: isSelected,
                  onSelected: (_) => setState(() => _selectedGenreId = null),
                  selectedColor: AppColors.gold.withValues(alpha: 0.2),
                  labelStyle: GoogleFonts.inter(
                    fontSize: 12,
                    color: isSelected ? AppColors.gold : AppColors.inkMuted,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  ),
                  side: BorderSide(
                    color: isSelected ? AppColors.gold : Theme.of(context).dividerColor,
                  ),
                );
              }

              final genre = genres[index - 1];
              final isSelected = _selectedGenreId == genre.id;

              return ChoiceChip(
                label: Text(genre.name),
                selected: isSelected,
                onSelected: (_) {
                  setState(() {
                    _selectedGenreId = isSelected ? null : genre.id;
                  });
                },
                selectedColor: AppColors.gold.withValues(alpha: 0.2),
                labelStyle: GoogleFonts.inter(
                  fontSize: 12,
                  color: isSelected ? AppColors.gold : AppColors.inkMuted,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                ),
                side: BorderSide(
                  color: isSelected ? AppColors.gold : Theme.of(context).dividerColor,
                ),
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildFeaturedHero(StoryListItem story) {
    final coverUrl = story.fullCoverUrl.isNotEmpty
        ? story.fullCoverUrl
        : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&q=80';

    return InkWell(
      onTap: () => context.push('/stories/${story.id}'),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        height: 190,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.25),
              blurRadius: 14,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Background image with blur
            CachedNetworkImage(
              imageUrl: coverUrl,
              fit: BoxFit.cover,
            ),
            // Gradient Overlay
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                  colors: [
                    Colors.black.withValues(alpha: 0.92),
                    Colors.black.withValues(alpha: 0.65),
                    Colors.black.withValues(alpha: 0.35),
                  ],
                ),
              ),
            ),
            // Content
            Padding(
              padding: const EdgeInsets.all(18),
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: SizedBox(
                      width: 95,
                      height: 145,
                      child: CachedNetworkImage(
                        imageUrl: coverUrl,
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.gold,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'NỔI BẬT HÔM NAY',
                            style: GoogleFonts.inter(
                              color: AppColors.inkBg,
                              fontSize: 9.5,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          story.title,
                          style: GoogleFonts.lora(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            height: 1.25,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Tác giả: ${story.author}',
                          style: GoogleFonts.inter(
                            color: Colors.white70,
                            fontSize: 12,
                          ),
                          maxLines: 1,
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.menu_book, color: AppColors.gold, size: 14),
                                  const SizedBox(width: 5),
                                  Text(
                                    'Đọc ngay',
                                    style: GoogleFonts.inter(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
