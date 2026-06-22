"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { ReceivablesFilters } from "@/components/financeiro/receivables-filters";
import { ReceivablesList } from "@/components/financeiro/receivables-list";
import { ReceivablesByClient } from "@/components/financeiro/receivables-by-client";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useCustomers } from "@/hooks/use-customers";
import { useReceivables, useReceivablesByClient } from "@/hooks/use-receivables";
import { cn } from "@/lib/cn";
import { routes } from "@/config/routes";
import type { Customer } from "@/types/customer";
import type { ReceivableFilters, ReceivableListItem } from "@/types/receivable";

type Tab = "lista" | "por-cliente";

const EMPTY_RECEIVABLES: ReceivableListItem[] = [];
const EMPTY_CUSTOMERS: Customer[] = [];
const EMPTY_FILTERS: ReceivableFilters = {};

function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR");
}

function tabButtonClassName(active: boolean) {
  return cn(
    "px-4 py-2 text-sm font-medium transition-colors border-b-2",
    active
      ? "border-primary text-text-primary"
      : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
  );
}

export default function ContasReceberPage() {
  const [activeTab, setActiveTab] = useState<Tab>("lista");
  const [filters, setFilters] = useState<ReceivableFilters>(EMPTY_FILTERS);

  const receivablesQuery = useReceivables();
  const byClientQuery = useReceivablesByClient();
  const customersQuery = useCustomers("all");

  const receivables = receivablesQuery.data ?? EMPTY_RECEIVABLES;
  const customers = customersQuery.data ?? EMPTY_CUSTOMERS;

  const hasActiveFilters = Boolean(
    filters.status || filters.search?.trim()
  );

  const filteredReceivables = useMemo(() => {
    let result = receivables;

    if (filters.status) {
      result = result.filter((r) => r.status === filters.status);
    }

    if (filters.search?.trim()) {
      const search = normalizeSearch(filters.search);
      result = result.filter((r) => {
        if (!r.clienteId) return false;
        const customer = customers.find((c) => c.id === r.clienteId);
        const name = normalizeSearch(customer?.nome ?? r.clienteId);
        return name.includes(search);
      });
    }

    return result;
  }, [receivables, customers, filters]);

  function handleClearFilters() {
    setFilters(EMPTY_FILTERS);
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Contas a receber"
        description="Gerencie contas a receber, registre pagamentos e acompanhe saldos."
        actions={
          <Button asChild>
            <Link href={routes.contasReceberNova}>
              <Plus className="h-4 w-4" aria-hidden />
              <span>Nova conta</span>
            </Link>
          </Button>
        }
      />

      <div
        role="tablist"
        aria-label="Visualizações de contas a receber"
        className="flex overflow-x-auto border-b border-border scrollbar-none"
      >
        <button
          role="tab"
          type="button"
          className={tabButtonClassName(activeTab === "lista")}
          onClick={() => setActiveTab("lista")}
          aria-selected={activeTab === "lista"}
        >
          Lista
        </button>
        <button
          role="tab"
          type="button"
          className={tabButtonClassName(activeTab === "por-cliente")}
          onClick={() => setActiveTab("por-cliente")}
          aria-selected={activeTab === "por-cliente"}
        >
          Por Cliente
        </button>
      </div>

      {activeTab === "lista" ? (
        <div className="space-y-4">
          <ReceivablesFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClear={handleClearFilters}
          />
          <ReceivablesList
            receivables={filteredReceivables}
            customers={customers}
            isLoading={receivablesQuery.isLoading || customersQuery.isLoading}
            isError={receivablesQuery.isError || customersQuery.isError}
            onRetry={() => {
              if (receivablesQuery.isError) void receivablesQuery.refetch();
              if (customersQuery.isError) void customersQuery.refetch();
            }}
            usingFilters={hasActiveFilters}
          />
        </div>
      ) : (
        <ReceivablesByClient
          data={byClientQuery.data ?? []}
          isLoading={byClientQuery.isLoading}
          isError={byClientQuery.isError}
          onRetry={() => void byClientQuery.refetch()}
        />
      )}
    </main>
  );
}
