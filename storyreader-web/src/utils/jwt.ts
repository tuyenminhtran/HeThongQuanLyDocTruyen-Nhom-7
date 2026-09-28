// Giải mã phần payload của JWT (không verify chữ ký — chỉ dùng để đọc claim ở client,
// việc verify thật đã do backend đảm nhiệm).
export function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export function getRoleFromToken(token: string): string[] {
  const payload = decodeJwt(token);
  if (!payload) return [];
  const role = payload[ROLE_CLAIM] ?? payload["role"];
  if (!role) return [];
  return Array.isArray(role) ? (role as string[]) : [role as string];
}
