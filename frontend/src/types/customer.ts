export type Customer = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  ativo: boolean;
};

export type CustomerPayload = {
  nome: string;
  email: string | null;
  telefone: string | null;
};

export type CustomerStatusFilter = "active" | "inactive" | "all";
