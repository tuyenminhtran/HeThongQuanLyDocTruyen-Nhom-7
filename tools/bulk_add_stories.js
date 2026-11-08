/**
 * Công cụ cào và nạp truyện hàng loạt vào StoryReader (Cả Manga và Tiểu thuyết)
 * Chạy bằng: node tools/bulk_add_stories.js
 */

const fs = require('fs');
const { execSync } = require('child_process');
const crypto = require('crypto');

const GENRES = {
  manga: 'a1000000-0000-0000-0000-000000000024',
  action: 'a1000000-0000-0000-0000-000000000011',
  adventure: 'a1000000-0000-0000-0000-000000000012',
  comedy: 'a1000000-0000-0000-0000-000000000013',
  supernatural: 'a1000000-0000-0000-0000-000000000025',
  horror: 'a1000000-0000-0000-0000-000000000027',
  sports: '64e8441d-4144-48db-a8ee-683eeb81a3d7', // Thể Thao
  scifi: 'a1000000-0000-0000-0000-000000000005',
  fantasy: 'a63af464-7952-498a-a561-224a892cabd4',
  shounen: 'cda6fba4-b872-44ca-8936-ecb8bc29cd25',
  slice_of_life: 'a1000000-0000-0000-0000-000000000021',
  mystery: 'a1000000-0000-0000-0000-000000000010',
  tien_hiep: 'a1000000-0000-0000-0000-000000000001',
  kiem_hiep: 'a1000000-0000-0000-0000-000000000002',
  vong_du: 'a1000000-0000-0000-0000-000000000008',
  huyen_huyen: 'a1000000-0000-0000-0000-000000000003'
};

const MANGA_TARGETS = [
  {
    search: "Chainsaw Man",
    vietnameseTitle: "Chainsaw Man - Thợ Săn Quỷ",
    genreKeys: ['manga', 'action', 'supernatural', 'horror', 'shounen'],
    views: 48920,
    maxChapters: 5
  },
  {
    search: "One Punch-Man",
    vietnameseTitle: "One Punch-Man - Thánh Phồng Tôm",
    genreKeys: ['manga', 'action', 'comedy', 'shounen'],
    views: 65430,
    maxChapters: 5
  },
  {
    search: "Hunter x Hunter",
    vietnameseTitle: "Hunter x Hunter - Thợ Săn Tí Hon",
    genreKeys: ['manga', 'adventure', 'action', 'shounen'],
    views: 71200,
    maxChapters: 5
  },
  {
    search: "Blue Lock",
    vietnameseTitle: "Blue Lock - Tiền Đạo Số 1 Thế Giới",
    genreKeys: ['manga', 'action', 'shounen'],
    views: 52100,
    maxChapters: 5
  },
  {
    search: "Oshi no Ko",
    vietnameseTitle: "【Oshi no Ko】 - Dưới Ánh Hào Quang Thần Tượng",
    genreKeys: ['manga', 'slice_of_life', 'mystery'],
    views: 39800,
    maxChapters: 5
  },
  {
    search: "Dr.STONE",
    vietnameseTitle: "Dr. STONE - Kỷ Nguyên Hồi Sinh Thế Giới Đá",
    genreKeys: ['manga', 'scifi', 'adventure', 'shounen'],
    views: 36700,
    maxChapters: 5
  }
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchManga(title) {
  const url = `https://api.mangadex.org/manga?title=${encodeURIComponent(title)}&limit=5&order[relevance]=desc&contentRating[]=safe&contentRating[]=suggestive&includes[]=author&includes[]=artist`;
  const res = await fetch(url);
  const json = await res.json();
  const list = json.data || [];
  const manga = list.find(m => !(m.attributes.tags || []).some(t => t.attributes?.name?.en === 'Doujinshi')) || list[0];
  return manga;
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

async function crawlMangaDex(target) {
  console.log(`\n======================================================`);
  console.log(`🔍 [1/3] Đang tìm kiếm: ${target.search}...`);
  const manga = await searchManga(target.search);
  if (!manga) {
    console.log(`❌ Không tìm thấy truyện "${target.search}" trên MangaDex.`);
    return null;
  }

  const mangaId = manga.id;
  const attrs = manga.attributes;
  const rels = manga.relationships || [];
  const authorNames = rels
    .filter(r => r.type === 'author' || r.type === 'artist')
    .map(r => r.attributes?.name)
    .filter(Boolean);
  const author = [...new Set(authorNames)].join(', ') || 'MangaDex Author';

  const desc = attrs.description?.vi || attrs.description?.en || `Bộ manga nổi tiếng ${target.vietnameseTitle}. Cùng theo dõi hành trình phiêu lưu đầy kịch tính!`;
  const coverUrl = await getCoverUrl(mangaId);

  console.log(`✅ Tên gốc: ${attrs.title.en || attrs.title['ja-ro'] || target.search}`);
  console.log(`📝 Tác giả: ${author}`);
  console.log(`🖼️  Ảnh bìa: ${coverUrl}`);

  await sleep(500);

  // Lấy các chương dịch tiếng Việt
  console.log(`📥 [2/3] Đang lấy ${target.maxChapters} chương tiếng Việt...`);
  const chapsUrl = `https://api.mangadex.org/chapter?manga=${mangaId}&translatedLanguage[]=vi&order[chapter]=asc&limit=${target.maxChapters}`;
  const chapsRes = await fetch(chapsUrl);
  const chapsJson = await chapsRes.json();
  const chaptersData = chapsJson.data || [];

  if (chaptersData.length === 0) {
    console.log(`⚠️ Không có chương tiếng Việt cho "${target.search}", bỏ qua.`);
    return null;
  }

  const chapters = [];
  let index = 1;
  for (const c of chaptersData) {
    const chapId = c.id;
    const chapNum = c.attributes.chapter || index;
    const chapTitle = `Chương ${chapNum}: ${c.attributes.title || 'Hồi ' + chapNum}`;

    await sleep(400); // Tránh rate limit của MangaDex
    try {
      const srvRes = await fetch(`https://api.mangadex.org/at-home/server/${chapId}`);
      const srvJson = await srvRes.json();
      const baseUrl = srvJson.baseUrl;
      const hash = srvJson.chapter.hash;
      const files = srvJson.chapter.data;

      const images = files.map(f => `${baseUrl}/data/${hash}/${f}`);
      console.log(`   ✔️  Đã nạp ${chapTitle} (${images.length} trang tranh)`);

      chapters.push({
        chapterNumber: index,
        title: chapTitle,
        content: images.join('\n')
      });
      index++;
    } catch (e) {
      console.error(`   ❌ Lỗi nạp chương ${chapTitle}:`, e.message);
    }
  }

  return {
    title: target.vietnameseTitle,
    author,
    coverUrl,
    description: desc,
    type: 1, // Manga
    views: target.views,
    genreKeys: target.genreKeys,
    chapters
  };
}

async function run() {
  console.log("🚀 BẮT ĐẦU CÀO VÀ THÊM TRUYỆN MỚI CHO STORYREADER...");
  const storiesToInsert = [];

  for (const target of MANGA_TARGETS) {
    try {
      const story = await crawlMangaDex(target);
      if (story && story.chapters.length > 0) {
        storiesToInsert.push(story);
      }
    } catch (err) {
      console.error(`Lỗi khi xử lý ${target.search}:`, err.message);
    }
  }

  console.log(`\n======================================================`);
  console.log(`📦 Đã cào thành công ${storiesToInsert.length} bộ Manga chất lượng cao!`);
  console.log(`🛠️  Đang tạo mã SQL để nạp vào PostgreSQL...`);

  let sqlStatements = "";

  for (const s of storiesToInsert) {
    const storyId = crypto.randomUUID();
    const safeTitle = s.title.replace(/'/g, "''");
    const safeAuthor = s.author.replace(/'/g, "''");
    const safeCover = s.coverUrl.replace(/'/g, "''");
    const safeDesc = s.description.replace(/'/g, "''");

    sqlStatements += `
-- Truyện: ${safeTitle}
INSERT INTO "Stories" (
  "Id", "Title", "CoverImageUrl", "Description", "Author", "Status", "AccessPolicy",
  "Price", "FreeChapterCount", "ViewCount", "CreatedAt", "UpdatedAt", "Type"
) VALUES (
  '${storyId}', '${safeTitle}', '${safeCover}', '${safeDesc}', '${safeAuthor}',
  0, 0, NULL, 0, ${s.views}, NOW(), NOW(), ${s.type}
);
`;

    for (const gk of s.genreKeys) {
      const gid = GENRES[gk];
      if (gid) {
        sqlStatements += `INSERT INTO "StoryGenres" ("StoryId", "GenreId") VALUES ('${storyId}', '${gid}') ON CONFLICT DO NOTHING;\n`;
      }
    }

    for (const chap of s.chapters) {
      const safeChapTitle = chap.title.replace(/'/g, "''");
      const safeContent = chap.content.replace(/'/g, "''");
      sqlStatements += `
INSERT INTO "Chapters" (
  "Id", "StoryId", "ChapterNumber", "Title", "Content", "ViewCount", "PublishAt", "CreatedAt", "UpdatedAt"
) VALUES (
  gen_random_uuid(), '${storyId}', ${chap.chapterNumber}, '${safeChapTitle}', '${safeContent}', ${Math.floor(s.views / (s.chapters.length || 1))}, NOW(), NOW(), NOW()
);
`;
    }
  }

  const tmpSql = `bulk_import_${Date.now()}.sql`;
  fs.writeFileSync(tmpSql, sqlStatements, 'utf-8');

  console.log(`\n💾 Đang thực thi nạp dữ liệu vào cơ sở dữ liệu Docker PostgreSQL...`);
  try {
    execSync(`docker exec -i hethongquanlydoctruyen-nhom-7-postgres-1 psql -U storynest -d storyreader < "${tmpSql}"`, { stdio: 'inherit', shell: true });
    console.log(`\n🎉 HOÀN TẤT NHẬP THÊM TRUYỆN VÀO HỆ THỐNG STORYREADER THÀNH CÔNG!`);
  } catch (err) {
    console.error("❌ Lỗi khi import SQL:", err.message);
  } finally {
    if (fs.existsSync(tmpSql)) fs.unlinkSync(tmpSql);
  }
}

run().catch(console.error);
