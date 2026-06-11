import Link from "next/link";
import { Edit3, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";

type CustomerActionsProps = {
  customerId: string;
  showDetails?: boolean;
};

export function CustomerActions({
  customerId,
  showDetails = true
}: CustomerActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {showDetails ? (
        <Button asChild variant="secondary" size="sm">
          <Link href={`/clientes/${customerId}`}>
            <Eye className="h-4 w-4" aria-hidden />
            <span>Detalhes</span>
          </Link>
        </Button>
      ) : null}
      <Button asChild variant="ghost" size="sm">
        <Link href={`/clientes/${customerId}/editar`}>
          <Edit3 className="h-4 w-4" aria-hidden />
          <span>Editar</span>
        </Link>
      </Button>
    </div>
  );
}
