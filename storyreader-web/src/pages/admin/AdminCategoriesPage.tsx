export default function AdminCategoriesPage() {
  const categories = [
    { id: 1, name: "Tiên Hiệp", slug: "tien-hiep", storyCount: 1540 },
    { id: 2, name: "Kiếm Hiệp", slug: "kiem-hiep", storyCount: 890 },
    { id: 3, name: "Ngôn Tình", slug: "ngon-tinh", storyCount: 3200 },
    { id: 4, name: "Đô Thị", slug: "do-thi", storyCount: 1205 },
    { id: 5, name: "Xuyên Không", slug: "xuyen-khong", storyCount: 950 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-ink-text">Quản lý Thể loại</h1>
          <p className="text-sm text-ink-muted mt-1">Thêm, sửa, xóa các thể loại truyện</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gold text-ink-bg hover:bg-gold-dim transition-all shadow-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Thêm thể loại
        </button>
      </div>

      <div className="bg-ink-card border border-ink-border rounded-2xl overflow-hidden shadow-lg shadow-black/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-ink-bg/50 border-b border-ink-border">
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">ID</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Tên thể loại</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Slug</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Số truyện</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-border/60">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-ink-bg/30 transition-colors group">
                  <td className="py-3 px-4 text-sm text-ink-muted">#{cat.id}</td>
                  <td className="py-3 px-4 text-sm font-medium text-ink-text">{cat.name}</td>
                  <td className="py-3 px-4 text-sm text-ink-muted font-mono">{cat.slug}</td>
                  <td className="py-3 px-4 text-sm text-ink-text">{cat.storyCount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right space-x-3">
                    <button className="text-sm font-medium text-gold hover:text-gold-dim transition-colors">
                      Sửa
                    </button>
                    <button className="text-sm font-medium text-red-400 hover:text-red-500 transition-colors">
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
