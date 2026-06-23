"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SaleForm } from "@/components/vendas/sale-form";
import { routes } from "@/config/routes";

export default function NovaVendaPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Nova venda"
        description="Registre venda com cliente, itens e validacao oficial de estoque."
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.vendas}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span>Voltar</span>
            </Link>
          </Button>
        }
      />

      <SaleForm />
    </main>
  );
}
