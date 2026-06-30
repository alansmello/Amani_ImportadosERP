# Research: Revisão do Dashboard Gerencial

## 1. Evolução do contrato financeiro

**Decision**: manter todos os campos atuais e adicionar campos novos como opcionais durante o rollout. `ReceitaTotal` continua sendo o campo de faturamento e `ValoresRecebidos` continua sendo o campo de entradas; os rótulos da interface corrigem a semântica sem criar aliases duplicados. `SaidasPeriodo` será fornecido pelo backend.

**Rationale**: aliases como `FaturamentoTotal`/`EntradasPeriodo` criariam duas fontes contratuais para o mesmo valor e risco de divergência. Campos opcionais permitem publicar backend e frontend independentemente; o frontend mostra “Indisponível” quando um campo novo não chegou.

**Alternatives considered**: renomear campos existentes, rejeitado por quebra de compatibilidade; duplicar campos sinônimos, rejeitado por ambiguidade; calcular saídas no frontend, rejeitado pelo princípio de backend como fonte das métricas.

## 2. Caixa inicial, ajuste de implantação e caixa final

**Decision**: separar `CaixaInicialPeriodo`, `AjusteImplantacaoPeriodo` e `CaixaFinalPeriodo`. Eventos de saldo inicial anteriores ao filtro compõem o caixa inicial; eventos dentro do filtro compõem o ajuste; eventos posteriores ao filtro são ignorados. O ajuste não integra `ValoresRecebidos`.

**Rationale**: a separação preserva a cronologia e impede classificar implantação como recebimento operacional. A fórmula fica `CaixaFinal = CaixaInicial + AjusteImplantacao + ValoresRecebidos - SaidasPeriodo`.

**Alternatives considered**: tratar saldo dentro do período como caixa inicial, rejeitado por deslocar temporalmente o evento; ignorá-lo, rejeitado por eliminar valor real; somá-lo a entradas, rejeitado por corromper a semântica de recebimentos.

## 3. Consultas agregadas e índices

**Decision**: substituir `Include(...).ToListAsync()` usado para somar vendas, compras e recebíveis por projeções e agregações traduzidas para SQL. Criar índices orientados aos filtros de data/status e aos agrupamentos de estoque, confirmando o uso com planos de execução antes de manter cada índice.

**Rationale**: a implementação atual cresce em memória com o histórico e não atende 100 mil registros por tabela. A documentação do EF Core recomenda projetar somente colunas necessárias, limitar materialização e usar índices alinhados aos predicados; índices compostos devem respeitar a ordem das colunas consultadas. Referências: [Efficient Querying](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying) e [Indexes](https://learn.microsoft.com/en-us/ef/core/modeling/indexes).

**Alternatives considered**: cache distribuído, rejeitado porque adiciona invalidação e infraestrutura antes de provar necessidade; carregar tudo e agregar em C#, rejeitado por escala; SQL manual em todas as consultas, rejeitado inicialmente em favor de LINQ traduzível, mantendo SQL parametrizado apenas como fallback comprovado por medição.

## 4. Custo médio compartilhado

**Decision**: extrair a consulta de custo médio para um serviço interno de leitura da Infra.Data, reutilizado pelos repositories financeiro, de estoque, rankings e gráficos. A consulta recebe IDs de produtos e data de referência, considera somente inventário inicial e entradas vinculadas a item de compra com valor unitário e nunca aplica `Produto.Custo` como fallback no Dashboard.

**Rationale**: existem implementações duplicadas com risco de divergência. O serviço compartilhado preserva Repository Pattern porque handlers continuam acessando interfaces de repositories, enquanto remove duplicação interna da persistência.

**Alternatives considered**: serviço de domínio, rejeitado porque depende de consulta agregada e data de corte; manter helpers privados duplicados, rejeitado por inconsistência; usar custo cadastral, rejeitado pela constituição e spec.

## 5. Estoque sem custo calculável

**Decision**: `ValorEstoqueAoPrecoVenda` inclui todo saldo positivo com preço atual; `ValorEstoqueAoCusto` inclui somente produtos com custo médio; `LucroPotencialEstoque` inclui somente produtos com custo médio. A resposta informa `QuantidadeEstoqueSemCusto` em unidades e `ValorVendaEstoqueSemCusto`, além de aviso `ESTOQUE_CUSTO_MEDIO_AUSENTE`.

**Rationale**: preço de venda permite medir potencial bruto mesmo sem custo, mas custo zero presumido inflaria o lucro. Separar a lacuna mantém os totais auditáveis.

**Alternatives considered**: excluir produtos de todos os totais, rejeitado por subestimar potencial de venda; custo zero ou `Produto.Custo`, rejeitados por produzir lucro sem base em entradas reais.

## 6. Recebíveis vencidos e a vencer

**Decision**: calcular saldo da conta como `Valor - soma(ValorBrutoLiquidado até dataReferencia)`, limitar contas a `CreatedAt <= dataReferencia` e classificar o saldo positivo por `DataVencimento < dataReferencia` (vencido) ou `>=` (a vencer). Uma única projeção agregada retorna os três totais.

**Rationale**: `ValorBrutoLiquidado` representa a parcela efetivamente liquidada da obrigação, inclusive desconto; usar apenas `PagamentoRecebido.Valor` deixa saldo artificial quando houve desconto. Uma projeção comum garante `Abertas = Vencidas + A Vencer` dentro da precisão monetária.

**Alternatives considered**: três consultas independentes, rejeitado por repetção e risco de cortes diferentes; usar valor líquido recebido, rejeitado por ignorar desconto liquidado.

## 7. Resumo de alertas e rankings da home

**Decision**: estender `DashboardAlertasDto` com resumo opcional calculado no backend: total, contagens por severidade e por tipo. Preservar a lista detalhada no contrato, mas a home renderiza somente o resumo. Os rankings de maior/menor estoque continuam disponíveis no endpoint existente e são filtrados apenas da composição visual da home.

**Rationale**: o resumo é métrica gerencial e deve vir do backend. Manter coleções existentes evita quebra e respeita o escopo, que não cria tela dedicada nem remove endpoints.

**Alternatives considered**: agrupar alertas no frontend, rejeitado pela fonte central de métricas; remover alertas/rankings do contrato, rejeitado por incompatibilidade.

## 8. Validação sem infraestrutura automatizada

**Decision**: não criar projetos, frameworks, dependências ou infraestrutura de testes unitários ou de integração na F023. A entrega será validada por build do backend, lint/typecheck/build do frontend, revisão do script de migration e roteiro manual dos cálculos, contratos, falhas parciais, desempenho e responsividade.

**Rationale**: o responsável pelo produto corrigiu o relatório-base e retirou a exigência de testes automatizados desta feature. Registrar a decisão evita que `tasks.md` recrie esse escopo por inferência.

**Alternatives considered**: qualquer infraestrutura automatizada adicional, rejeitada por decisão explícita de escopo.

## 9. Compatibilidade de rollout

**Decision**: os campos novos são nullable no DTO C# e opcionais/nullables no TypeScript durante a transição. O backend preenchido retorna valores não nulos, inclusive zero real. O frontend diferencia `null`/`undefined` de `0` e mostra “Indisponível” apenas para ausência.

**Rationale**: permite deploy gradual sem confundir indisponibilidade com resultado financeiro zero.

**Alternatives considered**: campos obrigatórios desde o primeiro deploy, rejeitado por acoplamento de rollout; converter ausência em zero, rejeitado por risco gerencial; ocultar cards, rejeitado por tornar a interface instável.
