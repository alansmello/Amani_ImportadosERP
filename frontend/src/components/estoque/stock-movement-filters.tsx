"use client";

import { Filter, RotateCcw, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import type { StockMovementFilters } from "@/types/stock";

type StockMovementFiltersProps = {
  filters: StockMovementFilters;
  disabled?: boolean;
  onApply: (filters: StockMovementFilters) => void;
  onClear: () => void;
};

const selectClassName =
  "flex h-11 w-full rounded-amani border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

function normalizeFilters(filters: StockMovementFilters): StockMovementFilters {
  return {
    dataInicio: filters.dataInicio || undefined,
    dataFim: filters.dataFim || undefined,
    tipo: filters.tipo || undefined
  };
}

export function StockMovementFilters({
  filters,
  disabled = false,
  onApply,
  onClear
}: StockMovementFiltersProps) {
  const [draft, setDraft] = useState<StockMovementFilters>(filters);

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  function updateField(field: keyof StockMovementFilters, value: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value || undefined
    }));
  }

  function clearFilters() {
    setDraft({});
    onClear();
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-amani border border-border bg-surface-light text-primary">
            <Filter className="h-5 w-5" aria-hidden />
          </div>
          <CardTitle>Filtros do historico</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-4 tablet:grid-cols-2 desktop:grid-cols-[repeat(3,minmax(0,1fr))_auto] desktop:items-end">
        <div className="grid gap-2">
          <label
            className="text-sm font-medium text-text-primary"
            htmlFor="stock-movement-start-date"
          >
            Data inicial
          </label>
          <Input
            id="stock-movement-start-date"
            type="date"
            value={draft.dataInicio ?? ""}
            onChange={(event) => updateField("dataInicio", event.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="grid gap-2">
          <label
            className="text-sm font-medium text-text-primary"
            htmlFor="stock-movement-end-date"
          >
            Data final
          </label>
          <Input
            id="stock-movement-end-date"
            type="date"
            value={draft.dataFim ?? ""}
            onChange={(event) => updateField("dataFim", event.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="grid gap-2">
          <label
            className="text-sm font-medium text-text-primary"
            htmlFor="stock-movement-type"
          >
            Tipo
          </label>
          <select
            id="stock-movement-type"
            className={cn(selectClassName)}
            value={draft.tipo ?? ""}
            onChange={(event) => updateField("tipo", event.target.value)}
            disabled={disabled}
          >
            <option value="">Todos</option>
            <option value="Entrada">Entrada</option>
            <option value="Saida">Saida</option>
            <option value="InventarioInicial">Inventario inicial</option>
          </select>
        </div>

        <div className="grid gap-2 tablet:col-span-2 tablet:grid-cols-2 desktop:col-span-1 desktop:min-w-44 desktop:grid-cols-1">
          <Button
            type="button"
            onClick={() => onApply(normalizeFilters(draft))}
            disabled={disabled}
          >
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
