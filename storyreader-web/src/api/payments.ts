import { apiClient } from "./client";

export interface InitiatePaymentResult {
  transactionId: string;
  paymentUrl: string;
}

export async function buyStory(storyId: string) {
  const res = await apiClient.post<InitiatePaymentResult>(`/payments/story/${storyId}`);
  return res.data;
}

export async function buySubscription(planId: string) {
  const res = await apiClient.post<InitiatePaymentResult>(`/payments/subscription/${planId}`);
  return res.data;
}
