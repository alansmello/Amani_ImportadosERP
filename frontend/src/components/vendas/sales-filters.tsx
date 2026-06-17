"use client";

import { Filter, RotateCcw, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import type { Customer } from "@/types/customer";
import type { SaleFilters } from "@/types/sale";

type SalesFiltersProps = {
  filters: SaleFilters;
  customers: Customer[];
  disabled?: boolean;
  onApply: (filters: SaleFilters) => void;
  onClear: () => void;
};

const fieldLabelClassName = "text-sm font-medium text-text-primary";
const selectClassName =
  "flex h-11 w-full rounded-amani border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

export function SalesFilters({
  filters,
  customers,
  disabled = false,
  onApply,
  onClear
}: SalesFiltersProps) {
  const [draft, setDraft] = useState<SaleFilters>(filters);

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  function updateField(field: keyof SaleFilters, value: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value || undefined
    }));
  }

  function submitFilters() {
    onApply({
      dataInicio: draft.dataInicio || undefined,
      dataFim: draft.dataFim || undefined,
      clienteId: draft.clienteId || undefined
    });
  }

  function clearFilters() {
    setDraft({});
    onClear();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-amani border border-border bg-surface-light text-primary">
            <Filter className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <CardTitle>Filtros</CardTitle>
            <CardDescription className="mt-1">
              Periodo e cliente consultam a API diretamente.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-4 tablet:grid-cols-2 desktop:grid-cols-[repeat(3,minmax(0,1fr))_auto] desktop:items-end">
        <div className="grid gap-2">
          <label className={fieldLabelClassName} htmlFor="sale-start-date">
            Data inicial
          </label>
          <Input
            id="sale-start-date"
            type="date"
            value={draft.dataInicio ?? ""}
            onChange={(event) => updateField("dataInicio", event.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="grid gap-2">
          <label className={fieldLabelClassName} htmlFor="sale-end-date">
            Data final
          </label>
          <Input
            id="sale-end-date"
            type="date"
            value={draft.dataFim ?? ""}
            onChange={(event) => updateField("dataFim", event.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="grid gap-2">
          <label className={fieldLabelClassName} htmlFor="sale-customer">
            Cliente
          </label>
          <select
            id="sale-customer"
            className={cn(selectClassName)}
            value={draft.clienteId ?? ""}
            onChange={(event) => updateField("clienteId", event.target.value)}
            disabled={disabled}
          >
            <option value="">Todos</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2 tablet:col-span-2 tablet:grid-cols-2 desktop:col-span-1 desktop:grid-cols-1">
          <Button type="button" onClick={submitFilters} disabled={disabled}>
            <Search className="h-4 w-4" aria-hidden />
            <span>Aplicar</span>
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={clearFilters}
            disabled={disabled}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            <span>Limpar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
