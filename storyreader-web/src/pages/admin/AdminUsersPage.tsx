import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminUsers, toggleUserRestriction, type AdminUserItem } from "../../api/users";

export default function AdminUsersPage() {
  const [keyword, setKeyword] = useState("");
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["adminUsers", keyword],
    queryFn: () => getAdminUsers(keyword),
  });

  const toggleMutation = useMutation({
    mutationFn: (userId: string) => toggleUserRestriction(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardOverview"] });
    },
  });

  const handleToggle = (user: AdminUserItem) => {
    if (user.role === "Admin") {
      alert("Không thể khóa tài khoản Administrator.");
      return;
    }
    const action = user.isRestricted ? "mở khóa" : "khóa";
    if (confirm(`Bạn có chắc chắn muốn ${action} tài khoản ${user.displayName || user.email}?`)) {
      toggleMutation.mutate(user.id);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl text-ink-text font-bold">Quản lý Người dùng</h1>
          <p className="text-sm text-ink-muted mt-1">Xem và quản lý tài khoản thành viên trong hệ thống CSDL</p>
        </div>
        <div className="relative">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo email hoặc tên..."
            className="w-full sm:w-72 bg-ink-card border border-ink-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink-text focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 placeholder:text-ink-muted/50"
          />
          <i className="fa-solid fa-magnifying-glass text-ink-muted text-xs absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-ink-card border border-ink-border rounded-2xl overflow-hidden shadow-lg shadow-black/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-ink-bg/60 border-b border-ink-border">
                <th className="py-3.5 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Thành viên</th>
                <th className="py-3.5 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Ngày tham gia</th>
                <th className="py-3.5 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Vai trò</th>
                <th className="py-3.5 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Trạng thái</th>
                <th className="py-3.5 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-ink-muted">
                    <div className="flex items-center justify-center gap-2">
                      <i className="fa-solid fa-spinner fa-spin text-gold text-base" />
                      <span>Đang tải danh sách người dùng từ máy chủ...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-red-400">
                    Không thể tải danh sách người dùng. Vui lòng thử lại sau.
                  </td>
                </tr>
              ) : !users || users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-ink-muted">
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-ink-bg/30 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/30 text-gold flex items-center justify-center font-bold text-sm shrink-0">
                          {(user.displayName || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-ink-text truncate">
                            {user.displayName || "Thành viên"}
                          </div>
                          <div className="text-xs text-ink-muted font-mono truncate">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-slate-300">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
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
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 font-medium ${
                          !user.isRestricted
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${!user.isRestricted ? "bg-emerald-400" : "bg-rose-400"}`} />
                        {!user.isRestricted ? "Hoạt động" : "Đã khóa"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {user.role === "Admin" ? (
                        <span className="text-xs text-ink-muted italic">Mặc định</span>
                      ) : (
                        <button
                          onClick={() => handleToggle(user)}
                          disabled={toggleMutation.isPending}
                          className={`text-sm font-medium transition-colors px-3 py-1 rounded-lg border ${
                            user.isRestricted
                              ? "text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/30"
                              : "text-rose-400 hover:bg-rose-500/10 border-rose-500/30"
                          }`}
                        >
                          {user.isRestricted ? "Mở khóa" : "Khóa"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
