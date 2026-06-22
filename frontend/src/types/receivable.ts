export type ReceivableStatus = "Pendente" | "Pago";

export type ReceivableOrigin = "Venda" | "Manual" | "SaldoInicial" | "ImplantacaoInicial";

export type ReceivableListItem = {
  id: string;
  vendaId: string | null;
  clienteId: string | null;
  origem: string;
  valorTotal: number;
  totalPago: number;
  saldo: number;
  status: ReceivableStatus;
  dataVencimento: string;
};

export type ReceivablesByClient = {
  clienteId: string;
  nomeCliente: string;
  totalAReceber: number;
};

export type PaymentDetail = {
  id: string;
  valor: number;
  dataPagamento: string;
};

export type ReceivableClientDetail = {
  contaId: string;
  vendaId: string | null;
  clienteId: string | null;
  origem: string;
  valorTotal: number;
  totalPago: number;
  saldo: number;
  dataVencimento: string;
  status: ReceivableStatus;
  pagamentos: PaymentDetail[];
};

export type CreateReceivablePayload = {
  clienteId: string;
  valor: number;
  dataVencimento: string;
};

export type UpdateReceivablePayload = {
  valor: number;
  dataVencimento: string;
};

export type RegisterPaymentPayload = {
  valor: number;
};

export type CreateReceivableResponse = {
  id: string;
};

export type ReceivableFilters = {
  status?: ReceivableStatus | "";
  search?: string;
};
