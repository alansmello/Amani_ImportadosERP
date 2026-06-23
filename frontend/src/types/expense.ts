import type { PaymentMethod } from "@/types/payment-settings";

export type ExpensePaymentMethod = Extract<
  PaymentMethod,
  "Dinheiro" | "PIX" | "CartaoDebito" | "CartaoCredito"
>;

export type Expense = {
  id: string;
  dataCompetencia: string;
  valor: number;
  descricao: string;
  categoriaId: string;
  categoriaNome: string;
  categoriaAtiva: boolean;
  formaPagamento: ExpensePaymentMethod;
};

export type ExpenseFilters = {
  dataInicio?: string;
  dataFim?: string;
  categoriaId?: string;
};

export type CreateExpensePayload = {
  dataCompetencia: string;
  valor: number;
  descricao: string;
  categoriaDespesaId: string;
  formaPagamento: ExpensePaymentMethod;
};

export type CreateExpenseResponse = {
  id: string;
};
