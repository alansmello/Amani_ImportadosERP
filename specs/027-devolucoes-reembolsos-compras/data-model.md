# Data Model: Devoluções e Reembolsos de Compras

## Visão geral

A F027 adiciona fatos append-only em tabelas próprias. Nenhuma coluna ou linha histórica de compra, item, recebimento, perda, movimentação, venda, pagamento ou evento financeiro é alterada. Todas as situações apresentadas na interface são derivadas desses fatos e de suas compensações.

```text
Compra
├── CompraItem
│   ├── CompraItemRecebimento (existente)
│   ├── CompraItemPerda (existente)
│   └── CompraItemDevolucao (nova)
│       └── CompraItemDevolucaoCompensacao (nova, 0..1)
├── CompraReembolso (novo)
│   ├── CompraReembolsoCancelamento (novo, 0..1)
│   └── CompraReembolsoAlocacao (nova, 0..N)
└── Resumos derivados de logística, reembolso e recuperação
```

## Entidades existentes preservadas

### Compra

Campos relevantes permanecem `Id`, `FornecedorId`, `DataCompra`, `Desconto`, `Acrescimo`, `Status` e `Items`.

- `TotalOriginal = Compra.Total()` continua derivado pela política F026.
- Nenhum total, status de reembolso ou valor líquido novo é persistido em `compras`.
- `Status` continua representando logística, não recuperação financeira.
- Compra cancelada não aceita nova devolução ou reembolso.

### CompraItem

Campos comerciais permanecem inalterados. Novas quantidades são derivadas:

```text
DevolvidaAntesVigente(ref) = devoluções AntesDoRecebimento até ref
                             - compensações dessas devoluções até ref

DevolvidaDepoisVigente(ref) = devoluções DepoisDoRecebimento até ref
                              - compensações dessas devoluções até ref

QuantidadePendente(ref) = QuantidadeComprada
                          - RecebidaAte(ref)
                          - PerdidaAte(ref)
                          - DevolvidaAntesVigente(ref)
```

Devolução posterior não reabre pendência.

### CompraItemRecebimento

Permanece imutável e é a origem obrigatória da devolução posterior.

- `Quantidade` limita as devoluções posteriores vinculadas.
- `ValorUnitario` é o snapshot autoritativo para saída e eventual restauração da base de custo.
- `DataRecebimento` deve ser igual ou anterior à devolução posterior.
- `EstoqueMovimentacaoId` e entrada original não são alterados.

### CompraItemPerda

Permanece inalterada. Pode receber alocação opcional de reembolso para cálculo de recuperação da ocorrência.

### EstoqueMovimentacao

Permanece sem campo novo.

- Devolução posterior cria `Tipo = Saida`, quantidade positiva, produto da compra e `ValorUnitario` do recebimento, sem `VendaId`, `VendaItemId`, `CompraId` ou `CompraItemId`.
- Compensação de devolução posterior cria `Tipo = Entrada` com a mesma quantidade/custo, também sem referências legadas.
- A origem é resolvida por relação inversa a partir de `EstoqueMovimentacaoId` nas tabelas novas.
- Movimentos sem relação F027 mantêm interpretação anterior.

## Entidades novas

### CompraItemDevolucao

Representa uma devolução ou recusa original.

| Campo | Tipo lógico | Obrigatório | Regra |
| --- | --- | --- | --- |
| `Id` | Identificador | Sim | Gerado no domínio |
| `CompraId` | Identificador | Sim | Compra existente e não cancelada |
| `CompraItemId` | Identificador | Sim | Deve pertencer à compra |
| `CompraItemRecebimentoId` | Identificador opcional | Condicional | Nulo antes do recebimento; obrigatório depois; deve pertencer ao item |
| `EstoqueMovimentacaoId` | Identificador opcional | Condicional | Nulo antes do recebimento; obrigatório e único depois |
| `Momento` | Enum textual | Sim | `AntesDoRecebimento` ou `DepoisDoRecebimento` |
| `Quantidade` | Inteiro positivo | Sim | Limitada pela pendência ou pelo recebimento elegível |
| `Motivo` | Enum textual | Sim | `ProdutoFalsificado`, `Avaria`, `ProdutoIncorreto`, `DesistenciaRecusa`, `Outro` |
| `DataDevolucao` | Data UTC | Sim | Não anterior à compra; depois do recebimento, não anterior ao recebimento |
| `Observacao` | Texto até 500 | Condicional | Obrigatória para `Outro`; opcional nos demais |
| `OperacaoId` | Identificador | Sim | Único entre devoluções; idempotência desse tipo de comando |
| `CreatedAt` | Data/hora UTC | Sim | Auditoria de criação |

**Invariantes**:

1. Antes do recebimento: `Quantidade <= QuantidadePendente` dentro da transação.
2. Depois do recebimento: `Quantidade <= Recebimento.Quantidade - devoluções vigentes vinculadas`.
3. Depois do recebimento: `Quantidade <= SaldoFisicoProduto` dentro da transação.
4. Movimento depois do recebimento deve ser saída, possuir mesma quantidade/produto e usar `Recebimento.ValorUnitario`.
5. Uma operação idempotente repetida devolve o resultado existente e não cria novo efeito.

### CompraItemDevolucaoCompensacao

Neutraliza uma devolução incorreta sem apagar o original.

| Campo | Tipo lógico | Obrigatório | Regra |
| --- | --- | --- | --- |
| `Id` | Identificador | Sim | Gerado no domínio |
| `CompraItemDevolucaoId` | Identificador | Sim | Único; uma compensação por devolução |
| `EstoqueMovimentacaoId` | Identificador opcional | Condicional | Nulo para devolução anterior; obrigatório e único para posterior |
| `DataCompensacao` | Data UTC | Sim | Igual ou posterior à devolução |
| `Motivo` | Texto até 500 | Sim | Justificativa da correção |
| `PresencaFisicaConfirmada` | Booleano | Condicional | Deve ser verdadeiro na compensação posterior ao recebimento |
| `OperacaoId` | Identificador | Sim | Único entre compensações de devolução |
| `CreatedAt` | Data/hora UTC | Sim | Auditoria de criação |

**Invariantes**:

- Devolução anterior: restaura pendência na data da compensação e não movimenta estoque.
- Devolução posterior: somente aceita compensação quando o produto está fisicamente presente; cria entrada com quantidade e custo idênticos à saída original.
- Não é permitido compensar uma compensação. Uma operação posterior correta deve ser novo evento de devolução.

### CompraReembolso

Representa dinheiro efetivamente creditado pelo fornecedor ou marketplace.

| Campo | Tipo lógico | Obrigatório | Regra |
| --- | --- | --- | --- |
| `Id` | Identificador | Sim | Gerado no domínio |
| `CompraId` | Identificador | Sim | Compra existente e não cancelada |
| `Valor` | Moeda `18,2` | Sim | Positivo e não superior ao saldo reembolsável |
| `DataReembolso` | Data UTC | Sim | Data efetiva do crédito; não anterior à compra |
| `ReferenciaExterna` | Texto até 100 | Não | Quando preenchida, única dentro da compra; normalizada por trim |
| `Observacao` | Texto até 500 | Não | Informação operacional opcional |
| `OperacaoId` | Identificador | Sim | Único entre reembolsos |
| `CreatedAt` | Data/hora UTC | Sim | Auditoria de criação |

**Invariantes**:

```text
ReembolsosLiquidosAtuais = Σ Reembolso.Valor - Σ Cancelamento.ValorOriginal
SaldoReembolsavel = TotalOriginal - ReembolsosLiquidosAtuais
0 < NovoReembolso.Valor <= SaldoReembolsavel
```

Compra com total oficial não positivo ou indisponível rejeita reembolso com motivo explícito.

### CompraReembolsoCancelamento

Compensa integralmente um reembolso lançado incorretamente.

| Campo | Tipo lógico | Obrigatório | Regra |
| --- | --- | --- | --- |
| `Id` | Identificador | Sim | Gerado no domínio |
| `CompraReembolsoId` | Identificador | Sim | Único; um cancelamento por reembolso |
| `DataCancelamento` | Data UTC | Sim | Igual ou posterior ao reembolso |
| `Motivo` | Texto até 500 | Sim | Justificativa da correção |
| `OperacaoId` | Identificador | Sim | Único entre cancelamentos de reembolso |
| `CreatedAt` | Data/hora UTC | Sim | Auditoria de criação |

O efeito financeiro é `-Reembolso.Valor` na data do cancelamento. Alocações do reembolso cancelado deixam de compor recuperação a partir dessa data, mas permanecem armazenadas.

### CompraReembolsoAlocacao

Associa parte do reembolso a um item e, opcionalmente, a uma ocorrência física específica.

| Campo | Tipo lógico | Obrigatório | Regra |
| --- | --- | --- | --- |
| `Id` | Identificador | Sim | Gerado no domínio |
| `CompraReembolsoId` | Identificador | Sim | Reembolso pai |
| `CompraItemId` | Identificador | Sim | Deve pertencer à mesma compra |
| `CompraItemPerdaId` | Identificador opcional | Não | Se presente, deve pertencer ao item |
| `CompraItemDevolucaoId` | Identificador opcional | Não | Se presente, deve pertencer ao item |
| `Valor` | Moeda `18,2` | Sim | Positivo |
| `CreatedAt` | Data/hora UTC | Sim | Auditoria |

**Invariantes**:

- No máximo uma entre perda e devolução pode ser informada na mesma alocação.
- A soma das alocações de um reembolso não pode exceder seu valor.
- Alocações podem somar menos que o reembolso; a diferença é `ValorNaoAlocado`.
- Alocação não altera estoque, pendência ou caixa; apenas explica recuperação.
- Uma ocorrência cancelada não recebe nova alocação.

## Objetos derivados

### ResumoReembolsoCompra

| Campo | Derivação |
| --- | --- |
| `TotalOriginal` | Política F026 |
| `TotalReembolsado` | Créditos menos cancelamentos até referência |
| `CustoFinanceiroLiquido` | `TotalOriginal - TotalReembolsado` |
| `SaldoReembolsavel` | Igual ao custo líquido, limitado a zero |
| `Situacao` | `SemReembolso` se zero; `Parcial` se entre zero e total; `Integral` se igual ao total |

### ResumoQuantidadesItemCompra

| Campo | Derivação na referência |
| --- | --- |
| `QuantidadeComprada` | Campo original |
| `QuantidadeRecebida` | Soma de recebimentos |
| `QuantidadePerdida` | Soma de perdas |
| `QuantidadeDevolvidaAntes` | Devoluções anteriores menos compensações |
| `QuantidadeDevolvidaDepois` | Devoluções posteriores menos compensações |
| `QuantidadePendente` | Comprada - recebida - perdida - devolvida antes |
| `QuantidadeRecebidaElegivelDevolucao` | Recebida - devolvida depois, limitada pelo saldo físico global na validação |

### ResumoRecuperacaoCompra

```text
ValorBrutoPerdas = parcelas F026 das perdas vigentes
ValorBrutoDevolucoes = parcelas F026 das devoluções vigentes
ValorRecuperadoAssociado = alocações vigentes ligadas às ocorrências
PrejuizoLiquidoNaoRecuperado = max(0,
    ValorBrutoPerdas + ValorBrutoDevolucoes - ValorRecuperadoAssociado)
```

Reembolso não alocado entra no caixa e no total reembolsado, mas não reduz prejuízo de ocorrência.

### ResumoCaixa com reembolso

```text
ReembolsosLiquidosPeriodo = reembolsos pela DataReembolso
                            - cancelamentos pela DataCancelamento
EntradasCaixaPeriodo = ValoresRecebidosClientes + ReembolsosLiquidosPeriodo
SaidasPeriodo = TotalComprasBrutas + TotalDespesas
CaixaInicial = SaldoInicial + EntradasCaixaAnteriores - SaidasAnteriores
CaixaFinal = CaixaInicial + AjusteImplantacao + EntradasCaixaPeriodo - SaidasPeriodo
```

## Estados e transições

### Devolução

```text
Registrada
   └── compensação confirmada ──> Compensada
```

- `Registrada` produz efeito a partir de `DataDevolucao`.
- `Compensada` mantém o efeito original até `DataCompensacao` e produz efeito inverso a partir dela.

### Reembolso

```text
Registrado
   └── cancelamento confirmado ──> Cancelado
```

- Crédito entra na `DataReembolso`.
- Cancelamento compensa na `DataCancelamento`.

### Situação acumulada da compra

```text
SemReembolso ── primeiro crédito parcial ──> Parcial
Parcial ── créditos atingem total ──> Integral
Integral/Parcial ── cancelamento ──> Parcial ou SemReembolso
```

A situação é sempre recalculada e não é armazenada.

## Índices e constraints planejados

- Índice por `CompraId` e data em devoluções e reembolsos.
- Índice por `CompraItemId`, `CompraItemRecebimentoId` e momento em devoluções.
- Índice único em `OperacaoId` dentro de cada uma das quatro tabelas que recebem comandos; tipos diferentes não compartilham identidade operacional.
- Índice único em `EstoqueMovimentacaoId` quando não nulo.
- Índice único em `CompraItemDevolucaoId` para compensação.
- Índice único em `CompraReembolsoId` para cancelamento.
- Índice único parcial em `(CompraId, ReferenciaExterna)` quando referência não nula.
- Índices em alocações por reembolso, item, perda e devolução.
- Checks de quantidade/valor positivos e coerência de referências opcionais.
- Todas as FKs usam restrição de exclusão; nenhuma cascata apaga histórico.

## Compatibilidade e migration

- Criar somente as cinco tabelas novas, seus índices, checks e FKs.
- Não alterar `compras`, `compra_items`, `compra_item_recebimentos`, `compra_item_perdas`, `estoque_movimentacoes`, `eventos_financeiros` ou tabelas de venda/pagamento.
- Não executar DML, backfill ou cálculo retroativo.
- Tabelas novas iniciam vazias; ausência de linha significa ausência legítima de devolução/reembolso.
- Backend anterior ignora as estruturas; backend novo, com feature desligada, preserva fluxos antigos.
- Depois do primeiro evento, rollback é lógico: desligar operações e manter schema/dados.
