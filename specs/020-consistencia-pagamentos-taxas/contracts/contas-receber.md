# Contract: Contas a Receber e Pagamentos

Base: `/api/contas-receber`

## GET `/cliente/{clienteId}`

Retorna as contas em aberto do cliente. A F020 adiciona `formaPagamento` para alinhar este contrato à lista geral.

### Response 200

```json
[
  {
    "contaId": "uuid",
    "vendaId": "uuid-ou-null",
    "clienteId": "uuid-ou-null",
    "origem": "Venda",
    "formaPagamento": "CartaoCredito",
    "valorTotal": 100.00,
    "totalPago": 0.00,
    "saldo": 100.00,
    "dataVencimento": "2026-06-29T00:00:00Z",
    "status": "Pendente",
    "pagamentos": []
  }
]
```

`formaPagamento` aceita `Dinheiro`, `PIX`, `CartaoDebito`, `CartaoCredito`, `Fiado` ou `null`. Contas manuais/iniciais e vínculos não resolvíveis retornam `null`.

## POST `/{id}/pagamentos`

Registra pagamento na conta identificada por `id`.

### Pagamento simples

Aplicável a Fiado, conta manual/inicial ou conta sem forma identificável.

```json
{
  "valor": 80.00,
  "desconto": 20.00
}
```

- `valor`: obrigatório e maior que zero.
- `desconto`: opcional, padrão zero e maior ou igual a zero.
- `valorBrutoLiquidado`: omitido; o backend deriva `valor + desconto`.
- Não gera despesa de operadora.

### Liquidação integral de Cartão de Crédito

```json
{
  "valor": 96.50,
  "desconto": 0.00,
  "valorBrutoLiquidado": 100.00
}
```

- `valor` é o líquido recebido e deve satisfazer `0 < valor <= saldo`.
- `desconto` deve ser zero.
- `valorBrutoLiquidado` é obrigatório e deve ser exatamente igual ao saldo restante.
- O percentual de taxa não é aceito como entrada; é derivado pelo backend.
- Se `valor < valorBrutoLiquidado`, a diferença gera `DespesaOperadora`.
- Se os valores forem iguais, a conta é liquidada sem despesa.

### Response 200

Sem corpo. A conta, o histórico e eventual despesa foram registrados.

### Response 400

```json
{
  "error": "Cartao de credito exige liquidacao integral do saldo"
}
```

Outros erros esperados:

- valor recebido inválido;
- desconto não permitido para Crédito;
- bruto diferente do saldo restante;
- valor líquido superior ao bruto;
- conta já liquidada;
- conta ou Venda não encontrada quando necessária;
- tentativa de taxa de operadora em forma não elegível.

### Atomicidade

Para Crédito, pagamento e despesa são uma única operação: ambos são persistidos ou nenhum é persistido.

