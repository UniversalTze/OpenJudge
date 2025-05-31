import { env, API_ENDPOINTS } from '@/config/env';

// Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Request interceptor type
type RequestInterceptor = (config: RequestInit) => RequestInit | Promise<RequestInit>;
type ResponseInterceptor<T = any> = (response: Response) => Promise<T>;

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(baseURL: string, timeout: number = 10000) {
    this.baseURL = baseURL.replace(/\/$/, '');
    this.timeout = timeout;
  }

  // Add request interceptor
  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  // Add response interceptor
  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  // Get auth token
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Create request config
  private async createConfig(config: RequestInit = {}): Promise<RequestInit> {
    let requestConfig: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      ...config,
    };

    // Add auth token
    const token = this.getAuthToken();
    if (token) {
      requestConfig.headers = {
        ...requestConfig.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      requestConfig = await interceptor(requestConfig);
    }

    return requestConfig;
  }

  // Handle response
  private async handleResponse<T>(response: Response): Promise<T> {
    // Apply response interceptors
    let processedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }

    if (!processedResponse.ok) {
      const errorData = await processedResponse.json().catch(() => ({}));
      const error: ApiError = {
        message: errorData.message || `HTTP ${processedResponse.status}`,
        status: processedResponse.status,
        code: errorData.code,
        details: errorData,
      };
      throw error;
    }

    return processedResponse.json();
  }

  // Generic request method
  async request<T>(endpoint: string, config: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const requestConfig = await this.createConfig({
        ...config,
        signal: controller.signal,
      });

      const response = await fetch(`${this.baseURL}${endpoint}`, requestConfig);
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
export const apiClient = new ApiClient(env.API_BASE_URL, env.API_TIMEOUT);

// Add default request interceptor for logging
if (env.DEBUG) {
  apiClient.addRequestInterceptor((config) => {
    console.log('API Request:', config);
    return config;
  });

  apiClient.addResponseInterceptor(async (response) => {
    console.log('API Response:', response);
    return response;
  });
}

// Add auth error interceptor
apiClient.addResponseInterceptor(async (response) => {
  if (response.status === 401) {
    // Handle token expiration
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return response;
});