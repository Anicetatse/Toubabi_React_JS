import { apiClient } from '@/config/api';
import { ApiResponse, User } from '@/types';

export interface LoginData {
  identifier: string;
  password: string;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  type_compte: 'client' | 'agent_professionnel' | 'agent_informel' | 'agence';
  password: string;
  password_confirmation: string;
  captcha: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export const authService = {
  async login(data: LoginData): Promise<LoginResponse> {
    // Déterminer si c'est un email ou un téléphone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.identifier);
    const loginPayload = {
      [isEmail ? 'email' : 'telephone']: data.identifier,
      password: data.password,
    };
    
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      loginPayload
    );
    return response.data.data!;
  },

  async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(
      '/auth/register',
      data
    );
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/forgot-password',
      { email }
    );
    return response.data.data!;
  },

  async resetPassword(data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/reset-password',
      data
    );
    return response.data.data!;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return response.data.data!;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(
      '/auth/profile',
      data
    );
    return response.data.data!;
  },

  async updatePassword(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.put<ApiResponse<{ message: string }>>(
      '/auth/password',
      data
    );
    return response.data.data!;
  },
};

