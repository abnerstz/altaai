import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCompany } from '../../hooks/useCompany';
import { useMemberships } from '../../hooks/useMemberships';
import { useInvites } from '../../hooks/useInvites';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../types/errors';
import { showToast } from '../../lib/toast';
import Header from '../../components/layout/Header';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import CompanyHeader from '../../components/company/CompanyHeader';
import MemberList from '../../components/company/MemberList';
import InviteList from '../../components/company/InviteList';
import InviteFormCard from '../../components/company/InviteFormCard';
import { ArrowLeft, Building2, Users, Mail } from 'lucide-react';

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const companyQuery = useCompany(id);
  const { memberships, removeMember } = useMemberships(id);
  const { invites, deleteInvite } = useInvites(id);
  const [activeTab, setActiveTab] = useState('members');

  const company = companyQuery.data;
  const isLoading = companyQuery.isLoading;
  const members = memberships;

  const currentMembership = members.find((m) => m.userId === user?.id);
  const canManage = currentMembership?.role === 'OWNER' || currentMembership?.role === 'ADMIN';

  const handleRemoveMember = async (userId: string) => {
    if (!id) return;
    try {
      await removeMember.mutateAsync({ companyId: id, userId });
      showToast.success('Membro removido', 'O membro foi removido da empresa');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Erro ao remover membro');
      showToast.error('Erro ao remover membro', errorMessage);
    }
  };

  const handleRemoveInvite = async (inviteId: string) => {
    try {
      await deleteInvite.mutateAsync(inviteId);
      showToast.success('Convite cancelado', 'O convite foi cancelado com sucesso');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Erro ao cancelar convite');
      showToast.error('Erro ao cancelar convite', errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-4 max-w-5xl">
          <Skeleton className="h-7 w-16 mb-4" />
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
          <Card>
            <CardContent className="p-3">
              <div className="space-y-1.5">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-md" />
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="mb-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-1.5 h-8">
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground mb-3">Empresa não encontrada</p>
              <Link to="/">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Voltar ao Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="mb-3">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar
            </Button>
          </Link>
        </div>

        <CompanyHeader company={company} memberCount={members.length} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-3 h-9">
            <TabsTrigger value="members" className="gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Membros</span>
              <span className="ml-1 text-[10px]">({members.length})</span>
            </TabsTrigger>
            {canManage && (
              <TabsTrigger value="invites" className="gap-1.5 text-xs">
                <Mail className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Convites</span>
                <span className="ml-1 text-[10px]">({invites.length})</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="members" className="mt-0">
            <MemberList
              members={members}
              currentUserId={user?.id}
              canManage={canManage}
              onRemove={handleRemoveMember}
            />
          </TabsContent>

          {canManage && (
            <TabsContent value="invites" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-[0.5fr_1fr] gap-3">
                <InviteFormCard companyId={id!} onSuccess={() => {}} />
                <InviteList invites={invites} onRemove={handleRemoveInvite} />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}

