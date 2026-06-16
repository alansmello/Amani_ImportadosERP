"use client";

import { ClipboardList } from "lucide-react";

import { InitialCashStep } from "@/components/implantacao/initial-cash-step";
import { InitialInventoryStep } from "@/components/implantacao/initial-inventory-step";
import { InitialReceivablesStep } from "@/components/implantacao/initial-receivables-step";
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
            status: "editing",
            title: "Saldo inicial de caixa",
            description: "Evento financeiro de partida."
          },
          {
            id: "initialReceivables",
            status: "editing",
            title: "Contas a receber iniciais",
            description: "Recebiveis anteriores ao uso do ERP."
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

      <InitialCashStep />

      <InitialReceivablesStep />
    </main>
  );
}
