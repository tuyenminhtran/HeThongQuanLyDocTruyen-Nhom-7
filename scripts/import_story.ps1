<#
.SYNOPSIS
    Script tự động nhập truyện và các chương từ file văn bản (.txt) vào hệ thống StoryReader.
.DESCRIPTION
    Tự động đọc file cấu trúc chuẩn, phân tích thông tin truyện, thể loại, từng chương và gọi API để lưu vào cơ sở dữ liệu.
.EXAMPLE
    pwsh scripts/import_story.ps1 -FilePath "c:\Users\TrMin\Downloads\Tron_Bo_Tieu_Thuyet_Dragon_Ball.txt"
#>

param(
    [string]$FilePath = "c:\Users\TrMin\Downloads\Tron_Bo_Tieu_Thuyet_Dragon_Ball.txt",
    [string]$ApiBaseUrl = "http://localhost:5066/api",
    [string]$AdminEmail = "admin@storynest.local",
    [string]$AdminPassword = "Admin@123456"
)

$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " HỆ THỐNG TỰ ĐỘNG NHẬP TRUYỆN TỪ FILE TXT - STORYREADER" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not (Test-Path $FilePath)) {
    Write-Host "[LỖI] Không tìm thấy file tại đường dẫn: $FilePath" -ForegroundColor Red
    exit 1
}

Write-Host "[1/5] Đang kết nối máy chủ API tại $ApiBaseUrl..." -ForegroundColor Gray
try {
    $loginBody = @{
        email = $AdminEmail
        password = $AdminPassword
    } | ConvertTo-Json

    $loginRes = Invoke-RestMethod -Uri "$ApiBaseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginRes.accessToken
    if (-not $token) {
        Write-Host "[LỖI] Không nhận được Access Token từ API." -ForegroundColor Red
        exit 1
    }
    Write-Host "  -> Đăng nhập thành công với tài khoản Admin ($AdminEmail)" -ForegroundColor Green
}
catch {
    Write-Host "[LỖI] Đăng nhập thất bại: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
}

# Lấy danh sách thể loại từ DB để map GUID
Write-Host "[2/5] Đang nạp danh mục thể loại từ hệ thống..." -ForegroundColor Gray
$genreMap = @{}
try {
    $genres = Invoke-RestMethod -Uri "$ApiBaseUrl/genres" -Method Get
    foreach ($g in $genres) {
        $genreMap[$g.name.Trim().ToLower()] = $g.id
    }
    Write-Host "  -> Đã nạp $($genreMap.Count) thể loại sẵn sàng." -ForegroundColor Green
}
catch {
    Write-Host "[LỖI] Không thể tải danh sách thể loại: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Lấy danh sách truyện hiện có để tránh tạo trùng lặp
Write-Host "[3/5] Đang kiểm tra các truyện hiện có trên hệ thống..." -ForegroundColor Gray
$existingStories = @{}
try {
    $existingList = Invoke-RestMethod -Uri "$ApiBaseUrl/stories" -Method Get
    foreach ($s in $existingList) {
        $existingStories[$s.title.Trim().ToLower()] = $s.id
    }
    Write-Host "  -> Hệ thống hiện có $($existingStories.Count) truyện." -ForegroundColor Green
}
catch {
    Write-Host "[CẢNH BÁO] Không lấy được danh sách truyện hiện có, tiếp tục nhập mới." -ForegroundColor Yellow
}

# Đọc và phân tích file TXT
Write-Host "[4/5] Đang đọc và phân tích cấu trúc file: $FilePath..." -ForegroundColor Gray
$lines = [System.IO.File]::ReadAllLines($FilePath, [System.Text.Encoding]::UTF8)

$stories = @()
$currentStory = $null
$currentChapter = $null
$currentPart = $null

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]

    if ($line -match "^(?:BỘ \d+:|PHẦN \d+:|Phần \d+:|Tập \d+:)") {
        $currentPart = $line.Trim()
    }

    if ($line -match "^BỘ \d+:") {
        $currentStory = [PSCustomObject]@{
            RawHeader = $line
            Title = ""
            Author = ""
            Type = 0
            Cover = ""
            Desc = ""
            Genres = @()
            Access = 0
            Chapters = @()
        }
        $stories += $currentStory
        $currentChapter = $null
        $currentPart = $line.Trim()
        continue
    }

    if ($currentStory -and -not $currentChapter) {
        if ($line -match "^-\s*Tên truyện:\s*(.+)$") { $currentStory.Title = $matches[1].Trim() }
        if ($line -match "^-\s*Tác giả:\s*(.+)$") { $currentStory.Author = $matches[1].Trim() }
        if ($line -match "^-\s*Hình thức truyện:\s*(.+)$") { 
            $currentStory.Type = if ($matches[1] -match "tranh") { 1 } else { 0 }
        }
        if ($line -match "^-\s*URL ảnh bìa:\s*(.+)$") { $currentStory.Cover = $matches[1].Trim() }
        if ($line -match "^-\s*Mô tả:\s*(.+)$") { $currentStory.Desc = $matches[1].Trim() }
        if ($line -match "^-\s*Thể loại:\s*(.+)$") { 
            $currentStory.Genres = $matches[1].Split(',') | ForEach-Object { $_.Trim() }
        }
        if ($line -match "^-\s*Chính sách truy cập:\s*(.+)$") {
            $currentStory.Access = if ($matches[1] -match "Trả phí") { 1 } else { 0 }
        }
    }

    if ($line -match "^Chương (\d+)(?:[^\:]*)?:\s*(.*)") {
        $num = [int]$matches[1]
        $title = "Chương " + $num + ": " + $matches[2].Trim()
        $currentChapter = [PSCustomObject]@{
            Number = $num
            Title = $title
            PartName = $currentPart
            ContentLines = [System.Collections.Generic.List[string]]::new()
        }
        if ($currentStory) {
            $currentStory.Chapters += $currentChapter
        }
        continue
    }

    if ($currentChapter) {
        if ($line -match "^-{10,}$" -or $line -match "^#{10,}$" -or $line -match "^={10,}$") {
            continue
        }
        if ($line -match "^HẾT TRỌN BỘ") {
            $currentChapter = $null
            continue
        }
        $currentChapter.ContentLines.Add($line)
    }
}

Write-Host "  -> Tìm thấy $($stories.Count) bộ truyện trong file." -ForegroundColor Green

# Bắt đầu nhập truyện và chương vào API
Write-Host "`n[5/5] BẮT ĐẦU NHẬP DỮ LIỆU VÀO DATABASE QUA API..." -ForegroundColor Cyan

$totalStoriesCreated = 0
$totalChaptersCreated = 0

foreach ($s in $stories) {
    if ([string]::IsNullOrWhiteSpace($s.Title)) { continue }

    Write-Host "`n----------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host ">> TRUYỆN: $($s.Title)" -ForegroundColor Yellow
    Write-Host "   Tác giả: $($s.Author) | Thể loại: $($s.Genres -join ', ')" -ForegroundColor Gray

    # Map thể loại sang GUID
    $matchedGenreIds = @()
    foreach ($gName in $s.Genres) {
        $key = $gName.Trim().ToLower()
        if ($genreMap.ContainsKey($key)) {
            $matchedGenreIds += $genreMap[$key]
        }
    }

    $storyId = $null
    $titleKey = $s.Title.Trim().ToLower()

    if ($existingStories.ContainsKey($titleKey)) {
        $storyId = $existingStories[$titleKey]
        Write-Host "   [INFO] Truyện đã tồn tại trên hệ thống (ID: $storyId). Đang kiểm tra bổ sung chương..." -ForegroundColor Cyan
    }
    else {
        # Tạo truyện mới
        $createStoryPayload = @{
            title = $s.Title
            author = if ($s.Author) { $s.Author } else { "Đang cập nhật" }
            type = $s.Type
            coverImageUrl = if ($s.Cover) { $s.Cover } else { "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&q=80" }
            description = $s.Desc
            accessPolicy = $s.Access
            price = $null
            freeChapterCount = 0
            genreIds = $matchedGenreIds
        } | ConvertTo-Json

        try {
            $createRes = Invoke-RestMethod -Uri "$ApiBaseUrl/stories" -Method Post -Body $createStoryPayload -ContentType "application/json" -Headers $headers
            $storyId = $createRes.id
            $existingStories[$titleKey] = $storyId
            $totalStoriesCreated++
            Write-Host "   [SUCCESS] Đã tạo truyện mới thành công! (ID: $storyId)" -ForegroundColor Green
        }
        catch {
            Write-Host "   [LỖI] Không thể tạo truyện: $($_.Exception.Message)" -ForegroundColor Red
            continue
        }
    }

    # Lấy danh sách chương đã có của truyện để tránh thêm lặp
    $existingChapNumbers = @()
    try {
        $detail = Invoke-RestMethod -Uri "$ApiBaseUrl/stories/$storyId" -Method Get
        if ($detail.chapters) {
            $existingChapNumbers = $detail.chapters | ForEach-Object { $_.chapterNumber }
        }
    }
    catch {}

    # Thêm các chương
    foreach ($c in $s.Chapters) {
        if ($existingChapNumbers -contains $c.Number) {
            Write-Host "   - [Bỏ qua] Chương $($c.Number): đã tồn tại." -ForegroundColor DarkGray
            continue
        }

        $content = ($c.ContentLines -join "`n").Trim()
        if ([string]::IsNullOrWhiteSpace($content)) {
            Write-Host "   - [Cảnh báo] Chương $($c.Number): nội dung rỗng, bỏ qua." -ForegroundColor Yellow
            continue
        }

        $chapPayload = @{
            chapterNumber = $c.Number
            title = $c.Title
            partName = $c.PartName
            content = $content
            publishAt = $null
            renderAsImages = $false
        } | ConvertTo-Json

        try {
            Invoke-RestMethod -Uri "$ApiBaseUrl/stories/$storyId/chapters" -Method Post -Body $chapPayload -ContentType "application/json" -Headers $headers
            $totalChaptersCreated++
            Write-Host "   + [Chương $($c.Number)] $($c.Title) ($($content.Length) ký tự) -> Đã lưu!" -ForegroundColor Green
        }
        catch {
            Write-Host "   ! [Lỗi] Không thể thêm chương $($c.Number): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " HOÀN TẤT QUÁ TRÌNH NHẬP TRUYỆN TỰ ĐỘNG!" -ForegroundColor Green
Write-Host " - Số truyện tạo mới:  $totalStoriesCreated" -ForegroundColor White
Write-Host " - Số chương đã thêm:   $totalChaptersCreated" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
