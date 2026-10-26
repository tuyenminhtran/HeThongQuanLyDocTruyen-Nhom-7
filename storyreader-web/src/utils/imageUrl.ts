/**
 * Resolves a cover or image URL.
 * Supports absolute URLs (https://...), base64 data URLs, and relative upload paths (/uploads/...).
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url || !url.trim()) {
    return "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80";
  }

  const trimmed = url.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  // Handle relative backend paths like /uploads/covers/...
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5066/api";
  const origin = apiBase.replace(/\/api\/?$/, "");
  return `${origin}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}
