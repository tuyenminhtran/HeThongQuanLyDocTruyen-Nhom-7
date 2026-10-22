import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminTransactions,
  forceActivateTransaction,
  markTransactionFailed,
  type AdminTransactionItem,
} from "../../api/adminTransactions";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

const statusBadge: Record<string, { label: string; class: string; icon: string }> = {
  Pending: {
    label: "Chờ xử lý",
    class: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    icon: "fa-regular fa-clock",
  },
  Success: {
    label: "Thành công",
    class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    icon: "fa-solid fa-check",
  },
  Failed: {
    label: "Thất bại",
    class: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    icon: "fa-solid fa-xmark",
  },
};

export default function AdminTransactionsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminTransactions", statusFilter, keyword, page],
    queryFn: () =>
      getAdminTransactions({
        status: statusFilter === "all" ? undefined : statusFilter,
        keyword: keyword.trim() || undefined,
        page,
        pageSize,
      }),
    refetchInterval: 15000,
  });

  const forceActivateMutation = useMutation({
    mutationFn: (id: string) => forceActivateTransaction(id),
    onSuccess: (res) => {
      alert(res.message || "Đã kích hoạt giao dịch thành công!");
      queryClient.invalidateQueries({ queryKey: ["adminTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardOverview"] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Lỗi khi kích hoạt giao dịch.");
    },
  });

  const markFailedMutation = useMutation({
    mutationFn: (id: string) => markTransactionFailed(id),
    onSuccess: () => {
      alert("Đã đánh dấu giao dịch thất bại.");
      queryClient.invalidateQueries({ queryKey: ["adminTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardOverview"] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Lỗi khi cập nhật giao dịch.");
    },
  });

  const handleForceActivate = (tx: AdminTransactionItem) => {
    if (
      confirm(
        `[PB28] Bạn có chắc chắn muốn KÍCH HOẠT THỦ CÔNG cho giao dịch này?\n\n` +
          `Mã GD: ${tx.providerTransactionRef}\n` +
          `Người dùng: ${tx.userDisplayName || tx.userEmail}\n` +
          `Số tiền: ${formatCurrency(tx.amount)}\n\n` +
          `Hệ thống sẽ cấp bù quyền đọc/gói VIP ngay lập tức cho độc giả.`
      )
    ) {
      forceActivateMutation.mutate(tx.id);
    }
  };

  const handleMarkFailed = (tx: AdminTransactionItem) => {
    if (
      confirm(
        `Bạn có chắc chắn muốn HỦY / ĐÁNH DẤU THẤT BẠI giao dịch này?\n` +
          `Mã GD: ${tx.providerTransactionRef}`
      )
    ) {
      markFailedMutation.mutate(tx.id);
    }
  };

  const transactions = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl text-ink-text font-bold">Quản lý Giao dịch</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30 font-semibold font-mono">
              PB28
            </span>
          </div>
          <p className="text-sm text-ink-muted mt-1">
            Tra cứu lịch sử nạp tiền, đối soát và kích hoạt bù quyền lợi khi cổng thanh toán gặp sự cố
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo email, tên, mã GD..."
            className="w-full sm:w-72 bg-ink-card border border-ink-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink-text focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 placeholder:text-ink-muted/50"
          />
          <i className="fa-solid fa-magnifying-glass text-ink-muted text-xs absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 items-center border-b border-ink-border pb-3">
        {[
          { key: "all", label: "Tất cả", icon: "fa-solid fa-list" },
          { key: "Pending", label: "Chờ xử lý (Pending)", icon: "fa-regular fa-clock" },
          { key: "Success", label: "Thành công (Success)", icon: "fa-solid fa-circle-check" },
          { key: "Failed", label: "Thất bại (Failed)", icon: "fa-solid fa-circle-xmark" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setStatusFilter(tab.key);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
              statusFilter === tab.key
                ? "bg-gold text-ink-bg font-semibold shadow-sm"
                : "bg-ink-card border border-ink-border text-ink-muted hover:text-ink-text hover:bg-ink-bg"
            }`}
          >
            <i className={`${tab.icon} text-xs`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-ink-card border border-ink-border rounded-2xl overflow-hidden shadow-xl shadow-black/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-ink-bg/60 border-b border-ink-border">
                <th className="py-3.5 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Mã giao dịch
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Loại giao dịch
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider text-right">
                  Xử lý (PB28)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-muted">
                    <div className="flex items-center justify-center gap-2">
                      <i className="fa-solid fa-spinner fa-spin text-gold text-base" />
                      <span>Đang tải danh sách giao dịch...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-red-400">
                    Không thể tải dữ liệu giao dịch. Vui lòng thử lại sau.
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-muted">
                    <i className="fa-solid fa-receipt text-3xl opacity-30 mb-2 block" />
                    Không có giao dịch nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const badge = statusBadge[tx.status] || {
                    label: tx.status,
                    class: "bg-gray-500/20 text-ink-muted",
                    icon: "fa-regular fa-circle",
                  };
                  return (
                    <tr key={tx.id} className="hover:bg-ink-bg/30 transition-colors">
                      {/* Code */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs text-ink-text font-medium select-all">
                          {tx.providerTransactionRef}
                        </div>
                        <div className="text-[10px] text-ink-muted mt-0.5">
                          Cổng: {tx.provider || "VNPay"}
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4">
                        <div className="text-sm font-medium text-ink-text truncate max-w-[180px]">
                          {tx.userDisplayName || "Người dùng"}
                        </div>
                        <div className="text-xs text-ink-muted font-mono truncate max-w-[180px]">
                          {tx.userEmail}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4">
                        {tx.type === "Subscription" ? (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                            Gói Hội Viên VIP
                          </span>
                        ) : (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                            Mua Truyện Lẻ
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <div className="text-sm font-semibold text-gold font-mono">
                          {formatCurrency(tx.amount)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 font-medium ${badge.class}`}
                        >
                          <i className={`${badge.icon} text-[10px]`} />
                          {badge.label}
                        </span>
                      </td>

                      {/* CreatedAt */}
                      <td className="py-3.5 px-4 text-xs text-ink-muted">
                        <div>{formatDate(tx.createdAt)}</div>
                        {tx.completedAt && (
                          <div className="text-[10px] text-emerald-400/80 mt-0.5">
                            Xong: {formatDate(tx.completedAt)}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {tx.status === "Pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleForceActivate(tx)}
                              disabled={forceActivateMutation.isPending}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all flex items-center gap-1.5"
                              title="Kích hoạt bù quyền lợi cho người dùng (PB28)"
                            >
                              <i className="fa-solid fa-bolt text-[11px]" />
                              Kích hoạt bù
                            </button>
                            <button
                              onClick={() => handleMarkFailed(tx)}
                              disabled={markFailedMutation.isPending}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                              title="Hủy bỏ giao dịch"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : tx.status === "Success" ? (
                          <span className="text-xs text-emerald-400 flex items-center justify-end gap-1 font-medium">
                            <i className="fa-solid fa-circle-check text-xs" />
                            Đã hoàn tất
                          </span>
                        ) : (
                          <span className="text-xs text-rose-400 flex items-center justify-end gap-1">
                            <i className="fa-solid fa-ban text-xs" />
                            Đã hủy
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-ink-border flex items-center justify-between">
            <p className="text-xs text-ink-muted">
              Trang {page} / {totalPages} (Tổng {total} giao dịch)
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg border border-ink-border text-xs text-ink-text disabled:opacity-30 disabled:cursor-not-allowed hover:bg-ink-bg"
              >
                Trước
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded-lg border border-ink-border text-xs text-ink-text disabled:opacity-30 disabled:cursor-not-allowed hover:bg-ink-bg"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
