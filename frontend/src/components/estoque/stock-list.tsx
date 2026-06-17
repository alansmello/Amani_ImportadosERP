import Link from "next/link";
import { ArrowRight, Boxes } from "lucide-react";

import {
  formatStockQuantity,
  getStockBalanceLabel,
  getStockBalanceVariant
} from "@/components/estoque/stock-formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { estoqueDetalhe } from "@/config/routes";
import { cn } from "@/lib/cn";
import type { StockProduct } from "@/types/stock";

type StockListProps = {
  products: StockProduct[];
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

function getProductIdentity(product: StockProduct) {
  return product.codigo ?? product.categoriaNome ?? product.categoriaId ?? product.produtoId;
}

function StockBalance({ product }: { product: StockProduct }) {
  const variant = getStockBalanceVariant(product.saldoAtual);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={cn(
          "font-semibold tabular-nums",
          balanceClassByVariant[variant]
        )}
      >
        {formatStockQuantity(product.saldoAtual)}
      </span>
      <Badge variant={badgeByVariant[variant]}>
        {getStockBalanceLabel(product.saldoAtual)}
      </Badge>
    </div>
  );
}

export function StockList({ products }: StockListProps) {
  return (
    <section aria-label="Produtos em estoque">
      <div className="grid gap-3 desktop:hidden">
        {products.map((product) => (
          <Card key={product.produtoId}>
            <CardHeader className="pb-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-amani border border-border bg-surface-light text-primary">
                  <Boxes className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="break-words leading-6">
                    {product.nome}
                  </CardTitle>
                  <p className="mt-1 break-all text-sm text-text-secondary">
                    {getProductIdentity(product)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-text-secondary">Saldo atual</span>
                <StockBalance product={product} />
              </div>
              <Button asChild variant="secondary" className="w-full">
                <Link href={estoqueDetalhe(product.produtoId)}>
                  <span>Movimentacoes</span>
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="hidden rounded-amani border border-border bg-surface desktop:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Identificacao</TableHead>
              <TableHead>Saldo atual</TableHead>
              <TableHead className="w-48">Historico</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.produtoId}>
                <TableCell className="font-medium">{product.nome}</TableCell>
                <TableCell className="break-all text-text-secondary">
                  {getProductIdentity(product)}
                </TableCell>
                <TableCell>
                  <StockBalance product={product} />
                </TableCell>
                <TableCell>
                  <Button asChild variant="secondary" size="sm">
                    <Link href={estoqueDetalhe(product.produtoId)}>
                      <span>Movimentacoes</span>
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
