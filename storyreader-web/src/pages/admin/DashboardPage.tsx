import { useQuery } from "@tanstack/react-query";
import { getDashboardOverview, getRecentTransactions, getRecentActivities } from "../../api/stats";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return "Vừa xong";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export default function DashboardPage() {
  const { data: overview, isLoading: isOverviewLoading } = useQuery({
    queryKey: ["adminDashboardOverview"],
    queryFn: getDashboardOverview,
    refetchInterval: 30000,
  });

  const { data: transactions, isLoading: isTxLoading } = useQuery({
    queryKey: ["adminRecentTransactions"],
    queryFn: () => getRecentTransactions(5),
    refetchInterval: 30000,
  });

  const { data: activities, isLoading: isActivitiesLoading } = useQuery({
    queryKey: ["adminRecentActivities"],
    queryFn: () => getRecentActivities(6),
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl text-slate-900 font-bold mb-1">Tổng quan Hệ thống</h1>
        <p className="text-sm text-ink-muted">Báo cáo tóm tắt các chỉ số hoạt động và doanh thu StoryReader (Dữ liệu thời gian thực)</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Doanh thu hôm nay */}
        <div className="bg-ink-card border border-ink-border rounded-2xl p-5 shadow-xl shadow-black/20 hover:border-gold/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-ink-muted text-xs font-semibold uppercase tracking-wider">Doanh thu hôm nay</span>
            <div className="w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center text-gold">
              <i className="fa-solid fa-coins text-sm" />
            </div>
          </div>
          {isOverviewLoading ? (
            <div className="h-8 bg-ink-bg rounded-lg animate-pulse w-3/4 mb-2" />
          ) : (
            <div className="text-2xl sm:text-3xl font-bold text-gold tracking-tight">
              {formatCurrency(overview?.todayRevenue ?? 0)}
            </div>
          )}
          <div className="text-xs mt-2 flex items-center gap-1 font-medium">
            {overview && overview.revenueGrowthPercent >= 0 ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <i className="fa-solid fa-arrow-trend-up text-xs mr-0.5" />
                +{overview.revenueGrowthPercent}% so với hôm qua
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1">
                <i className="fa-solid fa-arrow-trend-down text-xs mr-0.5" />
                {overview?.revenueGrowthPercent ?? 0}% so với hôm qua
              </span>
            )}
          </div>
        </div>

        {/* Người dùng */}
        <div className="bg-ink-card border border-ink-border rounded-2xl p-5 shadow-xl shadow-black/20 hover:border-ink-border-light transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-ink-muted text-xs font-semibold uppercase tracking-wider">Người dùng</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-400">
              <i className="fa-solid fa-users text-sm" />
            </div>
          </div>
          {isOverviewLoading ? (
            <div className="h-8 bg-ink-bg rounded-lg animate-pulse w-1/2 mb-2" />
          ) : (
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {(overview?.totalUsers ?? 0).toLocaleString("vi-VN")}
            </div>
          )}
          <div className="text-xs text-sky-400 mt-2 flex items-center gap-1 font-medium">
            <span>+{overview?.newUsersThisWeek ?? 0} tài khoản tuần này</span>
          </div>
        </div>

        {/* Truyện theo dõi */}
        <div className="bg-ink-card border border-ink-border rounded-2xl p-5 shadow-xl shadow-black/20 hover:border-ink-border-light transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-ink-muted text-xs font-semibold uppercase tracking-wider">Truyện theo dõi</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
              <i className="fa-solid fa-bookmark text-sm" />
            </div>
          </div>
          {isOverviewLoading ? (
            <div className="h-8 bg-ink-bg rounded-lg animate-pulse w-1/2 mb-2" />
          ) : (
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {(overview?.totalFollows ?? 0).toLocaleString("vi-VN")}
            </div>
          )}
          <div className="text-xs text-ink-muted mt-2">
            Trên tổng số <span className="text-slate-200 font-semibold">{overview?.totalStories ?? 0}</span> truyện
          </div>
        </div>

        {/* Lượt đọc trang */}
        <div className="bg-ink-card border border-ink-border rounded-2xl p-5 shadow-xl shadow-black/20 hover:border-ink-border-light transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-ink-muted text-xs font-semibold uppercase tracking-wider">Lượt đọc chương</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400">
              <i className="fa-solid fa-eye text-sm" />
            </div>
          </div>
          {isOverviewLoading ? (
            <div className="h-8 bg-ink-bg rounded-lg animate-pulse w-1/2 mb-2" />
          ) : (
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {(overview?.totalChapterViews ?? 0).toLocaleString("vi-VN")}
            </div>
          )}
          <div className="text-xs text-purple-400 mt-2 flex items-center gap-1 font-medium">
            <span>Tổng lượt xem toàn hệ thống</span>
          </div>
        </div>
      </div>

      {/* Grid 2: Transactions & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Transactions */}
        <div className="bg-ink-card border border-ink-border rounded-2xl p-6 shadow-xl shadow-black/20 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-bold text-slate-900">Giao dịch gần đây</h2>
            <span className="text-xs text-ink-muted bg-ink-bg px-2.5 py-1 rounded-full border border-ink-border">
              Trực tiếp từ CSDL
            </span>
          </div>

          {isTxLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-14 bg-ink-bg rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-ink-muted border border-dashed border-ink-border rounded-xl flex-1">
              <i className="fa-solid fa-receipt text-3xl text-ink-muted/30 mb-3" />
              <p className="text-sm">Chưa có giao dịch nào được ghi nhận</p>
            </div>
          ) : (
            <div className="divide-y divide-ink-border/50 overflow-hidden flex-1">
              {transactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
                      <span className="text-xs font-bold font-mono">
                        {tx.provider === "Momo" ? "MO" : "VN"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">
                        {tx.userName}
                      </div>
                      <div className="text-xs text-ink-muted flex items-center gap-2 mt-0.5">
                        <span>{tx.type}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(tx.completedAt || tx.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-gold">
                      +{formatCurrency(tx.amount)}
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full inline-block mt-0.5 border ${
                        tx.status === "Success"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : tx.status === "Pending"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {tx.status === "Success" ? "Thành công" : tx.status === "Pending" ? "Chờ xử lý" : "Thất bại"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="bg-ink-card border border-ink-border rounded-2xl p-6 shadow-xl shadow-black/20 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-bold text-slate-900">Hoạt động mới nhất</h2>
            <span className="text-xs text-ink-muted bg-ink-bg px-2.5 py-1 rounded-full border border-ink-border">
              Thời gian thực
            </span>
          </div>

          {isActivitiesLoading ? (
            <div className="space-y-4 py-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-12 bg-ink-bg rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !activities || activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-ink-muted border border-dashed border-ink-border rounded-xl flex-1">
              <p className="text-sm">Chưa có hoạt động nào được ghi nhận</p>
            </div>
          ) : (
            <div className="space-y-4 overflow-hidden flex-1">
              {activities.map((act) => (
                <div key={act.id} className="flex gap-3.5 items-start pb-3.5 border-b border-ink-border/50 last:border-0 last:pb-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      act.type === "chapter_added"
                        ? "bg-gold/15 text-gold border-gold/30"
                        : act.type === "user_registered"
                        ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
                        : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    {act.type === "chapter_added" ? (
                      <i className="fa-solid fa-book-open text-xs" />
                    ) : act.type === "user_registered" ? (
                      <i className="fa-solid fa-user-plus text-xs" />
                    ) : (
                      <i className="fa-solid fa-circle-check text-xs" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 leading-snug">{act.title}</p>
                    <p className="text-xs text-ink-muted mt-0.5 truncate">{act.description}</p>
                    <p className="text-[11px] text-ink-muted/70 mt-1">{formatRelativeTime(act.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
