"use client";

import {
  AlertCircle,
  Boxes,
  CalendarClock,
  CircleDollarSign,
  Gem,
  HandCoins,
  Sparkles,
  TrendingUp
} from "lucide-react";

import {
  formatDashboardCurrency,
  formatDashboardDate,
  formatDashboardNullableCurrency,
  formatDashboardQuantity
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

type DashboardPatrimonialGridProps = {
  data?: DashboardFinancialKpis;
  isLoading?: boolean;
  isError?: boolean;
  isStaleForPeriod?: boolean;
  onRetry?: () => void;
};

type PatrimonialField = keyof Pick<
  DashboardFinancialKpis,
  | "contasReceberAbertas"
  | "contasReceberVencidas"
  | "contasReceberAVencer"
  | "valorEstoqueAoCusto"
  | "valorEstoqueAoPrecoVenda"
  | "lucroPotencialEstoque"
  | "valorTotalRealistaOperacao"
  | "valorTotalPotencialOperacao"
>;

type PatrimonialDefinition = {
  title: string;
  field: PatrimonialField;
  icon: typeof CircleDollarSign;
  tone: string;
  description: string;
  badge: "Snapshot" | "Potencial" | "Referencia";
  nullable?: boolean;
};

const patrimonialDefinitions: PatrimonialDefinition[] = [
  {
    title: "Recebiveis em aberto",
    field: "contasReceberAbertas",
    icon: HandCoins,
    tone: "text-info",
    badge: "Referencia",
    description: "Total em aberto ate a data de referencia."
  },
  {
    title: "Recebiveis vencidas",
    field: "contasReceberVencidas",
    icon: AlertCircle,
    tone: "text-danger",
    badge: "Snapshot",
    nullable: true,
    description: "Saldo positivo com vencimento anterior a referencia."
  },
  {
    title: "Recebiveis a vencer",
    field: "contasReceberAVencer",
    icon: CalendarClock,
    tone: "text-warning",
    badge: "Snapshot",
    nullable: true,
    description: "Saldo positivo com vencimento igual ou posterior a referencia."
  },
  {
    title: "Estoque ao custo",
    field: "valorEstoqueAoCusto",
    icon: Boxes,
    tone: "text-primary",
    badge: "Snapshot",
    nullable: true,
    description: "Saldo disponivel valorizado pelo custo medio calculavel."
  },
  {
    title: "Estoque ao preco de venda",
    field: "valorEstoqueAoPrecoVenda",
    icon: Sparkles,
    tone: "text-accent",
    badge: "Potencial",
    nullable: true,
    description: "Potencial bruto se vendido hoje ao preco atual de tabela."
  },
  {
    title: "Lucro potencial do estoque",
    field: "lucroPotencialEstoque",
    icon: TrendingUp,
    tone: "text-success",
    badge: "Potencial",
    nullable: true,
    description: "Margem potencial apenas onde ha custo medio calculavel."
  },
  {
    title: "Valor realista da operacao",
    field: "valorTotalRealistaOperacao",
    icon: CircleDollarSign,
    tone: "text-primary",
    badge: "Snapshot",
    nullable: true,
    description: "Caixa final + recebiveis abertos + estoque ao custo."
  },
  {
    title: "Valor potencial da operacao",
    field: "valorTotalPotencialOperacao",
    icon: Gem,
    tone: "text-accent",
    badge: "Potencial",
    nullable: true,
    description: "Caixa final + recebiveis abertos + estoque ao preco de venda."
  }
];

function formatPatrimonialValue(
  data: DashboardFinancialKpis,
  definition: PatrimonialDefinition
) {
  const value = data[definition.field];

  if (definition.nullable) {
    return formatDashboardNullableCurrency(value);
  }

  return formatDashboardCurrency(value);
}

function badgeVariant(badge: PatrimonialDefinition["badge"]) {
  if (badge === "Potencial") {
    return "accent" as const;
  }

  if (badge === "Snapshot") {
    return "neutral" as const;
  }

  return "info" as const;
}

export function DashboardPatrimonialGrid({
  data,
  isLoading = false,
  isError = false,
  isStaleForPeriod = false,
  onRetry
}: DashboardPatrimonialGridProps) {
  if (isLoading || isStaleForPeriod) {
    return (
      <DashboardSectionState
        state="loading"
        title="Carregando posicao patrimonial"
        description="Aguardando recebiveis, estoque e valor da operacao para o periodo selecionado."
        className="tablet:col-span-2 desktop:col-span-4"
      />
    );
  }

  if (isError) {
    return (
      <DashboardSectionState
        state="error"
        title="Nao foi possivel carregar a posicao patrimonial"
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
        title="Patrimonio indisponivel"
        description="Nenhum indicador patrimonial foi retornado para o periodo atual."
        className="tablet:col-span-2 desktop:col-span-4"
      />
    );
  }

  const dataReferencia = formatDashboardDate(data.filtrosAplicados.dataReferencia);
  const estoqueSemCusto = data.quantidadeEstoqueSemCusto ?? 0;

  return (
    <>
      {patrimonialDefinitions.map((definition) => {
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
              <Badge variant={badgeVariant(definition.badge)}>
                {definition.badge}
              </Badge>
            </CardHeader>
            <CardContent className="min-w-0">
              <CardTitle className="text-sm text-text-secondary">
                {definition.title}
              </CardTitle>
              <p className="mt-3 break-words text-2xl font-semibold leading-tight text-text-primary">
                {formatPatrimonialValue(data, definition)}
              </p>
              <CardDescription className="mt-3">
                {definition.description} Referencia em {dataReferencia}.
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}

      {estoqueSemCusto > 0 ? (
        <DashboardSectionState
          state="incomplete"
          title="Estoque com lacunas de custo"
          description={`${formatDashboardQuantity(estoqueSemCusto)} unidade(s) entram no potencial de venda, mas nao no valor ao custo.`}
          notices={data.avisos.filter(
            (aviso) => aviso.codigo === "ESTOQUE_CUSTO_MEDIO_AUSENTE"
          )}
          className="tablet:col-span-2 desktop:col-span-4"
        />
      ) : null}
    </>
  );
}
