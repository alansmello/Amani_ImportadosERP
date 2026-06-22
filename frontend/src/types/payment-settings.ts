export type PaymentMethod =
  | "Dinheiro"
  | "PIX"
  | "CartaoDebito"
  | "CartaoCredito"
  | "Fiado";

export type PaymentMethodSettings = {
  formaPagamento: PaymentMethod;
  percentualTaxa: number;
  atualizadoEm: string;
};

export type UpdatePaymentMethodSettingsPayload = {
  percentualTaxa: number;
};
