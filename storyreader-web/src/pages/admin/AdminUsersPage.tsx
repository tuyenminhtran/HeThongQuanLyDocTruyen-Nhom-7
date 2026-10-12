export default function AdminUsersPage() {
  const users = [
    { id: 1, name: "Anh Tuấn", email: "tuan@example.com", role: "User", status: "Active", joinDate: "2023-10-01" },
    { id: 2, name: "Minh Phượng", email: "phuong@example.com", role: "User", status: "Active", joinDate: "2023-10-05" },
    { id: 3, name: "Hải Đăng", email: "dang@example.com", role: "VIP", status: "Active", joinDate: "2023-10-10" },
    { id: 4, name: "Spammer123", email: "spam@example.com", role: "User", status: "Blocked", joinDate: "2023-10-15" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-ink-text">Quản lý Người dùng</h1>
          <p className="text-sm text-ink-muted mt-1">Xem và quản lý tài khoản thành viên</p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm theo email hoặc tên..."
            className="w-64 bg-ink-card border border-ink-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink-text focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
          />
          <svg className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
      </div>

      <div className="bg-ink-card border border-ink-border rounded-2xl overflow-hidden shadow-lg shadow-black/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-ink-bg/50 border-b border-ink-border">
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">ID</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Thành viên</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Ngày tham gia</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Vai trò</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Trạng thái</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-border/60">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-ink-bg/30 transition-colors group">
                  <td className="py-3 px-4 text-sm text-ink-muted">#{user.id}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-ink-bg border border-ink-border flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-ink-text">{user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-ink-text">{user.name}</div>
                        <div className="text-xs text-ink-muted">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-ink-text">{user.joinDate}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${
                      user.role === 'VIP' ? 'bg-gold/10 text-gold border-gold/20' : 'bg-ink-bg text-ink-muted border-ink-border'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${
                      user.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {user.status === 'Active' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-sm font-medium text-gold hover:text-gold-dim transition-colors">
                      {user.status === 'Active' ? 'Khóa' : 'Mở khóa'}
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
