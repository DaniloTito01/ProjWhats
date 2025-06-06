import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { campaignService } from '../../services/campaigns';
import { contactService } from '../../services/contacts';
import { Campaign, Contact } from '../../types';

const Dashboard: React.FC = () => {
  const { user, company } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Busca as campanhas recentes
        const campaignsResponse = await campaignService.getAllCampaigns(1, 5);
        if (campaignsResponse.success && campaignsResponse.data) {
          setCampaigns(campaignsResponse.data);
        }

        // Busca os contatos recentes
        const contactsResponse = await contactService.getAllContacts(1, 5);
        if (contactsResponse.success && contactsResponse.data) {
          setContacts(contactsResponse.data);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Função para obter a cor do status da campanha
  const getCampaignStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para traduzir o status da campanha
  const translateCampaignStatus = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Rascunho';
      case 'scheduled':
        return 'Agendada';
      case 'in_progress':
        return 'Em andamento';
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Bem-vindo, {user?.name}! Aqui está um resumo das suas atividades.
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-purple-creativity to-blue-trust text-white">
          <div className="flex flex-col">
            <div className="text-sm font-medium uppercase">Total de Contatos</div>
            <div className="mt-2 text-3xl font-bold">{loading ? '...' : contacts.length}</div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-trust to-purple-creativity text-white">
          <div className="flex flex-col">
            <div className="text-sm font-medium uppercase">Campanhas Ativas</div>
            <div className="mt-2 text-3xl font-bold">
              {loading
                ? '...'
                : campaigns.filter((c) => c.status === 'in_progress').length}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col">
            <div className="text-sm font-medium uppercase text-gray-500">Campanhas Agendadas</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {loading
                ? '...'
                : campaigns.filter((c) => c.status === 'scheduled').length}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col">
            <div className="text-sm font-medium uppercase text-gray-500">Campanhas Concluídas</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {loading
                ? '...'
                : campaigns.filter((c) => c.status === 'completed').length}
            </div>
          </div>
        </Card>
      </div>

      {/* Campanhas recentes */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Campanhas Recentes</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-creativity"></div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-gray-500">
              Nenhuma campanha encontrada
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Contatos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getCampaignStatusColor(
                          campaign.status
                        )}`}
                      >
                        {translateCampaignStatus(campaign.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {campaign.totalContacts}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(campaign.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Contatos recentes */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Contatos Recentes</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-creativity"></div>
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-gray-500">
              Nenhum contato encontrado
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {contact.phone}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(contact.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

