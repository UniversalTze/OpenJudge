import { env } from "@/config/env";

export interface ApiResponse<T> {
  data: T | null;
  message: string;
  status: number;
  success: boolean;
}

// TODO: check this implementation?
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiClient {
  private baseURL: string = env.API_BASE_URL;

  async request<T>(endpoint: string, config: RequestInit = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    const requestConfig: RequestInit = {
      ...config,
      signal: controller.signal,
    };

    if (env.ENV === "local") {
      console.log(`API Request: ${this.baseURL}${endpoint}`, requestConfig);
    }

    let result: ApiResponse<T>;

    try {
      const response: Response = await fetch(`${this.baseURL}${endpoint}`, requestConfig);
      clearTimeout(timeoutId);
      let data = null;
      let message = "Request successful";
      if (response.headers.get("content-type")?.includes("application/json")) {
        data = await response.json();
      } else {
        message = await response.text();
      }

      result = {
        data,
        message,
        status: response.status,
        success: response.ok,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        result = {
          data: null,
          message: "Request timed out",
          status: 408,
          success: false,
        };
      } else {
        result = {
          data: null,
          message: error instanceof Error ? error.message : "Unknown error",
          status: 500,
          success: false,
        };
      }
    } finally {
      if (env.ENV === "local") {
        console.log(`API Response:`, result);
      }
    }
    return result;
  }

  async get<T>(
    endpoint: string,
    config: RequestInit,
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, {
      ...config,
      method: "GET",
    });
  }

  async post<T>(endpoint: string, config: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
    });
  }

  async put<T>(endpoint: string, config: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
    });
  }

  async patch<T>(endpoint: string, config: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
    });
  }

  async delete<T>(endpoint: string, config: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
