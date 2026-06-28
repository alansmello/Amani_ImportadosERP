"use client";

import { ContextualLink } from "@/components/layout/contextual-link";
import { ArrowRight, Users } from "lucide-react";

import {
  formatReceivableCurrency
} from "@/components/financeiro/receivable-formatters";
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
import { contaReceberClienteDetalhe } from "@/config/routes";
import type { ReceivablesByClient } from "@/types/receivable";

type ReceivablesByClientProps = {
  data: ReceivablesByClient[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export function ReceivablesByClient({
  data,
  isLoading,
  isError,
  onRetry
}: ReceivablesByClientProps) {
  if (isLoading) {
    return (
      <LoadingState
        title="Carregando visao por cliente"
        description="Aguarde enquanto os dados sao carregados."
      />
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Nao foi possivel carregar a visao por cliente"
        description="Verifique a conexao com o servidor e tente novamente."
        onRetry={onRetry}
      />
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title="Nenhum cliente com saldo em aberto"
        description="Todos os recebimentos foram quitados ou nenhuma conta a receber foi registrada."
        variant="empty"
        icon={<Users className="h-5 w-5" aria-hidden />}
      />
    );
  }

  const totalGeral = data.reduce((sum, item) => sum + item.totalAReceber, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recebíveis por cliente</CardTitle>
        <CardDescription>
          {data.length} cliente(s) com saldo em aberto — Total:{" "}
          {formatReceivableCurrency(totalGeral)}
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <Table className="min-w-[28rem]">
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Total a receber</TableHead>
              <TableHead className="text-right">Detalhe</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.clienteId}>
                <TableCell className="font-medium">
                  <span className="block break-words">{item.nomeCliente}</span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatReceivableCurrency(item.totalAReceber)}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="secondary" size="sm">
                    <ContextualLink
                      href={contaReceberClienteDetalhe(item.clienteId)}
                    >
                      <span>Ver contas</span>
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </ContextualLink>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
