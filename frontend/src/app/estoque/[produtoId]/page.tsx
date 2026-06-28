"use client";

import { useParams } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { useMemo, useState } from "react";

import { StockMovementDetail } from "@/components/estoque/stock-movement-detail";
import { StockMovementFilters } from "@/components/estoque/stock-movement-filters";
import { StockMovementList } from "@/components/estoque/stock-movement-list";
import { PageHeader } from "@/components/layout/page-header";
import { ContextualBackButton } from "@/components/layout/contextual-back-button";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { routes } from "@/config/routes";
import { useProducts } from "@/hooks/use-products";
import { useStockMovements } from "@/hooks/use-stock";
import type { Product } from "@/types/product";
import type { StockMovementFilters as StockMovementFiltersType } from "@/types/stock";

const EMPTY_PRODUCTS: Product[] = [];
const EMPTY_FILTERS: StockMovementFiltersType = {};
const MOVEMENT_LIMIT = 50;

export default function EstoqueProdutoPage() {
  const params = useParams<{ produtoId: string }>();
  const produtoId = params.produtoId;
  const [filters, setFilters] =
    useState<StockMovementFiltersType>(EMPTY_FILTERS);
  const queryFilters = useMemo(
    () => ({
      ...filters,
      limite: MOVEMENT_LIMIT
    }),
    [filters]
  );
  const movementsQuery = useStockMovements(produtoId, queryFilters);
  const productsQuery = useProducts();
  const products = productsQuery.data ?? EMPTY_PRODUCTS;
  const product = products.find((item) => item.id === produtoId);
  const isLoading = movementsQuery.isLoading || productsQuery.isLoading;
  const hasError = movementsQuery.isError || productsQuery.isError;

  function retryAll() {
    void movementsQuery.refetch();
    void productsQuery.refetch();
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Historico de estoque"
        description="Movimentacoes oficiais, origem e saldo atual do produto."
        actions={
          <ContextualBackButton fallbackHref={routes.estoque} />
        }
      />

      <StockMovementFilters
        filters={filters}
        disabled={isLoading}
        onApply={setFilters}
        onClear={() => setFilters(EMPTY_FILTERS)}
      />

      {isLoading ? (
        <LoadingState
          title="Carregando historico"
          description="Aguarde enquanto o saldo e as movimentacoes oficiais sao carregados."
        />
      ) : null}

      {!isLoading && hasError ? (
        <ErrorState
          title="Nao foi possivel carregar o historico"
          description="O produto pode nao existir ou a API de estoque pode estar indisponivel."
          onRetry={retryAll}
        />
      ) : null}

      {!isLoading && !hasError && !movementsQuery.data ? (
        <EmptyState
          title="Produto nao encontrado"
          description="Volte para a lista e selecione um produto disponivel."
          badgeLabel="Nao encontrado"
          variant="empty"
          icon={<PackageSearch className="h-5 w-5" aria-hidden />}
        />
      ) : null}

      {!isLoading && !hasError && movementsQuery.data ? (
        <section className="space-y-4">
          <StockMovementDetail
            history={movementsQuery.data}
            product={product}
          />

          {movementsQuery.data.movimentacoes.length === 0 ? (
            <EmptyState
              title="Sem movimentacoes"
              description="Nao ha movimentacoes oficiais para os filtros atuais."
              badgeLabel="Historico vazio"
              variant="empty"
              icon={<PackageSearch className="h-5 w-5" aria-hidden />}
            />
          ) : (
            <StockMovementList
              movements={movementsQuery.data.movimentacoes}
              totalMovements={movementsQuery.data.totalMovimentacoes}
            />
          )}
        </section>
      ) : null}
    </main>
  );
}
