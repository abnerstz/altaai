import { api } from './api';

export interface Company {
  id: string;
  name: string;
  logo?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    memberships: number;
    invites: number;
  };
}

export interface CreateCompanyDto {
  name: string;
  logo?: string;
}

export interface UpdateCompanyDto {
  name?: string;
  logo?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const companyService = {
  create: async (data: CreateCompanyDto): Promise<Company> => {
    const response = await api.post('/companies', data);
    return response.data;
  },

  findAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Company>> => {
    const response = await api.get('/companies', { params: { page, limit } });
    return response.data;
  },

  findOne: async (id: string): Promise<Company> => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateCompanyDto): Promise<Company> => {
    const response = await api.patch(`/companies/${id}`, data);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/companies/${id}`);
  },

  selectCompany: async (id: string): Promise<void> => {
    await api.post(`/companies/${id}/select`);
  },
};

