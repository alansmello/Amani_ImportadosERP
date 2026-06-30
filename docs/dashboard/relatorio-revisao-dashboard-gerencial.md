# Relatório Técnico — Revisão do Dashboard Gerencial
**Amani ImportadosERP**
**Iniciado em**: 29/06/2026
**Última atualização**: 29/06/2026
**Status**: Fase 2 concluída — aguardando aprovação para implementação

---

## Índice

- [Visão Geral da Feature](#visão-geral-da-feature)
- [Fase 1 — Diagnóstico Técnico](#fase-1--diagnóstico-técnico)
- [Fase 2 — Definição Oficial das Regras de Cálculo](#fase-2--definição-oficial-das-regras-de-cálculo)
- [Fases Futuras](#fases-futuras)

---

## Visão Geral da Feature

**Nome da feature**: Revisão do Dashboard Gerencial
**Objetivo**: Evoluir o Dashboard para uma visão gerencial, financeira e patrimonial da Amani Importados, respondendo às perguntas:

- Quanto vendi no período?
- Quanto realmente entrou de dinheiro?
- Quanto saiu?
- Quanto lucrei?
- Quanto tenho em caixa?
- Quanto tenho a receber?
- Quanto tenho parado em estoque?
- Quanto vale minha operação hoje de forma realista?
- Quanto seria o valor potencial considerando preço de venda do estoque?

**Princípio central**: reaproveitar o máximo do que já existe. Não é uma reescrita completa. Expansão progressiva com adição, não substituição.

**Fases planejadas**:

| Fase | Descrição | Status |
|---|---|---|
| 1 | Diagnóstico técnico sem alteração de código | Concluída |
| 2 | Definição oficial das regras de cálculo | Concluída |
| 3 | Ajuste/expansão do DTO do backend | Pendente |
| 4 | Implementação dos cálculos no backend | Pendente |
| 5 | Testes dos cálculos | Pendente |
| 6 | Reorganização visual do frontend | Pendente |
| 7 | Ajuste dos gráficos e mensagens vazias | Pendente |
| 8 | Redução dos alertas operacionais no Dashboard | Pendente |
| 9 | Validação final | Pendente |
| 10 | Atualização do roadmapAmani.md (somente após aprovação) | Pendente |

---

## Fase 1 — Diagnóstico Técnico

### 1. Como o Dashboard funciona hoje

O Dashboard está implementado como tela principal (`/`) que carrega dados de múltiplas fontes independentes via React Query. Cada seção tem estado próprio (loading, error, empty, stale), garantindo que falha parcial não derruba o painel inteiro.

**Fluxo atual**:
1. Usuário acessa `/` → período padrão = mês corrente
2. `DashboardHome` dispara 5 chamadas paralelas:
   - KPIs financeiros (`/api/dashboard-gerencial/financeiro`)
   - Resumo operacional (`/api/dashboard-gerencial/operacional`)
   - Rankings (`/api/dashboard-gerencial/rankings`)
   - Alertas (`/api/dashboard-gerencial/alertas`)
   - Gráficos (`/api/dashboard-gerencial/graficos`)
3. O filtro de período (mês / ano / intervalo) é normalizado e enviado como query string para todas as fontes
4. O backend valida e normaliza o filtro via `DashboardFiltroService.Normalizar()`, retornando `DashboardFiltroAplicadoDto` em cada resposta
5. O frontend verifica se a resposta pertence ao filtro atual (`appliedFilterMatchesPeriod`) antes de renderizar

---

### 2. Endpoints que alimentam o Dashboard hoje

| Endpoint | Suporta filtro | Usado atualmente |
|---|---|---|
| `GET /api/dashboard-gerencial/financeiro` | Sim | Sim (KPIs) |
| `GET /api/dashboard-gerencial/operacional` | Sim | Sim |
| `GET /api/dashboard-gerencial/rankings` | Sim | Sim |
| `GET /api/dashboard-gerencial/alertas` | Sim | Sim |
| `GET /api/dashboard-gerencial/graficos` | Sim | Sim |
| `GET /api/dashboard-gerencial` | Sim | Não (consolidado, definido mas não chamado no home) |
| `GET /api/dashboard-financeiro` | **Não** (usa mês corrente internamente) | Definido no service, **não chamado** no home atual |

O endpoint `/api/dashboard-financeiro` é legado e pode ser descontinuado.

---

### 3. DTOs existentes

#### `DashboardFinanceiroGerencialDto` (principal, filtrado)

```
ReceitaTotal             → total das vendas do período (por DataVenda)
LucroTotal               → receita calculável - custo calculável
TotalCompras             → total de compras não canceladas (por DataCompra)
TotalDespesas            → total de despesas (por DataCompetencia)
SaldoOperacional         → valoresRecebidos - totalCompras - totalDespesas
ContasReceberAbertas     → saldo em aberto até dataReferencia (snapshot, não filtrado por período)
ValoresRecebidos         → pagamentos recebidos no período (por DataPagamento)
ValorLucroNaoCalculavel  → receita de itens sem custo médio
QuantidadeItensSemCusto
Avisos                   → avisos de custo médio ausente
```

#### `DashboardOperacionalDto`

```
ProdutosCadastrados, EstoqueDisponivelTotal (qtde apenas), MercadoriasEmTransitoQuantidade,
MercadoriasEmTransitoValor, ComprasEmAberto, ProdutosPendentesRecebimento,
PerdasRegistradasQuantidade, PerdasRegistradasValor, QuantidadeVendas, QuantidadeCompras
```

#### `DashboardFinanceiroDto` (legado, sem filtro)

```
TotalRecebido, TotalAReceber, TotalCompras, TotalDespesas, CaixaAtual, LucroReal
```
`CaixaAtual = totalRecebido - totalCompras - totalDespesas` para o mês corrente. Sem saldo inicial.

---

### 4. Rankings existentes

| Ranking | Base do cálculo |
|---|---|
| ProdutosMaisVendidos | Vendas no período por DataVenda |
| ProdutosMaisLucrativos | Lucro por produto no período (custo médio até dataReferencia) |
| ProdutosComMaiorEstoque | Saldo de movimentações até dataReferencia |
| ProdutosComMenorEstoque | Saldo de movimentações até dataReferencia |
| ClientesMaiorFaturamento | Vendas agrupadas por cliente no período |

---

### 5. Alertas existentes

| Tipo | Critério | Threshold |
|---|---|---|
| EstoqueBaixo | Saldo ≤ limite | **Hardcoded: 5 unidades** |
| ProdutoSemMovimentacao | Dias sem evento operacional | **Hardcoded: 90 dias** |
| CompraEmTransitoAntigo | Compra pendente há mais de X dias | **Hardcoded: 30 dias** |
| PerdaRecorrente | ≥ N ocorrências de perda no período | **Hardcoded: 2 ocorrências** |

---

### 6. Gráficos existentes

| Tipo | Série | Granularidade |
|---|---|---|
| ReceitaPorPeriodo | Linha | Dia (≤62 dias) ou Mês (>62 dias) |
| LucroPorPeriodo | Linha | Dia ou Mês |
| ComprasPorPeriodo | Linha | Dia ou Mês |
| DespesasPorCategoria | Barras | Categoria |
| EvolucaoEstoque | Linha | Dia ou Mês (saldo acumulado) |

---

### 7. Cálculos no backend

#### 7.1 Faturamento (`ReceitaTotal`)
```
Vendas não canceladas com DataVenda no período
→ sum( venda.Total() )
→ venda.Total() = sum(item.ValorTotal()) - desconto_venda + acrescimo_venda
→ item.ValorTotal() = (qtde × precoUnitario) - desconto_item + acrescimo_item
```
Regime: competência (data da venda, não entrada de caixa). Correto para faturamento.

#### 7.2 Lucro (`LucroTotal`)
```
custo_médio_produto = sum(ValorUnitario × Qtde de entradas/inventário até dataReferencia) / sum(Qtde)
lucroTotal = sum(ValorLiquidoItem | com custo) - sum(custoMédio × qtde | com custo)
```
Usa custo médio acumulado até `dataReferencia` (fim do período), não custo histórico no momento da venda.
Produtos sem movimentações de estoque com custo são excluídos (geram aviso `CUSTO_MEDIO_AUSENTE`).

#### 7.3 Saldo Operacional (`SaldoOperacional`)
```
SaldoOperacional = valoresRecebidos - totalCompras - totalDespesas
```
Mistura de regimes: caixa para receitas, competência/registro para compras e despesas. Sem saldo inicial.

#### 7.4 Contas a Receber Abertas (`ContasReceberAbertas`)
Retorna TODAS as contas em aberto até `dataReferencia`, independente do filtro de período.
Fórmula por conta: `Valor - sum(pagamentos até dataReferencia)` → inclui apenas saldo > 0.

#### 7.5 Total Compras (`TotalCompras`)
Compras não canceladas por `DataCompra` no período. `Compra.Total()` soma apenas itens.
**Atenção**: o `Desconto` e `Acrescimo` em nível de `Compra` não são aplicados no `Total()`.

#### 7.6 Total Despesas (`TotalDespesas`)
`sum(Despesa.Valor)` por `DataCompetencia` no período. Despesa não tem data de pagamento separada.

#### 7.7 Custo médio — 3 implementações diferentes

| Local | Implementação | Data filter | Fallback para Produto.Custo |
|---|---|---|---|
| `CustoProdutoRepository` | Todas as entradas históricas | Sem filtro de data | **Sim** |
| `DashboardFinanceiroRepository` | Entradas até `dataReferencia` | Com filtro | **Não** |
| `DashboardRankingRepository` | Entradas até `dataReferencia` | Com filtro | **Não** |
| `DashboardGraficoRepository` | Entradas até `dataFinal` | Com filtro | **Não** |

Resultado: lucro na criação da venda e na listagem usa `Produto.Custo` como fallback; lucro no Dashboard gerencial exclui produtos sem histórico de entrada.

---

### 8. Cálculos no frontend

O frontend **não realiza cálculos financeiros**. Toda aritmética está no backend. Apenas formatação e decisões de apresentação:

- `shouldUseBarChart()` — decide tipo de gráfico pelo nome da série (apresentação)
- `formatAlertValue()` — formata unidade do alerta (apresentação)
- `severityVariant()` — mapeia severidade para variante visual (UI)
- `appliedFilterMatchesPeriod()` — valida coerência de filtro (UX)
- `groupRankings()` — agrupa por tipo para renderizar (apresentação)

Nenhuma regra de negócio financeira no frontend.

---

### 9. Dados existentes vs. dados faltantes

| Indicador desejado | Dados existem | Cálculo existe | Observação |
|---|---|---|---|
| Faturamento do período | Sim | Sim (`ReceitaTotal`) | Apenas renomear campo |
| Entradas de caixa | Sim | Sim (`ValoresRecebidos`) | Não exibido no KPI grid |
| Lucro bruto | Sim | Sim (`LucroTotal`) | Usa custo médio atual |
| Total compras | Sim | Sim (`TotalCompras`) | Compra registrada ≠ compra paga |
| Total despesas | Sim | Sim (`TotalDespesas`) | |
| Recebíveis em aberto | Sim | Sim (`ContasReceberAbertas`) | Snapshot total, não filtrado |
| Qtde em estoque | Sim | Sim (`EstoqueDisponivelTotal`) | Só quantidade |
| Valor estoque pelo custo | Sim (custo médio via movimentações) | **Não** (falta consolidar) | Lógica existe em partes |
| Valor estoque pelo preço de venda | Sim (`Produto.PrecoVenda`) | **Não** | Saldo + preço existem |
| Lucro potencial em estoque | Parcial | **Não** | Derivado dos dois anteriores |
| Saldo inicial de caixa | Sim (`EventoFinanceiro.SaldoInicialCaixa` com `Data`) | **Não usado** | Existe no banco, ignorado |
| Caixa inicial do período | Dependente do saldo inicial | **Não** | Precisaria acúmulo desde saldo inicial |
| Caixa final do período | Dependente do anterior | **Não** | |
| Recebíveis vencidos / a vencer | Sim (`ContaReceber.DataVencimento`) | **Não** | Campo existe |
| Valor Total Realista | Parcial | **Não** | Depende de Caixa Final + Recebíveis + Estoque |

---

### 10. Componentes frontend reutilizáveis

| Componente | Reaproveitamento |
|---|---|
| `DashboardPeriodFilter` | 100% sem alterações |
| `DashboardKpiGrid` | Com expansão dos cards |
| `DashboardChartSection` | 100% sem alterações (já genérico por série) |
| `DashboardAlerts` | Com redução para resumo |
| `DashboardRankingList` | Com remoção dos rankings de estoque |
| `DashboardSectionState` | 100% sem alterações |
| `dashboard-formatters.ts` | 100% sem alterações |
| `dashboard.ts` (service) | Com adição de novos calls |
| `dashboard.ts` (types) | Com extensão dos tipos |

---

### 11. Riscos de implantação identificados na Fase 1

| # | Risco | Severidade |
|---|---|---|
| 1 | Duplicidade de entradas (mesma venda em ReceitaTotal e ValoresRecebidos) | Crítico |
| 2 | Mistura de regime de competência com regime de caixa | Médio |
| 3 | Custo médio atual vs. histórico | Médio |
| 4 | Cálculo acumulado desde o início (performance) | Médio |
| 5 | Compra registrada ≠ compra paga | Médio |
| 6 | Recebíveis: escopo ambíguo (total em aberto vs. gerado no período) | Médio |
| 7 | Mercadorias em trânsito indevidamente no estoque | Baixo |
| 8 | Preço de venda atual ≠ valor realizado | Baixo |
| 9 | Divergência de lucro entre venda, Dashboard, gráficos e rankings | Médio |
| 10 | Regressão em endpoints já usados | Baixo |
| 11 | `Compra.Total()` ignora desconto/acréscimo no nível da Compra | Baixo |
| 12 | `PagamentoRecebido.DataPagamento` fixado em `UtcNow` | Baixo |

---

## Fase 2 — Definição Oficial das Regras de Cálculo

### Investigação obrigatória: fluxo de pagamento das vendas

**Pergunta central**: vendas pagas no ato (Dinheiro, PIX, CartaoDebito) geram `PagamentoRecebido` automaticamente?

**Resposta confirmada por análise do `VendaService.CreateAsync`**:

| FormaPagamento | Gera ContaReceber | Gera PagamentoRecebido imediatamente | Observações |
|---|---|---|---|
| Dinheiro | Sim | **Sim** — `valorBruto, desconto=0, valorBrutoLiquidado=valorBruto` | |
| PIX | Sim | **Sim** — `valorBruto, desconto=0, valorBrutoLiquidado=valorBruto` | |
| CartaoDebito | Sim | **Sim** — `valorLiquido` (após taxa), `valorBrutoLiquidado=valorBruto` | Gera `DespesaOperadora` para a taxa |
| CartaoCredito | Sim | **Não** — ContaReceber com vencimento no próximo dia útil | Pagamento registrado depois via `RegistrarPagamentoCommand` |
| Fiado | Sim | **Não** — ContaReceber com vencimento na data da venda | Pagamento registrado depois via `RegistrarPagamentoCommand` |

**Conclusão**: **Dinheiro, PIX e CartaoDebito geram `PagamentoRecebido` imediatamente**. CartaoCredito e Fiado apenas geram `ContaReceber` e aguardam registro posterior.

---

#### Análise de duplicidade de entradas (Risco 1)

`ReceitaTotal` e `ValoresRecebidos` são **fontes independentes e sem duplicidade**:
- `ReceitaTotal` = soma de `Venda.Total()` por `DataVenda` → todas as vendas confirmadas no período
- `ValoresRecebidos` = soma de `PagamentoRecebido.Valor` por `DataPagamento` → dinheiro que entrou no período

Uma venda Dinheiro/PIX/CartaoDebito realizada em 10/06 gera:
- `ReceitaTotal` +R$ X em 10/06 (faturamento)
- `ValoresRecebidos` +R$ X em 10/06 (entrada de caixa)

São dois números distintos com semânticas distintas. **Não há duplicidade**.
O risco existe apenas se, no futuro, alguém tentar somar as duas fontes para calcular "entradas". A regra deve ser documentada.

---

#### Análise de divergência de lucro (Risco 9 — detalhamento)

Existem **quatro** implementações de cálculo de lucro no sistema:

| Local | Repositório de custo | Fallback para Produto.Custo | Data de referência do custo |
|---|---|---|---|
| `VendaService.CreateAsync` (resultado da venda) | `CustoProdutoRepository` | **Sim** | Agora (no momento da venda) |
| `ObterListaVendasQueryHandler` (listagem) | `CustoProdutoRepository` | **Sim** | Agora |
| `ObterDashboardQueryHandler` (endpoint legado) | `CustoProdutoRepository` | **Sim** | Agora |
| `ObterDashboardFinanceiroGerencialQueryHandler` (Dashboard) | `DashboardFinanceiroRepository` | **Não** | `dataReferencia` do filtro |
| `DashboardRankingRepository` (rankings) | Privado (`ObterCustosMediosAsync`) | **Não** | `dataReferencia` do filtro |
| `DashboardGraficoRepository` (gráficos) | Privado (`ObterCustosMediosAsync`) | **Não** | `dataFinal` do filtro |

**Implicação**: um produto novo (sem movimentações de estoque) tem `Produto.Custo = R$ 50`:
- Na venda: lucro calculado com custo R$ 50
- No Dashboard gerencial: produto excluído do lucro (aviso CUSTO_MEDIO_AUSENTE)
- Os números divergem por design

**Decisão para a feature**: manter o comportamento do Dashboard gerencial (sem fallback para `Produto.Custo`) pois ele é mais conservador e explícito sobre dados faltantes. Documentar a divergência. A unificação do cálculo de custo médio será tratada como extração de serviço compartilhado (Fase 4).

---

### Regras oficiais de cada indicador

#### Indicador 1 — Faturamento

**Regra oficial**:
```
FaturamentoTotal =
  sum(Venda.Total()) para vendas não canceladas
  onde Venda.DataVenda >= dataInicial e Venda.DataVenda <= dataFinal

Venda.Total() = sum(VendaItem.ValorTotal()) - Venda.Desconto + Venda.Acrescimo
VendaItem.ValorTotal() = (Quantidade × PrecoUnitario) - Desconto + Acrescimo
```

**Regime**: competência (data da venda).
**Nome no DTO**: renomear `ReceitaTotal` para `FaturamentoTotal` internamente (sem quebrar frontend — adicionar campo novo e manter o antigo por compatibilidade, ou apenas renomear a semântica no label da UI sem alterar o campo).
**Faturamento ≠ entrada de caixa**: documentar no DTO e na UI.

---

#### Indicador 2 — Entradas do período

**Fonte oficial**: `PagamentoRecebido.DataPagamento`

**Regra oficial**:
```
EntradasDoPeriodo =
  sum(PagamentoRecebido.Valor)
  onde PagamentoRecebido.DataPagamento >= dataInicial
  e PagamentoRecebido.DataPagamento <= dataFinal
```

Esta fonte já existe como `ValoresRecebidos` no DTO atual. **Apenas renomear semanticamente e promover a campo de destaque no KPI grid.**

**Cobertura por forma de pagamento**:
- Dinheiro/PIX: DataPagamento = DataVenda (gerado automaticamente)
- CartaoDebito: DataPagamento = DataVenda (gerado automaticamente, valor líquido)
- CartaoCredito: DataPagamento = data do registro manual do pagamento
- Fiado: DataPagamento = data do registro manual do pagamento

**Sem risco de duplicidade**: `PagamentosRecebidos` é a única fonte de entradas de caixa.

---

#### Indicador 3 — Saídas do período

**Regra oficial (aproximação documentada)**:
```
SaidasDoPeriodo =
  sum(Compra.Total()) para compras não canceladas onde Compra.DataCompra no período
  + sum(Despesa.Valor) onde Despesa.DataCompetencia no período
```

**Limitação conhecida e documentada**: compra registrada ≠ compra paga. Até que o módulo de contas a pagar seja implementado, esta é a melhor aproximação disponível. Deve aparecer com label explícito na UI: "Compras e despesas registradas no período (estimativa)".

---

#### Indicador 4 — Caixa inicial do período

**Regra oficial**:
```
CaixaInicialPeriodo =
  sum(EventoFinanceiro.Valor
    onde Tipo = SaldoInicialCaixa
    e Data < dataInicial)

  + sum(PagamentoRecebido.Valor
    onde DataPagamento < dataInicial)

  - sum(Compra.Total()
    onde DataCompra < dataInicial
    e Status != Cancelada)

  - sum(Despesa.Valor
    onde DataCompetencia < dataInicial)
```

**Nota**: o `EventoFinanceiro` é o marco zero do sistema. Ele é somado apenas uma vez (na primeira vez que sua `Data` cair antes de `dataInicial`). Não é uma "entrada recorrente" — é o ponto de partida.

**Se não houver `EventoFinanceiro` cadastrado**: `CaixaInicialPeriodo` inicia em 0 (sistema sem saldo inicial declarado).

---

#### Indicador 5 — Caixa final do período

**Regra oficial**:
```
CaixaFinalPeriodo =
  CaixaInicialPeriodo
  + EntradasDoPeriodo
  - SaidasDoPeriodo
```

Esta é a fórmula completa. O `SaldoOperacional` atual do DTO é parcialmente equivalente mas não inclui o caixa inicial. `CaixaFinalPeriodo` é o indicador correto.

---

#### Indicador 6 — Lucro bruto do período

**Regra oficial (mantida, com extração de serviço)**:
```
Para cada item de venda no período:
  custo_médio = sum(ValorUnitario × Quantidade de movimentações InventárioInicial
                    + Entrada com CompraItemId, onde Data <= dataReferencia)
                / sum(Quantidade dessas movimentações)

LucroBruto =
  sum(VendaItem.ValorTotal() onde custo_médio existe)
  - sum(custo_médio × Quantidade onde custo_médio existe)

ValorLucroNaoCalculavel =
  sum(VendaItem.ValorTotal() onde custo_médio NÃO existe)
```

**Sem alteração de comportamento.** A extração do cálculo para serviço compartilhado é feita na Fase 4.
**Custo histórico congelado no VendaItem**: fora do escopo desta feature. Documentado como evolução futura.

---

#### Indicador 7 — Recebíveis

**Regra oficial para `ContasReceberAbertas` (mantida)**:
```
ContasReceberAbertas =
  sum(ContaReceber.Valor - sum(PagamentoRecebido.ValorBrutoLiquidado até dataReferencia))
  onde saldo > 0
  e ContaReceber.CreatedAt <= dataReferencia
```

**Semântica**: total em aberto até a data de referência. **Não** é filtrado pelo período — representa a posição atual de recebíveis, independente de quando foram gerados. Label na UI deve indicar: "Recebíveis em aberto até [data de referência]".

**Novos indicadores de recebíveis (adicionar)**:
```
ContasReceberVencidas =
  sum(saldo_em_aberto por ContaReceber)
  onde DataVencimento < dataReferencia
  e saldo > 0

ContasReceberAVencer =
  sum(saldo_em_aberto por ContaReceber)
  onde DataVencimento >= dataReferencia
  e saldo > 0

Verificação: ContasReceberAbertas ≈ ContasReceberVencidas + ContasReceberAVencer
```

---

#### Indicador 8 — Estoque valorizado

**Regra oficial**:

Estoque disponível por produto = movimentações de estoque até `dataReferencia`:
```
SaldoDisponivel(produtoId) =
  sum(Quantidade onde Tipo = Entrada com CompraItemId != null, até dataReferencia)
  + sum(Quantidade onde Tipo = InventarioInicial, até dataReferencia)
  - sum(Quantidade onde Tipo = Saida, até dataReferencia)
```

Mercadorias em trânsito (compras ainda não recebidas) **não entram** no saldo disponível — ficam em `MercadoriasEmTransitoQuantidade` e `MercadoriasEmTransitoValor`.

```
ValorEstoqueAoCusto =
  sum(SaldoDisponivel(p) × CustoMedio(p)) para todos os produtos com saldo > 0

ValorEstoqueAoPrecoVenda =
  sum(SaldoDisponivel(p) × Produto.PrecoVenda) para todos os produtos com saldo > 0

LucroPotencialEstoque =
  ValorEstoqueAoPrecoVenda - ValorEstoqueAoCusto

QuantidadeTotalEstoque =
  sum(SaldoDisponivel(p)) para todos os produtos
```

**Nota sobre preço de venda**: `Produto.PrecoVenda` é o preço atual de tabela, não o preço ao qual o estoque foi originalmente comprado para revenda. O `ValorEstoqueAoPrecoVenda` representa **"se vendido hoje ao preço atual"** — é um potencial, não um valor realizado. O label na UI deve refletir isso.

**Custo médio no estoque**: usar a mesma lógica já existente (`ObterCustosMediosAsync`) que considera movimentações com `ValorUnitario` até `dataReferencia`. Se produto não tiver custo calculável, excluir do valor financeiro (não usar `Produto.Custo` como fallback — consistência com o Dashboard gerencial).

---

#### Indicador 9 — Valor total da operação

**Regra oficial**:
```
ValorTotalRealistaOperacao =
  CaixaFinalPeriodo
  + ContasReceberAbertas
  + ValorEstoqueAoCusto
```

**Indicador opcional**:
```
ValorTotalPotencialOperacao =
  CaixaFinalPeriodo
  + ContasReceberAbertas
  + ValorEstoqueAoPrecoVenda
```

**Semântica**:
- "Realista" = usa custo do estoque (já é dinheiro que saiu)
- "Potencial" = usa preço de venda do estoque (se tudo fosse vendido hoje ao preço atual)

---

### Novos campos no `DashboardFinanceiroGerencialDto`

Campos a adicionar (sem remover os existentes — princípio de adição):

```csharp
// Caixa por período
decimal CaixaInicialPeriodo      // saldo acumulado antes do início do período
decimal CaixaFinalPeriodo        // caixa inicial + entradas - saídas
// EntradasDoPeriodo → já existe como ValoresRecebidos (manter por compatibilidade)
// SaidasDoPeriodo → soma de TotalCompras + TotalDespesas (pode ser calculado no frontend ou adicionado)

// Recebíveis detalhados
decimal ContasReceberVencidas    // em aberto com DataVencimento < dataReferencia
decimal ContasReceberAVencer     // em aberto com DataVencimento >= dataReferencia

// Estoque valorizado
decimal ValorEstoqueAoCusto      // saldo disponível × custo médio por produto
decimal ValorEstoqueAoPrecoVenda // saldo disponível × precoVenda por produto
decimal LucroPotencialEstoque    // ValorEstoqueAoPrecoVenda - ValorEstoqueAoCusto
// QuantidadeTotalEstoque → já existe em DashboardOperacionalDto como EstoqueDisponivelTotal

// Visão geral
decimal ValorTotalRealistaOperacao   // CaixaFinal + Recebíveis + EstoqueCusto
decimal ValorTotalPotencialOperacao  // CaixaFinal + Recebíveis + EstoquePrecoVenda
```

---

### Impacto nos serviços e repositórios

#### 5.1 Novo: `DashboardEstoqueRepository` (ou extensão do `DashboardOperacionalRepository`)

Responsável por:
- `ObterEstoqueValorizadoAsync(dataReferencia)` → retorna `ValorEstoqueAoCusto`, `ValorEstoqueAoPrecoVenda`, `LucroPotencialEstoque`

Usa internamente: a lógica existente de `ObterSaldosEstoqueAsync` (já em `DashboardRankingRepository` e `DashboardAlertaRepository`) combinada com `ObterCustosMediosAsync` e join com `Produto.PrecoVenda`.

#### 5.2 Novo: `DashboardCaixaService` (ou extensão do handler)

Responsável por:
- `ObterCaixaInicialPeriodoAsync(dataInicial)` → acumula EventoFinanceiro + PagamentosRecebidos - Compras - Despesas antes de `dataInicial`

#### 5.3 Extensão: `DashboardFinanceiroRepository`

Adicionar:
- `ObterContasReceberVencidasAsync(dataReferencia)` → contas com `DataVencimento < dataReferencia` e saldo > 0
- `ObterContasReceberAVencerAsync(dataReferencia)` → contas com `DataVencimento >= dataReferencia` e saldo > 0
- `ObterEventoFinanceiroSaldoInicialAsync()` → retorna `EventoFinanceiro` do tipo `SaldoInicialCaixa`

#### 5.4 Extração futura: `CustoMedioService` compartilhado

As 4 implementações de custo médio devem ser unificadas em um único serviço/repositório. As diferenças (com/sem fallback, com/sem filtro de data) são parâmetros. Isso é Fase 4 e deve ser feito com testes antes de qualquer outra alteração de lucro.

---

### Sequência de implementação (Fases 3–5)

#### Fase 3 — Expandir DTO

1. Adicionar novos campos em `DashboardFinanceiroGerencialDto` (sem remover existentes)
2. Atualizar tipos TypeScript em `frontend/src/types/dashboard.ts`
3. Adicionar os campos como opcionais (`decimal?` no C# / `number | null | undefined` no TypeScript) para manter compatibilidade durante a transição

#### Fase 4 — Implementação no backend

**Sequência obrigatória** (cada item depende do anterior):

1. Extrair `ObterCustosMediosAsync` para classe base ou serviço compartilhado — eliminar duplicação antes de adicionar mais código
2. Adicionar `ObterContasReceberVencidasAsync` e `ObterContasReceberAVencerAsync` em `DashboardFinanceiroRepository`
3. Adicionar `ObterEventoFinanceiroSaldoInicialAsync` (leitura dos `EventosFinanceiros`)
4. Implementar `ObterCaixaInicialPeriodoAsync` — nova query acumulada
5. Implementar `ObterEstoqueValorizadoAsync` — novo cálculo de estoque financeiro
6. Atualizar `ObterDashboardFinanceiroGerencialQueryHandler` para calcular e popular os novos campos

#### Fase 5 — Testes

Ver seção de testes obrigatórios abaixo.

---

### Testes obrigatórios

#### Unitários (novos)

| Cenário | Teste |
|---|---|
| CaixaInicialPeriodo sem EventoFinanceiro | Deve retornar 0 |
| CaixaInicialPeriodo com EventoFinanceiro antes do período | Deve incluir o valor do evento |
| CaixaInicialPeriodo com EventoFinanceiro APÓS o período | Deve ignorar o evento |
| CaixaInicialPeriodo com pagamentos antes do período | Deve somar pagamentos |
| CaixaInicialPeriodo com compras antes do período | Deve subtrair compras |
| CaixaFinalPeriodo completo | CaixaInicial + Entradas - Saídas |
| EstoqueValorizado sem movimentações | Deve retornar 0 |
| EstoqueValorizado com inventário inicial | Deve calcular corretamente |
| EstoqueValorizado após venda (saída) | Deve reduzir o valor |
| EstoqueValorizado com mercadoria em trânsito | Não deve incluir trânsito |
| ContasReceberVencidas vs. AReceber | Soma deve igualar ContasReceberAbertas |
| Custo médio: produto sem movimentações no Dashboard | Deve excluir (sem fallback para Produto.Custo) |

#### Integração (existentes + novos)

| Cenário | Teste |
|---|---|
| Handler financeiro retorna todos os novos campos | Campos não devem ser null quando há dados |
| Filtro por período não altera ContasReceberAbertas | Snapshot deve ser constante para qualquer período |
| CaixaInicialPeriodo é consistente entre filtros | Filtrar junho ou julho deve ter mesma base inicial |
| Lucro no Dashboard ≠ lucro na venda | Divergência deve ser documentada, não corrigida forçosamente |

#### Manuais

| Cenário | Como testar |
|---|---|
| Cadastrar saldo inicial → filtrar período antes do saldo | CaixaInicial = 0 |
| Cadastrar saldo inicial → filtrar período que inclui o saldo | CaixaInicial = valor do saldo |
| Realizar venda Dinheiro/PIX → verificar entradas | Deve aparecer em `ValoresRecebidos` no mesmo dia |
| Realizar venda CartaoCredito → verificar entradas | Não deve aparecer até o pagamento ser registrado |
| Registrar pagamento de venda fiado → verificar entradas | Deve aparecer na data do registro |
| Receber compra → verificar estoque valorizado | Deve aumentar `ValorEstoqueAoCusto` |
| Realizar venda → verificar estoque valorizado | Deve reduzir `ValorEstoqueAoCusto` |
| Produto com `DataVencimento` passado → verificar vencidos | Deve aparecer em `ContasReceberVencidas` |

---

### Riscos adicionais identificados na Fase 2

| # | Risco | Severidade | Observação |
|---|---|---|---|
| 13 | Divergência de lucro entre venda e Dashboard (confirmada) | Médio | Comportamento por design — documentar |
| 14 | `CustoProdutoRepository` com fallback `Produto.Custo` causa inconsistência com Dashboard | Médio | Unificar na Fase 4 |
| 15 | Performance do `CaixaInicialPeriodo` em base grande | Médio | Indexar colunas de data antes de ativar |
| 16 | `Compra.Total()` ignora Desconto/Acrescimo no nível da Compra (confirmado) | Baixo | Investigar uso em produção antes da Fase 4 |
| 17 | CartaoCredito com taxa: `DespesaOperadora` registrada, mas não entra em `TotalDespesas` (é entidade separada) | Médio | Verificar se `DespesaOperadora` deve compor as saídas |

**Nota sobre Risco 17**: existe a entidade `DespesaOperadora` que registra a taxa do cartão de débito/crédito. Ela não é uma `Despesa` comum e não entra em `TotalDespesas`. Se essas taxas forem significativas, o cálculo de saídas pode subestimar as saídas reais. Investigar antes da Fase 4.

---

### Decisões tomadas e documentadas

| Decisão | Justificativa |
|---|---|
| Fonte oficial de entradas = `PagamentoRecebido.DataPagamento` | Dinheiro/PIX/CartaoDebito geram PagamentoRecebido automaticamente. CartaoCredito/Fiado geram quando registrado. Sem duplicidade. |
| Saídas = compras + despesas registradas (aproximação) | Sem módulo de contas a pagar, esta é a melhor aproximação. Documentado explicitamente. |
| Custo médio: manter sem fallback para `Produto.Custo` no Dashboard | Mais conservador e explícito. Produtos sem histórico geram aviso CUSTO_MEDIO_AUSENTE. |
| Custo histórico congelado em `VendaItem`: fora do escopo | Evolução futura. Documentado como risco aceito. |
| `ContasReceberAbertas`: manter como snapshot total | Semântica clara: "em aberto até hoje", não "gerado no período". Label na UI deve refletir. |
| `ValorEstoqueAoPrecoVenda`: label "Valor Potencial" | Preço de venda atual ≠ valor realizado. Label deve ser explícito. |
| `DespesaOperadora` (taxa cartão): investigar antes de incluir em saídas | Risco 17 — não incluir nas saídas sem validação. |
| Princípio: adição, não substituição | Nenhum campo existente será removido ou renomeado no DTO. |

---

## Fases Futuras

_(A preencher após aprovação e execução das Fases 3–9)_

### Fase 3 — Ajuste/expansão do DTO

_Pendente_

### Fase 4 — Implementação dos cálculos no backend

_Pendente_

### Fase 5 — Testes dos cálculos

_Pendente_

### Fase 6 — Reorganização visual do frontend

**Planejado**:
- Expandir `DashboardKpiGrid` com novos cards: Entradas, Saídas, Caixa Final, Estoque Valorizado, Valor Total Realista
- Manter gráficos existentes sem alteração
- Reduzir bloco "Operacional" no Dashboard principal

### Fase 7 — Ajuste dos gráficos e mensagens vazias

**Planejado**:
- Substituir "Serie sem pontos" por "Sem dados no período"
- Substituir "A API retornou a serie, mas sem pontos para renderizacao" por "Não há movimentações suficientes para gerar este gráfico."
- Avaliar adição de série "EntradasVsSaidas"

### Fase 8 — Redução dos alertas operacionais

**Planejado**:
- Dashboard principal: exibir apenas resumo de alertas (total, críticos, por tipo)
- Remover `ProdutosComMaiorEstoque` e `ProdutosComMenorEstoque` do Dashboard principal
- Detalhe de alertas → tela de Estoque ou tela dedicada de Alertas

### Fase 9 — Validação final

_Pendente_

### Fase 10 — Atualização do roadmapAmani.md

_Somente após aprovação do resultado final. Não alterar antes._

---

*Documento gerado e mantido automaticamente durante a feature. Não editar manualmente — atualizar via Fase correspondente.*
