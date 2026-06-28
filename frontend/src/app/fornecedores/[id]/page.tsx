"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Building2, Edit3 } from "lucide-react";

import { SupplierDetails } from "@/components/fornecedores/supplier-details";
import { ContextualBackButton } from "@/components/layout/contextual-back-button";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { useSupplier } from "@/hooks/use-suppliers";
import { ApiError } from "@/services/errors";
import { routes } from "@/config/routes";

function getParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default function FornecedorDetalhePage() {
  const params = useParams();
  const supplierId = getParamValue(params.id);
  const supplierQuery = useSupplier(supplierId);

  const isSupplierNotFound =
    supplierQuery.error instanceof ApiError && supplierQuery.error.status === 404;

  function retryLoad() {
    void supplierQuery.refetch();
  }

  const supplier = supplierQuery.data;

  return (
    <main className="space-y-6">
      <PageHeader
        title="Detalhes do fornecedor"
        description="Consulte os campos reais do fornecedor carregados da API."
        actions={
          <div className="flex flex-wrap gap-2">
            <ContextualBackButton fallbackHref={routes.fornecedores} />
            {supplier ? (
              <Button asChild>
                <Link href={`/fornecedores/${supplier.id}/editar`}>
                  <Edit3 className="h-4 w-4" aria-hidden />
                  <span>Editar</span>
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      {supplierQuery.isLoading ? (
        <LoadingState
          title="Carregando fornecedor"
          description="Aguarde enquanto os dados do fornecedor sao carregados."
        />
      ) : null}

      {!supplierQuery.isLoading && isSupplierNotFound ? (
        <EmptyState
          title="Fornecedor nao encontrado"
          description="O fornecedor informado nao existe ou nao esta disponivel na API."
          badgeLabel="Nao encontrado"
          variant="empty"
          icon={<Building2 className="h-5 w-5" aria-hidden />}
        />
      ) : null}

      {!supplierQuery.isLoading && supplierQuery.isError && !isSupplierNotFound ? (
        <ErrorState
          title="Nao foi possivel carregar o fornecedor"
          description="Verifique a API de fornecedores e tente novamente."
          onRetry={retryLoad}
        />
      ) : null}

      {!supplierQuery.isLoading && !supplierQuery.isError && supplier ? (
        <SupplierDetails supplier={supplier} />
      ) : null}
    </main>
  );
}
