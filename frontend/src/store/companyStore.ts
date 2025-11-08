import { create } from 'zustand';
import { Company } from '../services/company.service';
import { companyService } from '../services/company.service';

interface CompanyState {
  companies: Company[];
  currentCompany: Company | null;
  isLoading: boolean;
  setCompanies: (companies: Company[]) => void;
  setCurrentCompany: (company: Company | null) => void;
  fetchCompanies: (page?: number, limit?: number) => Promise<void>;
  selectCompany: (id: string) => Promise<void>;
}

export const useCompanyStore = create<CompanyState>((set) => ({
  companies: [],
  currentCompany: null,
  isLoading: false,

  setCompanies: (companies) => set({ companies }),

  setCurrentCompany: (company) => set({ currentCompany: company }),

  fetchCompanies: async (page = 1, limit = 10) => {
    set({ isLoading: true });
    try {
      const response = await companyService.findAll(page, limit);
      set({ companies: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  selectCompany: async (id: string) => {
    try {
      await companyService.selectCompany(id);
      const company = await companyService.findOne(id);
      set({ currentCompany: company });
    } catch (error) {
      throw error;
    }
  },
}));

