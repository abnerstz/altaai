import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membershipService, Membership, Role } from '../services/membership.service';

export const useMemberships = (companyId?: string) => {
  const queryClient = useQueryClient();

  const membershipsQuery = useQuery({
    queryKey: ['memberships', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      return await membershipService.findAll(companyId);
    },
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ companyId, userId, role }: { companyId: string; userId: string; role: Role }) => {
      return await membershipService.updateRole(companyId, userId, role);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['memberships', variables.companyId] });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async ({ companyId, userId }: { companyId: string; userId: string }) => {
      await membershipService.remove(companyId, userId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['memberships', variables.companyId] });
    },
  });

  return {
    memberships: membershipsQuery.data || [],
    isLoading: membershipsQuery.isLoading,
    updateRole: updateRoleMutation,
    removeMember: removeMemberMutation,
  };
};

