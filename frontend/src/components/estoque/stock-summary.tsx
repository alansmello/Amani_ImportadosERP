import { AlertTriangle, Boxes, CircleCheck, CircleOff } from "lucide-react";
import type { ComponentType } from "react";

import {
  getStockBalanceVariant,
  formatStockQuantity
} from "@/components/estoque/stock-formatters";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { StockProduct } from "@/types/stock";

type StockSummaryProps = {
  products: StockProduct[];
};

type SummaryItem = {
  label: string;
  value: number;
  tone: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

export function StockSummary({ products }: StockSummaryProps) {
  const totalProducts = products.length;
  const positiveBalances = products.filter(
    (product) => getStockBalanceVariant(product.saldoAtual) === "positive"
  ).length;
  const zeroBalances = products.filter(
    (product) => getStockBalanceVariant(product.saldoAtual) === "zero"
  ).length;
  const negativeBalances = products.filter(
    (product) => getStockBalanceVariant(product.saldoAtual) === "negative"
  ).length;

  const items: SummaryItem[] = [
    {
      label: "Produtos exibidos",
      value: totalProducts,
      tone: "text-primary",
      icon: Boxes
    },
    {
      label: "Com saldo",
      value: positiveBalances,
      tone: "text-success",
      icon: CircleCheck
    },
    {
      label: "Sem saldo",
      value: zeroBalances,
      tone: "text-info",
      icon: CircleOff
    },
    {
      label: "Inconsistencias",
      value: negativeBalances,
      tone: "text-danger",
      icon: AlertTriangle
    }
  ];

  return (
    <section
      className="grid min-w-0 gap-3 tablet:grid-cols-2 desktop:grid-cols-4"
      aria-label="Resumo de estoque"
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.label}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-sm text-text-secondary">
                  {item.label}
                </CardTitle>
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-amani border border-border bg-surface-light",
                    item.tone
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold leading-none text-text-primary">
                {formatStockQuantity(item.value)}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
