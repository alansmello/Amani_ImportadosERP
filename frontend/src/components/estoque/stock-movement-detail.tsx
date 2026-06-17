import { Boxes } from "lucide-react";

import {
  formatStockQuantity,
  getStockBalanceLabel,
  getStockBalanceVariant
} from "@/components/estoque/stock-formatters";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";
import type { StockMovementHistory } from "@/types/stock";

type StockMovementDetailProps = {
  history: StockMovementHistory;
  product?: Product;
};

const badgeByVariant = {
  positive: "success",
  zero: "info",
  negative: "danger"
} as const;

const balanceClassByVariant = {
  positive: "text-success",
  zero: "text-text-secondary",
  negative: "text-danger"
} as const;

export function StockMovementDetail({
  history,
  product
}: StockMovementDetailProps) {
  const variant = getStockBalanceVariant(history.saldoAtual);
  const productName = history.nomeProduto ?? product?.nome ?? "Produto";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 tablet:flex-row tablet:items-start tablet:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-amani border border-border bg-surface-light text-primary">
              <Boxes className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <CardTitle className="break-words leading-6">
                {productName}
              </CardTitle>
              <CardDescription className="mt-1 break-all">
                {product?.id ?? history.produtoId}
              </CardDescription>
            </div>
          </div>
          <Badge variant={badgeByVariant[variant]}>
            {getStockBalanceLabel(history.saldoAtual)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-amani border border-border bg-surface-light p-4">
          <p className="text-xs uppercase text-text-secondary">Saldo atual</p>
          <p
            className={cn(
              "mt-2 text-2xl font-semibold tabular-nums",
              balanceClassByVariant[variant]
            )}
          >
            {formatStockQuantity(history.saldoAtual)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
