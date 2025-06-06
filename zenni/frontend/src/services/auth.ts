import api from './api';
import { ApiResponse, User, Company } from '../types';

interface LoginResponse {
  token: string;
  user: User;
  company: Company;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  // Login de usuário
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
      
      // Armazena o token no localStorage
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer login',
      };
    }
  },

  // Logout de usuário
  logout(): void {
    localStorage.removeItem('token');
  },

  // Obter informações do usuário atual
  async getMe(): Promise<ApiResponse<{ user: User; company: Company }>> {
    try {
      const response = await api.get<ApiResponse<{ user: User; company: Company }>>('/auth/me');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter informações do usuário',
      };
    }
  },

  // Atualizar senha do usuário
  async updatePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.put<ApiResponse<null>>('/auth/password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar senha',
      };
    }
  },

  // Verificar se o usuário está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};

