// Tipos para autenticação
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator';
  companyId: string;
  lastLogin?: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  domain?: string;
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'cancelled';
  trialEndsAt?: string;
}

export interface AuthState {
  user: User | null;
  company: Company | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Tipos para contatos
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
  notes?: string;
  stage?: string;
  companyId: string;
  lastInteraction?: string;
  source?: string;
  active: boolean;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Tipos para campanhas
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  messageTemplate: string;
  mediaType: 'none' | 'image' | 'audio' | 'video';
  mediaUrl?: string;
  scheduledAt?: string;
  completedAt?: string;
  targetTags: string[];
  minDelaySeconds: number;
  maxDelaySeconds: number;
  companyId: string;
  createdBy: string;
  totalContacts: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  responseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignStats {
  total: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  responses: number;
  pending: number;
  deliveryRate: string;
  readRate: string;
  responseRate: string;
  failureRate: string;
}

// Tipos para mensagens
export interface Message {
  id: string;
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  mediaType: 'none' | 'image' | 'audio' | 'video';
  mediaUrl?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failedAt?: string;
  failureReason?: string;
  campaignId: string;
  contactId: string;
  companyId: string;
  whatsappMessageId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Response {
  id: string;
  content: string;
  mediaType: 'none' | 'image' | 'audio' | 'video';
  mediaUrl?: string;
  receivedAt: string;
  isRead: boolean;
  readAt?: string;
  readBy?: string;
  messageId?: string;
  contactId: string;
  companyId: string;
  whatsappMessageId?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos para estágios do funil de vendas
export interface Stage {
  id: string;
  name: string;
  description?: string;
  color: string;
  position: number;
  companyId: string;
  isDefault: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tipos para API
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  totalPages?: number;
  currentPage?: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

