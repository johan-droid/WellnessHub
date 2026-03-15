type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

import { getApiBaseUrl } from '@/lib/api-base-url';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };
  }

  /**
   * Safely parse JSON response, catching JSON parsing errors
   */
  private async parseJsonSafe(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      throw new ApiError(
        'Invalid JSON response from server',
        response.status,
        response.url
      );
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit & { method?: string } = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    const payload = (await this.parseJsonSafe(response)) as ApiEnvelope<T>;

    if (!response.ok) {
      const error = new ApiError(
        payload.error || `HTTP ${response.status}`,
        response.status,
        endpoint
      );
      throw error;
    }

    if (payload.data === undefined && payload.success !== false) {
      throw new ApiError('No data in response', response.status, endpoint);
    }

    return (payload.data || payload) as T;
  }

  get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public endpoint: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  isNetworkError(): boolean {
    return this.status === 0;
  }

  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  isNotFound(): boolean {
    return this.status === 404;
  }
}

export const apiClient = new ApiClient(
  getApiBaseUrl()
);
export { ApiError };
