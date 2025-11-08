import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDefaultAvatar, getUserInitials } from '../../lib/utils';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Building2, LogOut } from 'lucide-react';
import CompanySwitcher from '../company/CompanySwitcher';
import InviteNotifications from '../invite/InviteNotifications';

export default function Header() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout.mutateAsync();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
          >
            <Building2 className="h-6 w-6 text-primary" />
            Altaa.ai
          </Link>

          <div className="flex items-center gap-2">
            {user && <InviteNotifications />}

            {user?.activeCompany && <CompanySwitcher />}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 h-auto py-2 px-3 hover:bg-accent"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage 
                      src={user?.avatar || getDefaultAvatar(user?.name, user?.email)} 
                      alt={user?.name} 
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getUserInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium leading-none">{user?.name || 'Usuário'}</span>
                    <span className="text-xs leading-none text-muted-foreground">{user?.email}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

