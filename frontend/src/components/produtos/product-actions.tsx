import Link from "next/link";
import { Edit3, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";

type ProductActionsProps = {
  productId: string;
};

export function ProductActions({ productId }: ProductActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild variant="secondary" size="sm">
        <Link href={`/produtos/${productId}`}>
          <Eye className="h-4 w-4" aria-hidden />
          <span>Detalhes</span>
        </Link>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link href={`/produtos/${productId}/editar`}>
          <Edit3 className="h-4 w-4" aria-hidden />
          <span>Editar</span>
        </Link>
      </Button>
    </div>
  );
}
