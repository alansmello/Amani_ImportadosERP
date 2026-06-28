"use client";

import { use } from "react";

import { ReceivableClientDetail } from "@/components/financeiro/receivable-client-detail";
import { PageHeader } from "@/components/layout/page-header";
import { ContextualBackButton } from "@/components/layout/contextual-back-button";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { useCustomers } from "@/hooks/use-customers";
import { useReceivableClientDetail } from "@/hooks/use-receivables";
import { routes } from "@/config/routes";

type ClienteDetalhePageProps = {
  params: Promise<{ clienteId: string }>;
};

export default function ClienteContasReceberPage({
  params
}: ClienteDetalhePageProps) {
  const { clienteId } = use(params);
  const query = useReceivableClientDetail(clienteId);
  const customersQuery = useCustomers("all");

  const contas = query.data ?? [];
  const customers = customersQuery.data ?? [];

  const clienteName =
    customers.find((c) => c.id === clienteId)?.nome ??
    "Cliente nao encontrado";

  const isLoading = query.isLoading || customersQuery.isLoading;
  const isError = query.isError || customersQuery.isError;

  function handleRetry() {
    if (query.isError) void query.refetch();
    if (customersQuery.isError) void customersQuery.refetch();
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title={isLoading ? "Contas do cliente" : `Contas de ${clienteName}`}
        description="Contas em aberto, saldos e historico de pagamentos."
        actions={
          <ContextualBackButton fallbackHref={routes.contasReceber} />
        }
      />

      {isLoading ? (
        <LoadingState
          title="Carregando contas do cliente"
          description="Aguarde enquanto as informacoes sao carregadas."
        />
      ) : isError ? (
        <ErrorState
          title="Nao foi possivel carregar as contas"
          description="Verifique a conexao e tente novamente."
          onRetry={handleRetry}
        />
      ) : (
        <ReceivableClientDetail
          clienteName={clienteName}
          contas={contas}
        />
      )}
    </main>
  );
}
