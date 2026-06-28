import { PaymentFeesForm } from "@/components/configuracoes/payment-fees-form";
import { PageHeader } from "@/components/layout/page-header";
import { ContextualBackButton } from "@/components/layout/contextual-back-button";
import { routes } from "@/config/routes";

export default function FormasPagamentoPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Formas de pagamento"
        description="Edite as taxas padrao usadas nas vendas e recebimentos com cartao."
        actions={
          <ContextualBackButton fallbackHref={routes.configuracoes} />
        }
      />

      <PaymentFeesForm />
    </main>
  );
}
