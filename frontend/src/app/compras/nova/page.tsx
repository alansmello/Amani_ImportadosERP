"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PurchaseForm } from "@/components/compras/purchase-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export default function NovaCompraPage() {
  const router = useRouter();

  function handleCreated(href: string) {
    router.push(href);
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Nova compra"
        description="Registre a compra comercial sem gerar entrada automatica de estoque."
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.compras}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span>Voltar</span>
            </Link>
          </Button>
        }
      />

      <PurchaseForm onCreated={handleCreated} />
    </main>
  );
}
