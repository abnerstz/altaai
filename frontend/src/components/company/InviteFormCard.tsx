import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { UserPlus, X } from 'lucide-react';
import InviteForm from '../invite/InviteForm';

interface InviteFormCardProps {
  companyId: string;
  onSuccess: () => void;
}

export default function InviteFormCard({ companyId, onSuccess }: InviteFormCardProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Novo Convite</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Convide novos membros para sua empresa
            </CardDescription>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? 'outline' : 'default'}
            size="sm"
            className="gap-1.5 h-8"
          >
            {showForm ? (
              <>
                <X className="h-3.5 w-3.5" />
                Cancelar
              </>
            ) : (
              <>
                <UserPlus className="h-3.5 w-3.5" />
                Novo
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {showForm && (
        <CardContent className="pt-0 border-t">
          <div className="pt-3">
            <InviteForm
              companyId={companyId}
              onSuccess={() => {
                setShowForm(false);
                onSuccess();
              }}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}

