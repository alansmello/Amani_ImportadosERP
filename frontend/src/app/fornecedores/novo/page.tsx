"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SupplierForm } from "@/components/fornecedores/supplier-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useCreateSupplier } from "@/hooks/use-suppliers";
import type { SupplierPayload } from "@/types/supplier";

export default function NovoFornecedorPage() {
  const router = useRouter();
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const createSupplier = useCreateSupplier();

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  async function handleCreateSupplier(payload: SupplierPayload) {
    await createSupplier.mutateAsync(payload);
    setSuccessMessage("Fornecedor cadastrado. Redirecionando para a lista.");
    redirectTimeoutRef.current = setTimeout(() => {
      router.push("/fornecedores");
    }, 700);
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Novo fornecedor"
        description="Cadastre um fornecedor para preparar os fluxos operacionais de compras."
        actions={
          <Button asChild variant="secondary">
            <Link href="/fornecedores">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span>Voltar</span>
            </Link>
          </Button>
        }
      />

      <SupplierForm
        mode="create"
        isSubmitting={createSupplier.isPending}
        successMessage={successMessage}
        onSubmit={handleCreateSupplier}
      />
    </main>
  );
}
