"use client";

import { Eraser, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import type { ExpenseFilters } from "@/types/expense";
import type { ExpenseCategory } from "@/types/expense-category";

type ExpenseFiltersProps = {
  filters: ExpenseFilters;
  categories: ExpenseCategory[];
  onFiltersChange: (filters: ExpenseFilters) => void;
  onClear: () => void;
  disabled?: boolean;
  hasActiveFilters?: boolean;
};

const fieldLabelClassName = "text-sm font-medium text-text-primary";
const selectClassName =
  "flex h-11 w-full rounded-amani border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

export function ExpenseFiltersPanel({
  filters,
  categories,
  onFiltersChange,
  onClear,
  disabled = false,
  hasActiveFilters = false
}: ExpenseFiltersProps) {
  function updateFilter(field: keyof ExpenseFilters, value: string) {
    onFiltersChange({
      ...filters,
      [field]: value || undefined
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-[1fr_1fr_1.3fr_auto] desktop:items-end">
        <div className="grid gap-2">
          <label className={fieldLabelClassName} htmlFor="expense-filter-start">
            Inicio
          </label>
          <Input
            id="expense-filter-start"
            type="date"
            value={filters.dataInicio ?? ""}
            onChange={(event) => updateFilter("dataInicio", event.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="grid gap-2">
          <label className={fieldLabelClassName} htmlFor="expense-filter-end">
            Fim
          </label>
          <Input
            id="expense-filter-end"
            type="date"
            value={filters.dataFim ?? ""}
            onChange={(event) => updateFilter("dataFim", event.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="grid gap-2">
          <label
            className={fieldLabelClassName}
            htmlFor="expense-filter-category"
          >
            Categoria
          </label>
          <select
            id="expense-filter-category"
            className={cn(selectClassName)}
            value={filters.categoriaId ?? ""}
            onChange={(event) => updateFilter("categoriaId", event.target.value)}
            disabled={disabled}
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2 tablet:col-span-2 desktop:col-span-1">
          <Button
            type="button"
            variant={hasActiveFilters ? "secondary" : "ghost"}
            onClick={onClear}
            disabled={disabled || !hasActiveFilters}
            className="w-full"
          >
            {hasActiveFilters ? (
              <Eraser className="h-4 w-4" aria-hidden />
            ) : (
              <Search className="h-4 w-4" aria-hidden />
            )}
            <span>{hasActiveFilters ? "Limpar filtros" : "Sem filtros"}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
