# Quickstart de Validação: Apresentações Fracionadas

> Este roteiro é para implementação futura. A feature permanece desabilitada e não autorizada nesta etapa documental.

## Pré-requisitos

- Backup e cópia anonimizada representativa de produção.
- PostgreSQL na mesma versão de produção.
- Feature flag de apresentações desligada.
- Baseline de contagem e somas por produto para movimentações, vendas, custos médios e dashboard.

## Validação estática

```powershell
dotnet build
Set-Location frontend
npm run lint
npm run typecheck
npm run build
```

## Gate 1 — Migration sem alteração histórica

1. Restaurar a cópia de produção.
2. Registrar hash/contagem das tabelas operacionais e somas inteiras de quantidade por produto/tipo.
3. Aplicar a migration com a feature desligada e medir duração/lock.
4. Confirmar que nenhuma apresentação foi criada automaticamente e que snapshots/racionais antigos estão nulos.
5. Confirmar que cada quantidade legada continua numericamente idêntica após ampliação do tipo.
6. Executar consultas de venda, estoque, compra e dashboard; comparar com baseline.

## Gate 2 — Exatidão racional

Produto: 1 caixa em estoque, custo médio R$ 120,00.

| Operação | Razão | Resultado exato esperado |
| --- | --- | --- |
| vender 1 caixa | 1/1 | saldo 0 |
| vender 4 ampolas na mesma linha | 4 × 1/4 | saldo 0 |
| vender 1 ampola em 4 vendas | 1/4 + 1/4 + 1/4 + 1/4 | saldo 0 |
| vender 24 doses na mesma linha | 24 × 1/24 | saldo 0 |
| vender 1 dose em 24 vendas | soma de 24 × 1/24 | saldo 0 |

Após cada conjunto, confirmar que nova venda é bloqueada por saldo zero, sem tolerância arbitrária. Cancelar todas as vendas e confirmar saldo exato 1.

## Gate 3 — Custo e lucro

- 1 ampola: custo R$ 30,00.
- 1 dose: custo exato antes do arredondamento monetário = R$ 120,00 × 1/24.
- 24 doses: custo acumulado conciliado com R$ 120,00, sem aplicar arredondamento unitário repetido como fonte do total.
- Lucro = valor líquido comercial − custo proporcional.

## Gate 4 — Legado e compras

- Produto sem apresentação: compra, recebimento parcial, perda, venda e cancelamento mantêm resultado anterior.
- Compra de 3 caixas, recebimento de 2 e perda de 1: entrada de 2; trânsito zero; nenhuma conversão de apresentação.
- Venda histórica continua sem apresentação e cancela pela quantidade inteira original.

## Gate 5 — Dashboard e relatórios

- Ranking de quantidade usa equivalente na unidade principal e identifica a unidade.
- Faturamento usa valores comerciais, não quantidade convertida.
- Estoque valorizado usa saldo exato × custo/preço conforme regra do dashboard.
- Listagem/detalhe de venda mostram apresentação e quantidade informada; legado continua legível.

## Gate 6 — Responsividade

Validar cadastro de apresentação e nova venda em 390 px, 768 px e 1440 px, sem rolagem horizontal da página e sem ocultar apresentação, quantidade, preço ou ação de confirmação.

## Rollback/mitigação

- Antes de vendas fracionadas: desligar flag, reverter binário e, se o ensaio autorizar, manter ou remover schema expansivo.
- Depois de vendas fracionadas: desligar flag e manter binário compatível com razão/decimal; não executar `Down` nem restaurar backup sobre operações posteriores.
- Corrigir divergências somente por movimentações compensatórias auditáveis, nunca por edição histórica.
