import Link from "next/link";
import { CreditCard, ReceiptText, WalletCards } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { routes } from "@/config/routes";

const financeiroLinks = [
  {
    title: "Contas a receber",
    description: "Gerencie recebimentos, saldos e pagamentos de clientes.",
    href: routes.contasReceber,
    icon: WalletCards
  },
  {
    title: "Despesas",
    description: "Cadastre categorias, lance despesas e consulte por periodo.",
    href: routes.despesas,
    icon: ReceiptText
  },
  {
    title: "Taxas operadora",
    description: "Acompanhe despesas separadas de cartao e taxas de operadora.",
    href: routes.despesasOperadora,
    icon: CreditCard
  }
] as const;

export default function FinanceiroPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Financeiro"
        description="Acesse os fluxos financeiros operacionais do ERP."
      />

      <section className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
        {financeiroLinks.map((item) => {
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="block min-w-0">
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-amani border border-border bg-surface-light text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                </CardHeader>
                <CardContent className="min-w-0">
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription className="mt-2 break-words">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
