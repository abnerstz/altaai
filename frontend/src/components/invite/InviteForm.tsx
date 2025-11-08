import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInvites } from '../../hooks/useInvites';
import { inviteSchema, InviteFormData } from '../../lib/schemas';
import { getErrorMessage } from '../../types/errors';
import { showToast } from '../../lib/toast';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Mail, Send } from 'lucide-react';

interface InviteFormProps {
  companyId: string;
  onSuccess: () => void;
}

export default function InviteForm({ companyId, onSuccess }: InviteFormProps) {
  const { createInvite } = useInvites();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: 'MEMBER',
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    try {
      await createInvite.mutateAsync({ companyId, data });
      reset();
      showToast.success('Convite enviado!', `Convite enviado para ${data.email}`);
      onSuccess();
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Erro ao criar convite');
      setFormError('root', { message: errorMessage });
      showToast.error('Erro ao enviar convite', errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errors.root && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {errors.root.message}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="novo@example.com"
          {...register('email')}
          className="h-11"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Papel</Label>
        <select
          id="role"
          {...register('role')}
          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="MEMBER">Membro</option>
          <option value="ADMIN">Admin</option>
          <option value="OWNER">Owner</option>
        </select>
        {errors.role && (
          <p className="text-sm text-destructive">{errors.role.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full h-11 gap-2" disabled={isSubmitting}>
        {isSubmitting ? (
          'Enviando...'
        ) : (
          <>
            <Send className="h-4 w-4" />
            Enviar Convite
          </>
        )}
      </Button>
    </form>
  );
}

