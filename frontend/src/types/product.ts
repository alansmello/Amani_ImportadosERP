export type ProductPresentation = {
  id: string;
  produtoId: string;
  nome: string;
  fatorNumerador: number;
  fatorDenominador: number;
  fatorCalculado: number;
  permiteCompra: boolean;
  permiteVenda: boolean;
  precoVenda: number | null;
  ativo: boolean;
  createdAt: string;
  updatedAt?: string | null;
};

export type ProductPresentationPayload = {
  nome: string;
  fatorNumerador: number;
  fatorDenominador: number;
  permiteCompra: false;
  permiteVenda: boolean;
  precoVenda: number | null;
  ativo: boolean;
};

export type Product = {
  id: string;
  nome: string;
  precoVenda: number;
  custo: number;
  categoriaId: string;
  fornecedorId: string | null;
  apresentacoesFracionadasHabilitadas: boolean;
  apresentacoes: ProductPresentation[];
};

export type ProductPayload = {
  nome: string;
  precoVenda: number;
  custo: number;
  categoriaId: string;
  fornecedorId: string | null;
};
