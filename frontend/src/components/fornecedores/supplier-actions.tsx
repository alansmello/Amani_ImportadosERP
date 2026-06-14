import Link from "next/link";
import { Edit3, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";

type SupplierActionsProps = {
  supplierId: string;
};

export function SupplierActions({ supplierId }: SupplierActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild variant="secondary" size="sm">
        <Link href={`/fornecedores/${supplierId}`}>
          <Eye className="h-4 w-4" aria-hidden />
          <span>Detalhes</span>
        </Link>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link href={`/fornecedores/${supplierId}/editar`}>
          <Edit3 className="h-4 w-4" aria-hidden />
          <span>Editar</span>
        </Link>
      </Button>
    </div>
  );
}
