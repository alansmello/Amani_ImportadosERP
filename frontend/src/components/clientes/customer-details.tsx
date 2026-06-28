import { Mail, Phone, User, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import type { Customer } from "@/types/customer";

type CustomerStatusBadgeProps = {
  active: boolean;
};

type CustomerDetailsProps = {
  customer: Customer;
};

function formatOptional(value: string | null) {
  const normalizedValue = value?.trim();

  return normalizedValue ? normalizedValue : "Nao informado";
}

export function CustomerStatusBadge({ active }: CustomerStatusBadgeProps) {
  return (
    <Badge variant={active ? "success" : "neutral"}>
      {active ? "Ativo" : "Inativo"}
    </Badge>
  );
}

export function CustomerDetails({ customer }: CustomerDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-amani border border-border bg-surface-light text-primary">
            <Users className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <CardTitle className="leading-6">{customer.nome}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 tablet:grid-cols-2">
          <div className="rounded-amani border border-border bg-surface-light p-4">
            <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-normal text-text-secondary">
              <User className="h-4 w-4" aria-hidden />
              <span>Nome</span>
            </dt>
            <dd className="mt-2 break-words text-sm font-medium text-text-primary">
              {customer.nome}
            </dd>
          </div>

          <div className="rounded-amani border border-border bg-surface-light p-4">
            <dt className="text-xs font-medium uppercase tracking-normal text-text-secondary">
              Status
            </dt>
            <dd className="mt-2">
              <CustomerStatusBadge active={customer.ativo} />
            </dd>
          </div>

          <div className="rounded-amani border border-border bg-surface-light p-4">
            <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-normal text-text-secondary">
              <Mail className="h-4 w-4" aria-hidden />
              <span>Email</span>
            </dt>
            <dd className="mt-2 break-words text-sm font-medium text-text-primary">
              {formatOptional(customer.email)}
            </dd>
          </div>

          <div className="rounded-amani border border-border bg-surface-light p-4">
            <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-normal text-text-secondary">
              <Phone className="h-4 w-4" aria-hidden />
              <span>Telefone</span>
            </dt>
            <dd className="mt-2 break-words text-sm font-medium text-text-primary">
              {formatOptional(customer.telefone)}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
