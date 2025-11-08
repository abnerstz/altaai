import { useQuery } from '@tanstack/react-query';
import { companyService, Company } from '../services/company.service';

export const useCompany = (id: string | undefined) => {
  return useQuery<Company>({
    queryKey: ['companies', id],
    queryFn: async () => {
      if (!id) throw new Error('Company ID is required');
      return await companyService.findOne(id);
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

