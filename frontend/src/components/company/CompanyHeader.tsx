import { Company } from '../../services/company.service';
import { isValidImageUrl } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { Building2, Users } from 'lucide-react';

interface CompanyHeaderProps {
  company: Company;
  memberCount: number;
}

export default function CompanyHeader({ company, memberCount }: CompanyHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {company.logo && isValidImageUrl(company.logo) ? (
        <img
          src={company.logo}
          alt={`Logo de ${company.name}`}
          className="w-12 h-12 rounded-lg p-2 object-cover border border-border"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-border flex-shrink-0">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-semibold truncate">{company.name}</h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground font-mono truncate">{company.slug}</p>
          <Badge variant="secondary" className="gap-1 text-xs h-5 px-1.5 font-normal">
            <Users className="h-3 w-3" />
            {memberCount}
          </Badge>
        </div>
      </div>
    </div>
  );
}

