"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Edit3, PackageX } from "lucide-react";
import { useMemo } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { ProductDetails } from "@/components/produtos/product-details";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/use-categories";
import { useProduct } from "@/hooks/use-products";
import { useSuppliers } from "@/hooks/use-suppliers";
import { ApiError } from "@/services/errors";

function getParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default function ProdutoDetalhePage() {
  const params = useParams();
  const productId = getParamValue(params.id);
  const productQuery = useProduct(productId);
  const categoriesQuery = useCategories();
  const suppliersQuery = useSuppliers();

  const categoryNameById = useMemo(() => {
    return new Map(
      (categoriesQuery.data ?? []).map((category) => [category.id, category.nome])
    );
  }, [categoriesQuery.data]);

  const supplierNameById = useMemo(() => {
    return new Map(
      (suppliersQuery.data ?? []).map((supplier) => [supplier.id, supplier.nome])
    );
  }, [suppliersQuery.data]);

  const isInitialLoading =
    productQuery.isLoading ||
    categoriesQuery.isLoading ||
    suppliersQuery.isLoading;

  const isProductNotFound =
    productQuery.error instanceof ApiError && productQuery.error.status === 404;
  const hasLoadError =
    productQuery.isError || categoriesQuery.isError || suppliersQuery.isError;

  function retryLoad() {
    void productQuery.refetch();
    void categoriesQuery.refetch();
    void suppliersQuery.refetch();
  }

  const product = productQuery.data;
  const categoriaNome = product
    ? categoryNameById.get(product.categoriaId) ?? "Categoria nao encontrada"
    : "";
  const fornecedorNome = product?.fornecedorId
    ? supplierNameById.get(product.fornecedorId) ?? "Fornecedor nao encontrado"
    : "Sem fornecedor";

  return (
    <main className="space-y-6">
      <PageHeader
        title="Detalhes do produto"
        description="Consulte os campos reais do produto carregados da API."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href="/produtos">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                <span>Voltar</span>
              </Link>
            </Button>
            {product ? (
              <Button asChild>
                <Link href={`/produtos/${product.id}/editar`}>
                  <Edit3 className="h-4 w-4" aria-hidden />
                  <span>Editar</span>
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      {isInitialLoading ? (
        <LoadingState
          title="Carregando produto"
          description="Aguarde enquanto o produto e suas referencias sao carregados."
        />
      ) : null}

      {!isInitialLoading && isProductNotFound ? (
        <EmptyState
          title="Produto nao encontrado"
          description="O produto informado nao existe ou nao esta disponivel na API."
          badgeLabel="Nao encontrado"
          variant="empty"
          icon={<PackageX className="h-5 w-5" aria-hidden />}
        />
      ) : null}

      {!isInitialLoading && hasLoadError && !isProductNotFound ? (
        <ErrorState
          title="Nao foi possivel carregar o produto"
          description="Verifique a API de produtos, categorias e fornecedores e tente novamente."
          onRetry={retryLoad}
        />
      ) : null}

      {!isInitialLoading && !hasLoadError && product ? (
        <ProductDetails
          product={product}
          categoriaNome={categoriaNome}
          fornecedorNome={fornecedorNome}
        />
      ) : null}
    </main>
  );
}
