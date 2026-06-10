export type Product = {
  id: string;
  nome: string;
  precoVenda: number;
  custo: number;
  categoriaId: string;
  fornecedorId: string | null;
};

export type ProductPayload = {
  nome: string;
  precoVenda: number;
  custo: number;
  categoriaId: string;
  fornecedorId: string | null;
};
