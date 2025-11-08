import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { signupSchema, SignupFormData } from '../../lib/schemas';
import { getErrorMessage } from '../../types/errors';
import { showToast } from '../../lib/toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Building2, User, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signup.mutateAsync(data);
      showToast.success('Conta criada com sucesso!', 'Bem-vindo à plataforma');
      navigate('/');
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Erro ao criar conta');
      setFormError('root', { message: errorMessage });
      showToast.error('Erro ao criar conta', errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
          >
            <Building2 className="h-8 w-8 text-primary" />
            Altaa.ai
          </Link>
          <p className="text-muted-foreground mt-2">
            Crie sua conta e comece a gerenciar suas empresas
          </p>
        </div>

        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-center mb-2">
              <div className="rounded-full bg-primary/10 p-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Criar Conta</CardTitle>
            <CardDescription className="text-center">
              Cadastre-se para começar a usar a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errors.root && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {errors.root.message}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  {...register('name')}
                  className="h-11"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...register('email')}
                  className="h-11"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Senha
                </Label>
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
              <Button
                type="submit"
                className="w-full h-11 gap-2 shadow-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  'Criando conta...'
                ) : (
                  <>
                    Criar Conta
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              <div className="text-center text-sm pt-2">
                <span className="text-muted-foreground">Já tem uma conta? </span>
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Faça login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

