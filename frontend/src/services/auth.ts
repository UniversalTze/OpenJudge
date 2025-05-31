import { apiClient, ApiResponse } from './api';
import { API_ENDPOINTS } from '@/config/env';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: {
    languages: string[];
    theme: 'light' | 'dark' | 'system';
  };
  statistics: {
    problemsSolved: number;
    submissionsCount: number;
    acceptanceRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface OnboardingData {
  languages: Array<{
    id: string;
    name: string;
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  }>;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    if (response.success) {
      this.setAuthData(response.data);
    }
    
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );
    
    if (response.success) {
      this.setAuthData(response.data);
    }
    
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );

    if (response.success) {
      this.setAuthData(response.data);
    }

    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.AUTH.PROFILE
    );
    
    if (response.success) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(
      API_ENDPOINTS.USERS.UPDATE_PROFILE,
      userData
    );
    
    if (response.success) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  }

  async completeOnboarding(data: OnboardingData): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.USERS.ONBOARDING,
      data
    );
    
    if (response.success) {
      // Update user data to mark onboarding as complete
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          onboardingComplete: true,
        }));
      }
    }
  }

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.AUTH.VERIFY_EMAIL,
      { token }
    );
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    );
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      { token, password }
    );
  }

  // Local auth data management
  private setAuthData(authData: AuthResponse): void {
    localStorage.setItem('auth_token', authData.token);
    localStorage.setItem('refresh_token', authData.refreshToken);
    localStorage.setItem('user', JSON.stringify(authData.user));
  }

  private clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  isOnboardingComplete(): boolean {
    const user = this.getCurrentUser();
    return user?.onboardingComplete || false;
  }
}

export const authService = new AuthService();