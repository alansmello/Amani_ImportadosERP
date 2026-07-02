# Data Model: Consistência de Compras em Trânsito e Limpeza do Dashboard Gerencial

## Visão geral

A feature não cria tabelas nem altera campos persistidos. O modelo abaixo formaliza cálculos e contratos derivados dos dados existentes.

## Entidades persistidas existentes

### Compra

| Campo | Tipo lógico | Regra relevante |
| --- | --- | --- |
| Id | Identificador | Chave estável da compra |
| FornecedorId | Identificador | Obrigatório |
| DataCompra | Data/hora | Define competência e início possível do trânsito |
| Desconto | Moeda | Ajuste geral não negativo |
| Acrescimo | Moeda | Ajuste geral não negativo |
| Status | Estado | Cancelada é excluída; status atual não substitui a posição histórica |
| Items | Coleção | Deve conter os itens usados no total oficial |

**Total oficial derivado**: `Σ Item.ValorLiquido - Desconto + Acrescimo`.

### CompraItem

| Campo | Tipo lógico | Regra relevante |
| --- | --- | --- |
| Id | Identificador | Também define a ordem determinística de fechamento do rateio |
| CompraId | Identificador | Relaciona o item à compra |
| ProdutoId | Identificador | Permite obter o preço de venda atual |
| Quantidade | Inteiro positivo | Unidade principal da compra |
| CustoUnitario | Moeda não negativa | Base do valor bruto |
| Desconto | Moeda não negativa | Ajuste específico do item |
| Acrescimo | Moeda não negativa | Ajuste específico do item |

**Valor bruto derivado**: `Quantidade × CustoUnitario`.

**Valor líquido derivado**: `ValorBruto - Desconto + Acrescimo`.

### CompraItemRecebimento

| Campo | Tipo lógico | Regra relevante |
| --- | --- | --- |
| CompraItemId | Identificador | Item encerrado parcialmente ou integralmente |
| Quantidade | Inteiro positivo | Reduz a pendência na data do evento |
| DataRecebimento | Data/hora | Aplicada somente quando não posterior à referência |

O recebimento continua sendo o único evento desta feature que já gera entrada física; sua lógica não será alterada.

### CompraItemPerda

| Campo | Tipo lógico | Regra relevante |
| --- | --- | --- |
| CompraItemId | Identificador | Item encerrado parcialmente ou integralmente |
| Quantidade | Inteiro positivo | Reduz a pendência na data do evento |
| DataPerda | Data/hora | Aplicada somente quando não posterior à referência |
| Motivo | Perda, Extravio ou Avaria | Não gera estoque |

### Produto

| Campo | Tipo lógico | Regra relevante |
| --- | --- | --- |
| Id | Identificador | Relaciona a mercadoria em trânsito ao cadastro atual |
| PrecoVenda | Moeda não negativa | Usado na valorização potencial do trânsito; zero é legítimo |

## Objetos derivados

### ItemFinanceiroCompra

Representa a entrada pura da política de cálculo.

| Campo | Tipo | Validação |
| --- | --- | --- |
| ItemId | Identificador | Obrigatório e único na compra |
| QuantidadeComprada | Inteiro | Maior que zero |
| QuantidadePendente | Inteiro | Entre zero e a quantidade comprada |
| ValorLiquido | Moeda | Resultado do item antes dos ajustes gerais |

### RateioItemCompra

| Campo | Tipo | Derivação |
| --- | --- | --- |
| ItemId | Identificador | Item de origem |
| Peso | Decimal | `ValorLiquido ÷ Σ ValorLiquido` |
| DescontoGeralRateado | Moeda | Parcela fechada do desconto geral |
| AcrescimoGeralRateado | Moeda | Parcela fechada do acréscimo geral |
| ValorTotalRateado | Moeda | Líquido menos desconto rateado mais acréscimo rateado |
| ValorPendenteCusto | Moeda | Total rateado multiplicado pela proporção pendente |

### ResumoFinanceiroCompra

| Campo | Tipo | Regra |
| --- | --- | --- |
| TotalItensLiquidos | Moeda | Soma dos valores líquidos |
| TotalCompra | Moeda | Total oficial completo |
| ValorPendenteCusto | Moeda anulável | Soma das parcelas pendentes ou indisponível com motivo |
| MotivoValorIndisponivel | Texto opcional | Preenchido somente quando o rateio não puder ser formado |

### ResumoMercadoriasEmTransito

| Campo | Tipo | Regra |
| --- | --- | --- |
| QuantidadePendente | Inteiro | Soma das quantidades pendentes na referência |
| ValorAoCusto | Moeda anulável | Soma oficial dos valores pendentes; nulo quando qualquer compra impedir fechamento válido |
| SubtotalCalculavelAoCusto | Moeda | Soma das compras com rateio válido, preservada apenas para compatibilidade acompanhada de completude |
| ValorAoCustoCompleto | Booleano | Indica se o valor oficial ao custo cobre todas as compras pendentes |
| MotivoValorAoCustoIndisponivel | Texto opcional | Explica por que o valor oficial ao custo ficou indisponível |
| ValorAoPrecoVenda | Moeda anulável | Soma de pendência × preço de venda atual; nula quando produto/preço estiver inconsistente |
| MotivoValorAoPrecoVendaIndisponivel | Texto opcional | Explica a indisponibilidade do potencial de venda |

### PosicaoPatrimonial

| Campo | Tipo | Regra |
| --- | --- | --- |
| ValorEstoqueAoCusto | Moeda | Somente estoque fisicamente disponível com custo calculável |
| ValorEstoqueAoPrecoVenda | Moeda | Somente estoque fisicamente disponível |
| ValorTransitoAoCusto | Moeda anulável | Mercadorias ainda pendentes; nulo quando o custo oficial estiver incompleto |
| ValorTransitoAoPrecoVenda | Moeda anulável | Potencial das mercadorias pendentes; nulo quando produto/preço estiver inconsistente |
| ValorRealistaOperacao | Moeda anulável | Caixa final + recebíveis + estoque ao custo + trânsito ao custo; nulo se algum componente obrigatório estiver indisponível |
| ValorPotencialOperacao | Moeda anulável | Caixa final + recebíveis + estoque ao preço de venda + trânsito ao preço de venda; nulo se algum componente obrigatório estiver indisponível |

## Regras de arredondamento

1. Ratear desconto geral e acréscimo geral separadamente.
2. Arredondar cada parcela para duas casas com afastamento de zero no ponto médio.
3. Calcular o resíduo entre o ajuste original e a soma das parcelas.
4. Aplicar o resíduo ao último item elegível ordenado por `ItemId`.
5. Arredondar o valor pendente de cada item para duas casas antes da soma.

## Estados e transições preservados

```text
EmTransito ──recebimento parcial──> ParcialmenteRecebida
EmTransito ──perda parcial────────> EmTransito
ParcialmenteRecebida ──encerramento sem perda──> Recebida
EmTransito/ParcialmenteRecebida ──encerramento com perda──> Finalizada
```

A feature apenas lê esses estados e eventos. Não muda transições, entrada de estoque ou custo médio.

## Persistência e compatibilidade

- Nenhum novo campo, tabela, índice ou migration.
- Nenhum backfill ou atualização de linhas históricas.
- Campos adicionados existem somente em DTOs de resposta.
- Campos gerenciais antigos permanecem; nomes explícitos novos são aditivos.
