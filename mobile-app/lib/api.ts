// Ganti dengan URL deployment Next.js kamu (web-kkn)
export const API_BASE_URL = "http://localhost:3000/api";

export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  return res.json();
}

export async function apiPost<T = any>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function apiPut<T = any>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { method: "DELETE" });
  return res.json();
}
