import 'dart:async';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/constants/api_constants.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/tts_chunker.dart';
import '../../data/models/chapter_model.dart';

/// Abstraction bọc AudioPlayer để widget có thể kiểm thử độc lập trên VM.
abstract class AudioTrackPlayer {
  Stream<void> get onComplete;
  Future<void> playUrl(String url);
  Future<void> pause();
  Future<void> resume();
  Future<void> stop();
  Future<void> setPlaybackRate(double rate);
  Future<void> dispose();
}

class AudioPlayersTrackPlayer implements AudioTrackPlayer {
  final AudioPlayer _player = AudioPlayer();

  @override
  Stream<void> get onComplete => _player.onPlayerComplete;

  @override
  Future<void> playUrl(String url) => _player.play(UrlSource(url));

  @override
  Future<void> pause() => _player.pause();

  @override
  Future<void> resume() => _player.resume();

  @override
  Future<void> stop() => _player.stop();

  @override
  Future<void> setPlaybackRate(double rate) => _player.setPlaybackRate(rate);

  @override
  Future<void> dispose() => _player.dispose();
}

class AudioReaderBar extends StatefulWidget {
  final ChapterContent chapter;
  final Color surfaceColor;
  final Color textColor;
  final Color borderColor;
  final VoidCallback onClose;
  final VoidCallback? onChapterCompleted;
  final AudioTrackPlayer Function()? playerFactory;

  const AudioReaderBar({
    super.key,
    required this.chapter,
    required this.surfaceColor,
    required this.textColor,
    required this.borderColor,
    required this.onClose,
    this.onChapterCompleted,
    this.playerFactory,
  });

  @override
  State<AudioReaderBar> createState() => _AudioReaderBarState();
}

class _AudioReaderBarState extends State<AudioReaderBar> {
  static const List<double> _rates = [0.8, 1.0, 1.25, 1.5, 2.0];
  static const String _ratePrefKey = 'tts_rate_pref';

  late AudioTrackPlayer _player;
  StreamSubscription<void>? _completeSub;
  late List<String> _chunks;

  int _currentIndex = 0;
  double _rate = 1.0;
  bool _isPlaying = false;
  bool _isLoading = false;
  bool _hasStartedCurrent = false;
  String? _errorText;
  int _playGeneration = 0;

  @override
  void initState() {
    super.initState();
    _player = (widget.playerFactory ?? AudioPlayersTrackPlayer.new)();
    _completeSub = _player.onComplete.listen((_) => _handleTrackComplete());
    _chunks = buildChapterTtsChunks(
      chapterNumber: widget.chapter.chapterNumber,
      title: widget.chapter.title,
      content: widget.chapter.content,
    );
    _restorePrefs();
  }

  @override
  void didUpdateWidget(covariant AudioReaderBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.chapter.id != widget.chapter.id) {
      _playGeneration++;
      _player.stop();
      _chunks = buildChapterTtsChunks(
        chapterNumber: widget.chapter.chapterNumber,
        title: widget.chapter.title,
        content: widget.chapter.content,
      );
      setState(() {
        _currentIndex = 0;
        _isPlaying = false;
        _isLoading = false;
        _hasStartedCurrent = false;
        _errorText = null;
      });
      _restorePrefs();
    }
  }

  @override
  void dispose() {
    _playGeneration++;
    _completeSub?.cancel();
    _player.dispose();
    super.dispose();
  }

  String get _chunkPrefKey => 'tts_chunk_${widget.chapter.id}';

  Future<void> _restorePrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedRate = prefs.getDouble(_ratePrefKey);
      final savedIndex = prefs.getInt(_chunkPrefKey) ?? 0;
      if (!mounted) return;
      setState(() {
        if (savedRate != null && _rates.contains(savedRate)) {
          _rate = savedRate;
        }
        if (_chunks.isNotEmpty) {
          _currentIndex = savedIndex.clamp(0, _chunks.length - 1);
        } else {
          _currentIndex = 0;
        }
      });
    } catch (_) {}
  }

  Future<void> _saveChunkIndex(int index) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt(_chunkPrefKey, index);
    } catch (_) {}
  }

  Future<void> _saveRate(double rate) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setDouble(_ratePrefKey, rate);
    } catch (_) {}
  }

  Future<void> _playChunk(int index) async {
    if (_chunks.isEmpty || index < 0 || index >= _chunks.length) return;
    final gen = ++_playGeneration;
    await _saveChunkIndex(index);

    if (!mounted) return;
    setState(() {
      _currentIndex = index;
      _isLoading = true;
      _isPlaying = false;
      _errorText = null;
    });

    try {
      final url = ApiConstants.ttsAudioUrl(_chunks[index]);
      await _player.playUrl(url);
      if (gen != _playGeneration || !mounted) return;
      await _player.setPlaybackRate(_rate);
      if (gen != _playGeneration || !mounted) return;
      setState(() {
        _isLoading = false;
        _isPlaying = true;
        _hasStartedCurrent = true;
      });
    } catch (_) {
      if (gen != _playGeneration || !mounted) return;
      setState(() {
        _isLoading = false;
        _isPlaying = false;
        _errorText = 'Không thể phát giọng đọc lúc này. Kiểm tra kết nối máy chủ.';
      });
    }
  }

  Future<void> _togglePlayPause() async {
    if (_chunks.isEmpty) return;
    if (_isPlaying) {
      _playGeneration++;
      await _player.pause();
      if (mounted) setState(() => _isPlaying = false);
      return;
    }

    if (_hasStartedCurrent) {
      try {
        await _player.resume();
        if (mounted) {
          setState(() {
            _isPlaying = true;
            _errorText = null;
          });
        }
        return;
      } catch (_) {}
    }

    await _playChunk(_currentIndex);
  }

  Future<void> _handleTrackComplete() async {
    if (!mounted || !_isPlaying) return;
    if (_currentIndex + 1 < _chunks.length) {
      await _playChunk(_currentIndex + 1);
      return;
    }
    setState(() {
      _isPlaying = false;
      _hasStartedCurrent = false;
      _currentIndex = 0;
    });
    await _saveChunkIndex(0);
    widget.onChapterCompleted?.call();
  }

  Future<void> _cycleSpeed() async {
    final idx = _rates.indexOf(_rate);
    final nextRate = _rates[(idx + 1) % _rates.length];
    setState(() => _rate = nextRate);
    await _saveRate(nextRate);
    if (_isPlaying) {
      try {
        await _player.setPlaybackRate(nextRate);
      } catch (_) {}
    }
  }

  Future<void> _stopAndClose() async {
    _playGeneration++;
    try {
      await _player.stop();
    } catch (_) {}
    widget.onClose();
  }

  @override
  Widget build(BuildContext context) {
    final total = _chunks.length;
    final progress = total > 0 ? (_currentIndex + 1) / total : 0.0;
    final preview = total > 0 ? _chunks[_currentIndex] : 'Không có văn bản để đọc';

    return Material(
      color: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
        decoration: BoxDecoration(
          color: widget.surfaceColor.withValues(alpha: 0.97),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: widget.borderColor),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.22),
              blurRadius: 14,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                const Icon(Icons.headphones_rounded, size: 17, color: AppColors.gold),
                const SizedBox(width: 6),
                Text(
                  'Nghe truyện (Tiếng Việt)',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: widget.textColor,
                  ),
                ),
                const Spacer(),
                if (total > 0)
                  Text(
                    'Đoạn ${_currentIndex + 1}/$total',
                    style: GoogleFonts.spaceMono(
                      fontSize: 11,
                      color: widget.textColor.withValues(alpha: 0.65),
                    ),
                  ),
                const SizedBox(width: 6),
                InkWell(
                  onTap: _stopAndClose,
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: const EdgeInsets.all(4),
                    child: Icon(
                      Icons.close,
                      size: 18,
                      color: widget.textColor.withValues(alpha: 0.7),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: progress.clamp(0.0, 1.0),
                minHeight: 3,
                backgroundColor: widget.borderColor,
                valueColor: const AlwaysStoppedAnimation<Color>(AppColors.gold),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              _errorText ?? preview,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.inter(
                fontSize: 11.5,
                color: _errorText != null
                    ? AppColors.red400
                    : widget.textColor.withValues(alpha: 0.78),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                OutlinedButton(
                  onPressed: _cycleSpeed,
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: widget.borderColor),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    minimumSize: const Size(54, 32),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text(
                    '${_rate}x',
                    style: GoogleFonts.spaceMono(
                      fontSize: 11.5,
                      fontWeight: FontWeight.bold,
                      color: AppColors.gold,
                    ),
                  ),
                ),
                Row(
                  children: [
                    IconButton(
                      onPressed: total > 0 && _currentIndex > 0
                          ? () => _playChunk(_currentIndex - 1)
                          : null,
                      icon: const Icon(Icons.skip_previous_rounded),
                      color: widget.textColor,
                      tooltip: 'Đoạn trước',
                      visualDensity: VisualDensity.compact,
                    ),
                    const SizedBox(width: 4),
                    ElevatedButton(
                      onPressed: total > 0 && !_isLoading ? _togglePlayPause : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.gold,
                        foregroundColor: Colors.white,
                        shape: const CircleBorder(),
                        padding: const EdgeInsets.all(10),
                        minimumSize: const Size(42, 42),
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : Icon(
                              _isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                              size: 22,
                            ),
                    ),
                    const SizedBox(width: 4),
                    IconButton(
                      onPressed: total > 0 && _currentIndex + 1 < total
                          ? () => _playChunk(_currentIndex + 1)
                          : null,
                      icon: const Icon(Icons.skip_next_rounded),
                      color: widget.textColor,
                      tooltip: 'Đoạn tiếp theo',
                      visualDensity: VisualDensity.compact,
                    ),
                  ],
                ),
                const SizedBox(width: 54),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
