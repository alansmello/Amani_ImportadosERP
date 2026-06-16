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
import type { PurchaseFilters } from "@/types/purchase";
import type { Supplier } from "@/types/supplier";

type PurchaseFiltersProps = {
  filters: PurchaseFilters;
  suppliers: Supplier[];
  disabled?: boolean;
  onApply: (filters: PurchaseFilters) => void;
  onClear: () => void;
};

const fieldLabelClassName = "text-sm font-medium text-text-primary";
const fieldHelpClassName = "text-xs leading-5 text-text-secondary";
const selectClassName =
  "flex h-11 w-full rounded-amani border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

export function PurchaseFilters({
  filters,
  suppliers,
  disabled = false,
  onApply,
  onClear
}: PurchaseFiltersProps) {
  const [draft, setDraft] = useState<PurchaseFilters>(filters);

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  function updateField(field: keyof PurchaseFilters, value: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value || undefined
    }));
  }

  function submitFilters() {
    onApply({
      dataInicio: draft.dataInicio || undefined,
      dataFim: draft.dataFim || undefined,
      fornecedorId: draft.fornecedorId || undefined,
      status: draft.status || undefined
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
              Periodo e fornecedor consultam a API; status e aplicado na leitura
              da tela.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 desktop:grid-cols-[repeat(4,minmax(0,1fr))_auto] desktop:items-end">
        <div className="grid gap-2">
          <label className={fieldLabelClassName} htmlFor="purchase-start-date">
            Data inicial
          </label>
          <Input
            id="purchase-start-date"
            type="date"
            value={draft.dataInicio ?? ""}
            onChange={(event) => updateField("dataInicio", event.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="grid gap-2">
          <label className={fieldLabelClassName} htmlFor="purchase-end-date">
            Data final
          </label>
          <Input
            id="purchase-end-date"
            type="date"
            value={draft.dataFim ?? ""}
            onChange={(event) => updateField("dataFim", event.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="grid gap-2">
          <label className={fieldLabelClassName} htmlFor="purchase-supplier">
            Fornecedor
          </label>
          <select
            id="purchase-supplier"
            className={cn(selectClassName)}
            value={draft.fornecedorId ?? ""}
            onChange={(event) =>
              updateField("fornecedorId", event.target.value)
            }
            disabled={disabled}
          >
            <option value="">Todos</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label className={fieldLabelClassName} htmlFor="purchase-status">
            Situacao
          </label>
          <select
            id="purchase-status"
            className={cn(selectClassName)}
            value={draft.status ?? ""}
            onChange={(event) => updateField("status", event.target.value)}
            disabled={disabled}
          >
            <option value="">Todas</option>
            <option value="EmTransito">Em transito</option>
            <option value="ParcialmenteRecebida">Parcial</option>
            <option value="Recebida">Recebida</option>
            <option value="Finalizada">Finalizada</option>
            <option value="ComPerda">Com perda</option>
          </select>
          <p className={fieldHelpClassName}>Aplicado localmente quando usado.</p>
        </div>

        <div className="flex flex-col gap-2 tablet:flex-row desktop:flex-col">
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
