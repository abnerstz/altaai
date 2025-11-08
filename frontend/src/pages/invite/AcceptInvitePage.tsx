import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { acceptInviteSchema, AcceptInviteFormData } from '../../lib/schemas';
import { inviteService, Invite } from '../../services/invite.service';
import { getErrorMessage, isApiError } from '../../types/errors';
import { isValidImageUrl } from '../../lib/utils';
import { showToast } from '../../lib/toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Building2, Mail, User, Calendar, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, acceptInvite } = useAuth();
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectSuccess, setRejectSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
    setValue,
  } = useForm<AcceptInviteFormData>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: {
      token: token || '',
    },
  });

  const { data: invite, isLoading: isLoadingInvite, error: inviteError } = useQuery<Invite>({
    queryKey: ['invite', token],
    queryFn: async () => {
      if (!token) throw new Error('Token não fornecido');
      return await inviteService.findByToken(token);
    },
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (token) {
      setValue('token', token);
    }
    if (user) {
      setValue('name', user.name || '');
    }
  }, [token, user, setValue]);

  const onSubmit = async (data: AcceptInviteFormData) => {
    if (!token) return;

    try {
      await acceptInvite.mutateAsync({
        token,
        name: data.name || undefined,
        password: user ? undefined : data.password,
      });
      showToast.success('Convite aceito!', 'Você foi adicionado à empresa');
      navigate('/');
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Erro ao aceitar convite');
      setFormError('root', { message: errorMessage });
      showToast.error('Erro ao aceitar convite', errorMessage);
    }
  };

  const handleReject = async () => {
    if (!token) return;

    setIsRejecting(true);
    try {
      await inviteService.rejectByToken(token);
      setRejectSuccess(true);
      showToast.success('Convite recusado', 'O convite foi recusado com sucesso');
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Erro ao recusar convite');
      setFormError('root', { message: errorMessage });
      showToast.error('Erro ao recusar convite', errorMessage);
    } finally {
      setIsRejecting(false);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="w-full max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Token inválido</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isLoadingInvite) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando informações do convite...</p>
        </div>
      </div>
    );
  }

  if (inviteError || !invite) {
    const errorMessage = isApiError(inviteError)
      ? inviteError.response?.data?.message || 'Convite não encontrado ou inválido'
      : 'Convite não encontrado ou inválido';
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="w-full max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Link to="/login">
              <Button variant="outline">Voltar para login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (rejectSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Convite recusado</h2>
          <p className="text-muted-foreground">Você recusou o convite com sucesso.</p>
        </div>
      </div>
    );
  }

  const isLoggedIn = !!user;
  const needsPassword = !isLoggedIn;
  const expiresAt = new Date(invite.expiresAt);
  const isExpired = expiresAt < new Date();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            {invite.company.logo && isValidImageUrl(invite.company.logo) ? (
              <img
                src={invite.company.logo}
                alt={`Logo de ${invite.company.name}`}
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              <Building2 className="h-8 w-8 text-primary" />
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Convite para {invite.company.name}</h1>
          <p className="text-muted-foreground">
            Você foi convidado para se juntar a esta empresa
          </p>
        </div>

        <div className="bg-card border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{invite.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Papel:</span>
            <span className="font-medium capitalize">{invite.role.toLowerCase()}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Expira em:</span>
            <span className="font-medium">{expiresAt.toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        {isExpired ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Este convite expirou.</AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.root && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.root.message}</AlertDescription>
              </Alert>
            )}

            {needsPassword && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome (opcional)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  {...register('name')}
                  className="h-11"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
            )}

            {needsPassword && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  {...register('password')}
                  className="h-11"
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleReject}
                disabled={isRejecting || isSubmitting}
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recusando...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Recusar
                  </>
                )}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || isRejecting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Aceitando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Aceitar
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {!isLoggedIn && (
          <div className="text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Fazer login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
