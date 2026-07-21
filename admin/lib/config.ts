// API base resolution:
//  1. NEXT_PUBLIC_API_BASE (build arg) — explicit override, wins if set.
//  2. Browser runtime — same-origin `/api/v1`. In production the backend is
//     reverse-proxied under the admin host at /api/*, so one build works on
//     both the sslip.io test host and the real domain (no CORS, no rebuild).
//  3. SSR/build fallback — localhost (dev only; no client fetch runs there).
function resolveApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_BASE) return process.env.NEXT_PUBLIC_API_BASE;
  if (typeof window !== "undefined") return `${window.location.origin}/api/v1`;
  return "http://localhost:3000/api/v1";
}

export const API_BASE = resolveApiBase();

export const TOKEN_COOKIE = "jetsonic_token";
