import api from './api';
import { ApiResponse, Stage } from '../types';

export const stageService = {
  // Listar todos os estágios
  async getAllStages(): Promise<ApiResponse<Stage[]>> {
    try {
      const response = await api.get<ApiResponse<Stage[]>>('/stages');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao listar estágios',
      };
    }
  },

  // Obter um estágio específico
  async getStage(id: string): Promise<ApiResponse<Stage>> {
    try {
      const response = await api.get<ApiResponse<Stage>>(`/stages/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar estágio',
      };
    }
  },

  // Criar um novo estágio
  async createStage(stageData: Partial<Stage>): Promise<ApiResponse<Stage>> {
    try {
      const response = await api.post<ApiResponse<Stage>>('/stages', stageData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar estágio',
      };
    }
  },

  // Atualizar um estágio
  async updateStage(id: string, stageData: Partial<Stage>): Promise<ApiResponse<Stage>> {
    try {
      const response = await api.put<ApiResponse<Stage>>(`/stages/${id}`, stageData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar estágio',
      };
    }
  },

  // Reordenar estágios
  async reorderStages(stageOrder: string[]): Promise<ApiResponse<Stage[]>> {
    try {
      const response = await api.put<ApiResponse<Stage[]>>('/stages/reorder', { stageOrder });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao reordenar estágios',
      };
    }
  },

  // Arquivar um estágio
  async archiveStage(id: string, targetStageId: string): Promise<ApiResponse<{ archivedStage: Stage; activeStages: Stage[] }>> {
    try {
      const response = await api.put<ApiResponse<{ archivedStage: Stage; activeStages: Stage[] }>>(`/stages/${id}/archive`, { targetStageId });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao arquivar estágio',
      };
    }
  },

  // Restaurar um estágio arquivado
  async restoreStage(id: string): Promise<ApiResponse<{ restoredStage: Stage; activeStages: Stage[] }>> {
    try {
      const response = await api.put<ApiResponse<{ restoredStage: Stage; activeStages: Stage[] }>>(`/stages/${id}/restore`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao restaurar estágio',
      };
    }
  },

  // Excluir um estágio permanentemente
  async deleteStage(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete<ApiResponse<null>>(`/stages/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao excluir estágio',
      };
    }
  },
};

