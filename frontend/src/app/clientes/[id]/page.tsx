"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, UserX } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { CustomerActions } from "@/components/clientes/customer-actions";
import { CustomerDetails } from "@/components/clientes/customer-details";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { useCustomer } from "@/hooks/use-customers";
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
  const customerQuery = useCustomer(customerId);
  const customer = customerQuery.data;
  const isCustomerNotFound =
    customerQuery.error instanceof ApiError && customerQuery.error.status === 404;

  function retryLoad() {
    void customerQuery.refetch();
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Detalhes do cliente"
        description="Consulte os campos reais do cliente carregados da API."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href="/clientes">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                <span>Voltar</span>
              </Link>
            </Button>
            {customer ? (
              <CustomerActions customerId={customer.id} showDetails={false} />
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
        <CustomerDetails customer={customer} />
      ) : null}
    </main>
  );
}
