import { useState } from 'react';
import { useInvites } from '../../hooks/useInvites';
import { isValidImageUrl } from '../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Building2, Bell, Calendar, Mail } from 'lucide-react';

export default function InviteNotifications() {
  const { myPendingInvites, isLoadingMyPending } = useInvites();
  const [isOpen, setIsOpen] = useState(false);

  const inviteCount = myPendingInvites.length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {inviteCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center">
              {inviteCount > 9 ? '9+' : inviteCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-0">
        <div className="px-3 py-2.5 border-b">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Convites Pendentes</span>
            {inviteCount > 0 && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                {inviteCount}
              </Badge>
            )}
          </div>
        </div>
        <div className="max-h-[360px] overflow-y-auto">
          {isLoadingMyPending ? (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              Carregando...
            </div>
          ) : inviteCount === 0 ? (
            <div className="px-3 py-6 text-center">
              <Bell className="h-6 w-6 mx-auto mb-1.5 text-muted-foreground opacity-50" />
              <p className="text-xs text-muted-foreground">Nenhum convite pendente</p>
            </div>
          ) : (
            <div>
              {myPendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="px-3 py-3 hover:bg-accent transition-colors border-b last:border-b-0"
                >
                  <div className="flex items-start gap-2.5">
                    {invite.company.logo && isValidImageUrl(invite.company.logo) ? (
                      <img
                        src={invite.company.logo}
                        alt={`Logo de ${invite.company.name}`}
                        className="w-8 h-8 rounded object-cover p-1 border flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border flex-shrink-0">
                        <Building2 className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-medium truncate">
                          {invite.company.name}
                        </span>
                        <Badge variant="outline" className="text-[9px] h-3.5 px-1">
                          {invite.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2">
                        <Calendar className="h-2.5 w-2.5" />
                        <span>Expira {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-primary/5 border border-primary/10 rounded px-2 py-1.5">
                        <Mail className="h-3 w-3 text-primary" />
                        <span className="text-primary font-medium">
                          Verifique seu email para aceitar ou recusar
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

