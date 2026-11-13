/// Chia văn bản chương truyện thành các đoạn câu <= [maxLength] ký tự
/// để tương thích giới hạn 250 ký tự của endpoint `GET /api/tts`.
List<String> splitTextIntoTtsChunks(String text, {int maxLength = 180}) {
  final normalized = text.replaceAll('\r\n', '\n').trim();
  if (normalized.isEmpty) return const [];

  final chunks = <String>[];
  final paragraphs = normalized.split('\n');

  for (final rawParagraph in paragraphs) {
    final paragraph = rawParagraph.replaceAll(RegExp(r'\s+'), ' ').trim();
    if (paragraph.isEmpty) continue;

    final sentences = _splitParagraphToSentences(paragraph);
    var buffer = '';

    for (final sentence in sentences) {
      if (sentence.length > maxLength) {
        if (buffer.isNotEmpty) {
          chunks.add(buffer);
          buffer = '';
        }
        chunks.addAll(_splitLongSentence(sentence, maxLength));
        continue;
      }

      final candidate = buffer.isEmpty ? sentence : '$buffer $sentence';
      if (candidate.length <= maxLength) {
        buffer = candidate;
      } else {
        if (buffer.isNotEmpty) chunks.add(buffer);
        buffer = sentence;
      }
    }

    if (buffer.isNotEmpty) {
      chunks.add(buffer);
    }
  }

  return chunks;
}

/// Tạo danh sách đoạn TTS đầy đủ gồm tiêu đề chương (không lặp) + nội dung.
List<String> buildChapterTtsChunks({
  required int chapterNumber,
  required String title,
  required String content,
  int maxLength = 180,
}) {
  final cleanTitle = title.replaceAll(RegExp(r'\s+'), ' ').trim();
  final chapterPrefixPattern = RegExp(
    '^chương\\s*$chapterNumber(?:\\b|[:.\\-\\s])',
    caseSensitive: false,
  );

  final String headerText;
  if (cleanTitle.isEmpty) {
    headerText = 'Chương $chapterNumber.';
  } else if (chapterPrefixPattern.hasMatch(cleanTitle)) {
    headerText = cleanTitle;
  } else {
    headerText = 'Chương $chapterNumber: $cleanTitle.';
  }

  // Bỏ dòng mở đầu trong content nếu bị trùng tiêu đề chương
  final rawLines = content.replaceAll('\r\n', '\n').trimLeft().split('\n');
  if (rawLines.isNotEmpty) {
    final firstLine = rawLines.first.replaceAll(RegExp(r'\s+'), ' ').trim();
    if (firstLine.isNotEmpty &&
        (chapterPrefixPattern.hasMatch(firstLine) ||
            (cleanTitle.isNotEmpty &&
                firstLine.toLowerCase() == cleanTitle.toLowerCase()))) {
      rawLines.removeAt(0);
    }
  }

  final headerChunks = splitTextIntoTtsChunks(headerText, maxLength: maxLength);
  final bodyChunks =
      splitTextIntoTtsChunks(rawLines.join('\n'), maxLength: maxLength);
  return [...headerChunks, ...bodyChunks];
}

List<String> _splitParagraphToSentences(String paragraph) {
  final matches = RegExp(r'[^.!?\u2026;:]+[.!?\u2026;:]*')
      .allMatches(paragraph)
      .map((m) => m.group(0)?.trim() ?? '')
      .where((s) => s.isNotEmpty)
      .toList();
  return matches.isEmpty ? [paragraph] : matches;
}

List<String> _splitLongSentence(String sentence, int maxLength) {
  final result = <String>[];
  final clauseParts = RegExp(r'[^,]+,*')
      .allMatches(sentence)
      .map((m) => m.group(0)?.trim() ?? '')
      .where((s) => s.isNotEmpty)
      .toList();

  var current = '';
  for (final part in (clauseParts.isEmpty ? [sentence] : clauseParts)) {
    if (part.length > maxLength) {
      if (current.isNotEmpty) {
        result.add(current);
        current = '';
      }
      result.addAll(_splitByWords(part, maxLength));
      continue;
    }

    final candidate = current.isEmpty ? part : '$current $part';
    if (candidate.length <= maxLength) {
      current = candidate;
    } else {
      if (current.isNotEmpty) result.add(current);
      current = part;
    }
  }

  if (current.isNotEmpty) result.add(current);
  return result;
}

List<String> _splitByWords(String text, int maxLength) {
  final words = text.split(RegExp(r'\s+')).where((w) => w.isNotEmpty);
  final result = <String>[];
  var current = '';

  for (final word in words) {
    if (word.length > maxLength) {
      if (current.isNotEmpty) {
        result.add(current);
        current = '';
      }
      for (var i = 0; i < word.length; i += maxLength) {
        final end = (i + maxLength < word.length) ? i + maxLength : word.length;
        result.add(word.substring(i, end));
      }
      continue;
    }

    final candidate = current.isEmpty ? word : '$current $word';
    if (candidate.length <= maxLength) {
      current = candidate;
    } else {
      if (current.isNotEmpty) result.add(current);
      current = word;
    }
  }

  if (current.isNotEmpty) result.add(current);
  return result;
}
