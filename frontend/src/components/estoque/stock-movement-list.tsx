import { ArrowRightLeft, Info } from "lucide-react";

import {
  formatMovementOrigin,
  formatMovementType,
  formatStockCurrency,
  formatStockDate,
  formatStockQuantity
} from "@/components/estoque/stock-formatters";
import { Badge } from "@/components/ui/badge";
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
import type { StockMovement } from "@/types/stock";

type StockMovementListProps = {
  movements: StockMovement[];
  totalMovements?: number;
};

function getMovementVariant(type: string) {
  const normalized = type.toLocaleLowerCase("pt-BR");

  if (normalized.includes("saida")) {
    return "warning" as const;
  }

  if (normalized.includes("entrada")) {
    return "success" as const;
  }

  return "info" as const;
}

function getReferenceLabel(movement: StockMovement) {
  if (movement.compraId) {
    return `Compra ${movement.compraId}`;
  }

  if (movement.vendaId) {
    return `Venda ${movement.vendaId}`;
  }

  return movement.referenciaId ?? "-";
}

export function StockMovementList({
  movements,
  totalMovements
}: StockMovementListProps) {
  const isLimited =
    typeof totalMovements === "number" && totalMovements > movements.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-amani border border-border bg-surface-light text-primary">
              <ArrowRightLeft className="h-5 w-5" aria-hidden />
            </div>
            <CardTitle className="break-words leading-6">
              Movimentacoes
            </CardTitle>
          </div>
          <Badge variant="neutral">{movements.length} exibidas</Badge>
        </div>
      </CardHeader>
      <CardContent className="min-w-0 space-y-4">
        {isLimited ? (
          <div className="flex gap-3 rounded-amani border border-info bg-surface-light p-3 text-sm text-info">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>
              Existem {totalMovements} movimentacoes para os filtros atuais. A
              lista exibe as mais recentes retornadas pela fonte oficial.
            </p>
          </div>
        ) : null}

        <div className="grid gap-3 desktop:hidden">
          {movements.map((movement) => (
            <div
              key={movement.id}
              className="rounded-amani border border-border bg-surface-light p-4"
            >
              <div className="flex flex-col gap-2 tablet:flex-row tablet:items-center tablet:justify-between">
                <Badge variant={getMovementVariant(movement.tipo)}>
                  {formatMovementType(movement.tipo)}
                </Badge>
                <span className="text-sm text-text-secondary">
                  {formatStockDate(movement.data)}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="flex flex-col gap-1 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-3">
                  <dt className="text-text-secondary">Quantidade</dt>
                  <dd className="font-medium text-text-primary">
                    {formatStockQuantity(movement.quantidade)}
                  </dd>
                </div>
                <div className="grid gap-1">
                  <dt className="text-text-secondary">Origem</dt>
                  <dd className="break-words text-text-primary">
                    {formatMovementOrigin(movement.origem)}
                  </dd>
                </div>
                <div className="grid gap-1">
                  <dt className="text-text-secondary">Referencia</dt>
                  <dd className="break-all text-text-primary">
                    {getReferenceLabel(movement)}
                  </dd>
                </div>
                <div className="flex flex-col gap-1 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-3">
                  <dt className="text-text-secondary">Valor unitario</dt>
                  <dd className="font-medium text-text-primary">
                    {formatStockCurrency(movement.valorUnitario)}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>

        <div className="hidden rounded-amani border border-border bg-surface desktop:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead>Valor unitario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    <Badge variant={getMovementVariant(movement.tipo)}>
                      {formatMovementType(movement.tipo)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatStockQuantity(movement.quantidade)}</TableCell>
                  <TableCell>{formatStockDate(movement.data)}</TableCell>
                  <TableCell className="max-w-64 break-words">
                    {formatMovementOrigin(movement.origem)}
                  </TableCell>
                  <TableCell className="max-w-64 break-all">
                    {getReferenceLabel(movement)}
                  </TableCell>
                  <TableCell>{formatStockCurrency(movement.valorUnitario)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
