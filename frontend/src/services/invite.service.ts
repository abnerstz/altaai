import { api } from './api';
import { Role } from './membership.service';

export interface Invite {
  id: string;
  email: string;
  token: string;
  role: Role;
  companyId: string;
  senderId: string;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
  company: {
    id: string;
    name: string;
    logo?: string;
    slug?: string;
  };
  sender: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateInviteDto {
  email: string;
  role: Role;
}

export const inviteService = {
  create: async (companyId: string, data: CreateInviteDto): Promise<Invite> => {
    const response = await api.post(`/companies/${companyId}/invites`, data);
    return response.data;
  },

  findAll: async (companyId: string): Promise<Invite[]> => {
    const response = await api.get(`/companies/${companyId}/invites`);
    return response.data;
  },

  findMyPending: async (): Promise<Invite[]> => {
    const response = await api.get('/invites/my-pending');
    return response.data;
  },

  findByToken: async (token: string): Promise<Invite> => {
    const response = await api.get(`/invites/token/${token}`);
    return response.data;
  },

  rejectByToken: async (token: string): Promise<void> => {
    await api.post(`/invites/token/${token}/reject`);
  },

  remove: async (inviteId: string): Promise<void> => {
    await api.delete(`/invites/${inviteId}`);
  },
};

