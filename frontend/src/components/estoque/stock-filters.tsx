"use client";

import { RotateCcw, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { StockListFilters } from "@/types/stock";

type StockFiltersProps = {
  filters: StockListFilters;
  disabled?: boolean;
  onChange: (filters: StockListFilters) => void;
  onClear: () => void;
};

function countActiveFilters(filters: StockListFilters) {
  return Number(Boolean(filters.busca?.trim())) + Number(filters.somenteComSaldo);
}

export function StockFilters({
  filters,
  disabled = false,
  onChange,
  onClear
}: StockFiltersProps) {
  const activeFilterCount = countActiveFilters(filters);

  function updateFilters(nextFilters: StockListFilters) {
    onChange({
      busca: nextFilters.busca?.trim() ? nextFilters.busca : undefined,
      somenteComSaldo: nextFilters.somenteComSaldo || undefined
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Filtros</CardTitle>
          <Badge variant={activeFilterCount > 0 ? "accent" : "neutral"}>
            {activeFilterCount} ativos
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-4 tablet:grid-cols-[minmax(0,1fr)_auto] tablet:items-end">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-primary" htmlFor="stock-search">
            Busca
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
              aria-hidden
            />
            <Input
              id="stock-search"
              value={filters.busca ?? ""}
              onChange={(event) =>
                updateFilters({ ...filters, busca: event.target.value })
              }
              placeholder="Nome do produto"
              className="pl-10"
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid gap-3 tablet:min-w-56">
          <label className="flex h-11 items-center gap-3 rounded-amani border border-border bg-surface px-3 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={Boolean(filters.somenteComSaldo)}
              onChange={(event) =>
                updateFilters({
                  ...filters,
                  somenteComSaldo: event.target.checked
                })
              }
              disabled={disabled}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span>Somente com saldo</span>
          </label>

          <Button
            type="button"
            variant="secondary"
            onClick={onClear}
            disabled={disabled || activeFilterCount === 0}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            <span>Limpar filtros</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
