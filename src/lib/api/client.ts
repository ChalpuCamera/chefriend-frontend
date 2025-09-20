// API Client using Fetch API
import { useAuthStore } from "@/stores/auth.store";

class ApiError extends Error {
  constructor(public status: number, public data: unknown) {
    super((data as { message?: string })?.message || "API Error");
    this.name = "ApiError";
  }
}

class ApiClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL;

  private async request<T>(
    endpoint: string,
    options?: RequestInit & { params?: Record<string, unknown> }
  ): Promise<T> {
    // Get token from auth store
    const token = useAuthStore.getState().token;

    // Query parameters 처리
    let url = `${this.baseURL}${endpoint}`;
    if (options?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, String(v)));
        } else if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));
      throw new ApiError(response.status, error);
    }

    return response.json();
  }

  get<T>(endpoint: string, options?: { params?: Record<string, unknown> }) {
    return this.request<T>(endpoint, { method: "GET", ...options });
  }

  post<T>(endpoint: string, data?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  put<T>(endpoint: string, data?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { method: "DELETE", ...options });
  }

  // 파일 업로드용 메서드
  async uploadFile(url: string, file: File): Promise<void> {
    const response = await fetch(url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, { message: "File upload failed" });
    }
  }
}

export const apiClient = new ApiClient();
export { ApiError };
