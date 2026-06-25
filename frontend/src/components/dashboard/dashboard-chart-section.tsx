"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

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
import type {
  DashboardChartPoint,
  DashboardChartSeries,
  IncompleteDataNotice
} from "@/types/dashboard";

type DashboardChartSectionProps = {
  series?: DashboardChartSeries[];
  notices?: IncompleteDataNotice[];
  isLoading?: boolean;
  isError?: boolean;
  isStaleForPeriod?: boolean;
  onRetry?: () => void;
};

type ChartPoint = DashboardChartPoint & {
  label: string;
};

function formatChartValue(value: number, unidade: string) {
  const normalizedUnit = unidade.toLowerCase();

  return normalizedUnit.includes("r$") || normalizedUnit.includes("brl")
    ? formatDashboardCurrency(value)
    : formatDashboardQuantity(value);
}

function toChartPoints(points: DashboardChartPoint[]): ChartPoint[] {
  return points.map((point) => ({
    ...point,
    label: point.rotulo || point.periodo.slice(0, 10)
  }));
}

function shouldUseBarChart(tipoGrafico: string) {
  const normalized = tipoGrafico.toLowerCase();
  return normalized.includes("categoria") || normalized.includes("ranking");
}

export function DashboardChartSection({
  series,
  notices = [],
  isLoading = false,
  isError = false,
  isStaleForPeriod = false,
  onRetry
}: DashboardChartSectionProps) {
  if (isLoading || isStaleForPeriod) {
    return (
      <DashboardSectionState
        state="loading"
        title="Carregando graficos"
        description="Aguardando series oficiais para o periodo selecionado."
      />
    );
  }

  if (isError) {
    return (
      <DashboardSectionState
        state="error"
        title="Nao foi possivel carregar graficos"
        description="A fonte oficial de graficos nao respondeu para este periodo."
        onAction={onRetry}
      />
    );
  }

  if (!series || series.length === 0) {
    return (
      <DashboardSectionState
        state="empty"
        title="Sem series no periodo"
        description="A API nao retornou pontos suficientes para graficos no filtro aplicado."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 desktop:grid-cols-2">
        {series.map((chart) => {
          const points = toChartPoints(chart.pontos);
          const hasPoints = points.length > 0;
          const ChartComponent = shouldUseBarChart(chart.tipoGrafico)
            ? BarChart
            : LineChart;

          return (
            <Card key={`${chart.tipoGrafico}-${chart.nomeSerie}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div className="min-w-0">
                  <CardTitle className="break-words">
                    {chart.nomeSerie || formatDashboardLabel(chart.tipoGrafico)}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {formatDashboardLabel(chart.granularidade)} ·{" "}
                    {formatDashboardLabel(chart.unidade)}
                  </CardDescription>
                </div>
                <Badge variant="neutral">
                  {formatChartValue(chart.totalConsolidado, chart.unidade)}
                </Badge>
              </CardHeader>
              <CardContent>
                {hasPoints ? (
                  <div className="h-64 min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <ChartComponent
                        data={points}
                        margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
                      >
                        <CartesianGrid stroke="rgba(148, 163, 184, 0.18)" />
                        <XAxis
                          dataKey="label"
                          tick={{ fill: "#94a3b8", fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                          minTickGap={12}
                        />
                        <YAxis
                          tick={{ fill: "#94a3b8", fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                          width={48}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
                          contentStyle={{
                            background: "#111827",
                            border: "1px solid rgba(148, 163, 184, 0.24)",
                            borderRadius: 8,
                            color: "#f8fafc"
                          }}
                          formatter={(value) =>
                            typeof value === "number"
                              ? formatChartValue(value, chart.unidade)
                              : value
                          }
                          labelFormatter={(label) => String(label)}
                        />
                        {shouldUseBarChart(chart.tipoGrafico) ? (
                          <Bar
                            dataKey="valor"
                            fill="#38bdf8"
                            radius={[4, 4, 0, 0]}
                          />
                        ) : (
                          <Line
                            type="monotone"
                            dataKey="valor"
                            stroke="#38bdf8"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        )}
                      </ChartComponent>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <DashboardSectionState
                    state="empty"
                    title="Serie sem pontos"
                    description="A API retornou a serie, mas sem pontos para renderizacao."
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {notices.length > 0 ? (
        <DashboardSectionState
          state="incomplete"
          title="Graficos com dados incompletos"
          description="A API retornou avisos para as series do periodo."
          notices={notices}
        />
      ) : null}
    </div>
  );
}
