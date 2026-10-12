// Giải mã phần payload của JWT (không verify chữ ký — chỉ dùng để đọc claim ở client,
// việc verify thật đã do backend đảm nhiệm).
export function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const binaryStr = atob(base64);
    const bytes = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0));
    const jsonStr = new TextDecoder().decode(bytes);
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const NAME_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";

export function getRoleFromToken(token: string): string[] {
  const payload = decodeJwt(token);
  if (!payload) return [];
  const role = payload[ROLE_CLAIM] ?? payload["role"];
  if (!role) return [];
  return Array.isArray(role) ? (role as string[]) : [role as string];
}

export function getDisplayNameFromToken(token: string): string | null {
  const payload = decodeJwt(token);
  if (!payload) return null;
  const name = payload[NAME_CLAIM] ?? payload["unique_name"] ?? payload["name"];
  return typeof name === "string" && name ? name : null;
}
