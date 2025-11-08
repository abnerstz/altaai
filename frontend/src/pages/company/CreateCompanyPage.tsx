import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCompanies } from '../../hooks/useCompanies';
import { createCompanySchema } from '../../lib/schemas';
import { getErrorMessage } from '../../types/errors';
import { showToast } from '../../lib/toast';
import { isValidImageUrl } from '../../lib/utils';
import Header from '../../components/layout/Header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Building2, Image, ArrowLeft, Sparkles } from 'lucide-react';

export default function CreateCompanyPage() {
  const navigate = useNavigate();
  const { createCompany } = useCompanies();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm({
    resolver: zodResolver(createCompanySchema),
  });

  const logoPreview = watch('logo') || '';


  const onSubmit = async (data: z.infer<typeof createCompanySchema>) => {
    try {
      await createCompany.mutateAsync({
        name: data.name,
        logo: data.logo || undefined,
      });
      showToast.success('Empresa criada com sucesso!', `A empresa ${data.name} foi criada`);
      navigate('/');
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Erro ao criar empresa');
      setFormError('root', { message: errorMessage });
      showToast.error('Erro ao criar empresa', errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-center mb-2">
              <div className="rounded-full bg-primary/10 p-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Criar Nova Empresa</CardTitle>
            <CardDescription className="text-center">
              Preencha os dados da sua empresa para começar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errors.root && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {errors.root.message}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Nome da Empresa
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ex: Minha Empresa"
                  {...register('name')}
                  className="h-11"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Logo (URL - opcional)
                </Label>
                <Input
                  id="logo"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  {...register('logo')}
                  className="h-11"
                  onChange={(e) => {
                    register('logo').onChange(e);
                  }}
                />
                {errors.logo && (
                  <p className="text-sm text-destructive">{errors.logo.message}</p>
                )}
                {logoPreview && typeof logoPreview === 'string' && isValidImageUrl(logoPreview) && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                    <img
                      src={logoPreview}
                      alt="Preview do logo"
                      className="w-20 h-20 rounded-lg object-cover border-2 border-border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-4 pt-2">
                <Button
                  type="submit"
                  className="flex-1 h-11 gap-2 shadow-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Criando...'
                  ) : (
                    <>
                      <Building2 className="h-4 w-4" />
                      Criar Empresa
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="h-11"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

