import api from './api';
import { ApiResponse, Contact } from '../types';

export const contactService = {
  // Listar todos os contatos com paginação e filtros
  async getAllContacts(
    page = 1,
    limit = 10,
    search?: string,
    tag?: string,
    stage?: string
  ): Promise<ApiResponse<Contact[]>> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (search) params.append('search', search);
      if (tag) params.append('tag', tag);
      if (stage) params.append('stage', stage);
      
      const response = await api.get<ApiResponse<Contact[]>>(`/contacts?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao listar contatos',
      };
    }
  },

  // Obter um contato específico
  async getContact(id: string): Promise<ApiResponse<Contact>> {
    try {
      const response = await api.get<ApiResponse<Contact>>(`/contacts/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar contato',
      };
    }
  },

  // Criar um novo contato
  async createContact(contactData: Partial<Contact>): Promise<ApiResponse<Contact>> {
    try {
      const response = await api.post<ApiResponse<Contact>>('/contacts', contactData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar contato',
      };
    }
  },

  // Atualizar um contato
  async updateContact(id: string, contactData: Partial<Contact>): Promise<ApiResponse<Contact>> {
    try {
      const response = await api.put<ApiResponse<Contact>>(`/contacts/${id}`, contactData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar contato',
      };
    }
  },

  // Excluir um contato
  async deleteContact(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete<ApiResponse<null>>(`/contacts/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao excluir contato',
      };
    }
  },

  // Importar contatos a partir de um arquivo CSV
  async importContacts(file: File): Promise<ApiResponse<{ totalProcessed: number; successCount: number; errorCount: number }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post<ApiResponse<{ totalProcessed: number; successCount: number; errorCount: number }>>('/contacts/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao importar contatos',
      };
    }
  },
};

