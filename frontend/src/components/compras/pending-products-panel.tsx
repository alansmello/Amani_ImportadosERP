"use client";

import Link from "next/link";
import { ArrowRight, PackageSearch } from "lucide-react";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { compraDetalhe } from "@/config/routes";
import type { PendingPurchaseProduct } from "@/types/purchase";
import type { Product } from "@/types/product";
import type { Supplier } from "@/types/supplier";

type PendingProductsPanelProps = {
  products: PendingPurchaseProduct[];
  productCatalog: Product[];
  suppliers: Supplier[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};

function getProductName(products: Product[], id: string) {
  return products.find((product) => product.id === id)?.nome ?? "Produto";
}

function getSupplierName(suppliers: Supplier[], id: string) {
  return suppliers.find((supplier) => supplier.id === id)?.nome ?? "Fornecedor";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short"
  }).format(new Date(value));
}

export function PendingProductsPanel({
  products,
  productCatalog,
  suppliers,
  isLoading = false,
  isError = false,
  onRetry
}: PendingProductsPanelProps) {
  if (isLoading) {
    return (
      <LoadingState
        title="Carregando produtos pendentes"
        description="Aguarde enquanto a visao oficial de pendencias e carregada."
      />
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Nao foi possivel carregar pendencias"
        description="A lista de produtos pendentes vem da fonte oficial. Tente novamente."
        onRetry={onRetry}
      />
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="Sem produtos pendentes"
        description="Nao ha itens aguardando recebimento na leitura atual."
        variant="empty"
        icon={<PackageSearch className="h-5 w-5" aria-hidden />}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos pendentes</CardTitle>
        <CardDescription>
          Itens ainda nao recebidos ou baixados por perda.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {products.slice(0, 8).map((pending) => (
          <div
            key={`${pending.compraId}-${pending.itemId}`}
            className="rounded-amani border border-border bg-surface-light p-4"
          >
            <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-primary">
                  {getProductName(productCatalog, pending.produtoId)}
                </p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  {getSupplierName(suppliers, pending.fornecedorId)} · Compra em{" "}
                  {formatDate(pending.dataCompra)}
                </p>
                <p className="mt-2 text-sm text-text-primary">
                  {pending.quantidadePendente} unidade(s) pendente(s)
                </p>
              </div>
              <Button asChild variant="secondary" size="sm">
                <Link href={compraDetalhe(pending.compraId)}>
                  <span>Detalhe</span>
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
