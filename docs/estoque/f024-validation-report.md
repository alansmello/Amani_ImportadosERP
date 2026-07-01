# F024 — Relatório de validação

**Data**: 2026-07-01

## Resultado parcial

- Backend compila (`dotnet build --no-restore`).
- Frontend passa typecheck, lint e build (2026-07-01).
- Migration idempotente gerada e revisada sem DML histórico.
- Migration ensaiada em clone PostgreSQL 16 em 0,244 s, com hashes de negócio idênticos, zero backfill e clone removido.
- Runner temporário confirmou `24 × 1/24 = 1/1`, `4 × 1/4 = 1/1` e cancelamento `1/1 − 1/1 = 0/1` usando o domínio compilado.
- Razão exata é usada por venda, cancelamento, estoque, alertas, dashboard operacional, valorização e rankings.
- Compensações de cancelamento (`VendaItemId`) excluídas do custo médio.
- Lista de vendas indica vendas fracionadas vs legado; detalhe exibe snapshot completo.
- Feature fica desligada por padrão e, quando desligada, produtos configurados voltam ao fluxo legado sem exigir apresentação.

## Gates ainda necessários

- Fluxo HTTP completo com autenticação, persistência e concorrência no ambiente de homologação.
- Compra/recebimento/perda e dashboard consultados após vendas fracionadas persistidas.
- Validação responsiva no navegador.

O relatório será fechado após esses gates; não representa autorização de rollout em produção.
