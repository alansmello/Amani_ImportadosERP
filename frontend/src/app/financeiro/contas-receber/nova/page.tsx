"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { ReceivableForm } from "@/components/financeiro/receivable-form";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export default function NovaContaReceberPage() {
  const router = useRouter();

  function handleCreated() {
    router.push(routes.contasReceber);
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Nova conta a receber"
        description="Registre uma conta a receber informando cliente, valor e data de vencimento."
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.contasReceber}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span>Voltar</span>
            </Link>
          </Button>
        }
      />

      <ReceivableForm onCreated={handleCreated} />
    </main>
  );
}
