const API_BASE = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) || "http://localhost:4000/api/v1";
export const SERVER_BASE = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_MEDIA_BASE_URL
  ? String(process.env.NEXT_PUBLIC_MEDIA_BASE_URL).replace(/\/uploads\/?$/, "")
  : API_BASE.replace(/\/api\/?.*$/, ""));

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

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

function normalizePath(path: string): string {
  const trimmedPath = path.startsWith("/") ? path : `/${path}`;

  if (
    trimmedPath.startsWith("/cms/") ||
    trimmedPath === "/cms" ||
    trimmedPath.startsWith("/api/")
  ) {
    return trimmedPath;
  }

  if (typeof window === "undefined") {
    return trimmedPath;
  }

  const isCmsContext =
    window.location.pathname === "/login" ||
    window.location.pathname.startsWith("/dashboard") ||
    window.location.pathname.startsWith("/dashboard/");

  if (!isCmsContext) {
    return trimmedPath;
  }

  const [pathname] = trimmedPath.split("?");
  const cmsPrefixes = [
    "/dashboard",
    "/users",
    "/roles",
    "/articles",
    "/categories",
    "/media",
    "/upload",
    "/tags",
    "/analytics",
    "/editorial",
    "/seo",
    "/layouts",
    "/advertisers",
    "/ad-campaigns",
    "/advertisements",
    "/newsletter",
    "/tracking",
    "/reports",
    "/settings",
    "/campaigns",
    "/templates",
    "/automations",
    "/workflow",
  ];

  const shouldUseCmsPrefix = cmsPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  return shouldUseCmsPrefix ? `/cms${trimmedPath}` : trimmedPath;
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

  const normalizedPath = normalizePath(path);

  const res = await fetch(`${API_BASE}${normalizedPath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/cms/login";
    }
    throw new ApiError("Unauthorized", 401);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = "Request failed";
    try {
      const parsed = JSON.parse(text);
      message = parsed.message || parsed.error || message;
    } catch {
      if (text) message = text;
    }
    throw new ApiError(message, res.status);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json") || res.status === 204) {
    return undefined as T;
  }

  const json = await res.json().catch(() => ({}));
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

  const normalizedPath = normalizePath(path);

  const res = await fetch(`${API_BASE}${normalizedPath}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/cms/login";
    }
    throw new ApiError("Unauthorized", 401);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = "Upload failed";
    try {
      const parsed = JSON.parse(text);
      message = parsed.message || parsed.error || message;
    } catch {
      if (text) message = text;
    }
    throw new ApiError(message, res.status);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json") || res.status === 204) {
    return undefined as T;
  }

  const json = await res.json().catch(() => ({}));
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
