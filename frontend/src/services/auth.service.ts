import { api } from './api';

export interface SignupDto {
  email: string;
  name: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AcceptInviteDto {
  token: string;
  name?: string;
  password?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  activeCompanyId?: string;
  activeCompany?: {
    id: string;
    name: string;
    logo?: string;
    slug: string;
  };
  memberships?: Array<{
    id: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    company: {
      id: string;
      name: string;
      logo?: string;
      slug: string;
    };
  }>;
}

export const authService = {
  signup: async (data: SignupDto): Promise<{ user: User }> => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  login: async (data: LoginDto): Promise<{ user: User }> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  acceptInvite: async (data: AcceptInviteDto): Promise<{ user: User }> => {
    const response = await api.post('/auth/accept-invite', data);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

