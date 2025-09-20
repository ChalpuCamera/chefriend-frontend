import { useAuthStore } from "@/stores/auth.store";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://platform.chalpu.com";

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
  skipAuth?: boolean;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await useAuthStore.getState().refreshAccessToken();
        if (!refreshed) {
          // Clear auth and redirect to login
          useAuthStore.getState().clearAuth();
          window.location.href = "/";
        }
        throw new Error("Unauthorized");
      }

      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}`);
    }

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  private buildURL(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  private getHeaders(config?: RequestConfig): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add auth header if not skipped
    if (!config?.skipAuth) {
      const token = useAuthStore.getState().token;
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    // Merge with custom headers
    return {
      ...headers,
      ...(config?.headers as Record<string, string>),
    };
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    const response = await fetch(url, {
      ...config,
      method: "GET",
      headers: this.getHeaders(config),
      credentials: config?.credentials || "same-origin",
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    const response = await fetch(url, {
      ...config,
      method: "POST",
      headers: this.getHeaders(config),
      body: data ? JSON.stringify(data) : undefined,
      credentials: config?.credentials || "same-origin",
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    const response = await fetch(url, {
      ...config,
      method: "PUT",
      headers: this.getHeaders(config),
      body: data ? JSON.stringify(data) : undefined,
      credentials: config?.credentials || "same-origin",
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    const response = await fetch(url, {
      ...config,
      method: "PATCH",
      headers: this.getHeaders(config),
      body: data ? JSON.stringify(data) : undefined,
      credentials: config?.credentials || "same-origin",
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    const response = await fetch(url, {
      ...config,
      method: "DELETE",
      headers: this.getHeaders(config),
      credentials: config?.credentials || "same-origin",
    });
    return this.handleResponse<T>(response);
  }

  // File upload method
  async upload<T>(
    endpoint: string,
    formData: FormData,
    config?: RequestConfig
  ): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    const headers = { ...config?.headers };

    // Don't set Content-Type for FormData - browser will set it with boundary
    delete (headers as Record<string, string>)["Content-Type"];

    // Add auth header if needed
    if (!config?.skipAuth) {
      const token = useAuthStore.getState().token;
      if (token) {
        (headers as Record<string, string>)[
          "Authorization"
        ] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      ...config,
      method: "POST",
      headers,
      body: formData,
      credentials: config?.credentials || "same-origin",
    });
    return this.handleResponse<T>(response);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export { ApiClient };

// Convenience methods
export const api = {
  get: <T>(endpoint: string, config?: RequestConfig) =>
    apiClient.get<T>(endpoint, config),
  post: <T>(endpoint: string, data?: unknown, config?: RequestConfig) =>
    apiClient.post<T>(endpoint, data, config),
  put: <T>(endpoint: string, data?: unknown, config?: RequestConfig) =>
    apiClient.put<T>(endpoint, data, config),
  patch: <T>(endpoint: string, data?: unknown, config?: RequestConfig) =>
    apiClient.patch<T>(endpoint, data, config),
  delete: <T>(endpoint: string, config?: RequestConfig) =>
    apiClient.delete<T>(endpoint, config),
  upload: <T>(endpoint: string, formData: FormData, config?: RequestConfig) =>
    apiClient.upload<T>(endpoint, formData, config),
};
