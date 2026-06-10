"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FolderOpen } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "@/components/produtos/product-form";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/use-categories";
import { useCreateProduct } from "@/hooks/use-products";
import { useSuppliers } from "@/hooks/use-suppliers";
import type { ProductPayload } from "@/types/product";

export default function NovoProdutoPage() {
  const router = useRouter();
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const categoriesQuery = useCategories();
  const suppliersQuery = useSuppliers();
  const createProduct = useCreateProduct();

  const isLoadingSupportLists =
    categoriesQuery.isLoading || suppliersQuery.isLoading;
  const hasSupportListError = categoriesQuery.isError || suppliersQuery.isError;
  const categories = categoriesQuery.data ?? [];
  const suppliers = suppliersQuery.data ?? [];
  const hasNoCategories =
    !isLoadingSupportLists && !hasSupportListError && categories.length === 0;

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  function retrySupportLists() {
    void categoriesQuery.refetch();
    void suppliersQuery.refetch();
  }

  async function handleCreateProduct(payload: ProductPayload) {
    await createProduct.mutateAsync(payload);
    setSuccessMessage("Produto cadastrado. Redirecionando para o catalogo.");
    redirectTimeoutRef.current = setTimeout(() => {
      router.push("/produtos");
    }, 700);
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Novo produto"
        description="Cadastre um produto usando categorias e fornecedores carregados da API."
        actions={
          <Button asChild variant="secondary">
            <Link href="/produtos">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span>Voltar</span>
            </Link>
          </Button>
        }
      />

      {isLoadingSupportLists ? (
        <LoadingState
          title="Carregando referencias"
          description="Aguarde enquanto categorias e fornecedores sao carregados."
        />
      ) : null}

      {!isLoadingSupportLists && hasSupportListError ? (
        <ErrorState
          title="Nao foi possivel carregar referencias"
          description="Categorias sao obrigatorias para cadastrar produtos. Verifique a API e tente novamente."
          onRetry={retrySupportLists}
        />
      ) : null}

      {hasNoCategories ? (
        <EmptyState
          title="Nenhuma categoria disponivel"
          description="Cadastre uma categoria no backend antes de salvar produtos. Fornecedores continuam opcionais."
          badgeLabel="Dependencia obrigatoria"
          variant="empty"
          icon={<FolderOpen className="h-5 w-5" aria-hidden />}
        />
      ) : null}

      {!isLoadingSupportLists && !hasSupportListError && !hasNoCategories ? (
        <ProductForm
          mode="create"
          categories={categories}
          suppliers={suppliers}
          isSubmitting={createProduct.isPending}
          successMessage={successMessage}
          onSubmit={handleCreateProduct}
        />
      ) : null}
    </main>
  );
}
