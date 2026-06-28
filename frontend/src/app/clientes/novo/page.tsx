"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { ContextualBackButton } from "@/components/layout/contextual-back-button";
import { CustomerForm } from "@/components/clientes/customer-form";
import { useCreateCustomer } from "@/hooks/use-customers";
import type { CustomerPayload } from "@/types/customer";

export default function NovoClientePage() {
  const router = useRouter();
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const createCustomer = useCreateCustomer();

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  async function handleCreateCustomer(payload: CustomerPayload) {
    await createCustomer.mutateAsync(payload);
    setSuccessMessage("Cliente cadastrado. Redirecionando para a carteira.");
    redirectTimeoutRef.current = setTimeout(() => {
      router.push("/clientes");
    }, 700);
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Novo cliente"
        description="Cadastre um cliente com os dados aceitos pelo contrato atual da API."
        actions={
          <ContextualBackButton fallbackHref="/clientes" />
        }
      />

      <CustomerForm
        mode="create"
        isSubmitting={createCustomer.isPending}
        successMessage={successMessage}
        onSubmit={handleCreateCustomer}
      />
    </main>
  );
}
