// Nguồn duy nhất cho nhãn/badge của accessPolicy (0: Miễn phí, 1: Trả phí, 2: Hỗn hợp).
// Dùng chung cho StoryCard, HomePage, StoryDetailPage để không bị lệch nhãn giữa các màn hình.
export interface AccessPolicyMeta {
  label: string; // nhãn đầy đủ (trang chi tiết)
  badgeLabel: string; // nhãn ngắn (badge trên ảnh bìa)
  badgeClass: string; // class màu cho badge ở StoryCard
}

export const ACCESS_POLICY: Record<number, AccessPolicyMeta> = {
  0: {
    label: "Miễn phí",
    badgeLabel: "Miễn phí",
    badgeClass: "bg-emerald-500/90 text-white border-emerald-400/30",
  },
  1: {
    label: "Trả phí",
    badgeLabel: "VIP",
    badgeClass:
      "bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold shadow-sm shadow-amber-500/20 border-amber-300/40",
  },
  2: {
    label: "Hỗn hợp",
    badgeLabel: "Hỗn hợp",
    badgeClass: "bg-blue-500/90 text-white border-blue-400/30",
  },
};

export function getAccessPolicy(policy?: number): AccessPolicyMeta {
  return ACCESS_POLICY[policy ?? 0] ?? ACCESS_POLICY[0];
}
