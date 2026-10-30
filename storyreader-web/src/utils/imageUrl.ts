/**
 * Resolves a cover or image URL safely.
 * Supports absolute URLs (https://...), safe image data URLs, and relative upload paths (/uploads/...).
 */
export function resolveImageUrl(url?: string | null): string {
  const fallback = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80";
  if (!url || !url.trim()) {
    return fallback;
  }

  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  // Chặn các giao thức nguy hiểm như javascript:, vbscript:, data:text/html
  if (lower.startsWith("javascript:") || lower.startsWith("vbscript:")) {
    return fallback;
  }

  if (
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("data:image/") ||
    lower.startsWith("blob:")
  ) {
    return trimmed;
  }

  if (lower.startsWith("data:")) {
    return fallback;
  }

  // Handle relative backend paths like /uploads/covers/...
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5066/api";
  const origin = apiBase.replace(/\/api\/?$/, "");
  return `${origin}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}
