export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl text-white font-bold mb-1">Tổng quan Hệ thống</h1>
        <p className="text-sm text-ink-muted">Báo cáo tóm tắt các chỉ số hoạt động và doanh thu StoryReader</p>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-ink-card border border-ink-border rounded-2xl p-5 shadow-xl shadow-black/20 hover:border-gold/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-ink-muted text-xs font-semibold uppercase tracking-wider">Doanh thu hôm nay</span>
            <div className="w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center text-gold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gold tracking-tight">2.450.000đ</div>
          <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
            +15% so với hôm qua
          </div>
        </div>
        
        <div className="bg-ink-card border border-ink-border rounded-2xl p-5 shadow-xl shadow-black/20 hover:border-ink-border-light transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-ink-muted text-xs font-semibold uppercase tracking-wider">Người dùng mới</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.999-3.199a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">124</div>
          <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
            +5% so với tuần trước
          </div>
        </div>
        
        <div className="bg-ink-card border border-ink-border rounded-2xl p-5 shadow-xl shadow-black/20 hover:border-ink-border-light transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-ink-muted text-xs font-semibold uppercase tracking-wider">Truyện theo dõi</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">8.902</div>
          <div className="text-xs text-ink-muted mt-2">Tổng số lượt theo dõi</div>
        </div>
        
        <div className="bg-ink-card border border-ink-border rounded-2xl p-5 shadow-xl shadow-black/20 hover:border-ink-border-light transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-ink-muted text-xs font-semibold uppercase tracking-wider">Lượt đọc trang</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">45.231</div>
          <div className="text-xs text-rose-400 mt-2 flex items-center gap-1 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" />
            </svg>
            -2% so với hôm qua
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-ink-card border border-ink-border rounded-2xl p-6 shadow-xl shadow-black/20">
          <h2 className="font-serif text-lg font-bold text-white mb-4">Giao dịch gần đây</h2>
          <div className="flex flex-col items-center justify-center py-12 text-ink-muted border border-dashed border-ink-border rounded-xl">
            <svg className="w-10 h-10 text-ink-muted/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
            </svg>
            <p className="text-sm">Hệ thống đang đồng bộ dữ liệu giao dịch trực tiếp</p>
          </div>
        </div>
        
        <div className="bg-ink-card border border-ink-border rounded-2xl p-6 shadow-xl shadow-black/20">
          <h2 className="font-serif text-lg font-bold text-white mb-4">Hoạt động mới nhất</h2>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3.5 items-start pb-4 border-b border-ink-border/50 last:border-0 last:pb-0">
                <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold border border-gold/30 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-200">Truyện <span className="font-semibold text-gold">"Thế Giới Hoàn Mỹ"</span> vừa cập nhật chương 102</p>
                  <p className="text-xs text-ink-muted mt-0.5">5 phút trước</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
