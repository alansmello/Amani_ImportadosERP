import { ContextualLink } from "@/components/layout/contextual-link";
import { Edit3, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";

type SupplierActionsProps = {
  supplierId: string;
};

export function SupplierActions({ supplierId }: SupplierActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild variant="secondary" size="sm">
        <ContextualLink href={`/fornecedores/${supplierId}`}>
          <Eye className="h-4 w-4" aria-hidden />
          <span>Detalhes</span>
        </ContextualLink>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <ContextualLink href={`/fornecedores/${supplierId}/editar`}>
          <Edit3 className="h-4 w-4" aria-hidden />
          <span>Editar</span>
        </ContextualLink>
      </Button>
    </div>
  );
}
