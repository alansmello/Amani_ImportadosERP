export type ExpenseCategory = {
  id: string;
  nome: string;
  descricao?: string | null;
  ativa: boolean;
};

export type CreateExpenseCategoryPayload = {
  nome: string;
  descricao?: string | null;
};

export type UpdateExpenseCategoryPayload = {
  nome: string;
  descricao?: string | null;
};
