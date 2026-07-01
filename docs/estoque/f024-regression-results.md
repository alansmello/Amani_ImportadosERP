# F024 — Regressão funcional

**Data**: 2026-07-01

## Checks automatizados de build/análise estática

- `dotnet build Amani_ImportadosERP.sln`: aprovado; somente avisos preexistentes/NuGet privado.
- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado com um aviso preexistente em `dashboard-chart-section.tsx`.
- `npm run build`: aprovado.

## Cenários manuais

| Cenário | Estado | Evidência esperada |
| --- | --- | --- |
| produto legado sem apresentação | aprovado na migration | 38 itens e 70 movimentos preservados sem snapshot/razão |
| compra 3, recebe 2, perde 1 | pendente de banco isolado | entrada 2; trânsito 0 |
| Caixa 1/1 | aprovado no runner de domínio | saída exata 1/1 |
| quatro Ampolas 1/4 | aprovado no runner de domínio | 4 × 1/4 = 1/1 |
| vinte e quatro Doses 1/24 | aprovado no runner de domínio | 24 × 1/24 = 1/1 |
| cancelamento fracionado | aprovado no runner de domínio | 1/1 − 1/1 = 0/1 |
| dashboard/estoque | pendente de banco isolado | equivalente na unidade principal |

O runner .NET 8 foi temporário, executou o assembly de domínio real e foi removido; nenhuma infraestrutura de testes foi adicionada.
