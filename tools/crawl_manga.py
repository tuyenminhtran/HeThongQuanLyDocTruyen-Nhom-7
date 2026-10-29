"""
Công cụ cào truyện tranh tiếng Việt từ MangaDex API và xuất định dạng tương thích StoryReader.
Hỗ trợ:
- Tự động tìm kiếm manga theo tên
- Lấy danh sách chương tiếng Việt
- Lấy đường link ảnh CDN chất lượng cao của từng trang
- Xuất file SQL hoặc JSON để nạp vào cơ sở dữ liệu StoryReader
"""

import requests
import json
import uuid

def search_manga(title):
    url = f"https://api.mangadex.org/manga?title={requests.utils.quote(title)}&limit=10&order[relevance]=desc&contentRating[]=safe&contentRating[]=suggestive"
    res = requests.get(url).json()
    data = res.get("data", [])
    if not data:
        return None
    # Ưu tiên bản chính thức (loại trừ doujinshi)
    for m in data:
        tags = [t.get("attributes", {}).get("name", {}).get("en", "").lower() for t in m.get("attributes", {}).get("tags", [])]
        if "doujinshi" not in tags:
            return m
    return data[0]

def get_cover_url(manga_id):
    url = f"https://api.mangadex.org/cover?manga[]={manga_id}&limit=1"
    res = requests.get(url).json()
    if res.get("data"):
        file_name = res["data"][0]["attributes"]["fileName"]
        return f"https://uploads.mangadex.org/covers/{manga_id}/{file_name}"
    return ""

def crawl_mangadex(manga_title, max_chapters=5):
    print(f"Đang tìm kiếm bộ truyện: {manga_title}...")
    manga = search_manga(manga_title)
    if not manga:
        print("Không tìm thấy truyện!")
        return None

    manga_id = manga["id"]
    attributes = manga["attributes"]
    title = attributes.get("title", {}).get("en") or attributes.get("title", {}).get("ja-ro") or manga_title
    desc = attributes.get("description", {}).get("vi") or attributes.get("description", {}).get("en", "Đang cập nhật")
    cover_url = get_cover_url(manga_id)

    print(f"-> Đã tìm thấy: {title}")
    print(f"-> Ảnh bìa: {cover_url}")

    # Lấy danh sách chương tiếng Việt
    chaps_url = f"https://api.mangadex.org/chapter?manga={manga_id}&translatedLanguage[]=vi&order[chapter]=asc&limit={max_chapters}"
    chaps_res = requests.get(chaps_url).json()
    chapters_data = chaps_res.get("data", [])

    if not chapters_data:
        print("Không tìm thấy chương dịch tiếng Việt nào trên MangaDex.")
        return None

    comic_data = {
        "title": title,
        "author": "Đang cập nhật",
        "cover_url": cover_url,
        "description": desc,
        "type": 1, # 1: Truyện tranh (Comic)
        "chapters": []
    }

    chap_index = 1
    for c in chapters_data:
        chap_id = c["id"]
        chap_num = c["attributes"].get("chapter") or str(chap_index)
        chap_name = c["attributes"].get("title") or f"Hồi {chap_num}"
        full_title = f"Chương {chap_num}: {chap_name}"

        # Lấy danh sách link ảnh từ server CDN
        srv_url = f"https://api.mangadex.org/at-home/server/{chap_id}"
        srv_res = requests.get(srv_url).json()
        base_url = srv_res["baseUrl"]
        chap_hash = srv_res["chapter"]["hash"]
        files = srv_res["chapter"]["data"]

        images = [f"{base_url}/data/{chap_hash}/{f}" for f in files]
        print(f"Đã cào xong {full_title} ({len(images)} trang ảnh)")

        comic_data["chapters"].append({
            "chapter_number": chap_index,
            "title": full_title,
            "images": images,
            "content": "\n".join(images) # Định dạng text ngắt dòng cho StoryReader
        })
        chap_index += 1

    return comic_data

if __name__ == "__main__":
    # Thử cào Dragon Ball, One Punch Man hoặc Spy x Family...
    ten_truyen = "Dragon Ball"
    data = crawl_mangadex(ten_truyen, max_chapters=5)

    if data:
        file_name = f"comic_{ten_truyen.lower().replace(' ', '_')}.json"
        with open(file_name, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Đã xuất file {file_name} thành công!")
