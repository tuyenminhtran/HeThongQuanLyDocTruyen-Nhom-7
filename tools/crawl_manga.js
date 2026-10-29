/**
 * Công cụ cào truyện tranh tiếng Việt từ MangaDex API và nạp trực tiếp vào StoryReader
 * Cách chạy: node tools/crawl_manga.js "Dragon Ball"
 */

const fs = require('fs');

async function searchManga(title) {
  const url = `https://api.mangadex.org/manga?title=${encodeURIComponent(title)}&limit=10&order[relevance]=desc&contentRating[]=safe&contentRating[]=suggestive`;
  const res = await fetch(url);
  const json = await res.json();
  if (!json.data || json.data.length === 0) return null;
  // Ưu tiên bản chính chủ (không phải doujinshi)
  const canonical = json.data.find(m => {
    const isDoujin = (m.attributes.tags || []).some(t => t.attributes?.name?.en?.toLowerCase() === 'doujinshi');
    return !isDoujin;
  });
  return canonical || json.data[0];
}

async function getCoverUrl(mangaId) {
  const url = `https://api.mangadex.org/cover?manga[]=${mangaId}&limit=1`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.data && json.data.length > 0) {
    const fileName = json.data[0].attributes.fileName;
    return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
  }
  return "";
}

async function crawlManga(title, maxChapters = 5) {
  console.log(`\n========================================`);
  console.log(`🔍 Đang tìm kiếm truyện: "${title}"...`);
  const manga = await searchManga(title);
  if (!manga) {
    console.log("❌ Không tìm thấy truyện trên MangaDex!");
    return;
  }

  const mangaId = manga.id;
  const attrs = manga.attributes;
  const mangaTitle = attrs.title.en || attrs.title['ja-ro'] || title;
  const desc = attrs.description.vi || attrs.description.en || "Chưa có mô tả.";
  const coverUrl = await getCoverUrl(mangaId);

  console.log(`✅ Tìm thấy: ${mangaTitle}`);
  console.log(`🖼️  Ảnh bìa: ${coverUrl}`);

  console.log(`\n📥 Đang tìm các chương dịch Tiếng Việt...`);
  const chapsUrl = `https://api.mangadex.org/chapter?manga=${mangaId}&translatedLanguage[]=vi&order[chapter]=asc&limit=${maxChapters}`;
  const chapsRes = await fetch(chapsUrl);
  const chapsJson = await chapsRes.json();
  const chaptersData = chapsJson.data || [];

  if (chaptersData.length === 0) {
    console.log("❌ Truyện này chưa có chương tiếng Việt trên MangaDex.");
    return;
  }

  console.log(`🎯 Tìm thấy ${chapsJson.total} chương tiếng Việt, đang cào ${chaptersData.length} chương đầu...`);

  const chapters = [];
  let index = 1;
  for (const c of chaptersData) {
    const chapId = c.id;
    const chapNum = c.attributes.chapter || index;
    const chapTitle = `Chương ${chapNum}: ${c.attributes.title || 'Hồi ' + chapNum}`;

    const srvRes = await fetch(`https://api.mangadex.org/at-home/server/${chapId}`);
    const srvJson = await srvRes.json();
    const baseUrl = srvJson.baseUrl;
    const hash = srvJson.chapter.hash;
    const files = srvJson.chapter.data;

    const images = files.map(f => `${baseUrl}/data/${hash}/${f}`);
    console.log(`   ✔️  Đã cào ${chapTitle} (${images.length} trang ảnh)`);

    chapters.push({
      chapterNumber: index,
      title: chapTitle,
      content: images.join('\n')
    });
    index++;
  }

  const result = {
    title: mangaTitle,
    coverUrl,
    description: desc,
    type: 1,
    chapters
  };

  const shouldImport = process.argv.includes('--import');

  if (shouldImport) {
    const { execSync } = require('child_process');
    const crypto = require('crypto');
    const storyId = crypto.randomUUID();

    const safeTitle = mangaTitle.replace(/'/g, "''");
    const safeDesc = desc.replace(/'/g, "''");
    const safeCover = coverUrl.replace(/'/g, "''");

    let sql = `
INSERT INTO "Stories" (
  "Id", "Title", "CoverImageUrl", "Description", "Author", "Status", "AccessPolicy", 
  "Price", "FreeChapterCount", "ViewCount", "CreatedAt", "UpdatedAt", "Type"
) VALUES (
  '${storyId}', '${safeTitle}', '${safeCover}', '${safeDesc}', 'MangaDex',
  0, 0, NULL, 0, 1000, NOW(), NOW(), 1
);

INSERT INTO "StoryGenres" ("StoryId", "GenreId") VALUES
  ('${storyId}', 'a1000000-0000-0000-0000-000000000024'); -- Manga
`;

    for (const chap of chapters) {
      const safeChapTitle = chap.title.replace(/'/g, "''");
      const safeContent = chap.content.replace(/'/g, "''");
      sql += `
INSERT INTO "Chapters" (
  "Id", "StoryId", "ChapterNumber", "Title", "Content", "ViewCount", "PublishAt", "CreatedAt", "UpdatedAt"
) VALUES (
  gen_random_uuid(), '${storyId}', ${chap.chapterNumber}, '${safeChapTitle}', '${safeContent}', 500, NOW(), NOW(), NOW()
);
`;
    }

    const tmpSql = `scratch_import_${Date.now()}.sql`;
    fs.writeFileSync(tmpSql, sql, 'utf-8');

    try {
      execSync(`docker exec -i hethongquanlydoctruyen-nhom-7-postgres-1 psql -U storynest -d storyreader < "${tmpSql}"`, { stdio: 'pipe', shell: true });
      console.log(`\n🚀 ĐÃ TỰ ĐỘNG CẬP NHẬT TRUYỆN VÀO DATABASE POSTGRESQL!`);
      console.log(`🔗 Link đọc trực tiếp: http://localhost:5173/stories/${storyId}`);
    } catch (err) {
      console.error("Lỗi khi nạp vào database:", err.message);
    } finally {
      if (fs.existsSync(tmpSql)) fs.unlinkSync(tmpSql);
    }
  } else {
    const outFile = `comic_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
    fs.writeFileSync(outFile, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`\n🎉 Đã xuất thành công ra file: ${outFile}`);
    console.log(`💡 Mẹo: Thêm cờ --import để tự động nạp thẳng vào Database (VD: node tools/crawl_manga.js "${title}" --import)`);
  }
}

const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const inputTitle = args[0] || "Dragon Ball";
crawlManga(inputTitle, 5).catch(console.error);
