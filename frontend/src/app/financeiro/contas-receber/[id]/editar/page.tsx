"use client";

import { use } from "react";
import { useRouter } from "next/navigation";

import { ReceivableForm } from "@/components/financeiro/receivable-form";
import { PageHeader } from "@/components/layout/page-header";
import { ContextualBackButton } from "@/components/layout/contextual-back-button";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { useReceivables } from "@/hooks/use-receivables";
import { routes } from "@/config/routes";

type EditarContaReceberPageProps = {
  params: Promise<{ id: string }>;
};

export default function EditarContaReceberPage({
  params
}: EditarContaReceberPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const query = useReceivables();

  const receivable = query.data?.find((r) => r.id === id);

  function handleUpdated() {
    router.push(routes.contasReceber);
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Editar conta a receber"
        description="Altere o valor ou a data de vencimento da conta."
        actions={
          <ContextualBackButton fallbackHref={routes.contasReceber} />
        }
      />

      {query.isLoading ? (
        <LoadingState
          title="Carregando conta"
          description="Aguarde enquanto as informações são carregadas."
        />
      ) : query.isError ? (
        <ErrorState
          title="Não foi possível carregar a conta"
          description="Verifique a conexão e tente novamente."
          onRetry={() => void query.refetch()}
        />
      ) : !receivable ? (
        <EmptyState
          title="Conta não encontrada"
          description="A conta solicitada não foi encontrada. Ela pode ter sido excluída."
          variant="empty"
        />
      ) : (
        <ReceivableForm
          mode="edit"
          receivableId={receivable.id}
          initialValor={receivable.valorTotal}
          initialDataVencimento={receivable.dataVencimento}
          onUpdated={handleUpdated}
        />
      )}
    </main>
  );
}
