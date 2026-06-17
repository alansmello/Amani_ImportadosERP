"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import { CancelSaleDialog } from "@/components/vendas/cancel-sale-dialog";
import { SaleDetail } from "@/components/vendas/sale-detail";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useCustomers } from "@/hooks/use-customers";
import { useProducts } from "@/hooks/use-products";
import { useSale } from "@/hooks/use-sales";
import type { Customer } from "@/types/customer";
import type { Product } from "@/types/product";

const EMPTY_CUSTOMERS: Customer[] = [];
const EMPTY_PRODUCTS: Product[] = [];

export default function VendaDetalhePage() {
  const params = useParams<{ vendaId: string }>();
  const vendaId = params.vendaId;
  const saleQuery = useSale(vendaId);
  const customersQuery = useCustomers();
  const productsQuery = useProducts();
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const isLoading =
    saleQuery.isLoading ||
    customersQuery.isLoading ||
    productsQuery.isLoading;
  const hasError =
    saleQuery.isError || customersQuery.isError || productsQuery.isError;

  function retryAll() {
    void saleQuery.refetch();
    void customersQuery.refetch();
    void productsQuery.refetch();
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Detalhe da venda"
        description="Consulte itens, totais e lucro oficial retornado pelo backend."
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.vendas}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span>Voltar</span>
            </Link>
          </Button>
        }
      />

      {cancelSuccess ? (
        <div className="rounded-amani border border-success bg-surface-light px-4 py-3 text-sm leading-6 text-success">
          Cancelamento solicitado com sucesso. Os dados da venda foram atualizados.
        </div>
      ) : null}

      {isLoading ? (
        <LoadingState
          title="Carregando venda"
          description="Aguarde enquanto os dados da venda, cliente e produtos sao carregados."
        />
      ) : null}

      {!isLoading && hasError ? (
        <ErrorState
          title="Nao foi possivel carregar a venda"
          description="A venda pode nao existir ou a API pode estar indisponivel."
          onRetry={retryAll}
        />
      ) : null}

      {!isLoading && !hasError && !saleQuery.data ? (
        <EmptyState
          title="Venda nao encontrada"
          description="Volte para a lista e selecione uma venda disponivel."
          variant="empty"
        />
      ) : null}

      {!isLoading && !hasError && saleQuery.data ? (
        <SaleDetail
          sale={saleQuery.data}
          customers={customersQuery.data ?? EMPTY_CUSTOMERS}
          products={productsQuery.data ?? EMPTY_PRODUCTS}
          cancelAction={
            <CancelSaleDialog
              vendaId={vendaId}
              onCancelled={() => setCancelSuccess(true)}
            />
          }
        />
      ) : null}
    </main>
  );
}
