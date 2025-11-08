import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  companyService,
  Company,
  CreateCompanyDto,
  UpdateCompanyDto,
  PaginatedResponse,
} from '../services/company.service';
import { useCompanyStore } from '../store/companyStore';

export const useCompanies = (page = 1, limit = 10) => {
  const { setCompanies, setCurrentCompany } = useCompanyStore();
  const queryClient = useQueryClient();

  const companiesQuery = useQuery({
    queryKey: ['companies', page, limit],
    queryFn: async () => {
      const response = await companyService.findAll(page, limit);
      setCompanies(response.data);
      return response;
    },
    staleTime: 2 * 60 * 1000,
  });


  const createCompanyMutation = useMutation({
    mutationFn: async (data: CreateCompanyDto) => {
      return await companyService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCompanyDto }) => {
      return await companyService.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['companies', variables.id] });
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: string) => {
      await companyService.remove(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  const selectCompanyMutation = useMutation({
    mutationFn: async (id: string) => {
      await companyService.selectCompany(id);
      return await companyService.findOne(id);
    },
    onSuccess: (company) => {
      setCurrentCompany(company);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  return {
    companies: companiesQuery.data?.data || [],
    pagination: companiesQuery.data?.meta,
    isLoading: companiesQuery.isLoading,
    createCompany: createCompanyMutation,
    updateCompany: updateCompanyMutation,
    deleteCompany: deleteCompanyMutation,
    selectCompany: selectCompanyMutation,
  };
};

