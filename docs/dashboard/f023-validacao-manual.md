# F023 — Validação manual do Dashboard Gerencial

**Feature**: 023-revisao-dashboard-gerencial  
**Última atualização**: 30/06/2026  
**Escopo deste registro**: Phase 3 (US1) a Phase 7 (Polish)

Referências: [quickstart.md](../specs/023-revisao-dashboard-gerencial/quickstart.md), [data-model.md](../specs/023-revisao-dashboard-gerencial/data-model.md), [f023-dashboard-baseline.md](f023-dashboard-baseline.md).

## Validação automatizada (Phase 3–7)

| Verificação | Comando | Resultado | Observação |
|---|---|---|---|
| Backend Application Release build | `dotnet build src/Amani.ImportadosERP.Application --configuration Release --no-restore` | OK | 0 erros |
| Backend solução completa | `dotnet build Amani_ImportadosERP.sln --configuration Release` | Bloqueado | Feed NuGet Azure 401 (Mongeral); usar ambiente com pacotes já restaurados |
| Frontend lint | `npm run lint` (pasta `frontend`) | OK | 1 warning pré-existente em `dashboard-chart-section.tsx` |
| Frontend typecheck | `npm run typecheck` | OK | |
| Frontend build | `npm run build` | OK | Next.js 15.5.19 compilado com sucesso |

## 5.1 Faturamento versus entradas

**Objetivo**: Faturamento inclui vendas à vista e a prazo; Entradas inclui apenas pagamentos efetivamente registrados no período.

| Passo | Ação | Esperado | Obtido | Status |
|---|---|---|---|---|
| 1 | Registrar venda Dinheiro/PIX e venda Crédito/Fiado não recebida no mesmo período | Faturamento = soma das duas vendas | _Preencher após execução local_ | Pendente |
| 2 | Consultar `GET /api/dashboard-gerencial/financeiro` | `receitaTotal` reflete ambas | _Preencher_ | Pendente |
| 3 | Conferir card **Entradas** na home | `valoresRecebidos` = apenas pagamentos do período | _Preencher_ | Pendente |
| 4 | Registrar pagamento da venda a prazo em data posterior | Pagamento entra nas Entradas pelo mês do pagamento, não do faturamento | _Preencher_ | Pendente |

**Fórmulas de referência**:

- `receitaTotal` = soma de vendas não canceladas no período (competência).
- `valoresRecebidos` = soma de `PagamentoRecebido.Valor` com `DataPagamento` no período.

## 5.2 Saídas estimadas

**Objetivo**: Saídas = compras não canceladas + despesas por competência; sem DespesaOperadora.

| Passo | Ação | Esperado | Obtido | Status |
|---|---|---|---|---|
| 1 | Registrar compra não cancelada e despesa no período | `saidasPeriodo` = totalCompras + totalDespesas | _Preencher_ | Pendente |
| 2 | Conferir card **Saídas estimadas** | Badge "Estimativa" e descrição "Compras e despesas registradas no período (estimativa)" | _Preencher_ | Pendente |
| 3 | Verificar ausência de DespesaOperadora | Saídas não incluem taxas de operadora | _Preencher_ | Pendente |

**Fórmula de referência**:

```
saidasPeriodo = totalCompras + totalDespesas
```

## 5.3 Caixa e implantação

**Objetivo**: Separar caixa inicial, ajuste de implantação e caixa final conforme cronologia do saldo inicial.

| Cenário | Período consultado | caixaInicialPeriodo | ajusteImplantacaoPeriodo | caixaFinalPeriodo | Status |
|---|---|---:|---:|---:|---|
| A — anterior ao saldo inicial | Antes da data do `EventoFinanceiro.SaldoInicialCaixa` | 0 | 0 | entradas − saídas | Pendente |
| B — contém a data do saldo | Mês/semana que inclui a implantação | 0 | valor do evento | ajuste + entradas − saídas | Pendente |
| C — posterior ao saldo | Após a implantação | inclui saldo + movimentos anteriores | 0 | caixaInicial + entradas − saídas | Pendente |

**Invariante**:

```
caixaFinalPeriodo = caixaInicialPeriodo + ajusteImplantacaoPeriodo + valoresRecebidos - saidasPeriodo
```

| Campo API | Origem implementada (Phase 3) |
|---|---|
| `caixaInicialPeriodo` | Eventos `SaldoInicialCaixa` com `Data < dataInicial` + entradas anteriores − compras anteriores − despesas anteriores |
| `ajusteImplantacaoPeriodo` | Eventos `SaldoInicialCaixa` com `dataInicial <= Data <= dataFinal` |
| `caixaFinalPeriodo` | Fórmula oficial acima via `ObterResumoCaixaAsync` |

## 5.4 Recebíveis

**Objetivo**: Liquidação por valor bruto liquidado; segmentação vencida/a vencer; snapshot independente do início do filtro.

| Passo | Ação | Esperado | Obtido | Status |
|---|---|---|---|---|
| 1 | Preparar conta vencida, a vencer e pagamentos parciais com/sem desconto | Saldo usa `ValorBrutoLiquidado` | _Preencher_ | Pendente |
| 2 | Consultar API | `contasReceberAbertas` = soma dos saldos positivos | _Preencher_ | Pendente |
| 3 | Conferir segmentação | `contasReceberVencidas` + `contasReceberAVencer` ≈ `contasReceberAbertas` | _Preencher_ | Pendente |
| 4 | Trocar somente `dataInicial`, mantendo `dataReferencia` | Snapshot de recebíveis inalterado | _Preencher_ | Pendente |

**Fórmulas de referência (Phase 4)**:

```
saldo = ContaReceber.Valor - sum(ValorBrutoLiquidado até dataReferencia)
Abertas = Vencidas + AVencer (saldo > 0, CreatedAt <= dataReferencia)
Vencidas: DataVencimento < dataReferencia
AVencer: DataVencimento >= dataReferencia
```

| Campo API | Origem implementada |
|---|---|
| `contasReceberAbertas` | `ObterResumoRecebiveisAsync().Abertas` |
| `contasReceberVencidas` | Resumo segmentado por vencimento |
| `contasReceberAVencer` | Resumo segmentado por vencimento |

## 5.5 Estoque valorizado

**Objetivo**: Valorizar saldo disponível por movimentações; excluir trânsito; lacunas de custo auditáveis.

| Passo | Ação | Esperado | Obtido | Status |
|---|---|---|---|---|
| 1 | Inventário inicial + recebimento de compra com custo | Aumento em `valorEstoqueAoCusto` e `valorEstoqueAoPrecoVenda` | _Preencher_ | Pendente |
| 2 | Registrar venda | Redução proporcional ao saldo de movimentações | _Preencher_ | Pendente |
| 3 | Compra em trânsito (sem entrada) | Estoque valorizado inalterado | _Preencher_ | Pendente |
| 4 | Produto com saldo positivo, preço de venda e sem custo médio | Entra no potencial; fora do custo/lucro calculável; aviso `ESTOQUE_CUSTO_MEDIO_AUSENTE` | _Preencher_ | Pendente |
| 5 | Conferir totais da operação | `valorTotalRealistaOperacao` = caixa final + recebíveis + estoque ao custo; `valorTotalPotencialOperacao` = caixa final + recebíveis + estoque ao preço | _Preencher_ | Pendente |

**Regras de saldo disponível (Phase 4)**:

```
Saldo(produto) = InventarioInicial + Entrada(com CompraItemId) - Saida
```

| Campo API | Origem implementada |
|---|---|
| `valorEstoqueAoCusto` | `DashboardEstoqueRepository` — saldo × custo médio calculável |
| `valorEstoqueAoPrecoVenda` | saldo × `Produto.PrecoVenda` |
| `lucroPotencialEstoque` | margem potencial apenas onde há custo |
| `quantidadeEstoqueSemCusto` / `valorVendaEstoqueSemCusto` | unidades sem custo médio |
| `valorTotalRealistaOperacao` | handler — caixa final + recebíveis + estoque ao custo |
| `valorTotalPotencialOperacao` | handler — caixa final + recebíveis + estoque ao preço |

## Evidências de UI (Phase 3–5)

| Item | Esperado | Obtido | Status |
|---|---|---|---|
| Grid financeiro exibe 7 cards | Faturamento, Entradas, Saídas estimadas, Caixa inicial, Ajuste, Caixa final, Lucro | _Validar na home após login_ | Pendente |
| Grid patrimonial exibe 8 cards | Recebíveis aberto/vencido/a vencer, estoque custo/preço, lucro potencial, valor realista/potencial | _Validar_ | Pendente |
| Aviso estoque sem custo | Banner incompleto quando `quantidadeEstoqueSemCusto > 0` | _Validar_ | Pendente |
| Filtro stale | Trocar período não renderiza KPIs do filtro anterior | _Validar_ | Pendente |
| Rótulos semânticos | Badges Competência/Caixa/Estimativa/Snapshot/Potencial nos grids | _Validar_ | Pendente |
| Mensagens de gráfico vazio | Textos operacionais aprovados, sem jargão técnico | _Validar_ | Pendente |

## 6. Compatibilidade e falha parcial (Phase 5)

**Objetivo**: Campos legados preservados; indisponibilidade distinta de zero; degradação parcial por seção; bloqueio de resposta stale.

| Passo | Ação | Esperado | Obtido | Status |
|---|---|---|---|---|
| 1 | Consultar API financeira completa | Campos legados (`receitaTotal`, `valoresRecebidos`, `contasReceberAbertas`, etc.) presentes | _Preencher_ | Pendente |
| 2 | Simular resposta sem campo nullable (ex.: `saidasPeriodo: null`) | Card exibe **Indisponível**, nunca R$ 0,00 | _Preencher_ | Pendente |
| 3 | Simular valor zero real em campo nullable | Card exibe R$ 0,00 (zero calculado) | _Preencher_ | Pendente |
| 4 | Forçar falha isolada em financeiro | KPIs e patrimônio em erro; operacional/rankings/alertas/gráficos visíveis | _Preencher_ | Pendente |
| 5 | Forçar falha isolada em operacional, rankings, alertas e gráficos (uma por vez) | Retry afeta somente a seção com erro | _Preencher_ | Pendente |
| 6 | Trocar filtro rapidamente | Resposta stale não renderizada (`useDashboardSectionPeriodMatch`) | _Preencher_ | Pendente |

**Implementação Phase 5**:

| Item | Comportamento |
|---|---|
| Formatadores | `formatDashboardNullableCurrency` / `isDashboardValueMissing` distinguem `null`/`undefined` de `0` |
| Badges KPI | Competência, Caixa, Estimativa |
| Badges patrimoniais | Referência, Snapshot, Potencial |
| Gráficos vazios | `Sem dados no periodo` / `Nao ha movimentacoes suficientes para gerar este grafico.` |
| Acessibilidade | `aria-live` assertive em erro; `aria-busy` em loading; retry com `aria-label` |
| Queries | Chaves independentes por seção + filtro; stale bloqueado via `appliedFilterMatchesPeriod` |

## 8. UX e responsividade (Phase 6 — US4)

**Objetivo**: Home gerencial enxuta, Mobile First, alertas só como resumo, rankings de estoque ocultos na home.

**Viewports**: 390×844 (smartphone), 768×1024 (tablet), 1440×900 (desktop).

| Passo | Ação | Esperado | Obtido | Status |
|---|---|---|---|---|
| 1 | Abrir home em 390×844 | Sem rolagem horizontal; seções empilhadas (KPI → patrimônio → operacional → alertas → rankings → gráficos) | _Validar localmente_ | Pendente |
| 2 | Abrir home em 768×1024 | Grids 2 colunas (KPI/patrimônio); filtro operável | _Validar_ | Pendente |
| 3 | Abrir home em 1440×900 | Conteúdo centralizado (`max-w-content`); grids 3/4 colunas | _Validar_ | Pendente |
| 4 | Conferir seção alertas | Total + agrupamentos por severidade/tipo; sem lista detalhada | _Validar_ | Pendente |
| 5 | Conferir rankings | `ProdutosComMaiorEstoque` e `ProdutosComMenorEstoque` ausentes da home | _Validar_ | Pendente |
| 6 | Leitura gerencial em ≤30s | Faturamento, entradas, saídas, caixa final, recebíveis, estoque e valor da operação visíveis sem scroll horizontal | _Validar_ | Pendente |

**Implementação Phase 6**:

| Item | Comportamento |
|---|---|
| `ObterDashboardAlertasQueryHandler` | `Resumo` com total, `PorSeveridade`, `PorTipo` após filtros |
| `DashboardGerencialDto` | `ResumoAlertas` propagado no consolidado |
| `dashboard-alerts.tsx` | Renderiza somente resumo agrupado |
| `dashboard-ranking-list.tsx` | Filtra visualmente rankings de estoque |
| `dashboard-home.tsx` | Layout Mobile First; alertas antes dos rankings |

## 7. Desempenho e índices (Phase 7)

**Objetivo**: Migration aditiva de índices; p95 ≤ 3s por seção em base representativa.

| Passo | Ação | Esperado | Obtido | Status |
|---|---|---|---|---|
| 1 | Revisar migration `AddDashboardGerencialIndexes` | Somente `CreateIndex`; sem alteração de dados/colunas | Migration manual + snapshot atualizados | OK (revisão estática) |
| 2 | Aplicar migration ou `artifacts/f023-dashboard-indexes.sql` | 7 índices criados no PostgreSQL | _Executar localmente_ | Pendente |
| 3 | Medir endpoints (≥20 amostras, descartar 1ª) | p95 ≤ 3s por seção | _Registrar ambiente/volume/p95_ | Pendente |
| 4 | Inspecionar planos das agregações | Uso dos índices candidatos | _EXPLAIN ANALYZE local_ | Pendente |

**Índices mantidos (F023)**:

| Índice | Tabela | Colunas |
|---|---|---|
| `IX_vendas_DataVenda_Cancelada` | vendas | DataVenda, Cancelada |
| `IX_compras_DataCompra_Status` | compras | DataCompra, Status |
| `IX_pagamentos_recebidos_DataPagamento` | pagamentos_recebidos | DataPagamento |
| `IX_contas_receber_CreatedAt_DataVencimento` | contas_receber | CreatedAt, DataVencimento |
| `IX_eventos_financeiros_Tipo_Data` | eventos_financeiros | Tipo, Data |
| `IX_estoque_movimentacoes_ProdutoId_Data_Tipo` | estoque_movimentacoes | ProdutoId, Data, Tipo |
| `IX_despesas_DataCompetencia` | despesas | DataCompetencia |

Script SQL: [artifacts/f023-dashboard-indexes.sql](../artifacts/f023-dashboard-indexes.sql)

## Exit Criteria (quickstart)

| Critério | Status |
|---|---|
| Backend e frontend compilam | Application OK; solução bloqueada por NuGet 401; frontend OK |
| Lint e typecheck passam | OK (1 warning pré-existente) |
| Migration aditiva revisada | OK |
| Cenários financeiros/patrimoniais conferem manualmente | Pendente execução local (seções 5.1–5.5) |
| Desempenho e ambiente registrados | Pendente (seção 7) |
| Roteiro responsivo nos 3 viewports | Pendente (seção 8) |
| Campos existentes preservados | OK (contrato aditivo; lista `Alertas` mantida na API) |
| Sem infraestrutura automatizada de testes | OK |
