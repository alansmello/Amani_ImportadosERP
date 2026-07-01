# F024 — Revisão de consultas e índices

## Estratégia

- Saldo agrupa no PostgreSQL por `ProdutoId`, `Tipo` e denominador e soma numeradores antes de compor razões.
- Legado é agregado como decimal exato finito e interpretado como razão sobre potência de 10.
- Dashboard de estoque, alertas, operacional e evolução reutilizam o repository exato.
- Rankings agrupam vendas por produto/denominador no banco; não materializam todos os itens para converter quantidades.

## Índices usados

- `IX_estoque_movimentacoes_ProdutoId_Data_Tipo`: filtro temporal, produto e tipo.
- `IX_estoque_movimentacoes_VendaItemId`: rastreio de saída/compensação.
- `IX_produto_apresentacoes_ProdutoId_Ativo_PermiteVenda`: seleção de venda.
- `IX_produto_apresentacoes_ProdutoId_Nome`: unicidade cadastral.

## Validação pendente

Executar `EXPLAIN (ANALYZE, BUFFERS)` no clone com volume representativo. Não executar `ANALYZE` destrutivo nem adicionar índice em produção sem comparar custo de escrita e plano real.
