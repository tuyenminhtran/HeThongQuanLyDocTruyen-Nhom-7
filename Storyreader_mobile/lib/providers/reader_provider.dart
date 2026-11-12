import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/storage/auth_storage.dart';

final readerThemeProvider = StateNotifierProvider<ReaderThemeNotifier, String>((ref) {
  return ReaderThemeNotifier();
});

class ReaderThemeNotifier extends StateNotifier<String> {
  ReaderThemeNotifier() : super('dark') {
    _load();
  }

  Future<void> _load() async {
    state = await ReaderPreferences.getTheme();
  }

  Future<void> setTheme(String theme) async {
    state = theme;
    await ReaderPreferences.saveTheme(theme);
  }
}

final readerFontSizeProvider = StateNotifierProvider<ReaderFontSizeNotifier, double>((ref) {
  return ReaderFontSizeNotifier();
});

class ReaderFontSizeNotifier extends StateNotifier<double> {
  ReaderFontSizeNotifier() : super(20.0) {
    _load();
  }

  Future<void> _load() async {
    state = await ReaderPreferences.getFontSize();
  }

  Future<void> setFontSize(double size) async {
    final clamped = size.clamp(14.0, 32.0);
    state = clamped;
    await ReaderPreferences.saveFontSize(clamped);
  }

  Future<void> increase() async => setFontSize(state + 2);
  Future<void> decrease() async => setFontSize(state - 2);
}
