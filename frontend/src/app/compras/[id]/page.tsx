"use client";

import { useParams } from "next/navigation";

import { PurchaseDetail } from "@/components/compras/purchase-detail";
import { PageHeader } from "@/components/layout/page-header";
import { ContextualBackButton } from "@/components/layout/contextual-back-button";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { routes } from "@/config/routes";
import { useProducts } from "@/hooks/use-products";
import {
  usePurchase,
  usePurchaseLosses,
  usePurchaseReceipts
} from "@/hooks/use-purchases";
import { useSuppliers } from "@/hooks/use-suppliers";

export default function CompraDetalhePage() {
  const params = useParams<{ id: string }>();
  const compraId = params.id;
  const purchaseQuery = usePurchase(compraId);
  const receiptsQuery = usePurchaseReceipts(compraId);
  const lossesQuery = usePurchaseLosses(compraId);
  const productsQuery = useProducts();
  const suppliersQuery = useSuppliers();

  const isLoading =
    purchaseQuery.isLoading ||
    receiptsQuery.isLoading ||
    lossesQuery.isLoading ||
    productsQuery.isLoading ||
    suppliersQuery.isLoading;
  const hasError =
    purchaseQuery.isError ||
    receiptsQuery.isError ||
    lossesQuery.isError ||
    productsQuery.isError ||
    suppliersQuery.isError;

  function retryAll() {
    void purchaseQuery.refetch();
    void receiptsQuery.refetch();
    void lossesQuery.refetch();
    void productsQuery.refetch();
    void suppliersQuery.refetch();
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Detalhe da compra"
        description="Consulte itens, pendencias, recebimentos e perdas registrados pela fonte oficial."
        actions={
          <ContextualBackButton fallbackHref={routes.compras} />
        }
      />

      {isLoading ? (
        <LoadingState
          title="Carregando compra"
          description="Aguarde enquanto detalhe, historico e referencias sao carregados."
        />
      ) : null}

      {!isLoading && hasError ? (
        <ErrorState
          title="Nao foi possivel carregar a compra"
          description="A compra pode nao existir ou a API pode estar indisponivel."
          onRetry={retryAll}
        />
      ) : null}

      {!isLoading && !hasError && !purchaseQuery.data ? (
        <EmptyState
          title="Compra nao encontrada"
          description="Volte para a lista e selecione uma compra disponivel."
          variant="empty"
        />
      ) : null}

      {!isLoading && !hasError && purchaseQuery.data ? (
        <PurchaseDetail
          purchase={purchaseQuery.data}
          receipts={receiptsQuery.data ?? []}
          losses={lossesQuery.data ?? []}
          products={productsQuery.data ?? []}
          suppliers={suppliersQuery.data ?? []}
        />
      ) : null}
    </main>
  );
}
