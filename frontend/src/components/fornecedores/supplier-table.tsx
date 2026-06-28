import { Building2 } from "lucide-react";

import { SupplierActions } from "@/components/fornecedores/supplier-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import type { Supplier } from "@/types/supplier";

type SupplierTableProps = {
  suppliers: Supplier[];
};

export function SupplierTable({ suppliers }: SupplierTableProps) {
  return (
    <section aria-label="Fornecedores cadastrados">
      <div className="grid gap-3 desktop:hidden">
        {suppliers.map((supplier) => (
          <Card key={supplier.id}>
            <CardHeader className="pb-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-amani border border-border bg-surface-light text-primary">
                  <Building2 className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate leading-6">
                    {supplier.nome}
                  </CardTitle>
                  <p className="mt-1 break-words text-sm text-text-secondary">
                    {supplier.telefone?.trim() || "Nao informado"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <SupplierActions supplierId={supplier.id} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="hidden rounded-amani border border-border bg-surface desktop:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="w-52">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.nome}</TableCell>
                <TableCell className="break-words text-text-secondary">
                  {supplier.telefone?.trim() || "Nao informado"}
                </TableCell>
                <TableCell>
                  <SupplierActions supplierId={supplier.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
