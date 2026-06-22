"use client";

import Link from "next/link";
import { use } from "react";
import { ArrowLeft } from "lucide-react";

import { ReceivableClientDetail } from "@/components/financeiro/receivable-client-detail";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
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
    clienteId.slice(0, 8) + "…";

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
          <Button asChild variant="secondary">
            <Link href={routes.contasReceber}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span>Voltar</span>
            </Link>
          </Button>
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
