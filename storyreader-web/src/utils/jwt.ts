// Giải mã phần payload của JWT (không verify chữ ký — chỉ dùng để đọc claim ở client,
// việc verify thật đã do backend đảm nhiệm).
export function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const binaryStr = atob(padded);
    const bytes = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0));
    const jsonStr = new TextDecoder().decode(bytes);
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string | null | undefined): boolean {
  if (!token) return true;
  const payload = decodeJwt(token);
  if (!payload) return true;
  const exp = payload["exp"];
  if (typeof exp !== "number") return false;
  // Trừ hao 5 giây để tránh gửi token vừa hết hạn
  return Date.now() >= (exp * 1000) - 5000;
}

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const NAME_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";

export function getRoleFromToken(token: string): string[] {
  if (isTokenExpired(token)) return [];
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
