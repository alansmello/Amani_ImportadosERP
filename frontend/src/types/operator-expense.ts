import type { PaymentMethod } from "./payment-settings";

export type OperatorExpense = {
  id: string;
  vendaId: string;
  formaPagamento: Extract<PaymentMethod, "CartaoDebito" | "CartaoCredito">;
  valorBruto: number;
  valorLiquido: number;
  percentualTaxa: number;
  valorTaxa: number;
  dataRegistro: string;
};

export type OperatorExpenseFilters = {
  dataInicio?: string;
  dataFim?: string;
  formaPagamento?: PaymentMethod | "";
};
