"use client";

import { Package, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { ContextualLink } from "@/components/layout/contextual-link";
import { ProductTable } from "@/components/produtos/product-table";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/hooks/use-categories";
import { useProducts } from "@/hooks/use-products";
import { useSuppliers } from "@/hooks/use-suppliers";

export default function ProdutosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const productsQuery = useProducts();
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

  const products = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase("pt-BR");

    return (productsQuery.data ?? [])
      .filter((product) => {
        if (!normalizedSearch) {
          return true;
        }

        return product.nome.toLocaleLowerCase("pt-BR").includes(normalizedSearch);
      })
      .map((product) => ({
        ...product,
        categoriaNome:
          categoryNameById.get(product.categoriaId) ?? "Categoria nao encontrada",
        fornecedorNome: product.fornecedorId
          ? supplierNameById.get(product.fornecedorId) ?? "Fornecedor nao encontrado"
          : "Sem fornecedor"
      }));
  }, [
    categoryNameById,
    productsQuery.data,
    searchTerm,
    supplierNameById
  ]);

  const isInitialLoading =
    productsQuery.isLoading ||
    categoriesQuery.isLoading ||
    suppliersQuery.isLoading;

  const hasLoadError =
    productsQuery.isError || categoriesQuery.isError || suppliersQuery.isError;

  function retryLoad() {
    void productsQuery.refetch();
    void categoriesQuery.refetch();
    void suppliersQuery.refetch();
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Produtos"
        description="Gerencie o catalogo operacional de produtos com dados reais da API."
        actions={
          <Button asChild>
            <ContextualLink href="/produtos/novo">
              <Plus className="h-4 w-4" aria-hidden />
              <span>Novo Produto</span>
            </ContextualLink>
          </Button>
        }
      />

      {isInitialLoading ? (
        <LoadingState
          title="Carregando produtos"
          description="Aguarde enquanto o catalogo e as referencias de apoio sao carregados."
        />
      ) : null}

      {!isInitialLoading && hasLoadError ? (
        <ErrorState
          title="Nao foi possivel carregar produtos"
          description="Verifique a API de produtos, categorias e fornecedores e tente novamente."
          onRetry={retryLoad}
        />
      ) : null}

      {!isInitialLoading && !hasLoadError ? (
        <section className="space-y-4">
          <div className="relative max-w-xl">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
              aria-hidden
            />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar produto por nome"
              className="pl-10"
              aria-label="Buscar produto por nome"
            />
          </div>

          {(productsQuery.data ?? []).length === 0 ? (
            <EmptyState
              title="Nenhum produto cadastrado"
              description="Cadastre o primeiro produto para iniciar a gestao do catalogo."
              badgeLabel="Sem produtos"
              variant="empty"
              icon={<Package className="h-5 w-5" aria-hidden />}
            />
          ) : products.length === 0 ? (
            <EmptyState
              title="Nenhum produto encontrado"
              description="Ajuste o termo de busca para localizar outro produto do catalogo."
              badgeLabel="Busca sem resultado"
              variant="empty"
              icon={<Search className="h-5 w-5" aria-hidden />}
            />
          ) : (
            <ProductTable products={products} />
          )}
        </section>
      ) : null}
    </main>
  );
}
