export const purchaseLossMotives = ["Perda", "Extravio", "Avaria"] as const;
export const purchaseReturnMotives = [
  "ProdutoFalsificado",
  "Avaria",
  "ProdutoIncorreto",
  "DesistenciaRecusa",
  "Outro"
] as const;

export type PurchaseLossMotive = (typeof purchaseLossMotives)[number];
export type PurchaseReturnMotive = (typeof purchaseReturnMotives)[number];

export type PurchaseStatus = string;

export type PurchaseFilters = {
  dataInicio?: string;
  dataFim?: string;
  fornecedorId?: string;
  status?: PurchaseStatus;
};

export type PurchaseListItem = {
  id: string;
  fornecedorId: string;
  dataCompra: string;
  status: PurchaseStatus;
  totalCompra: number;
  totalReembolsadoLiquido?: number | null;
  custoFinanceiroLiquido?: number | null;
  situacaoReembolso?: PurchaseRefundStatus | null;
  possuiDevolucao?: boolean | null;
  quantidadeDevolvidaAntes?: number | null;
  quantidadeDevolvidaDepois?: number | null;
  quantidadeDevolvidaDepoisCompensada?: number | null;
  situacaoLogisticaDevolucao?: PurchaseReturnLogisticsStatus | null;
  descricaoSituacaoLogisticaDevolucao?: string | null;
  valorPendenteCusto?: number | null;
  motivoValorPendenteIndisponivel?: string | null;
};

export type PurchaseInTransitItem = {
  itemId: string;
  produtoId: string;
  quantidadeComprada: number;
  quantidadeRecebida: number;
  quantidadePerdida: number;
  quantidadeDevolvidaAntes?: number | null;
  quantidadeDevolvidaDepois?: number | null;
  quantidadeDevolvidaDepoisCompensada?: number | null;
  situacaoLogisticaDevolucao?: PurchaseReturnLogisticsStatus | null;
  descricaoSituacaoLogisticaDevolucao?: string | null;
  quantidadeElegivelDevolucaoAntes?: number | null;
  quantidadePendente: number;
};

export type PurchaseInTransit = {
  compraId: string;
  fornecedorId: string;
  dataCompra: string;
  status: PurchaseStatus;
  totalCompra: number;
  valorPendenteCusto: number | null;
  motivoValorPendenteIndisponivel?: string | null;
  itens: PurchaseInTransitItem[];
};

export type PendingPurchaseProduct = {
  compraId: string;
  itemId: string;
  produtoId: string;
  fornecedorId: string;
  dataCompra: string;
  statusCompra: PurchaseStatus;
  quantidadeComprada: number;
  quantidadeRecebida: number;
  quantidadePerdida: number;
  quantidadeDevolvidaAntes?: number | null;
  quantidadeDevolvidaDepois?: number | null;
  quantidadeDevolvidaDepoisCompensada?: number | null;
  situacaoLogisticaDevolucao?: PurchaseReturnLogisticsStatus | null;
  descricaoSituacaoLogisticaDevolucao?: string | null;
  quantidadeElegivelDevolucaoAntes?: number | null;
  quantidadePendente: number;
};

export type PurchaseItem = {
  id: string;
  produtoId: string;
  quantidade: number;
  quantidadeComprada: number;
  quantidadeRecebida: number;
  quantidadePerdida: number;
  quantidadeDevolvidaAntes?: number | null;
  quantidadeDevolvidaDepois?: number | null;
  quantidadeDevolvidaDepoisCompensada?: number | null;
  situacaoLogisticaDevolucao?: PurchaseReturnLogisticsStatus | null;
  descricaoSituacaoLogisticaDevolucao?: string | null;
  quantidadeElegivelDevolucaoAntes?: number | null;
  quantidadePendente: number;
  recebimentosElegiveisDevolucao?: PurchaseReceiptEligibleForReturn[] | null;
  custoUnitario: number;
  desconto: number;
  acrescimo: number;
  valorTotal: number;
};

export type Purchase = {
  id: string;
  fornecedorId: string;
  dataCompra: string;
  status: PurchaseStatus;
  desconto: number;
  acrescimo: number;
  total: number;
  totalReembolsadoLiquido?: number | null;
  saldoReembolsavel?: number | null;
  custoFinanceiroLiquido?: number | null;
  situacaoReembolso?: PurchaseRefundStatus | null;
  possuiDevolucao?: boolean | null;
  quantidadeDevolvidaAntes?: number | null;
  quantidadeDevolvidaDepois?: number | null;
  quantidadeDevolvidaDepoisCompensada?: number | null;
  situacaoLogisticaDevolucao?: PurchaseReturnLogisticsStatus | null;
  descricaoSituacaoLogisticaDevolucao?: string | null;
  items: PurchaseItem[];
};

export type PurchaseReceiptEligibleForReturn = {
  recebimentoId: string;
  dataRecebimento: string;
  quantidadeRecebida: number;
  quantidadeDevolvidaDepois: number;
  quantidadeElegivel: number;
  valorUnitario: number;
};

export type CreatePurchaseItemPayload = {
  produtoId: string;
  quantidade: number;
  custoUnitario: number;
  desconto: number;
  acrescimo: number;
};

export type CreatePurchasePayload = {
  fornecedorId: string;
  dataCompra: string;
  desconto: number;
  acrescimo: number;
  items: CreatePurchaseItemPayload[];
};

export type CreatePurchaseResponse = {
  id: string;
};

export type RegisterPurchaseReceiptPayload = {
  quantidade: number;
  dataRecebimento?: string | null;
  observacao?: string | null;
};

export type PurchaseReceipt = {
  id: string;
  compraId: string;
  itemId: string;
  produtoId: string;
  quantidade: number;
  valorUnitario: number;
  origem: string;
  dataRecebimento: string;
  estoqueMovimentacaoId: string | null;
  observacao: string | null;
};

export type RegisterPurchaseLossPayload = {
  quantidade: number;
  motivo: PurchaseLossMotive;
  dataPerda?: string | null;
  observacao?: string | null;
};

export type PurchaseLoss = {
  id: string;
  compraId: string;
  itemId: string;
  produtoId: string;
  quantidade: number;
  motivo: PurchaseLossMotive;
  dataPerda: string;
  observacao: string | null;
};

export type PurchaseRefundStatus = "SemReembolso" | "Parcial" | "Integral" | string;
export type PurchaseReturnLogisticsStatus =
  | "SemDevolucao"
  | "ParcialmenteDevolvida"
  | "Devolvida"
  | "ParcialmenteCompensada"
  | "DevolucaoCompensada"
  | string;

export type PurchaseRefundAllocationPayload = {
  compraItemId?: string | null;
  compraItemPerdaId?: string | null;
  compraItemDevolucaoId?: string | null;
  valor: number;
};

export type RegisterPurchaseRefundPayload = {
  valor: number;
  dataReembolso?: string | null;
  referenciaExterna?: string | null;
  observacao?: string | null;
  operacaoId: string;
  alocacoes?: PurchaseRefundAllocationPayload[];
};

export type CancelPurchaseRefundPayload = {
  operacaoId: string;
  dataCancelamento?: string | null;
  motivo: string;
};

export type PurchaseRefundAllocation = {
  id: string;
  compraReembolsoId: string;
  compraItemId?: string | null;
  compraItemPerdaId?: string | null;
  compraItemDevolucaoId?: string | null;
  valor: number;
};

export type PurchaseRefund = {
  id: string;
  compraId: string;
  valor: number;
  valorLiquido: number;
  dataReembolso: string;
  referenciaExterna?: string | null;
  operacaoId: string;
  observacao?: string | null;
  cancelado: boolean;
  criadoEm?: string | null;
  alocacoes: PurchaseRefundAllocation[];
};

export type PurchaseRefundList = {
  compraId: string;
  totalReembolsadoLiquido: number;
  saldoReembolsavel: number;
  situacaoReembolso: PurchaseRefundStatus;
  reembolsos: PurchaseRefund[];
};

export type RegisterPurchaseReturnPayload = {
  operacaoId: string;
  momento: "AntesDoRecebimento" | "DepoisDoRecebimento";
  compraItemRecebimentoId?: string | null;
  quantidade: number;
  motivo: PurchaseReturnMotive;
  dataDevolucao?: string | null;
  observacao?: string | null;
};

export type CompensatePurchaseReturnPayload = {
  operacaoId: string;
  dataCompensacao?: string | null;
  motivo: string;
  presencaFisicaConfirmada: boolean;
};

export type PurchaseReturn = {
  id: string;
  compraId: string;
  compraItemId: string;
  compraItemRecebimentoId?: string | null;
  estoqueMovimentacaoId?: string | null;
  momento: string;
  quantidade: number;
  quantidadeCompensada: number;
  quantidadeVigente: number;
  motivo: PurchaseReturnMotive | string;
  dataDevolucao: string;
  observacao?: string | null;
  valorComercialBruto: number;
  valorCustoEstoque: number;
  compensada: boolean;
  criadoEm: string;
};

export type PurchaseReturnList = {
  items: PurchaseReturn[];
  quantidadeVigenteAntesRecebimento: number;
  quantidadeVigenteDepoisRecebimento: number;
  valorComercialBrutoVigente: number;
};

export type PurchaseItemDraft = {
  id: string;
  produtoId: string;
  quantidade: string;
  custoUnitario: string;
  desconto: string;
  acrescimo: string;
};

export type PurchaseDraft = {
  fornecedorId: string;
  dataCompra: string;
  desconto: string;
  acrescimo: string;
  items: PurchaseItemDraft[];
};

export type PurchaseActionDraft = {
  quantidade: string;
  data: string;
  observacao: string;
};

export type PurchaseLossDraft = PurchaseActionDraft & {
  motivo: PurchaseLossMotive | "";
};

export type PurchaseRefundDraft = {
  valor: string;
  data: string;
  referenciaExterna: string;
  observacao: string;
};

export type PurchaseReturnDraft = PurchaseActionDraft & {
  momento: "AntesDoRecebimento" | "DepoisDoRecebimento";
  compraItemRecebimentoId: string;
  motivo: PurchaseReturnMotive | "";
};

export type PurchaseEventCorrectionDraft = {
  data: string;
  motivo: string;
  presencaFisicaConfirmada: boolean;
};

export type PurchaseValidationError = {
  field: string;
  itemId?: string;
  message: string;
};
