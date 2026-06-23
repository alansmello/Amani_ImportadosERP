import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PaymentFeesForm } from "@/components/configuracoes/payment-fees-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export default function FormasPagamentoPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Formas de pagamento"
        description="Edite as taxas padrao usadas nas vendas e recebimentos com cartao."
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.configuracoes}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span>Voltar</span>
            </Link>
          </Button>
        }
      />

      <PaymentFeesForm />
    </main>
  );
}
