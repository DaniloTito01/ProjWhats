import api from './api';
import { ApiResponse, User } from '../types';

export const userService = {
  // Listar todos os usuários
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await api.get<ApiResponse<User[]>>('/users');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao listar usuários',
      };
    }
  },

  // Obter um usuário específico
  async getUser(id: string): Promise<ApiResponse<User>> {
    try {
      const response = await api.get<ApiResponse<User>>(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar usuário',
      };
    }
  },

  // Criar um novo usuário
  async createUser(userData: { name: string; email: string; password: string; role?: 'admin' | 'operator' }): Promise<ApiResponse<User>> {
    try {
      const response = await api.post<ApiResponse<User>>('/users', userData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar usuário',
      };
    }
  },

  // Atualizar um usuário
  async updateUser(id: string, userData: { name?: string; email?: string; role?: 'admin' | 'operator'; active?: boolean }): Promise<ApiResponse<User>> {
    try {
      const response = await api.put<ApiResponse<User>>(`/users/${id}`, userData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar usuário',
      };
    }
  },

  // Redefinir senha de um usuário
  async resetPassword(id: string, newPassword: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.put<ApiResponse<null>>(`/users/${id}/reset-password`, { newPassword });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao redefinir senha',
      };
    }
  },

  // Excluir um usuário
  async deleteUser(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete<ApiResponse<null>>(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao excluir usuário',
      };
    }
  },
};

