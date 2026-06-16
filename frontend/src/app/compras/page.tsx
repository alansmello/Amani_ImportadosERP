"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { PendingProductsPanel } from "@/components/compras/pending-products-panel";
import { PurchaseFilters } from "@/components/compras/purchase-filters";
import { PurchaseList } from "@/components/compras/purchase-list";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useProducts } from "@/hooks/use-products";
import {
  usePendingPurchaseProducts,
  usePurchases,
  usePurchasesInTransit
} from "@/hooks/use-purchases";
import { useSuppliers } from "@/hooks/use-suppliers";
import type {
  PendingPurchaseProduct,
  PurchaseFilters as PurchaseFiltersType
} from "@/types/purchase";
import type { Product } from "@/types/product";
import type { Supplier } from "@/types/supplier";

const EMPTY_FILTERS: PurchaseFiltersType = {};
const EMPTY_PENDING_PRODUCTS: PendingPurchaseProduct[] = [];
const EMPTY_PRODUCTS: Product[] = [];
const EMPTY_SUPPLIERS: Supplier[] = [];

function isWithinLastThirtyDays(value: string) {
  const date = new Date(value);
  const start = new Date();
  start.setDate(start.getDate() - 30);
  start.setHours(0, 0, 0, 0);

  return date >= start;
}

function hasActiveFilters(filters: PurchaseFiltersType) {
  return Boolean(
    filters.dataInicio || filters.dataFim || filters.fornecedorId || filters.status
  );
}

export default function ComprasPage() {
  const [filters, setFilters] = useState<PurchaseFiltersType>(EMPTY_FILTERS);
  const suppliersQuery = useSuppliers();
  const productsQuery = useProducts();
  const purchasesQuery = usePurchases(filters);
  const inTransitQuery = usePurchasesInTransit();
  const pendingProductsQuery = usePendingPurchaseProducts();
  const usingFilters = hasActiveFilters(filters);

  const suppliers = suppliersQuery.data ?? EMPTY_SUPPLIERS;
  const products = productsQuery.data ?? EMPTY_PRODUCTS;
  const pendingProducts = pendingProductsQuery.data ?? EMPTY_PENDING_PRODUCTS;

  const pendingByPurchase = useMemo(() => {
    return pendingProducts.reduce<Record<string, number>>((accumulator, item) => {
      accumulator[item.compraId] =
        (accumulator[item.compraId] ?? 0) + item.quantidadePendente;
      return accumulator;
    }, {});
  }, [pendingProducts]);

  const purchases = useMemo(() => {
    if (usingFilters) {
      return (purchasesQuery.data ?? []).filter((purchase) =>
        filters.status ? purchase.status === filters.status : true
      );
    }

    return (inTransitQuery.data ?? [])
      .filter((purchase) => isWithinLastThirtyDays(purchase.dataCompra))
      .map((purchase) => ({
        id: purchase.compraId,
        fornecedorId: purchase.fornecedorId,
        dataCompra: purchase.dataCompra,
        status: purchase.status,
        totalCompra: 0
      }));
  }, [filters.status, inTransitQuery.data, purchasesQuery.data, usingFilters]);

  const isLoading =
    suppliersQuery.isLoading ||
    productsQuery.isLoading ||
    pendingProductsQuery.isLoading ||
    (usingFilters ? purchasesQuery.isLoading : inTransitQuery.isLoading);

  const hasError =
    suppliersQuery.isError ||
    productsQuery.isError ||
    pendingProductsQuery.isError ||
    (usingFilters ? purchasesQuery.isError : inTransitQuery.isError);

  function retryAll() {
    void suppliersQuery.refetch();
    void productsQuery.refetch();
    void pendingProductsQuery.refetch();
    void purchasesQuery.refetch();
    void inTransitQuery.refetch();
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Compras"
        description="Acompanhe compras em transito, filtre por fornecedor e periodo e veja produtos pendentes de recebimento."
        actions={
          <Button asChild>
            <Link href={routes.comprasNova}>
              <Plus className="h-4 w-4" aria-hidden />
              <span>Nova compra</span>
            </Link>
          </Button>
        }
      />

      <PurchaseFilters
        filters={filters}
        suppliers={suppliers}
        disabled={isLoading}
        onApply={setFilters}
        onClear={() => setFilters(EMPTY_FILTERS)}
      />

      {isLoading ? (
        <LoadingState
          title="Carregando compras"
          description="Aguarde enquanto compras, fornecedores, produtos e pendencias sao carregados."
        />
      ) : null}

      {!isLoading && hasError ? (
        <ErrorState
          title="Nao foi possivel carregar compras"
          description="Verifique a API de compras e tente novamente."
          onRetry={retryAll}
        />
      ) : null}

      {!isLoading && !hasError ? (
        <div className="grid min-w-0 gap-6 desktop:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)]">
          <PurchaseList
            purchases={purchases}
            suppliers={suppliers}
            pendingByPurchase={pendingByPurchase}
          />
          <PendingProductsPanel
            products={pendingProducts}
            productCatalog={products}
            suppliers={suppliers}
            isLoading={pendingProductsQuery.isLoading}
            isError={pendingProductsQuery.isError}
            onRetry={() => void pendingProductsQuery.refetch()}
          />
        </div>
      ) : null}
    </main>
  );
}
