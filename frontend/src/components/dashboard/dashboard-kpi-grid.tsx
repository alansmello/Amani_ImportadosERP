"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleDollarSign,
  Landmark,
  Scale,
  TrendingUp,
  Wallet
} from "lucide-react";

import {
  formatDashboardCurrency,
  formatDashboardDate,
  formatDashboardNullableCurrency
} from "@/components/dashboard/dashboard-formatters";
import { DashboardSectionState } from "@/components/dashboard/dashboard-section-state";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { DashboardFinancialKpis } from "@/types/dashboard";

type DashboardKpiGridProps = {
  data?: DashboardFinancialKpis;
  isLoading?: boolean;
  isError?: boolean;
  isStaleForPeriod?: boolean;
  onRetry?: () => void;
};

type KpiField = keyof Pick<
  DashboardFinancialKpis,
  | "receitaTotal"
  | "valoresRecebidos"
  | "saidasPeriodo"
  | "caixaInicialPeriodo"
  | "ajusteImplantacaoPeriodo"
  | "caixaFinalPeriodo"
  | "lucroTotal"
>;

type KpiDefinition = {
  title: string;
  field: KpiField;
  icon: typeof CircleDollarSign;
  tone: string;
  description: string;
  badge: string;
  nullable?: boolean;
};

const kpiDefinitions: KpiDefinition[] = [
  {
    title: "Faturamento",
    field: "receitaTotal",
    icon: CircleDollarSign,
    tone: "text-success",
    badge: "Competencia",
    description: "Vendas confirmadas no periodo por data da venda."
  },
  {
    title: "Entradas",
    field: "valoresRecebidos",
    icon: ArrowDownLeft,
    tone: "text-info",
    badge: "Caixa",
    description: "Pagamentos recebidos registrados no periodo."
  },
  {
    title: "Saidas estimadas",
    field: "saidasPeriodo",
    icon: ArrowUpRight,
    tone: "text-warning",
    badge: "Estimativa",
    nullable: true,
    description: "Compras e despesas registradas no periodo (estimativa)."
  },
  {
    title: "Caixa inicial",
    field: "caixaInicialPeriodo",
    icon: Landmark,
    tone: "text-text-secondary",
    badge: "Caixa",
    nullable: true,
    description: "Posicao acumulada antes do inicio do filtro."
  },
  {
    title: "Ajuste de implantacao",
    field: "ajusteImplantacaoPeriodo",
    icon: Scale,
    tone: "text-text-secondary",
    badge: "Caixa",
    nullable: true,
    description: "Saldo inicial de caixa registrado dentro do periodo."
  },
  {
    title: "Caixa final",
    field: "caixaFinalPeriodo",
    icon: Wallet,
    tone: "text-primary",
    badge: "Caixa",
    nullable: true,
    description:
      "Caixa inicial + ajuste + entradas - saidas estimadas do periodo."
  },
  {
    title: "Lucro",
    field: "lucroTotal",
    icon: TrendingUp,
    tone: "text-success",
    badge: "Competencia",
    description: "Lucro bruto calculado sobre itens com custo medio conhecido."
  }
];

function formatKpiValue(data: DashboardFinancialKpis, definition: KpiDefinition) {
  const value = data[definition.field];

  if (definition.nullable) {
    return formatDashboardNullableCurrency(value);
  }

  return formatDashboardCurrency(value);
}

export function DashboardKpiGrid({
  data,
  isLoading = false,
  isError = false,
  isStaleForPeriod = false,
  onRetry
}: DashboardKpiGridProps) {
  if (isLoading || isStaleForPeriod) {
    return (
      <DashboardSectionState
        state="loading"
        title="Carregando KPIs financeiros"
        description="Aguardando a fonte financeira oficial para o periodo selecionado."
        className="tablet:col-span-2 desktop:col-span-3"
      />
    );
  }

  if (isError) {
    return (
      <DashboardSectionState
        state="error"
        title="Nao foi possivel carregar os KPIs"
        description="A fonte financeira oficial nao respondeu para o periodo selecionado."
        onAction={onRetry}
        className="tablet:col-span-2 desktop:col-span-3"
      />
    );
  }

  if (!data) {
    return (
      <DashboardSectionState
        state="empty"
        title="KPIs indisponiveis"
        description="Nenhum indicador financeiro foi retornado para o periodo atual."
        className="tablet:col-span-2 desktop:col-span-3"
      />
    );
  }

  const dataReferencia = formatDashboardDate(data.filtrosAplicados.dataReferencia);

  return (
    <>
      {kpiDefinitions.map((definition) => {
        const Icon = definition.icon;

        return (
          <Card key={definition.field} className="min-h-40 min-w-0">
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-amani border border-border bg-surface-light",
                  definition.tone
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <Badge
                variant={
                  definition.badge === "Estimativa"
                    ? "warning"
                    : definition.badge === "Caixa"
                      ? "info"
                      : "neutral"
                }
              >
                {definition.badge}
              </Badge>
            </CardHeader>
            <CardContent className="min-w-0">
              <CardTitle className="text-sm text-text-secondary">
                {definition.title}
              </CardTitle>
              <p className="mt-3 break-words text-2xl font-semibold leading-tight text-text-primary">
                {formatKpiValue(data, definition)}
              </p>
              <CardDescription className="mt-3">
                {definition.description} Dados oficiais ate {dataReferencia}.
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}

      {data.avisos.length > 0 ? (
        <DashboardSectionState
          state="incomplete"
          title="Dados financeiros incompletos"
          description="A API retornou avisos para leitura dos KPIs deste periodo."
          notices={data.avisos}
          className="tablet:col-span-2 desktop:col-span-3"
        />
      ) : null}
    </>
  );
}
