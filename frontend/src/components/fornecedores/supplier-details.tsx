import { Building2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import type { Supplier } from "@/types/supplier";

type SupplierDetailsProps = {
  supplier: Supplier;
};

export function SupplierDetails({ supplier }: SupplierDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-amani border border-border bg-surface-light text-primary">
            <Building2 className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <CardTitle className="leading-6">{supplier.nome}</CardTitle>
            <CardDescription className="mt-2 break-words">
              {supplier.telefone?.trim() || "Nao informado"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 tablet:grid-cols-2">
          <div className="rounded-amani border border-border bg-surface-light p-4">
            <dt className="text-xs font-medium uppercase tracking-normal text-text-secondary">
              Nome
            </dt>
            <dd className="mt-2 text-lg font-semibold text-text-primary">
              {supplier.nome}
            </dd>
          </div>

          <div className="rounded-amani border border-border bg-surface-light p-4">
            <dt className="text-xs font-medium uppercase tracking-normal text-text-secondary">
              Telefone
            </dt>
            <dd className="mt-2 break-words text-sm font-medium text-text-primary">
              {supplier.telefone?.trim() || "Nao informado"}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
