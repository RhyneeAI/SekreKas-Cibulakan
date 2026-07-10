import { Alert, Platform } from "react-native";

const REQUEST_TIMEOUT_MS = 15_000;

/** Override via EXPO_PUBLIC_API_URL, mis. http://192.168.1.5:3001/api */
const API_BASE =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ||
  (Platform.OS === "web"
    ? "http://localhost:3001/api"
    : "http://192.168.18.131:3001/api");

export const API_BASE_URL = API_BASE;

export type ApiResult<T> = {
  ok: boolean;
  data: T;
  status: number;
  error?: "timeout" | "network" | "http";
  message?: string;
};

type RequestOptions = {
  /** Jangan tampilkan Alert — error ditangani layar pemanggil */
  silent?: boolean;
  timeoutMs?: number;
};

function networkMessage(): string {
  return `Tidak bisa terhubung ke ${API_BASE}. Pastikan web API jalan (npm run dev:web) dan IP/port benar.`;
}

async function request<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<ApiResult<T>> {
  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    let data: T;
    try {
      data = await res.json();
    } catch {
      data = null as T;
    }

    if (!res.ok) {
      const message =
        (data as { message?: string } | null)?.message || "Terjadi kesalahan";
      if (!options.silent) {
        Alert.alert("Error", message);
      }
      return { ok: false, data, status: res.status, error: "http", message };
    }

    return { ok: true, data, status: res.status };
  } catch (e: unknown) {
    const isTimeout =
      e instanceof Error &&
      (e.name === "AbortError" || e.message.includes("aborted"));

    const message = isTimeout
      ? `Server tidak merespons dalam ${timeoutMs / 1000} detik. ${networkMessage()}`
      : networkMessage();

    if (!options.silent) {
      Alert.alert(isTimeout ? "Timeout" : "Network Error", message);
    }

    return {
      ok: false,
      data: null as T,
      status: 0,
      error: isTimeout ? "timeout" : "network",
      message,
    };
  } finally {
    clearTimeout(timer);
  }
}

export function apiGet<T = unknown>(path: string, options?: RequestOptions) {
  return request<T>("GET", path, undefined, options);
}

export function apiPost<T = unknown>(
  path: string,
  body: unknown,
  options?: RequestOptions
) {
  return request<T>("POST", path, body, options);
}

export function apiPut<T = unknown>(
  path: string,
  body: unknown,
  options?: RequestOptions
) {
  return request<T>("PUT", path, body, options);
}

export function apiDelete<T = unknown>(path: string, options?: RequestOptions) {
  return request<T>("DELETE", path, undefined, options);
}
