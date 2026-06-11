import { Mail, Phone, Users } from "lucide-react";

import { CustomerActions } from "@/components/clientes/customer-actions";
import { CustomerStatusBadge } from "@/components/clientes/customer-details";
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
import type { Customer } from "@/types/customer";

type CustomerTableProps = {
  customers: Customer[];
};

function formatOptional(value: string | null) {
  const normalizedValue = value?.trim();

  return normalizedValue ? normalizedValue : "Nao informado";
}

export function CustomerTable({ customers }: CustomerTableProps) {
  return (
    <section aria-label="Clientes cadastrados">
      <div className="grid gap-3 desktop:hidden">
        {customers.map((customer) => (
          <Card key={customer.id}>
            <CardHeader className="pb-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-amani border border-border bg-surface-light text-primary">
                  <Users className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate leading-6">
                    {customer.nome}
                  </CardTitle>
                  <div className="mt-2">
                    <CustomerStatusBadge active={customer.ativo} />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <dt className="flex items-center gap-2 text-text-secondary">
                    <Mail className="h-4 w-4 shrink-0" aria-hidden />
                    <span>Email</span>
                  </dt>
                  <dd className="min-w-0 break-words text-right text-text-primary">
                    {formatOptional(customer.email)}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="flex items-center gap-2 text-text-secondary">
                    <Phone className="h-4 w-4 shrink-0" aria-hidden />
                    <span>Telefone</span>
                  </dt>
                  <dd className="min-w-0 break-words text-right text-text-primary">
                    {formatOptional(customer.telefone)}
                  </dd>
                </div>
              </dl>
              <CustomerActions customerId={customer.id} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="hidden rounded-amani border border-border bg-surface desktop:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-52">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.nome}</TableCell>
                <TableCell>{formatOptional(customer.email)}</TableCell>
                <TableCell>{formatOptional(customer.telefone)}</TableCell>
                <TableCell>
                  <CustomerStatusBadge active={customer.ativo} />
                </TableCell>
                <TableCell>
                  <CustomerActions customerId={customer.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
