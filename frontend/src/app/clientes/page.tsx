"use client";

import { Plus, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { ContextualLink } from "@/components/layout/contextual-link";
import { CustomerTable } from "@/components/clientes/customer-table";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCustomers, useInactivateCustomer } from "@/hooks/use-customers";
import type { CustomerStatusFilter } from "@/types/customer";

const statusFilterOptions: Array<{
  value: CustomerStatusFilter;
  label: string;
}> = [
  { value: "active", label: "Ativos" },
  { value: "inactive", label: "Inativos" },
  { value: "all", label: "Todos" }
];

const emptyStateByFilter: Record<
  CustomerStatusFilter,
  {
    title: string;
    description: string;
    badgeLabel: string;
  }
> = {
  active: {
    title: "Nenhum cliente ativo",
    description: "Cadastre um cliente ou alterne o filtro para consultar inativos.",
    badgeLabel: "Sem ativos"
  },
  inactive: {
    title: "Nenhum cliente inativo",
    description: "Clientes inativados permanecerao disponiveis nesta visao.",
    badgeLabel: "Sem inativos"
  },
  all: {
    title: "Nenhum cliente cadastrado",
    description: "Cadastre o primeiro cliente para iniciar a gestao da carteira.",
    badgeLabel: "Sem clientes"
  }
};

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<CustomerStatusFilter>("active");
  const [inactivatingCustomerId, setInactivatingCustomerId] = useState<
    string | null
  >(null);
  const customersQuery = useCustomers(statusFilter);
  const inactivateCustomer = useInactivateCustomer();

  const customers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase("pt-BR");

    return (customersQuery.data ?? []).filter((customer) => {
      if (!normalizedSearch) {
        return true;
      }

      const searchableFields = [
        customer.nome,
        customer.email ?? "",
        customer.telefone ?? ""
      ];

      return searchableFields.some((field) =>
        field.toLocaleLowerCase("pt-BR").includes(normalizedSearch)
      );
    });
  }, [customersQuery.data, searchTerm]);

  const totalCustomers = customersQuery.data?.length ?? 0;
  const emptyState = emptyStateByFilter[statusFilter];

  function retryLoad() {
    void customersQuery.refetch();
  }

  async function handleInactivateCustomer(customerId: string) {
    setInactivatingCustomerId(customerId);

    try {
      await inactivateCustomer.mutateAsync(customerId);
    } finally {
      setInactivatingCustomerId(null);
    }
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gerencie a carteira operacional de clientes com dados reais da API."
        actions={
          <Button asChild>
            <ContextualLink href="/clientes/novo">
              <Plus className="h-4 w-4" aria-hidden />
              <span>Novo cliente</span>
            </ContextualLink>
          </Button>
        }
      />

      {customersQuery.isLoading ? (
        <LoadingState
          title="Carregando clientes"
          description="Aguarde enquanto a carteira de clientes e carregada."
        />
      ) : null}

      {!customersQuery.isLoading && customersQuery.isError ? (
        <ErrorState
          title="Nao foi possivel carregar clientes"
          description="Verifique a API de clientes e tente novamente."
          onRetry={retryLoad}
        />
      ) : null}

      {!customersQuery.isLoading && !customersQuery.isError ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 desktop:flex-row desktop:items-center desktop:justify-between">
            <div
              className="inline-flex w-full rounded-amani border border-border bg-surface p-1 desktop:w-auto"
              aria-label="Filtrar clientes por status"
            >
              {statusFilterOptions.map((option) => {
                const isSelected = statusFilter === option.value;

                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={isSelected ? "secondary" : "ghost"}
                    size="sm"
                    className="min-w-0 flex-1 desktop:min-w-24"
                    aria-pressed={isSelected}
                    onClick={() => setStatusFilter(option.value)}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </div>

            <div className="relative w-full desktop:max-w-xl">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
                aria-hidden
              />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar cliente por nome, email ou telefone"
                className="pl-10"
                aria-label="Buscar cliente por nome, email ou telefone"
              />
            </div>
          </div>

          {totalCustomers === 0 ? (
            <EmptyState
              title={emptyState.title}
              description={emptyState.description}
              badgeLabel={emptyState.badgeLabel}
              variant="empty"
              icon={<Users className="h-5 w-5" aria-hidden />}
            />
          ) : customers.length === 0 ? (
            <EmptyState
              title="Nenhum cliente encontrado"
              description="Ajuste o termo de busca para localizar outro cliente nesta visao."
              badgeLabel="Busca sem resultado"
              variant="empty"
              icon={<Search className="h-5 w-5" aria-hidden />}
            />
          ) : (
            <CustomerTable
              customers={customers}
              inactivatingCustomerId={inactivatingCustomerId}
              onInactivate={handleInactivateCustomer}
            />
          )}
        </section>
      ) : null}
    </main>
  );
}
