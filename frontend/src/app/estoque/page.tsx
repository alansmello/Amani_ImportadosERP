"use client";

import { Boxes, RotateCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { StockFilters } from "@/components/estoque/stock-filters";
import { StockList } from "@/components/estoque/stock-list";
import { StockSummary } from "@/components/estoque/stock-summary";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { useStockProducts } from "@/hooks/use-stock";
import type { StockListFilters, StockProduct } from "@/types/stock";

const EMPTY_FILTERS: StockListFilters = {};
const EMPTY_PRODUCTS: StockProduct[] = [];

function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR");
}

export default function EstoquePage() {
  const [filters, setFilters] = useState<StockListFilters>(EMPTY_FILTERS);
  const stockQuery = useStockProducts({});
  const products = stockQuery.data ?? EMPTY_PRODUCTS;
  const hasActiveFilters = Boolean(
    filters.busca?.trim() || filters.somenteComSaldo
  );

  const displayedProducts = useMemo(() => {
    const search = normalizeSearch(filters.busca ?? "");

    return products.filter((product) => {
      const matchesSearch = search
        ? [
            product.nome,
            product.codigo,
            product.categoriaNome,
            product.categoriaId,
            product.produtoId
          ]
            .filter(Boolean)
            .some((value) =>
              value?.toLocaleLowerCase("pt-BR").includes(search)
            )
        : true;

      const matchesBalance = filters.somenteComSaldo
        ? product.saldoAtual > 0
        : true;

      return matchesSearch && matchesBalance;
    });
  }, [filters.busca, filters.somenteComSaldo, products]);

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Estoque"
        description="Saldos oficiais, busca operacional e historico por produto."
      />

      <StockFilters
        filters={filters}
        disabled={stockQuery.isLoading}
        onChange={setFilters}
        onClear={clearFilters}
      />

      {stockQuery.isLoading ? (
        <LoadingState
          title="Carregando estoque"
          description="Aguarde enquanto os saldos oficiais sao carregados."
        />
      ) : null}

      {!stockQuery.isLoading && stockQuery.isError ? (
        <ErrorState
          title="Nao foi possivel carregar estoque"
          description="Verifique a API de estoque e tente novamente."
          onRetry={() => void stockQuery.refetch()}
        />
      ) : null}

      {!stockQuery.isLoading && !stockQuery.isError ? (
        <section className="space-y-4">
          <StockSummary products={displayedProducts} />

          {products.length === 0 ? (
            <EmptyState
              title="Nenhum produto em estoque"
              description="A fonte oficial nao retornou produtos para exibicao."
              badgeLabel="Sem produtos"
              variant="empty"
              icon={<Boxes className="h-5 w-5" aria-hidden />}
            />
          ) : displayedProducts.length === 0 && hasActiveFilters ? (
            <div className="space-y-3">
              <EmptyState
                title="Nenhum produto encontrado"
                description={`Nenhum saldo corresponde aos filtros atuais${
                  filters.busca ? ` para "${filters.busca}"` : ""
                }.`}
                badgeLabel="Filtros sem resultado"
                variant="empty"
                icon={<Search className="h-5 w-5" aria-hidden />}
              />
              <Button type="button" variant="secondary" onClick={clearFilters}>
                <RotateCcw className="h-4 w-4" aria-hidden />
                <span>Limpar filtros</span>
              </Button>
            </div>
          ) : (
            <StockList products={displayedProducts} />
          )}
        </section>
      ) : null}
    </main>
  );
}
