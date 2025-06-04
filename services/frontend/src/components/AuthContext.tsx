import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiClient, ApiResponse } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/env';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  skill: "Beginner" | "Intermediate" | "Advanced";
  verified: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  skill: 'Beginner' | 'Intermediate' | 'Advanced';
  email: string;
  password: string;
}

export interface LoginResponse { 
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface UserUpdateRequest {
  firstName: string;
  lastName: string;
  skill: 'Beginner' | 'Intermediate' | 'Advanced';
  email: string;
}

export interface VerifyRequest {
  token: string;
}

export type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  login: (body: LoginRequest) => Promise<ApiResponse<LoginResponse>>;
  register: (body: RegisterRequest) => Promise<ApiResponse<null>>;
  logout: () => Promise<ApiResponse<null>>;
  refresh: () => Promise<ApiResponse<RefreshResponse>>;
  getUser: () => Promise<ApiResponse<User>>;
  updateUser: (body: UserUpdateRequest) => Promise<ApiResponse<UserUpdateRequest>>;
  deleteUser: () => Promise<ApiResponse<null>>;
  verify: (body: VerifyRequest) => Promise<ApiResponse<null>>;
  reset: (body: ResetPasswordRequest) => Promise<ApiResponse<null>>;
  forgot: (body: ForgotPasswordRequest) => Promise<ApiResponse<null>>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  
  async function login(body: LoginRequest) {
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(body),
          credentials: 'include'
        }
      );
      
      if (response.success) { 
        setAccessToken(response.data.accessToken);
      }
      
      return response;
    }
  
    async function register(body: RegisterRequest) {
      const response = await apiClient.post<null>(
        API_ENDPOINTS.AUTH.REGISTER,
        {
          headers: {            
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      );
      
      return response;
    }

    async function logout() {
      const response = await apiClient.post<null>(
        API_ENDPOINTS.AUTH.LOGOUT,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
          credentials: 'include'
        }
      );
      
      if (response.success) {
        setAccessToken(null)
      }

      return response
    }
  
    async function refresh() {
      const response = await apiClient.post<RefreshResponse>(
        API_ENDPOINTS.AUTH.REFRESH, {
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include'
      }
      )

      if (response.success) {
        setAccessToken(response.data.accessToken)
      }

      return response
    }

    async function getUser() {
      const response = await apiClient.get<User>(
        API_ENDPOINTS.AUTH.PROFILE,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      )

      if (response.success) {
        setUser(response.data as User)
      }

      return response
    }

    async function updateUser(body: UserUpdateRequest) {
      const response = await apiClient.post<UserUpdateRequest>(
        API_ENDPOINTS.AUTH.PROFILE,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      )

      if (response.success) {
        setUser({
          ...user,
          ...body
        })
      }

      return response
    }

    async function deleteUser() {
      const response = await apiClient.delete<null>(
        API_ENDPOINTS.AUTH.PROFILE,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      )

      return response
    }

    async function verify(body: VerifyRequest) {
      const response = await apiClient.post<null>(
        API_ENDPOINTS.AUTH.PROFILE,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      )

      return response
    }

    async function reset(body: ResetPasswordRequest) {
      const response = await apiClient.post<null>(
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      )

      return response      
    }

    async function forgot(body: ForgotPasswordRequest) {
      const response = await apiClient.post<null>(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      )

      return response
    }

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      login,
      register,
      logout,
      refresh,
      getUser,
      updateUser,
      deleteUser,
      verify,
      reset,
      forgot
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};