import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCompanies } from '../../hooks/useCompanies';
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
import { Skeleton } from '../../components/ui/skeleton';
import {
  Building2,
  Plus,
  Users,
  ArrowRight,
  Sparkles,
  Briefcase,
} from 'lucide-react';

export default function DashboardPage() {
  const [page] = useState(1);
  const { companies, isLoading } = useCompanies(page, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Minhas Empresas
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas empresas e equipes em um só lugar
            </p>
          </div>
          <Link to="/companies/new">
            <Button size="lg" className="gap-2 shadow-lg">
              <Briefcase className="h-5 w-5" />
              Nova Empresa
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader>
                  <Skeleton className="h-16 w-16 rounded-lg mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-4">
              <div className="rounded-full bg-primary/10 p-6 mb-4">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Nenhuma empresa ainda
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                Comece criando sua primeira empresa para gerenciar sua equipe e
                projetos
              </p>
              <Link to="/companies/new">
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Criar Primeira Empresa
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company, index) => (
              <Card
                key={company.id}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20 overflow-hidden"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <CardHeader className="relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-start gap-4">
                    {company.logo && isValidImageUrl(company.logo) ? (
                      <div className="relative">
                        <img
                          src={company.logo}
                          alt={`Logo de ${company.name}`}
                          className="w-16 h-16 rounded-xl object-cover border-2 p-2 border-border shadow-md"
                        />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Sparkles className="h-3 w-3 text-primary-foreground" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-border">
                        <Building2 className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl mb-1 line-clamp-1">
                        {company.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {company._count?.memberships || 0} membro
                        {(company._count?.memberships || 0) !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link to={`/companies/${company.id}`}>
                    <Button
                      variant="outline"
                      className="w-full group/btn gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      Ver Detalhes
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

