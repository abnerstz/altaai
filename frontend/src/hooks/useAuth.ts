import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import { isApiError } from '../types/errors';

export const useAuth = () => {
  const { setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const user = await authService.getMe();
        setUser(user);
        return user;
      } catch (error: unknown) {
        if (isApiError(error) && error.response?.status === 401) {
          setUser(null);
          queryClient.setQueryData(['auth', 'me'], null);
        }
        throw error;
      }
    },
    retry: (failureCount, error: unknown) => {
      if (isApiError(error) && error.response?.status === 401) {
        setUser(null);
        queryClient.setQueryData(['auth', 'me'], null);
        return false;
      }
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await authService.login(data);
      return response.user;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(['auth', 'me'], user);
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: { email: string; name: string; password: string }) => {
      const response = await authService.signup(data);
      return response.user;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(['auth', 'me'], user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authService.logout();
    },
    onSuccess: async () => {
      setUser(null);
      queryClient.cancelQueries({ queryKey: ['auth', 'me'] });
      queryClient.setQueryData(['auth', 'me'], null);
      await queryClient.removeQueries({ queryKey: ['auth', 'me'] });
      queryClient.clear();
      window.location.href = '/login';
    },
  });

  const acceptInviteMutation = useMutation({
    mutationFn: async (data: { token: string; name?: string; password?: string }) => {
      const response = await authService.acceptInvite(data);
      return response.user;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(['auth', 'me'], user);
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['invites', 'my-pending'] });
    },
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    isAuthenticated: !!userQuery.data,
    login: loginMutation,
    signup: signupMutation,
    logout: logoutMutation,
    acceptInvite: acceptInviteMutation,
  };
};

