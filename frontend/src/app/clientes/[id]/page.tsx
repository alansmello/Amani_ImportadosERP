"use client";

import { useParams } from "next/navigation";
import { UserX } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { ContextualBackButton } from "@/components/layout/contextual-back-button";
import { CustomerActions } from "@/components/clientes/customer-actions";
import { CustomerDetails } from "@/components/clientes/customer-details";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { useCustomer, useInactivateCustomer } from "@/hooks/use-customers";
import { ApiError } from "@/services/errors";

function getParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default function ClienteDetalhePage() {
  const params = useParams();
  const customerId = getParamValue(params.id);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const customerQuery = useCustomer(customerId);
  const inactivateCustomer = useInactivateCustomer();
  const customer = customerQuery.data;
  const isCustomerNotFound =
    customerQuery.error instanceof ApiError && customerQuery.error.status === 404;

  function retryLoad() {
    void customerQuery.refetch();
  }

  async function handleInactivateCustomer(id: string) {
    await inactivateCustomer.mutateAsync(id);
    setSuccessMessage(
      "Cliente inativado. O status atualizado permanecera disponivel nesta tela."
    );
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Detalhes do cliente"
        description="Consulte os campos reais do cliente carregados da API."
        actions={
          <div className="flex flex-wrap gap-2">
            <ContextualBackButton fallbackHref="/clientes" />
            {customer ? (
              <CustomerActions
                customerId={customer.id}
                customerName={customer.nome}
                isActive={customer.ativo}
                showDetails={false}
                isInactivating={inactivateCustomer.isPending}
                onInactivate={handleInactivateCustomer}
              />
            ) : null}
          </div>
        }
      />

      {customerQuery.isLoading ? (
        <LoadingState
          title="Carregando cliente"
          description="Aguarde enquanto os dados do cliente sao carregados."
        />
      ) : null}

      {!customerQuery.isLoading && isCustomerNotFound ? (
        <EmptyState
          title="Cliente nao encontrado"
          description="O cliente informado nao existe ou nao esta disponivel na API."
          badgeLabel="Nao encontrado"
          variant="empty"
          icon={<UserX className="h-5 w-5" aria-hidden />}
        />
      ) : null}

      {!customerQuery.isLoading &&
      customerQuery.isError &&
      !isCustomerNotFound ? (
        <ErrorState
          title="Nao foi possivel carregar o cliente"
          description="Verifique a API de clientes e tente novamente."
          onRetry={retryLoad}
        />
      ) : null}

      {!customerQuery.isLoading && !customerQuery.isError && customer ? (
        <section className="space-y-4">
          {successMessage ? (
            <div className="rounded-amani border border-success bg-surface-light px-4 py-3 text-sm leading-6 text-text-primary">
              {successMessage}
            </div>
          ) : null}
          <CustomerDetails customer={customer} />
        </section>
      ) : null}
    </main>
  );
}
