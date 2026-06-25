"use client";

import {
  CircleDollarSign,
  HandCoins,
  ReceiptText,
  TrendingUp
} from "lucide-react";

import {
  formatDashboardCurrency,
  formatDashboardDate
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

const kpiDefinitions = [
  {
    title: "Faturamento",
    field: "receitaTotal",
    icon: CircleDollarSign,
    tone: "text-success"
  },
  {
    title: "Lucro",
    field: "lucroTotal",
    icon: TrendingUp,
    tone: "text-primary"
  },
  {
    title: "Despesas",
    field: "totalDespesas",
    icon: ReceiptText,
    tone: "text-warning"
  },
  {
    title: "Recebiveis",
    field: "contasReceberAbertas",
    icon: HandCoins,
    tone: "text-info"
  }
] as const;

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
        className="tablet:col-span-2 desktop:col-span-4"
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
        className="tablet:col-span-2 desktop:col-span-4"
      />
    );
  }

  if (!data) {
    return (
      <DashboardSectionState
        state="empty"
        title="KPIs indisponiveis"
        description="Nenhum indicador financeiro foi retornado para o periodo atual."
        className="tablet:col-span-2 desktop:col-span-4"
      />
    );
  }

  return (
    <>
      {kpiDefinitions.map(({ title, field, icon: Icon, tone }) => (
        <Card key={field} className="min-h-40">
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-amani border border-border bg-surface-light",
                tone
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <Badge variant="neutral">Periodo</Badge>
          </CardHeader>
          <CardContent className="min-w-0">
            <CardTitle className="text-sm text-text-secondary">
              {title}
            </CardTitle>
            <p className="mt-3 break-words text-2xl font-semibold leading-tight text-text-primary">
              {formatDashboardCurrency(data[field])}
            </p>
            <CardDescription className="mt-3">
              Fonte oficial atualizada em{" "}
              {formatDashboardDate(data.filtrosAplicados.dataReferencia)}
            </CardDescription>
          </CardContent>
        </Card>
      ))}

      {data.avisos.length > 0 ? (
        <DashboardSectionState
          state="incomplete"
          title="Dados financeiros incompletos"
          description="A API retornou avisos para leitura dos KPIs deste periodo."
          notices={data.avisos}
          className="tablet:col-span-2 desktop:col-span-4"
        />
      ) : null}
    </>
  );
}
