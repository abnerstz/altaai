import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inviteService, Invite, CreateInviteDto } from '../services/invite.service';

export const useInvites = (companyId?: string) => {
  const queryClient = useQueryClient();

  const invitesQuery = useQuery({
    queryKey: ['invites', 'company', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      return await inviteService.findAll(companyId);
    },
    enabled: !!companyId,
    staleTime: 1 * 60 * 1000,
  });

  const myPendingInvitesQuery = useQuery({
    queryKey: ['invites', 'my-pending'],
    queryFn: async () => {
      return await inviteService.findMyPending();
    },
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });

  const createInviteMutation = useMutation({
    mutationFn: async ({ companyId, data }: { companyId: string; data: CreateInviteDto }) => {
      return await inviteService.create(companyId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invites', 'company', variables.companyId] });
    },
  });

  const deleteInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      await inviteService.remove(inviteId);
    },
    onSuccess: (_, inviteId) => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
    },
  });

  return {
    invites: invitesQuery.data || [],
    myPendingInvites: myPendingInvitesQuery.data || [],
    isLoadingInvites: invitesQuery.isLoading,
    isLoadingMyPending: myPendingInvitesQuery.isLoading,
    createInvite: createInviteMutation,
    deleteInvite: deleteInviteMutation,
  };
};

