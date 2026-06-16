"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";

import { EmptyState } from "@/components/states/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { compraDetalhe } from "@/config/routes";
import type { PurchaseListItem } from "@/types/purchase";
import type { Supplier } from "@/types/supplier";

type PurchaseListProps = {
  purchases: PurchaseListItem[];
  suppliers: Supplier[];
  pendingByPurchase?: Record<string, number>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short"
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  if (value <= 0) {
    return "Valor nao informado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function getSupplierName(suppliers: Supplier[], id: string) {
  return suppliers.find((supplier) => supplier.id === id)?.nome ?? "Fornecedor";
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    EmTransito: "Em transito",
    ParcialmenteRecebida: "Parcial",
    Recebida: "Recebida",
    Finalizada: "Finalizada",
    ComPerda: "Com perda"
  };

  return labels[status] ?? status;
}

function getStatusVariant(status: string) {
  if (status.toLowerCase().includes("perda")) {
    return "warning" as const;
  }

  if (status.toLowerCase().includes("recebida")) {
    return "success" as const;
  }

  return "info" as const;
}

export function PurchaseList({
  purchases,
  suppliers,
  pendingByPurchase = {}
}: PurchaseListProps) {
  if (purchases.length === 0) {
    return (
      <EmptyState
        title="Nenhuma compra encontrada"
        description="Ajuste os filtros ou registre uma nova compra para acompanhar mercadorias em transito."
        variant="empty"
        icon={<ClipboardList className="h-5 w-5" aria-hidden />}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compras</CardTitle>
        <CardDescription>
          Lista operacional com fornecedor, data, situacao e pendencias.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Situacao</TableHead>
              <TableHead>Pendencia</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="text-right">Acao</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => {
              const pendingQuantity = pendingByPurchase[purchase.id] ?? 0;

              return (
                <TableRow key={purchase.id}>
                  <TableCell className="min-w-40 font-medium">
                    {getSupplierName(suppliers, purchase.fornecedorId)}
                  </TableCell>
                  <TableCell>{formatDate(purchase.dataCompra)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(purchase.status)}>
                      {getStatusLabel(purchase.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {pendingQuantity > 0
                      ? `${pendingQuantity} unidade(s)`
                      : "Sem pendencia informada"}
                  </TableCell>
                  <TableCell>{formatCurrency(purchase.totalCompra)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="secondary" size="sm">
                      <Link href={compraDetalhe(purchase.id)}>
                        <span>Detalhe</span>
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
