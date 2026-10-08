import { useState, useEffect } from "react";
import { getAdminUsers, toggleUserRestriction, type AdminUserListItem } from "../../api/users";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (keyword?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminUsers(keyword);
      setUsers(data);
    } catch {
      setError("Không thể tải danh sách người dùng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleRestriction = async (user: AdminUserListItem) => {
    const actionText = user.isRestricted ? "mở khóa" : "khóa";
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản "${user.displayName || user.email}"?`)) {
      return;
    }

    try {
      setActionId(user.id);
      const res = await toggleUserRestriction(user.id);
      setUsers(prev =>
        prev.map(u => (u.id === user.id ? { ...u, isRestricted: res.isRestricted } : u))
      );
    } catch {
      alert("Cập nhật trạng thái thất bại. Vui lòng thử lại.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl text-ink-text">Quản lý Người dùng</h1>
          <p className="text-sm text-ink-muted mt-1">
            Xem và quản lý tài khoản thành viên trong hệ thống ({users.length} tài khoản)
          </p>
        </div>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo email hoặc tên..."
            className="w-full sm:w-72 bg-ink-card border border-ink-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink-text placeholder:text-ink-muted/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all"
          />
          <svg
            className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted hover:text-ink-text"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-ink-card border border-ink-border rounded-2xl overflow-hidden shadow-lg shadow-black/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-ink-bg/50 border-b border-ink-border">
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">#</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Thành viên</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Ngày tham gia</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Vai trò</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Trạng thái</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-border/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ink-muted">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gold border-t-transparent mb-2"></div>
                    <div>Đang tải danh sách người dùng...</div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ink-muted">
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => {
                  const initial = (user.displayName || user.email || "U").charAt(0).toUpperCase();
                  const joinDate = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : "---";

                  return (
                    <tr key={user.id} className="hover:bg-ink-bg/30 transition-colors group">
                      <td className="py-3 px-4 text-xs text-ink-muted font-mono">
                        #{idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 text-gold flex items-center justify-center shrink-0 font-bold text-sm">
                            {initial}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-ink-text">
                              {user.displayName || "Chưa đặt tên"}
                            </div>
                            <div className="text-xs text-ink-muted">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-ink-text">{joinDate}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                            user.role === "Admin"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : user.role === "VIP"
                              ? "bg-gold/10 text-gold border-gold/20"
                              : "bg-ink-bg text-ink-muted border-ink-border"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full border ${
                            !user.isRestricted
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {!user.isRestricted ? "Hoạt động" : "Đã khóa"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {user.role === "Admin" ? (
                          <span className="text-xs text-ink-muted italic">Quản trị viên</span>
                        ) : (
                          <button
                            disabled={actionId === user.id}
                            onClick={() => handleToggleRestriction(user)}
                            className={`text-sm font-medium transition-colors ${
                              actionId === user.id
                                ? "text-ink-muted cursor-not-allowed"
                                : user.isRestricted
                                ? "text-green-400 hover:text-green-300"
                                : "text-red-400 hover:text-red-300"
                            }`}
                          >
                            {actionId === user.id
                              ? "Đang xử lý..."
                              : user.isRestricted
                              ? "Mở khóa"
                              : "Khóa"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
