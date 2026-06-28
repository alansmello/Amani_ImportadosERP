"use client";

import { useParams, useRouter } from "next/navigation";
import { UserX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { ContextualBackButton } from "@/components/layout/contextual-back-button";
import { CustomerForm } from "@/components/clientes/customer-form";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { useCustomer, useUpdateCustomer } from "@/hooks/use-customers";
import { ApiError } from "@/services/errors";
import type { CustomerPayload } from "@/types/customer";

function getParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default function EditarClientePage() {
  const params = useParams();
  const router = useRouter();
  const customerId = getParamValue(params.id);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  const customerQuery = useCustomer(customerId);
  const updateCustomer = useUpdateCustomer();
  const customer = customerQuery.data;
  const isCustomerNotFound =
    customerQuery.error instanceof ApiError && customerQuery.error.status === 404;

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  function retryLoad() {
    void customerQuery.refetch();
  }

  async function handleUpdateCustomer(payload: CustomerPayload) {
    if (!customerId) {
      return;
    }

    await updateCustomer.mutateAsync({ id: customerId, payload });
    setSuccessMessage("Cliente atualizado. Redirecionando para os detalhes.");
    redirectTimeoutRef.current = setTimeout(() => {
      router.push(`/clientes/${customerId}`);
    }, 700);
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Editar cliente"
        description="Atualize os campos permitidos pelo contrato real de cliente."
        actions={
          <ContextualBackButton
            fallbackHref={customerId ? `/clientes/${customerId}` : "/clientes"}
          />
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
          description="O cliente informado nao existe ou nao esta disponivel para edicao."
          badgeLabel="Nao encontrado"
          variant="empty"
          icon={<UserX className="h-5 w-5" aria-hidden />}
        />
      ) : null}

      {!customerQuery.isLoading &&
      customerQuery.isError &&
      !isCustomerNotFound ? (
        <ErrorState
          title="Nao foi possivel carregar a edicao"
          description="Verifique a API de clientes e tente novamente."
          onRetry={retryLoad}
        />
      ) : null}

      {!customerQuery.isLoading && !customerQuery.isError && customer ? (
        <CustomerForm
          mode="edit"
          initialCustomer={customer}
          isSubmitting={updateCustomer.isPending}
          successMessage={successMessage}
          onSubmit={handleUpdateCustomer}
        />
      ) : null}
    </main>
  );
}
