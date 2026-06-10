import {
  Boxes,
  ClipboardList,
  CreditCard,
  PackageSearch,
  ShoppingCart,
  Siren,
  Users
} from "lucide-react";

import { MetricPlaceholderCard } from "@/components/dashboard/metric-placeholder-card";
import { QuickActionGrid } from "@/components/dashboard/quick-action-grid";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { routes } from "@/config/routes";

const summaryRegions = [
  {
    title: "Resumo financeiro",
    description: "Espaco reservado para indicadores consolidados futuros.",
    icon: CreditCard
  },
  {
    title: "Resumo operacional",
    description: "Area futura para leitura rapida da rotina do ERP.",
    icon: ClipboardList
  },
  {
    title: "Atencao de estoque",
    description: "Regiao preparada para sinais vindos do backend.",
    icon: Boxes
  }
] as const;

const operationRegions = [
  {
    title: "Compras e recebimentos",
    description: "Bloco reservado para acompanhamento futuro de compras.",
    icon: PackageSearch
  },
  {
    title: "Vendas",
    description: "Bloco reservado para acompanhamento futuro de vendas.",
    icon: ShoppingCart
  },
  {
    title: "Clientes",
    description: "Bloco reservado para sinais futuros da base de clientes.",
    icon: Users
  }
] as const;

const quickActions = [
  {
    title: "Vendas",
    description: "Abrir rota placeholder",
    href: routes.vendas,
    icon: ShoppingCart
  },
  {
    title: "Estoque",
    description: "Abrir rota placeholder",
    href: routes.estoque,
    icon: Boxes
  },
  {
    title: "Compras",
    description: "Abrir rota placeholder",
    href: routes.compras,
    icon: ClipboardList
  },
  {
    title: "Financeiro",
    description: "Abrir rota placeholder",
    href: routes.financeiro,
    icon: CreditCard
  }
] as const;

export function DashboardPlaceholder() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Estrutura inicial para acompanhar a operacao do Amani ERP em features futuras."
      />

      <section className="rounded-amani border border-border bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <Badge variant="accent">Placeholder</Badge>
            <h2 className="text-lg font-semibold text-text-primary">
              Base visual do painel gerencial
            </h2>
            <p className="text-sm leading-6 text-text-secondary">
              Esta tela reserva regioes para indicadores futuros sem exibir dados
              reais, valores, rankings ou graficos.
            </p>
          </div>
          <div className="rounded-amani border border-border bg-surface-light px-3 py-2 text-xs font-medium text-text-secondary">
            Backend sera a fonte das metricas
          </div>
        </div>
      </section>

      <section className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
        {summaryRegions.map((region) => (
          <MetricPlaceholderCard key={region.title} {...region} />
        ))}
      </section>

      <section className="grid gap-4 desktop:grid-cols-[2fr_1fr]">
        <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
          {operationRegions.map((region) => (
            <MetricPlaceholderCard key={region.title} {...region} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-amani border border-border bg-surface-light text-warning">
                <Siren className="h-5 w-5" aria-hidden />
              </div>
              <Badge variant="warning">Futuro</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle>Alertas operacionais</CardTitle>
            <CardDescription className="mt-2">
              Area reservada para alertas calculados pelo backend quando os
              fluxos operacionais estiverem disponiveis.
            </CardDescription>
          </CardContent>
        </Card>
      </section>

      <QuickActionGrid actions={quickActions} />
    </main>
  );
}
