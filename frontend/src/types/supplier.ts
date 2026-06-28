export type Supplier = {
  id: string;
  nome: string;
  telefone: string | null;
};

export type SupplierPayload = {
  nome: string;
  telefone: string | null;
};
