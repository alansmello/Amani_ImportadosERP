# Data Model: Consistência de Pagamentos e Taxas de Operadora

## Visão geral

Nenhuma entidade ou coluna nova é necessária. A feature reforça invariantes de entidades existentes, amplia um DTO de leitura e normaliza dados de configuração.

## FormaPagamento

Valores canônicos preservados:

- `Dinheiro`
- `PIX`
- `CartaoDebito`
- `CartaoCredito`
- `Fiado`

Regra de configuração após F020:

| Forma | Taxa configurável | Valor persistido esperado | Momento da despesa |
| --- | --- | --- | --- |
| Dinheiro | Não | 0 | Nunca |
| PIX | Não | 0 | Nunca |
| CartaoDebito | Sim | `0 <= taxa < 100` | Na criação da Venda |
| CartaoCredito | Não | 0 | No recebimento, se bruto > líquido |
| Fiado | Não | 0 | Nunca |

## ConfiguracaoFormaPagamento

Representa a linha de configuração mantida para cada forma.

Campos existentes:

- `Id`: identificador.
- `FormaPagamento`: forma única da configuração.
- `PercentualTaxa`: percentual padrão.
- `AtualizadoEm`: instante da última alteração válida.

Invariantes:

- Uma configuração por forma.
- `CartaoDebito`: percentual maior ou igual a zero e menor que 100.
- Demais formas: percentual obrigatoriamente zero e atualização recusada.
- A normalização de dados não altera `Venda.PercentualTaxaAplicado` nem `DespesaOperadora.PercentualTaxa` históricos.

Transições:

- Débito com taxa válida → taxa atualizada e novo `AtualizadoEm`.
- Débito com taxa inválida → estado preservado.
- Forma não editável → atualização recusada e estado preservado.
- Dados legados não Débito com taxa diferente de zero → taxa normalizada para zero pela migration.

## ContaReceber

Campos relevantes existentes:

- `Id`
- `VendaId`: opcional.
- `ClienteId`: opcional conforme origem.
- `Valor`: bruto original.
- `Origem`
- `Pagamentos`

Valores derivados:

- `TotalLiquidado = soma(PagamentoRecebido.ValorBrutoLiquidado)`
- `Saldo = Valor - TotalLiquidado`
- `Status = Pago` quando `Saldo <= 0`; caso contrário, `Pendente`.
- `FormaPagamento`: derivada da Venda vinculada; nula quando não houver vínculo resolvível.

Invariantes da F020:

- Conta já liquidada não aceita novo pagamento.
- A forma derivada deve ser igual em todas as projeções de leitura.
- Conta sem forma identificável segue pagamento simples e não gera taxa automaticamente.

## PagamentoRecebido

Campos existentes:

- `Id`
- `ContaReceberId`
- `Valor`: líquido efetivamente recebido.
- `Desconto`: desconto comercial.
- `ValorBrutoLiquidado`: parte do saldo encerrada.
- `DataPagamento`

Regras gerais preservadas:

- `Valor > 0`.
- `Desconto >= 0`.
- `ValorBrutoLiquidado >= Valor`.
- `ValorBrutoLiquidado <= saldo restante`.

Regras específicas de Crédito:

- `Desconto = 0`.
- `ValorBrutoLiquidado = saldo restante`.
- `0 < Valor <= ValorBrutoLiquidado`.
- Apenas uma liquidação integral é aceita para o saldo pendente.

Regras de pagamento simples:

- `ValorBrutoLiquidado` omitido é derivado como `Valor + Desconto`.
- Não há despesa de operadora.

## DespesaOperadora

Campos existentes:

- `Id`
- `VendaId`
- `FormaPagamento`
- `ValorBruto`
- `ValorLiquido`
- `PercentualTaxa`
- `DataRegistro`

Regras para recebimento de Crédito:

- Criada somente quando `ValorBruto > ValorLiquido`.
- `ValorBruto` é o saldo integral liquidado.
- `ValorLiquido` é o valor efetivamente recebido.
- `ValorTaxa = ValorBruto - ValorLiquido`.
- `PercentualTaxa = round(ValorTaxa / ValorBruto * 100, 4)`.
- Se bruto e líquido forem iguais, não há registro de despesa.
- Pagamento e despesa pertencem à mesma transação.

## Projeções de leitura

### ContaReceberDetalhe

Campo adicionado:

- `FormaPagamento`: valor textual canônico da Venda vinculada ou nulo.

Os demais campos e a coleção de pagamentos permanecem compatíveis.

## Matriz de estado financeiro

| Forma | Estado após Venda | Ação posterior | Resultado |
| --- | --- | --- | --- |
| Dinheiro | Pago | Nenhuma | Sem despesa |
| PIX | Pago | Nenhuma | Sem despesa |
| CartaoDebito | Pago | Nenhuma | Despesa automática se taxa > 0 |
| CartaoCredito | Pendente | Liquidação integral pelo líquido recebido | Pago; despesa pela diferença se houver |
| Fiado | Pendente | Pagamento simples | Parcial ou pago, sem despesa de operadora |
| Conta manual/inicial | Pendente | Pagamento simples | Parcial ou pago, sem despesa de operadora |

## Retenção e compatibilidade

- Vendas, pagamentos e despesas existentes permanecem imutáveis.
- A migration altera apenas configurações padrão futuras.
- O percentual manual deixa de fazer parte do contrato suportado de novo pagamento; percentuais históricos continuam preservados em despesas existentes.

