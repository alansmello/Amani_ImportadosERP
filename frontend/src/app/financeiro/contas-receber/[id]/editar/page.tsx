"use client";

import Link from "next/link";
import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ReceivableForm } from "@/components/financeiro/receivable-form";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
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
          <Button asChild variant="secondary">
            <Link href={routes.contasReceber}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span>Voltar</span>
            </Link>
          </Button>
        }
      />

      {query.isLoading ? (
        <LoadingState
          title="Carregando conta"
          description="Aguarde enquanto as informacoes sao carregadas."
        />
      ) : query.isError ? (
        <ErrorState
          title="Nao foi possivel carregar a conta"
          description="Verifique a conexao e tente novamente."
          onRetry={() => void query.refetch()}
        />
      ) : !receivable ? (
        <EmptyState
          title="Conta nao encontrada"
          description="A conta solicitada nao foi encontrada. Ela pode ter sido excluida."
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
