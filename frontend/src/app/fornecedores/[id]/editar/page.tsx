"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SupplierForm } from "@/components/fornecedores/supplier-form";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { useSupplier, useUpdateSupplier } from "@/hooks/use-suppliers";
import { ApiError } from "@/services/errors";
import type { SupplierPayload } from "@/types/supplier";

function getParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default function EditarFornecedorPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = getParamValue(params.id);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  const supplierQuery = useSupplier(supplierId);
  const updateSupplier = useUpdateSupplier();

  const supplier = supplierQuery.data;
  const isSupplierNotFound =
    supplierQuery.error instanceof ApiError && supplierQuery.error.status === 404;

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  function retryLoad() {
    void supplierQuery.refetch();
  }

  async function handleUpdateSupplier(payload: SupplierPayload) {
    if (!supplierId) {
      return;
    }

    await updateSupplier.mutateAsync({ id: supplierId, payload });
    setSuccessMessage(
      "Fornecedor atualizado. Redirecionando para os detalhes."
    );
    redirectTimeoutRef.current = setTimeout(() => {
      router.push(`/fornecedores/${supplierId}`);
    }, 700);
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Editar fornecedor"
        description="Atualize somente o nome aceito pelo contrato real de fornecedor."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href="/fornecedores">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                <span>Voltar</span>
              </Link>
            </Button>
            {supplier ? (
              <Button asChild variant="secondary">
                <Link href={`/fornecedores/${supplier.id}`}>
                  <Eye className="h-4 w-4" aria-hidden />
                  <span>Detalhes</span>
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      {supplierQuery.isLoading ? (
        <LoadingState
          title="Carregando fornecedor"
          description="Aguarde enquanto os dados do fornecedor sao carregados."
        />
      ) : null}

      {!supplierQuery.isLoading && isSupplierNotFound ? (
        <EmptyState
          title="Fornecedor nao encontrado"
          description="O fornecedor informado nao existe ou nao esta disponivel para edicao."
          badgeLabel="Nao encontrado"
          variant="empty"
          icon={<Building2 className="h-5 w-5" aria-hidden />}
        />
      ) : null}

      {!supplierQuery.isLoading &&
      supplierQuery.isError &&
      !isSupplierNotFound ? (
        <ErrorState
          title="Nao foi possivel carregar a edicao"
          description="Verifique a API de fornecedores e tente novamente."
          onRetry={retryLoad}
        />
      ) : null}

      {!supplierQuery.isLoading && !supplierQuery.isError && supplier ? (
        <SupplierForm
          mode="edit"
          initialSupplier={supplier}
          isSubmitting={updateSupplier.isPending}
          successMessage={successMessage}
          onSubmit={handleUpdateSupplier}
        />
      ) : null}
    </main>
  );
}
