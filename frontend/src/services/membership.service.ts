import { api } from './api';

export type Role = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface Membership {
  id: string;
  role: Role;
  userId: string;
  companyId: string;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

export const membershipService = {
  findAll: async (companyId: string): Promise<Membership[]> => {
    const response = await api.get(`/companies/${companyId}/members`);
    return response.data;
  },

  updateRole: async (
    companyId: string,
    userId: string,
    role: Role
  ): Promise<Membership> => {
    const response = await api.patch(`/companies/${companyId}/members/${userId}`, {
      role,
    });
    return response.data;
  },

  remove: async (companyId: string, userId: string): Promise<void> => {
    await api.delete(`/companies/${companyId}/members/${userId}`);
  },
};

