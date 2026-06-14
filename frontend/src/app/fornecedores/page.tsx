"use client";

import Link from "next/link";
import { Building2, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { SupplierTable } from "@/components/fornecedores/supplier-table";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSuppliers } from "@/hooks/use-suppliers";

export default function FornecedoresPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const suppliersQuery = useSuppliers();

  const suppliers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase("pt-BR");

    return (suppliersQuery.data ?? []).filter((supplier) => {
      if (!normalizedSearch) {
        return true;
      }

      return supplier.nome.toLocaleLowerCase("pt-BR").includes(normalizedSearch);
    });
  }, [searchTerm, suppliersQuery.data]);

  function retryLoad() {
    void suppliersQuery.refetch();
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Fornecedores"
        description="Gerencie os fornecedores reais usados nos fluxos operacionais de compras."
        actions={
          <Button asChild>
            <Link href="/fornecedores/novo">
              <Plus className="h-4 w-4" aria-hidden />
              <span>Novo Fornecedor</span>
            </Link>
          </Button>
        }
      />

      {suppliersQuery.isLoading ? (
        <LoadingState
          title="Carregando fornecedores"
          description="Aguarde enquanto os fornecedores cadastrados sao carregados."
        />
      ) : null}

      {!suppliersQuery.isLoading && suppliersQuery.isError ? (
        <ErrorState
          title="Nao foi possivel carregar fornecedores"
          description="Verifique a API de fornecedores e tente novamente."
          onRetry={retryLoad}
        />
      ) : null}

      {!suppliersQuery.isLoading && !suppliersQuery.isError ? (
        <section className="space-y-4">
          <div className="relative max-w-xl">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
              aria-hidden
            />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar fornecedor por nome"
              className="pl-10"
              aria-label="Buscar fornecedor por nome"
            />
          </div>

          {(suppliersQuery.data ?? []).length === 0 ? (
            <EmptyState
              title="Nenhum fornecedor cadastrado"
              description="Cadastre o primeiro fornecedor para preparar os fluxos de compras."
              badgeLabel="Sem fornecedores"
              variant="empty"
              icon={<Building2 className="h-5 w-5" aria-hidden />}
            />
          ) : suppliers.length === 0 ? (
            <EmptyState
              title="Nenhum fornecedor encontrado"
              description="Ajuste o termo de busca para localizar outro fornecedor cadastrado."
              badgeLabel="Busca sem resultado"
              variant="empty"
              icon={<Search className="h-5 w-5" aria-hidden />}
            />
          ) : (
            <SupplierTable suppliers={suppliers} />
          )}
        </section>
      ) : null}
    </main>
  );
}
