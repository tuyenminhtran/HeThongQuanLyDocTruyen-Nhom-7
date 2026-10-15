import { apiClient } from "./client";

export interface DashboardOverview {
  todayRevenue: number;
  yesterdayRevenue: number;
  revenueGrowthPercent: number;
  totalUsers: number;
  newUsersThisWeek: number;
  totalFollows: number;
  totalChapterViews: number;
  totalStories: number;
}

export interface RecentTransaction {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  type: string;
  status: string;
  provider: string;
  createdAt: string;
  completedAt?: string | null;
}

export interface RecentActivity {
  id: string;
  type: "chapter_added" | "story_created" | "user_registered" | "subscription_created";
  title: string;
  description: string;
  timestamp: string;
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const res = await apiClient.get<DashboardOverview>("/admin/stats/overview");
  return res.data;
}

export async function getRecentTransactions(limit = 10): Promise<RecentTransaction[]> {
  const res = await apiClient.get<RecentTransaction[]>(`/admin/stats/recent-transactions?limit=${limit}`);
  return res.data;
}

export async function getRecentActivities(limit = 10): Promise<RecentActivity[]> {
  const res = await apiClient.get<RecentActivity[]>(`/admin/stats/recent-activities?limit=${limit}`);
  return res.data;
}
