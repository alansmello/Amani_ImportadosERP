"use client";

import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  Pencil,
  ReceiptText
} from "lucide-react";
import { useState } from "react";

import {
  formatReceivableCurrency,
  formatReceivableDate,
  formatReceivableOrigin
} from "@/components/financeiro/receivable-formatters";
import { DeleteReceivableDialog } from "@/components/financeiro/delete-receivable-dialog";
import { ReceivablePaymentModal } from "@/components/financeiro/receivable-payment-modal";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
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
import { contaReceberEditar, vendaDetalhe } from "@/config/routes";
import type { Customer } from "@/types/customer";
import type { ReceivableListItem } from "@/types/receivable";

type ReceivablesListProps = {
  receivables: ReceivableListItem[];
  customers: Customer[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  usingFilters?: boolean;
};

type PaymentModalState = {
  open: boolean;
  receivableId: string;
  clienteName: string;
  saldo: number;
  formaPagamento?: string | null;
};

const CLOSED_MODAL: PaymentModalState = {
  open: false,
  receivableId: "",
  clienteName: "",
  saldo: 0,
  formaPagamento: null
};

function resolveClienteName(
  receivable: ReceivableListItem,
  customers: Customer[]
): string {
  if (!receivable.clienteId) {
    return receivable.clienteId ? String(receivable.clienteId).slice(0, 8) + "…" : "—";
  }

  const customer = customers.find((c) => c.id === receivable.clienteId);
  return customer?.nome ?? receivable.clienteId.slice(0, 8) + "…";
}

function StatusBadge({ status }: { status: string }) {
  const isPago = status === "Pago";
  return (
    <span
      className={
        isPago
          ? "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-success ring-1 ring-inset ring-success/30"
          : "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-warning ring-1 ring-inset ring-warning/30"
      }
    >
      {status}
    </span>
  );
}

export function ReceivablesList({
  receivables,
  customers,
  isLoading,
  isError,
  onRetry,
  usingFilters = false
}: ReceivablesListProps) {
  const [paymentModal, setPaymentModal] =
    useState<PaymentModalState>(CLOSED_MODAL);

  if (isLoading) {
    return (
      <LoadingState
        title="Carregando contas a receber"
        description="Aguarde enquanto as contas sao carregadas."
      />
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Nao foi possivel carregar as contas"
        description="Verifique a conexao com o servidor e tente novamente."
        onRetry={onRetry}
      />
    );
  }

  if (receivables.length === 0) {
    return (
      <EmptyState
        title={
          usingFilters
            ? "Nenhuma conta corresponde aos filtros"
            : "Nenhuma conta a receber cadastrada"
        }
        description={
          usingFilters
            ? "Ajuste os filtros ou limpe a busca para ver todas as contas."
            : "Use a acao Nova conta a receber para registrar a primeira conta."
        }
        variant="empty"
        icon={<ReceiptText className="h-5 w-5" aria-hidden />}
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Contas a receber</CardTitle>
          <CardDescription>
            {receivables.length} conta(s) — Total a receber:{" "}
            {formatReceivableCurrency(
              receivables.reduce((sum, r) => sum + r.saldo, 0)
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          <Table className="min-w-[52rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receivables.map((receivable) => {
                const clienteName = resolveClienteName(receivable, customers);

                return (
                  <TableRow key={receivable.id}>
                    <TableCell className="min-w-36 max-w-52 font-medium">
                      <span className="block break-words">{clienteName}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <StatusBadge status={receivable.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatReceivableCurrency(receivable.valorTotal)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatReceivableCurrency(receivable.totalPago)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatReceivableCurrency(receivable.saldo)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {receivable.vendaId ? (
                        <Link
                          href={vendaDetalhe(receivable.vendaId)}
                          className="flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                        >
                          <span>{formatReceivableOrigin(receivable.origem)}</span>
                          <ArrowRight className="h-3 w-3" aria-hidden />
                        </Link>
                      ) : (
                        formatReceivableOrigin(receivable.origem)
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatReceivableDate(receivable.dataVencimento)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {receivable.status === "Pendente" ? (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              setPaymentModal({
                                open: true,
                                receivableId: receivable.id,
                                clienteName,
                                saldo: receivable.saldo,
                                formaPagamento: receivable.formaPagamento
                              })
                            }
                          >
                            <CreditCard className="h-4 w-4" aria-hidden />
                            <span className="sr-only tablet:not-sr-only">
                              Pagamento
                            </span>
                          </Button>
                        ) : null}
                        <Button
                          asChild
                          variant="secondary"
                          size="sm"
                        >
                          <Link href={contaReceberEditar(receivable.id)}>
                            <Pencil className="h-4 w-4" aria-hidden />
                            <span className="sr-only tablet:not-sr-only">
                              Editar
                            </span>
                          </Link>
                        </Button>
                        <DeleteReceivableDialog
                          receivableId={receivable.id}
                          clienteName={clienteName}
                          valorTotal={receivable.valorTotal}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ReceivablePaymentModal
        open={paymentModal.open}
        onOpenChange={(open) => {
          if (!open) setPaymentModal(CLOSED_MODAL);
        }}
        receivableId={paymentModal.receivableId}
        clienteName={paymentModal.clienteName}
        saldo={paymentModal.saldo}
        formaPagamento={paymentModal.formaPagamento}
      />
    </>
  );
}
