"use client";

import { ClipboardList, PackagePlus } from "lucide-react";

import { InitialInventoryStep } from "@/components/implantacao/initial-inventory-step";
import { ImplantationProgress } from "@/components/implantacao/implantation-progress";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { useProducts } from "@/hooks/use-products";

export default function ImplantacaoInicialPage() {
  const productsQuery = useProducts();
  const products = productsQuery.data ?? [];

  return (
    <main className="space-y-6">
      <PageHeader
        title="Implantacao inicial"
        description="Prepare os dados reais de partida do ERP sem misturar este fluxo com operacoes recorrentes."
      />

      <ImplantationProgress
        steps={[
          {
            id: "initialInventory",
            status: "editing",
            title: "Inventario inicial",
            description: "Entrada rastreavel do estoque de partida."
          },
          {
            id: "initialCash",
            status: "pending",
            title: "Saldo inicial de caixa",
            description: "Etapa planejada para a proxima fase."
          },
          {
            id: "initialReceivables",
            status: "pending",
            title: "Contas a receber iniciais",
            description: "Etapa planejada para a proxima fase."
          }
        ]}
      />

      {productsQuery.isLoading ? (
        <LoadingState
          title="Carregando produtos"
          description="Aguarde enquanto a lista oficial de produtos e carregada para o inventario inicial."
        />
      ) : null}

      {!productsQuery.isLoading && productsQuery.isError ? (
        <ErrorState
          title="Nao foi possivel carregar produtos"
          description="Verifique a API de produtos e tente novamente antes de registrar o inventario inicial."
          onRetry={() => {
            void productsQuery.refetch();
          }}
        />
      ) : null}

      {!productsQuery.isLoading && !productsQuery.isError ? (
        products.length === 0 ? (
          <EmptyState
            title="Nenhum produto disponivel"
            description="Cadastre produtos antes de registrar o inventario inicial."
            badgeLabel="Sem produtos"
            variant="empty"
            icon={<ClipboardList className="h-5 w-5" aria-hidden />}
          />
        ) : (
          <InitialInventoryStep products={products} />
        )
      ) : null}

      <EmptyState
        title="Proximas etapas da implantacao"
        description="Saldo inicial de caixa e contas a receber iniciais serao habilitados nas proximas fases desta feature."
        badgeLabel="Em preparo"
        icon={<PackagePlus className="h-5 w-5" aria-hidden />}
      />
    </main>
  );
}

