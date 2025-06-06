import api from './api';
import { ApiResponse, Campaign, CampaignStats } from '../types';

export const campaignService = {
  // Listar todas as campanhas com paginação e filtros
  async getAllCampaigns(
    page = 1,
    limit = 10,
    status?: string
  ): Promise<ApiResponse<Campaign[]>> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (status) params.append('status', status);
      
      const response = await api.get<ApiResponse<Campaign[]>>(`/campaigns?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao listar campanhas',
      };
    }
  },

  // Obter uma campanha específica
  async getCampaign(id: string): Promise<ApiResponse<Campaign>> {
    try {
      const response = await api.get<ApiResponse<Campaign>>(`/campaigns/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar campanha',
      };
    }
  },

  // Criar uma nova campanha
  async createCampaign(campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    try {
      const response = await api.post<ApiResponse<Campaign>>('/campaigns', campaignData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar campanha',
      };
    }
  },

  // Atualizar uma campanha
  async updateCampaign(id: string, campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    try {
      const response = await api.put<ApiResponse<Campaign>>(`/campaigns/${id}`, campaignData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar campanha',
      };
    }
  },

  // Excluir uma campanha
  async deleteCampaign(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete<ApiResponse<null>>(`/campaigns/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao excluir campanha',
      };
    }
  },

  // Preparar uma campanha para envio
  async prepareCampaign(id: string): Promise<ApiResponse<{ campaign: Campaign; totalContacts: number }>> {
    try {
      const response = await api.post<ApiResponse<{ campaign: Campaign; totalContacts: number }>>(`/campaigns/${id}/prepare`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao preparar campanha',
      };
    }
  },

  // Iniciar o envio de uma campanha
  async startCampaign(id: string): Promise<ApiResponse<Campaign>> {
    try {
      const response = await api.post<ApiResponse<Campaign>>(`/campaigns/${id}/start`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao iniciar campanha',
      };
    }
  },

  // Cancelar uma campanha
  async cancelCampaign(id: string): Promise<ApiResponse<Campaign>> {
    try {
      const response = await api.post<ApiResponse<Campaign>>(`/campaigns/${id}/cancel`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao cancelar campanha',
      };
    }
  },

  // Obter estatísticas de uma campanha
  async getCampaignStats(id: string): Promise<ApiResponse<{ campaign: Campaign; stats: CampaignStats }>> {
    try {
      const response = await api.get<ApiResponse<{ campaign: Campaign; stats: CampaignStats }>>(`/campaigns/${id}/stats`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter estatísticas da campanha',
      };
    }
  },
};

