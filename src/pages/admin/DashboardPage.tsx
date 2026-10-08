export default function DashboardPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl text-ink-text mb-6">Tổng quan (Dashboard)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-ink-card border border-ink-border rounded-2xl p-5 shadow-lg shadow-black/10">
          <div className="text-ink-muted text-sm mb-1">Doanh thu hôm nay</div>
          <div className="text-2xl font-bold text-gold">2,450,000đ</div>
          <div className="text-xs text-green-400 mt-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
            +15% so với hôm qua
          </div>
        </div>
        
        <div className="bg-ink-card border border-ink-border rounded-2xl p-5 shadow-lg shadow-black/10">
          <div className="text-ink-muted text-sm mb-1">Người dùng mới</div>
          <div className="text-2xl font-bold text-ink-text">124</div>
          <div className="text-xs text-green-400 mt-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
            +5% so với tuần trước
          </div>
        </div>
        
        <div className="bg-ink-card border border-ink-border rounded-2xl p-5 shadow-lg shadow-black/10">
          <div className="text-ink-muted text-sm mb-1">Truyện đang theo dõi</div>
          <div className="text-2xl font-bold text-ink-text">8,902</div>
          <div className="text-xs text-ink-muted mt-2">Tổng số lượt theo dõi</div>
        </div>
        
        <div className="bg-ink-card border border-ink-border rounded-2xl p-5 shadow-lg shadow-black/10">
          <div className="text-ink-muted text-sm mb-1">Lượt đọc trang</div>
          <div className="text-2xl font-bold text-ink-text">45,231</div>
          <div className="text-xs text-red-400 mt-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" />
            </svg>
            -2% so với hôm qua
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-ink-card border border-ink-border rounded-2xl p-6 shadow-lg shadow-black/10">
          <h2 className="font-medium text-ink-text mb-4">Giao dịch gần đây</h2>
          <div className="flex flex-col items-center justify-center py-10 text-ink-muted">
            <p className="text-sm">Chưa kết nối API Thống kê</p>
          </div>
        </div>
        
        <div className="bg-ink-card border border-ink-border rounded-2xl p-6 shadow-lg shadow-black/10">
          <h2 className="font-medium text-ink-text mb-4">Hoạt động mới nhất</h2>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 items-start pb-4 border-b border-ink-border/50 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-ink-text">Truyện <span className="font-medium">"Thế Giới Hoàn Mỹ"</span> vừa thêm chương 102</p>
                  <p className="text-xs text-ink-muted">5 phút trước</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
