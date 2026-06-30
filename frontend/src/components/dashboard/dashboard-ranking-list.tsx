"use client";

import { Award, Boxes, TrendingUp, UserRound } from "lucide-react";

import {
  formatDashboardCurrency,
  formatDashboardLabel,
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
import type { DashboardRanking, IncompleteDataNotice } from "@/types/dashboard";

const HIDDEN_HOME_RANKING_TYPES = new Set([
  "ProdutosComMaiorEstoque",
  "ProdutosComMenorEstoque"
]);

type DashboardRankingListProps = {
  rankings?: DashboardRanking[];
  notices?: IncompleteDataNotice[];
  isLoading?: boolean;
  isError?: boolean;
  isStaleForPeriod?: boolean;
  onRetry?: () => void;
};

function getRankingName(ranking: DashboardRanking) {
  return "clienteNome" in ranking ? ranking.clienteNome : ranking.produtoNome;
}

function getRankingIcon(tipoRanking: string) {
  if (tipoRanking.toLowerCase().includes("cliente")) {
    return UserRound;
  }

  if (tipoRanking.toLowerCase().includes("estoque")) {
    return Boxes;
  }

  if (tipoRanking.toLowerCase().includes("lucr")) {
    return TrendingUp;
  }

  return Award;
}

function groupRankings(rankings: DashboardRanking[]) {
  return rankings.reduce<Record<string, DashboardRanking[]>>((groups, ranking) => {
    groups[ranking.tipoRanking] = groups[ranking.tipoRanking] ?? [];
    groups[ranking.tipoRanking].push(ranking);
    return groups;
  }, {});
}

export function DashboardRankingList({
  rankings,
  notices = [],
  isLoading = false,
  isError = false,
  isStaleForPeriod = false,
  onRetry
}: DashboardRankingListProps) {
  if (isLoading || isStaleForPeriod) {
    return (
      <DashboardSectionState
        state="loading"
        title="Carregando rankings"
        description="Aguardando rankings oficiais para o periodo selecionado."
      />
    );
  }

  if (isError) {
    return (
      <DashboardSectionState
        state="error"
        title="Nao foi possivel carregar rankings"
        description="A fonte oficial de rankings nao respondeu para este periodo."
        onAction={onRetry}
      />
    );
  }

  if (!rankings || rankings.length === 0) {
    return (
      <DashboardSectionState
        state="empty"
        title="Sem rankings no periodo"
        description="A API nao retornou produtos ou clientes ranqueados para o filtro aplicado."
      />
    );
  }

  const visibleRankings = rankings.filter(
    (ranking) => !HIDDEN_HOME_RANKING_TYPES.has(ranking.tipoRanking)
  );

  if (visibleRankings.length === 0) {
    return (
      <DashboardSectionState
        state="empty"
        title="Sem rankings no periodo"
        description="Nenhum ranking gerencial disponivel para exibicao na home."
      />
    );
  }

  const groupedRankings = groupRankings(visibleRankings);

  return (
    <div className="space-y-4">
      {Object.entries(groupedRankings).map(([tipoRanking, items]) => {
        const Icon = getRankingIcon(tipoRanking);

        return (
          <Card key={tipoRanking}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-amani border border-border bg-surface-light text-primary">
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <CardTitle className="break-words">
                    {formatDashboardLabel(tipoRanking)}
                  </CardTitle>
                </div>
                <CardDescription className="mt-2">
                  Ordem, valores e criterios retornados pelo backend.
                </CardDescription>
              </div>
              <Badge variant="neutral">{items.length} itens</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((ranking) => (
                <article
                  key={`${ranking.tipoRanking}-${ranking.posicao}-${getRankingName(ranking)}`}
                  className="rounded-amani border border-border bg-surface-light p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-medium text-text-primary">
                        {ranking.posicao}. {getRankingName(ranking)}
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        {formatDashboardLabel(ranking.criterioOrdenacao)}
                      </p>
                    </div>
                    <Badge variant="info">
                      {formatDashboardQuantity(ranking.quantidade)}
                    </Badge>
                  </div>
                  {ranking.valorFinanceiro !== null &&
                  ranking.valorFinanceiro !== undefined ? (
                    <p className="mt-3 text-sm font-semibold text-text-primary">
                      {formatDashboardCurrency(ranking.valorFinanceiro)}
                    </p>
                  ) : null}
                  {ranking.aviso ? (
                    <p className="mt-2 rounded-amani border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-text-secondary">
                      {ranking.aviso.mensagem}
                    </p>
                  ) : null}
                </article>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {notices.length > 0 ? (
        <DashboardSectionState
          state="incomplete"
          title="Rankings com dados incompletos"
          description="A API retornou avisos sobre lacunas para alguns rankings."
          notices={notices}
        />
      ) : null}
    </div>
  );
}
