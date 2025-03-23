import type {
  Account,
  AccountsQueryParams,
  ApiResponse,
  CreateAccountRequest,
  CreateDealRequest,
  CreateReviewRequest,
  Deal,
  PaginatedResponse,
  Review,
  UpdateAccountRequest,
  User
} from '../types/api';

// Базовый URL API
const API_URL = 'http://localhost:8000/api/v1';

// Интерфейс для параметров запроса аккаунтов
interface GetAccountsParams {
  page?: number;
  search?: string;
}

// Интерфейс для создания сделки
interface CreateDealParams {
  account_id: number;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    // В production будем использовать реальный URL бэкенда
    this.baseUrl = import.meta.env.PROD 
      ? 'https://api.trustytrade.app/api/v1'
      : API_URL;
  }

  // Утилиты для работы с API
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ status: 'success' | 'error'; data?: T; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Something went wrong');
      }

      const data = await response.json();
      return {
        status: 'success',
        data,
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private buildQueryString(params: Record<string, any>): string {
    const query = Object.entries(params)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    return query ? `?${query}` : '';
  }

  // Аутентификация
  public setToken(token: string): void {
    this.token = token;
  }

  public clearToken(): void {
    this.token = null;
  }

  // Методы для работы с пользователями
  public async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/users/me');
  }

  public async getUserById(id: number): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`);
  }

  // Методы для работы с аккаунтами
  public async getAccounts(params: GetAccountsParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) {
      searchParams.append('page', params.page.toString());
    }
    if (params.search) {
      searchParams.append('search', params.search);
    }

    return this.request<PaginatedResponse<Account>>(
      `/accounts?${searchParams.toString()}`
    );
  }

  public async getAccount(id: number) {
    return this.request<Account>(`/accounts/${id}`);
  }

  public async createAccount(data: CreateAccountRequest): Promise<ApiResponse<Account>> {
    return this.request<Account>('/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateAccount(id: number, data: UpdateAccountRequest): Promise<ApiResponse<Account>> {
    return this.request<Account>(`/accounts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public async deleteAccount(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/accounts/${id}`, {
      method: 'DELETE',
    });
  }

  // Методы для работы со сделками
  public async createDeal(params: CreateDealParams) {
    return this.request<Deal>('/deals', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  public async getDeals() {
    return this.request<Deal[]>('/deals');
  }

  public async getDeal(id: number) {
    return this.request<Deal>(`/deals/${id}`);
  }

  public async confirmDeal(id: number) {
    return this.request<Deal>(`/deals/${id}/confirm`, {
      method: 'POST',
    });
  }

  public async cancelDeal(id: number) {
    return this.request<Deal>(`/deals/${id}/cancel`, {
      method: 'POST',
    });
  }

  // Методы для работы с отзывами
  public async createReview(data: CreateReviewRequest): Promise<ApiResponse<Review>> {
    return this.request<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getUserReviews(userId: number): Promise<ApiResponse<Review[]>> {
    return this.request<Review[]>(`/users/${userId}/reviews`);
  }
}

// Экспортируем единственный экземпляр клиента
export const api = new ApiClient(); 