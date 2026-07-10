import { Alert, Platform } from "react-native";

const DEV_HOST =
  Platform.OS === "web"
    ? "http://localhost:3001/api"
    : "http://192.168.18.131:3001/api";

export const API_BASE_URL = DEV_HOST;

async function request<T = any>(
  method: string,
  path: string,
  body?: any
): Promise<{ ok: boolean; data: T; status: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) {
      Alert.alert("Error", data.message || "Terjadi kesalahan");
      return { ok: false, data, status: res.status };
    }
    return { ok: true, data, status: res.status };
  } catch (e: any) {
    Alert.alert("Network Error", "Tidak bisa terhubung ke server");
    return { ok: false, data: null as T, status: 0 };
  }
}

export function apiGet<T = any>(path: string) {
  return request<T>("GET", path);
}
export function apiPost<T = any>(path: string, body: any) {
  return request<T>("POST", path, body);
}
export function apiPut<T = any>(path: string, body: any) {
  return request<T>("PUT", path, body);
}
export function apiDelete<T = any>(path: string) {
  return request<T>("DELETE", path);
}
