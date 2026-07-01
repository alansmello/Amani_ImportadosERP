# Relatório Técnico de Impacto — F024

**Status**: implementação autorizada; rollout depende dos gates manuais. Projeto/tarefas de testes automatizados removidos por decisão explícita.

## Conclusão executiva

Representar somente `FatorEstoque decimal` não garante exatidão para `1/24`. A decisão adotada é manter numerador/denominador como fonte de verdade no cadastro, snapshot e movimentação, com quantidade decimal final como projeção. Essa extensão evita resíduos entre vendas separadas, cancelamentos e conciliações sem migrar linhas antigas.

## Impacto no domínio

- Nova entidade `ProdutoApresentacao` vinculada a Produto.
- Novo value object `QuantidadeRacional` com redução, soma, comparação e multiplicação exatas.
- `VendaItem.Quantidade` continua sendo a quantidade comercial inteira e recebe snapshot imutável.
- `EstoqueMovimentacao` passa a representar projeção decimal e razão exata; legado nulo equivale a denominador 1.
- Invariantes: numerador/denominador positivos, fator ≤ 1, apresentação ativa/permitida e pertencente ao produto.

## Impacto no banco e migrations

- Nova tabela e FKs/índices/checks.
- Novas colunas nullable em `venda_itens` e `estoque_movimentacoes`.
- Ampliação de `estoque_movimentacoes.quantidade` de inteiro para `numeric(28,12)` por cast, sem update histórico.
- Risco principal: lock/reescrita física da tabela durante a alteração de tipo, dependente do volume/versão do PostgreSQL. Exige ensaio cronometrado.
- Snapshot do modelo e migration precisam demonstrar ausência de `UPDATE`, defaults que preencham dados antigos ou cascata destrutiva.

## Impacto nas compras, trânsito, recebimentos e perdas

- Sem seleção de apresentação nesta versão.
- Quantidades continuam inteiras na unidade principal.
- Compra não gera estoque; recebimento confirmado gera entrada; perda não gera entrada.
- DTOs e telas de compra só precisam de regressão porque o tipo de saldo exibido se torna decimal.

## Impacto nas vendas

- Payload adiciona `ProdutoApresentacaoId` opcional para compatibilidade.
- Backend resolve configuração e cria snapshot; não aceita fator enviado pelo cliente.
- Validação soma razões exatas por produto e ocorre imediatamente antes da persistência.
- Venda, snapshot e movimentação permanecem atômicos.
- Cancelamento copia a razão da saída; o handler atual usa `item.Quantidade` e precisa ser corrigido.
- O handler atual também grava `PrecoUnitario` da venda como valor da entrada de cancelamento; novas compensações devem ser identificadas por `VendaItemId`, não formar custo médio e não tratar preço de venda como custo. Registros antigos permanecem intocados.

## Impacto no estoque

- O repository atual retorna `int` e soma diretamente `Quantidade`; contratos e projeções precisam virar decimal.
- Para exatidão, queries agrupam numeradores por denominador e combinam agregados; não somam apenas `numeric(28,12)`.
- Histórico legado é interpretado como `q/1` sem backfill.
- A movimentação continua sendo a única fonte do saldo.

## Impacto no custo médio e lucro

- Entradas reais permanecem na unidade principal; custo médio por unidade principal não muda conceitualmente.
- Entrada compensatória de cancelamento não é recebimento físico nem inventário inicial e deve ser excluída da formação de custo médio das novas operações.
- Custo da venda passa de `custoMedio × item.Quantidade` para `custoMedio × razão exata convertida`.
- Arredondamento ocorre no valor monetário final, evitando acumular 24 arredondamentos de dose como custo autoritativo.
- Handlers de lista, dashboard e rankings que hoje usam `item.Quantidade` precisam consumir equivalente exato.

## Impacto no dashboard e relatórios

- Estoque valorizado usa saldo exato antes de multiplicar por custo/preço.
- Ranking de quantidade usa equivalente na unidade principal; faturamento continua usando valor comercial.
- Listagens/detalhes mostram quantidade informada e apresentação; movimentações mostram projeção na unidade principal.
- Repositories analíticos devem agregar no banco e não carregar histórico integral.

## Riscos para produção

| Risco | Controle |
| --- | --- |
| resíduo de 1/24 | razão exata autoritativa em cada movimento |
| overflow em multiplicação cruzada | operações verificadas/BigInteger e limites de persistência |
| lock na ampliação de tipo | ensaio em cópia, janela e timeout operacional |
| consumidor ainda esperando inteiro | inventário de DTOs, repositories, frontend e build completo |
| rollback para binário antigo | feature flag e release compatível de contingência |
| configuração alterada durante venda | resolver e validar no momento transacional |
| dashboard somar unidade comercial | padronizar equivalente na unidade principal |

## Estratégia de rollback e mitigação

1. Deploy de schema e código compatível com feature desligada.
2. Conciliação de legado e smoke tests.
3. Habilitação controlada.
4. Em incidente, desligar novas apresentações/vendas fracionadas; manter leitura dos registros já criados.
5. Não executar migration `Down` após primeira operação fracionada. Correção de saldo somente por movimentação compensatória.
6. Restore de backup é aceitável apenas antes de atividade posterior; depois disso causaria perda de operações e é proibido.

## Arquivos afetados confirmados

O inventário detalhado está em [plan.md](plan.md#affected-files-confirmed). Os pontos críticos existentes são `VendaService.cs`, `CancelarVendaCommandHandler.cs`, `EstoqueConsultaRepository.cs`, `CustoProdutoRepository.cs`, `DashboardCustoMedioReadService.cs`, `DashboardEstoqueRepository.cs`, `DashboardRankingRepository.cs`, DTOs de venda/estoque/ranking, mappings, migration/snapshot e componentes de produto/venda/estoque.

## Decisão de autorização

Documentação pronta para revisão. Implementação permanece bloqueada até aprovação explícita deste relatório, do plano, das tasks e do procedimento de migration/rollback.
