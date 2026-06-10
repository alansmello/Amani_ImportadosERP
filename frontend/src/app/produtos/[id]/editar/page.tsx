"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FolderOpen, PackageX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "@/components/produtos/product-form";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/use-categories";
import { useProduct, useUpdateProduct } from "@/hooks/use-products";
import { useSuppliers } from "@/hooks/use-suppliers";
import { ApiError } from "@/services/errors";
import type { ProductPayload } from "@/types/product";

function getParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default function EditarProdutoPage() {
  const params = useParams();
  const router = useRouter();
  const productId = getParamValue(params.id);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  const productQuery = useProduct(productId);
  const categoriesQuery = useCategories();
  const suppliersQuery = useSuppliers();
  const updateProduct = useUpdateProduct();

  const isLoading =
    productQuery.isLoading ||
    categoriesQuery.isLoading ||
    suppliersQuery.isLoading;
  const isProductNotFound =
    productQuery.error instanceof ApiError && productQuery.error.status === 404;
  const hasLoadError =
    productQuery.isError || categoriesQuery.isError || suppliersQuery.isError;
  const categories = categoriesQuery.data ?? [];
  const suppliers = suppliersQuery.data ?? [];
  const product = productQuery.data;
  const hasNoCategories =
    !isLoading && !hasLoadError && categories.length === 0;

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  function retryLoad() {
    void productQuery.refetch();
    void categoriesQuery.refetch();
    void suppliersQuery.refetch();
  }

  async function handleUpdateProduct(payload: ProductPayload) {
    if (!productId) {
      return;
    }

    await updateProduct.mutateAsync({ id: productId, payload });
    setSuccessMessage("Produto atualizado. Redirecionando para os detalhes.");
    redirectTimeoutRef.current = setTimeout(() => {
      router.push(`/produtos/${productId}`);
    }, 700);
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Editar produto"
        description="Atualize os campos permitidos pelo contrato real de produto."
        actions={
          <Button asChild variant="secondary">
            <Link href={productId ? `/produtos/${productId}` : "/produtos"}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span>Voltar</span>
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState
          title="Carregando produto"
          description="Aguarde enquanto o produto e as referencias sao carregados."
        />
      ) : null}

      {!isLoading && isProductNotFound ? (
        <EmptyState
          title="Produto nao encontrado"
          description="O produto informado nao existe ou nao esta disponivel para edicao."
          badgeLabel="Nao encontrado"
          variant="empty"
          icon={<PackageX className="h-5 w-5" aria-hidden />}
        />
      ) : null}

      {!isLoading && hasLoadError && !isProductNotFound ? (
        <ErrorState
          title="Nao foi possivel carregar a edicao"
          description="Verifique a API de produtos, categorias e fornecedores e tente novamente."
          onRetry={retryLoad}
        />
      ) : null}

      {hasNoCategories ? (
        <EmptyState
          title="Nenhuma categoria disponivel"
          description="Categorias sao obrigatorias para salvar produtos. Cadastre uma categoria no backend antes de editar."
          badgeLabel="Dependencia obrigatoria"
          variant="empty"
          icon={<FolderOpen className="h-5 w-5" aria-hidden />}
        />
      ) : null}

      {!isLoading && !hasLoadError && !hasNoCategories && product ? (
        <ProductForm
          mode="edit"
          initialProduct={product}
          categories={categories}
          suppliers={suppliers}
          isSubmitting={updateProduct.isPending}
          successMessage={successMessage}
          onSubmit={handleUpdateProduct}
        />
      ) : null}
    </main>
  );
}
