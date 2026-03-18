export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
export const API = `${API_URL}/api`;

const TOKEN_KEY = "perfume_admin_jwt";

export function setToken(t) {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, t);
}
export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

export async function api(path, opts) {
  const token = getToken();
  const headers = { ...(opts?.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const isForm = opts?.body instanceof FormData;
  if (!isForm && opts?.body && typeof opts.body === "string" && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${API}${path}`, { ...opts, headers });
  const j = await res.json().catch(() => ({}));
  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(j.message || j.errors?.[0]?.msg || res.statusText);
  return j;
}
