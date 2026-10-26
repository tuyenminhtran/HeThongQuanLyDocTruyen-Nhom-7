import type { ChapterListItem } from "../api/stories";

export interface ChapterGroup {
  partName: string;
  isFolder: boolean;
  chapters: ChapterListItem[];
}

/**
 * Groups chapters into parts/volumes (Folder cha - con).
 * If chapters have explicit `partName` or title pattern (e.g. "Phần 1", "Tập 1", "[Phần 1]"),
 * they will be grouped into collapsible folders.
 */
export function groupChaptersByPart(chapters: ChapterListItem[]): ChapterGroup[] {
  if (!chapters || chapters.length === 0) return [];

  const groupsMap = new Map<string, ChapterListItem[]>();
  let hasExplicitPart = false;

  for (const c of chapters) {
    let part = (c.partName || "").trim();
    if (part) {
      hasExplicitPart = true;
    } else {
      // Check title for pattern: [Phần 1], (Tập 1), Phần 1:...
      const match = c.title.match(/(?:\[|\()?((?:Phần|Tập|Quyển)\s*\d+[^\]\)]*)(?:\]|\))?/i);
      if (match) {
        part = match[1].trim();
      } else {
        part = "Chương chung";
      }
    }

    if (!groupsMap.has(part)) {
      groupsMap.set(part, []);
    }
    groupsMap.get(part)!.push(c);
  }

  // If there's only 1 group and it's "Chương chung" without any explicit part, don't show as a folder
  if (groupsMap.size <= 1 && (!hasExplicitPart && groupsMap.has("Chương chung"))) {
    return [
      {
        partName: "Tất cả chương",
        isFolder: false,
        chapters: chapters,
      },
    ];
  }

  const result: ChapterGroup[] = [];
  for (const [partName, groupChapters] of groupsMap.entries()) {
    result.push({
      partName,
      isFolder: true,
      chapters: groupChapters.sort((a, b) => a.chapterNumber - b.chapterNumber),
    });
  }

  return result;
}
