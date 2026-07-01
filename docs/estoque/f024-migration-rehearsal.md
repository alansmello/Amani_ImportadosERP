# F024 — Ensaio da migration

**Data**: 2026-07-01

## Escopo

Validar a migration `20260701002458_AddProdutoApresentacoesFracionadas` sem alterar o banco de desenvolvimento original.

## Verificações estáticas concluídas

- Script idempotente gerado em `artifacts/f024-migration.sql`.
- Nenhum `UPDATE`, `DELETE` ou backfill histórico no `Up`.
- Tabela de apresentações e campos de snapshot/razão são novos e nullable para legado.
- `Quantidade` é ampliada de inteiro para `numeric(28,12)`.
- Checks validam pares exatos, projeções decimais e fatores positivos ≤ 1.
- `Down` bloqueia reversão quando já houver movimentação racional ou quantidade não inteira.

## Procedimento do ensaio isolado

1. Coletar baseline no banco original somente para leitura.
2. Criar clone temporário `amani_f024_rehearsal` por dump/restore.
3. Aplicar `artifacts/f024-migration.sql` no clone.
4. Reexecutar o baseline e comparar hashes/contagens/saldos.
5. Registrar duração e resultado.
6. Remover somente o banco temporário após a coleta.

## Resultado

- Cliente e servidor PostgreSQL 16 utilizados no ensaio final.
- Clone temporário: `amani_f024_rehearsal_20260701b`, removido após validação.
- Duração observada da migration no clone local: **0,244 s**.
- Hash de movimentações normalizado numericamente: `f3e7410e3e315e5ff2134d70288a234f` antes e depois.
- Hash de itens de venda: `f874651bba041f7a16602e8b29d36348` antes e depois.
- Apresentações criadas automaticamente: **0**.
- Itens legados sem fração preservados: **38**; itens alterados para apresentação: **0**.
- Movimentações legadas preservadas: **70**; movimentações exatas criadas automaticamente: **0**.
- Tipo final de `estoque_movimentacoes.Quantidade`: `numeric(28,12)`.

**Conclusão**: ensaio aprovado no volume local. O tempo não substitui medição em cópia com volume real de produção.
