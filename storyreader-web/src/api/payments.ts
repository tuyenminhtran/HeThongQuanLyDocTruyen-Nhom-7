import { apiClient } from "./client";

export interface InitiatePaymentResult {
  transactionId: string;
  paymentUrl: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  scope: string;
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const res = await apiClient.get<SubscriptionPlan[]>("/subscriptions/plans");
  return res.data;
}

export async function buyStory(storyId: string) {
  const res = await apiClient.post<InitiatePaymentResult>(`/payments/story/${storyId}`);
  return res.data;
}

export async function buySubscription(planId: string) {
  const res = await apiClient.post<InitiatePaymentResult>(`/payments/subscription/${planId}`);
  return res.data;
}

export async function simulatePaymentCallback(providerRef: string, success = true) {
  const res = await apiClient.post(`/payments/callback?providerRef=${encodeURIComponent(providerRef)}&success=${success}`);
  return res.data;
}
