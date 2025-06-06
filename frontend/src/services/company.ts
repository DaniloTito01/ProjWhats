import api from './api';
import { ApiResponse, Company } from '../types';

export const companyService = {
  // Obter informações da empresa atual
  async getCompany(): Promise<ApiResponse<Company>> {
    try {
      const response = await api.get<ApiResponse<Company>>('/company');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar informações da empresa',
      };
    }
  },

  // Atualizar informações da empresa
  async updateCompany(companyData: Partial<Company>): Promise<ApiResponse<Company>> {
    try {
      const response = await api.put<ApiResponse<Company>>('/company', companyData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar informações da empresa',
      };
    }
  },

  // Fazer upload do logo da empresa
  async uploadLogo(logoFile: File): Promise<ApiResponse<{ logo: string }>> {
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);
      
      const response = await api.post<ApiResponse<{ logo: string }>>('/company/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer upload do logo',
      };
    }
  },

  // Remover o logo da empresa
  async removeLogo(): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete<ApiResponse<null>>('/company/logo');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao remover logo',
      };
    }
  },
};

