import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { loginSchema, LoginFormData } from '../../lib/schemas';
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
import { Building2, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login.mutateAsync(data);
      showToast.success('Login realizado com sucesso!', 'Bem-vindo de volta');
      navigate('/');
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Erro ao fazer login');
      setFormError('root', { message: errorMessage });
      showToast.error('Erro ao fazer login', errorMessage);
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
            Plataforma Multi-Tenant para gerenciar suas empresas
          </p>
        </div>

        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-center mb-2">
              <div className="rounded-full bg-primary/10 p-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Bem-vindo de volta</CardTitle>
            <CardDescription className="text-center">
              Entre na sua conta para continuar
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
                  placeholder="••••••••"
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
                  'Entrando...'
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              <div className="text-center text-sm pt-2">
                <span className="text-muted-foreground">Não tem uma conta? </span>
                <Link
                  to="/signup"
                  className="text-primary hover:underline font-medium"
                >
                  Cadastre-se
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

