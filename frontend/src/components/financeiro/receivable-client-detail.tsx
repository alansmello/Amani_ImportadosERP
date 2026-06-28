"use client";

import { ContextualLink } from "@/components/layout/contextual-link";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  CreditCard,
  ReceiptText
} from "lucide-react";
import { useState } from "react";

import {
  formatReceivableCurrency,
  formatReceivableDate,
  formatReceivableOrigin
} from "@/components/financeiro/receivable-formatters";
import { ReceivablePaymentModal } from "@/components/financeiro/receivable-payment-modal";
import { EmptyState } from "@/components/states/empty-state";
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
import { vendaDetalhe } from "@/config/routes";
import type { ReceivableClientDetail } from "@/types/receivable";

type ReceivableClientDetailProps = {
  clienteName: string;
  contas: ReceivableClientDetail[];
};

type PaymentModalState = {
  open: boolean;
  receivableId: string;
  saldo: number;
  formaPagamento?: ReceivableClientDetail["formaPagamento"];
};

const CLOSED_MODAL: PaymentModalState = {
  open: false,
  receivableId: "",
  saldo: 0,
  formaPagamento: null
};

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

export function ReceivableClientDetail({
  clienteName,
  contas
}: ReceivableClientDetailProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [paymentModal, setPaymentModal] =
    useState<PaymentModalState>(CLOSED_MODAL);

  function toggleExpanded(contaId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(contaId)) {
        next.delete(contaId);
      } else {
        next.add(contaId);
      }
      return next;
    });
  }

  if (contas.length === 0) {
    return (
      <EmptyState
        title="Nenhuma conta em aberto"
        description="Este cliente nao possui contas a receber em aberto no momento."
        variant="empty"
        icon={<ReceiptText className="h-5 w-5" aria-hidden />}
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="break-words">
            Contas de {clienteName}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {contas.map((conta) => {
            const isExpanded = expandedIds.has(conta.contaId);

            return (
              <div
                key={conta.contaId}
                className="rounded-amani border border-border bg-surface-light"
              >
                <div className="grid gap-3 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="grid gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={conta.status} />
                        <span className="text-xs text-text-secondary">
                          {formatReceivableDate(conta.dataVencimento)}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-4 text-sm">
                        <span>
                          <span className="text-text-secondary">Total: </span>
                          <span className="font-medium text-text-primary">
                            {formatReceivableCurrency(conta.valorTotal)}
                          </span>
                        </span>
                        <span>
                          <span className="text-text-secondary">Pago: </span>
                          <span className="font-medium text-text-primary">
                            {formatReceivableCurrency(conta.totalPago)}
                          </span>
                        </span>
                        <span>
                          <span className="text-text-secondary">Saldo: </span>
                          <span className="font-medium text-text-primary">
                            {formatReceivableCurrency(conta.saldo)}
                          </span>
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-text-secondary">
                        {conta.vendaId ? (
                          <ContextualLink
                            href={vendaDetalhe(conta.vendaId)}
                            className="flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                          >
                            <span>
                              Origem: {formatReceivableOrigin(conta.origem)}
                            </span>
                            <ArrowRight className="h-3 w-3" aria-hidden />
                          </ContextualLink>
                        ) : (
                          <span>
                            Origem: {formatReceivableOrigin(conta.origem)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {conta.status === "Pendente" ? (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setPaymentModal({
                              open: true,
                              receivableId: conta.contaId,
                              saldo: conta.saldo,
                              formaPagamento: conta.formaPagamento
                            })
                          }
                        >
                          <CreditCard className="h-4 w-4" aria-hidden />
                          <span>Pagamento</span>
                        </Button>
                      ) : null}
                      {conta.pagamentos.length > 0 ? (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => toggleExpanded(conta.contaId)}
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" aria-hidden />
                          ) : (
                            <ChevronRight className="h-4 w-4" aria-hidden />
                          )}
                          <span>
                            {conta.pagamentos.length} pagamento(s)
                          </span>
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {isExpanded && conta.pagamentos.length > 0 ? (
                    <div className="border-t border-border pt-3">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
                        Pagamentos individuais
                      </p>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {conta.pagamentos.map((pgto) => (
                            <TableRow key={pgto.id}>
                              <TableCell className="whitespace-nowrap text-sm">
                                {formatReceivableDate(pgto.dataPagamento)}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-sm font-medium">
                                {formatReceivableCurrency(pgto.valor)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <ReceivablePaymentModal
        open={paymentModal.open}
        onOpenChange={(open) => {
          if (!open) setPaymentModal(CLOSED_MODAL);
        }}
        receivableId={paymentModal.receivableId}
        clienteName={clienteName}
        saldo={paymentModal.saldo}
        formaPagamento={paymentModal.formaPagamento}
      />
    </>
  );
}
