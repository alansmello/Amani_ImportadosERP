"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";

import { SalesFilters } from "@/components/vendas/sales-filters";
import { SalesList } from "@/components/vendas/sales-list";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { vendasNova } from "@/config/routes";
import { useCustomers } from "@/hooks/use-customers";
import { useSales } from "@/hooks/use-sales";
import type { Customer } from "@/types/customer";
import type { SaleFilters } from "@/types/sale";

const EMPTY_FILTERS: SaleFilters = {};
const EMPTY_CUSTOMERS: Customer[] = [];

function hasActiveFilters(filters: SaleFilters) {
  return Boolean(filters.dataInicio || filters.dataFim || filters.clienteId);
}

export default function VendasPage() {
  const [filters, setFilters] = useState<SaleFilters>(EMPTY_FILTERS);
  const customersQuery = useCustomers();
  const salesQuery = useSales(filters);

  const customers = customersQuery.data ?? EMPTY_CUSTOMERS;
  const usingFilters = hasActiveFilters(filters);

  const isLoading = customersQuery.isLoading || salesQuery.isLoading;
  const hasError = customersQuery.isError || salesQuery.isError;

  function retryAll() {
    void customersQuery.refetch();
    void salesQuery.refetch();
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Vendas"
        description="Consulte vendas por periodo e cliente, abra detalhes e registre uma nova venda."
        actions={
          <Button asChild>
            <Link href={vendasNova()}>
              <Plus className="h-4 w-4" aria-hidden />
              <span>Nova venda</span>
            </Link>
          </Button>
        }
      />

      <SalesFilters
        filters={filters}
        customers={customers}
        disabled={isLoading}
        onApply={setFilters}
        onClear={() => setFilters(EMPTY_FILTERS)}
      />

      {isLoading ? (
        <LoadingState
          title="Carregando vendas"
          description="Aguarde enquanto vendas e clientes sao carregados."
        />
      ) : null}

      {!isLoading && hasError ? (
        <ErrorState
          title="Nao foi possivel carregar vendas"
          description="Verifique a API de vendas e tente novamente."
          onRetry={retryAll}
        />
      ) : null}

      {!isLoading && !hasError ? (
        <SalesList
          sales={salesQuery.data ?? []}
          customers={customers}
          usingFilters={usingFilters}
        />
      ) : null}
    </main>
  );
}
