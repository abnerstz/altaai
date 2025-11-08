import { Invite } from '../../services/invite.service';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Mail, Calendar, Trash2 } from 'lucide-react';

interface InviteListProps {
  invites: Invite[];
  onRemove: (inviteId: string) => void;
}

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'OWNER':
      return 'default' as const;
    case 'ADMIN':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
};

export default function InviteList({ invites, onRemove }: InviteListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Convites Pendentes
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {invites.length === 0 ? (
          <div className="py-8 text-center">
            <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">Nenhum convite pendente</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {invites.map((invite) => (
              <Card
                key={invite.id}
                className="relative hover:shadow-md transition-shadow group"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate mb-1">{invite.email}</div>
                      <Badge variant={getRoleBadgeVariant(invite.role)} className="text-xs h-5 mb-1.5">
                        {invite.role}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Expira {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja cancelar este convite?')) {
                          onRemove(invite.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

