const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export const SERVER_BASE = API_BASE.replace(/\/api\/?$/, "");

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("dnews_token");
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("dnews_token");
  localStorage.removeItem("dnews_user");
}

export function saveToken(token: string): void {
  localStorage.setItem("dnews_token", token);
}

export function saveUser(user: unknown): void {
  localStorage.setItem("dnews_user", JSON.stringify(user));
}

export function getStoredUser<T>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("dnews_user");
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard/login";
    }
    throw new ApiError("Unauthorized", 401);
  }

  const json = await res.json();

  if (!res.ok) {
    throw new ApiError(
      json.message || json.error || "Request failed",
      res.status
    );
  }

  return json.data as T;
}

export async function uploadFile<T>(path: string, file: File): Promise<T> {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard/login";
    }
    throw new ApiError("Unauthorized", 401);
  }

  const json = await res.json();

  if (!res.ok) {
    throw new ApiError(
      json.message || json.error || "Upload failed",
      res.status
    );
  }

  return json.data as T;
}

export function get<T>(path: string): Promise<T> {
  return request<T>("GET", path);
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("POST", path, body);
}

export function patch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("PATCH", path, body);
}

export function del<T>(path: string): Promise<T> {
  return request<T>("DELETE", path);
}

export function put<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("PUT", path, body);
}
