import { apiClient } from "./client";

export interface AdminTransactionItem {
  id: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  type: "Subscription" | "StoryPurchase";
  status: "Pending" | "Success" | "Failed";
  targetId: string;
  amount: number;
  provider: string;
  providerTransactionRef: string;
  createdAt: string;
  completedAt: string | null;
}

export interface AdminTransactionsResponse {
  total: number;
  page: number;
  pageSize: number;
  items: AdminTransactionItem[];
}

export async function getAdminTransactions(params?: {
  status?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}) {
  const res = await apiClient.get<AdminTransactionsResponse>("/admin/transactions", {
    params,
  });
  return res.data;
}

export async function forceActivateTransaction(id: string) {
  const res = await apiClient.post<{ message: string }>(`/admin/transactions/${id}/force-activate`);
  return res.data;
}

export async function markTransactionFailed(id: string) {
  const res = await apiClient.post<{ message: string }>(`/admin/transactions/${id}/mark-failed`);
  return res.data;
}
