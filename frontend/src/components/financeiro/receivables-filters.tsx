"use client";

import { Filter, RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import type { ReceivableFilters, ReceivableStatus } from "@/types/receivable";

type ReceivablesFiltersProps = {
  filters: ReceivableFilters;
  onFiltersChange: (filters: ReceivableFilters) => void;
  onClear: () => void;
};

const fieldLabelClassName = "text-sm font-medium text-text-primary";
const selectClassName =
  "flex h-11 w-full rounded-amani border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

const STATUS_OPTIONS: { value: "" | ReceivableStatus; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "Pendente", label: "Pendente" },
  { value: "Pago", label: "Pago" }
];

export function ReceivablesFilters({
  filters,
  onFiltersChange,
  onClear
}: ReceivablesFiltersProps) {
  const hasActiveFilters = Boolean(filters.status || filters.search?.trim());

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-amani border border-border bg-surface-light text-primary">
            <Filter className="h-5 w-5" aria-hidden />
          </div>
          <CardTitle>Filtros</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 tablet:grid-cols-[1fr_1fr_auto]">
        <div className="grid gap-2">
          <label className={fieldLabelClassName} htmlFor="receivables-status">
            Status
          </label>
          <select
            id="receivables-status"
            className={cn(selectClassName)}
            value={filters.status ?? ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                status: (e.target.value as "" | ReceivableStatus) || undefined
              })
            }
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label className={fieldLabelClassName} htmlFor="receivables-search">
            Busca por cliente
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
              aria-hidden
            />
            <Input
              id="receivables-search"
              type="search"
              placeholder="Nome do cliente..."
              className="pl-9"
              value={filters.search ?? ""}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex items-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onClear}
            disabled={!hasActiveFilters}
            className="w-full tablet:w-auto"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            <span>Limpar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
