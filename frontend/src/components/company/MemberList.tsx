import { Membership } from '../../services/membership.service';
import { getDefaultAvatar, getUserInitials } from '../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Trash2, Users, Mail } from 'lucide-react';

interface MemberListProps {
  members: Membership[];
  currentUserId?: string;
  canManage: boolean;
  onRemove: (userId: string) => void;
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    OWNER: 'Proprietário',
    ADMIN: 'Administrador',
    MEMBER: 'Membro',
  };
  return labels[role] || role;
};

const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (role) {
    case 'OWNER':
      return 'default';
    case 'ADMIN':
      return 'secondary';
    default:
      return 'outline';
  }
};

export default function MemberList({
  members,
  currentUserId,
  canManage,
  onRemove,
}: MemberListProps) {
  if (members.length === 0) {
    return (
      <div className="py-12 text-center border rounded-lg bg-card">
        <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-sm text-muted-foreground">Nenhum membro encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {members.map((member) => (
        <Card
          key={member.id}
          className="relative hover:shadow-md transition-all duration-200 group"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={member.user.avatar || getDefaultAvatar(member.user.name, member.user.email)}
                    alt={member.user.name}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {getUserInitials(member.user.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold truncate">
                    {member.user.name}
                  </h3>
                  {member.userId === currentUserId && (
                    <Badge variant="outline" className="text-xs h-5 px-1.5 shrink-0">
                      Você
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{member.user.email}</span>
                </div>

                <div>
                  <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs">
                    {getRoleLabel(member.role)}
                  </Badge>
                </div>
              </div>

              {canManage && member.userId !== currentUserId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja remover este membro?')) {
                      onRemove(member.userId);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

