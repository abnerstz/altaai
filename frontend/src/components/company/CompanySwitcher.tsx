import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCompanies } from '../../hooks/useCompanies';
import { isValidImageUrl } from '../../lib/utils';
import { showToast } from '../../lib/toast';
import { getErrorMessage } from '../../types/errors';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Building2, Check } from 'lucide-react';

export default function CompanySwitcher() {
  const { user } = useAuth();
  const { selectCompany } = useCompanies();
  const [isOpen, setIsOpen] = useState(false);

  const companies =
    user?.memberships?.map((m) => ({
      id: m.company.id,
      name: m.company.name,
      logo: m.company.logo,
    })) || [];

  const handleSelect = async (companyId: string) => {
    try {
      await selectCompany.mutateAsync(companyId);
      const selectedCompany = companies.find((c) => c.id === companyId);
      showToast.success('Empresa alterada', `Agora você está em ${selectedCompany?.name}`);
      setIsOpen(false);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Erro ao alterar empresa');
      showToast.error('Erro ao alterar empresa', errorMessage);
    }
  };

  const currentCompany = companies.find((c) => c.id === user?.activeCompanyId);

  if (!currentCompany || companies.length === 0) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 h-10 px-3"
          aria-label={`Empresa atual: ${currentCompany.name}`}
        >
          {currentCompany.logo && isValidImageUrl(currentCompany.logo) ? (
            <img
              src={currentCompany.logo}
              alt={`Logo de ${currentCompany.name}`}
              className="w-5 h-5 rounded"
            />
          ) : (
            <Building2 className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="font-medium">{currentCompany.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => handleSelect(company.id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            {company.logo && isValidImageUrl(company.logo) ? (
              <img
                src={company.logo}
                alt={`Logo de ${company.name}`}
                className="w-5 h-5 rounded"
              />
            ) : (
              <Building2 className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="flex-1">{company.name}</span>
            {company.id === user?.activeCompanyId && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

