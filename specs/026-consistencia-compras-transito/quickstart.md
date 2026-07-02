# Quickstart: Validação da F026

## Objetivo

Validar manualmente a regra oficial de compras, a valorização das mercadorias em trânsito, a limpeza da home e as regressões de estoque. Este roteiro não autoriza implementação e deve ser executado somente após aprovação explícita dos artefatos da feature.

## Pré-requisitos

- Backend e frontend configurados conforme o projeto.
- Banco de validação isolado, com usuário autenticado.
- Dois produtos com preços de venda atuais conhecidos.
- Um fornecedor ativo.
- Nenhuma nova infraestrutura de testes automatizados.

## Gates de build

Na raiz:

```powershell
dotnet build Amani_ImportadosERP.sln
```

Em `frontend/`:

```powershell
npm run lint
npm run typecheck
npm run build
```

Resultado esperado: todos os quatro comandos concluídos sem erro.

## Massa de referência

Registrar uma compra com:

| Item | Quantidade | Custo unitário | Desconto item | Acréscimo item | Líquido item |
| --- | ---: | ---: | ---: | ---: | ---: |
| Produto A | 10 | R$ 20,00 | R$ 10,00 | R$ 0,00 | R$ 190,00 |
| Produto B | 5 | R$ 40,00 | R$ 0,00 | R$ 10,00 | R$ 210,00 |

Ajustes gerais:

- desconto: R$ 30,00;
- acréscimo: R$ 10,00;
- total oficial esperado: R$ 380,00.

Rateio esperado:

| Item | Peso | Desconto geral | Acréscimo geral | Total rateado |
| --- | ---: | ---: | ---: | ---: |
| Produto A | 47,5% | R$ 14,25 | R$ 4,75 | R$ 180,50 |
| Produto B | 52,5% | R$ 15,75 | R$ 5,25 | R$ 199,50 |

## Cenário 1 — Consistência do total oficial

1. Consultar a listagem padrão de compras.
2. Aplicar filtro de data ou fornecedor e consultar a mesma compra.
3. Abrir o detalhe.
4. Consultar a visão em trânsito.
5. Consultar o total de compras e a série Compras por Período no dashboard.

Esperado:

- listagem, detalhe e trânsito apresentam R$ 380,00;
- total e gráfico gerencial incluem a mesma compra por R$ 380,00;
- nenhum caminho apresenta R$ 0,00 ou “Valor não informado” por falta de campo.

## Cenário 2 — Compra totalmente em trânsito

Sem recebimentos ou perdas, conferir:

- quantidade pendente total: 15 unidades;
- valor em trânsito ao custo: R$ 380,00;
- nenhum aumento de estoque disponível;
- nenhuma alteração de custo médio.

## Cenário 3 — Recebimento parcial

Registrar recebimento de:

- 5 unidades do Produto A;
- 3 unidades do Produto B.

Pendência esperada:

- Produto A: 5/10 → R$ 90,25;
- Produto B: 2/5 → R$ 79,80;
- total pendente ao custo: R$ 170,05.

Confirmar que somente 5 unidades de A e 3 de B entram no estoque e participam do custo médio conforme a regra existente.

## Cenário 4 — Perda parcial

Em uma compra equivalente ainda pendente, registrar perda de 2 unidades do Produto A.

Esperado:

- quantidade pendente de A reduz em 2;
- valor em trânsito ao custo reduz proporcionalmente;
- a perda não gera entrada de estoque;
- o histórico da perda permanece consultável.

Repetir para os motivos Extravio e Avaria quando viável.

## Cenário 5 — Trânsito ao preço de venda

Configurar preços atuais:

- Produto A: R$ 30,00;
- Produto B: R$ 60,00.

Com as pendências do Cenário 3, o card “Mercadorias em trânsito ao valor de venda” deve apresentar:

```text
(5 × R$ 30,00) + (2 × R$ 60,00) = R$ 270,00
```

Alterar o preço atual de um produto e confirmar que somente o valor potencial muda; o total da compra e o trânsito ao custo permanecem iguais.

## Cenário 6 — Valores realista e potencial

Para uma posição controlada com:

- caixa final: R$ 1.000,00;
- recebíveis em aberto: R$ 500,00;
- estoque disponível ao custo: R$ 300,00;
- estoque disponível ao preço de venda: R$ 450,00;
- trânsito ao custo: R$ 170,05;
- trânsito ao preço de venda: R$ 270,00.

Esperado:

- valor realista: R$ 1.970,05;
- valor potencial: R$ 2.220,00.

Confirmar que o trânsito não aparece dentro dos cards de estoque disponível.

## Cenário 7 — Zero legítimo e indisponibilidade real

1. Validar uma compra cujo total oficial seja legitimamente zero, se aceita pelas regras vigentes.
2. Validar em banco isolado um caso inconsistente no qual a base de rateio seja não positiva com ajuste geral.

Esperado:

- zero legítimo aparece como R$ 0,00;
- caso inconsistente não é convertido para zero e apresenta motivo explícito;
- custo de trânsito e valor realista ficam indisponíveis quando o rateio ao custo não fecha, enquanto valor à venda e potencial permanecem disponíveis se seus dados forem válidos;
- o subtotal legado calculável é marcado como incompleto e não é apresentado como total oficial;
- nenhuma página usa “Valor não informado” apenas porque o contrato de trânsito omitiu o total.

## Cenário 8 — Limpeza da home

Confirmar que a home não apresenta nem consulta:

- Resumo de alertas;
- contador de alertas;
- agrupamento por severidade;
- agrupamento por tipo;
- Estoque com lacunas de custo;
- Dados financeiros incompletos.

Confirmar também que rankings, gráficos, KPIs, estoque e posição patrimonial continuam independentes e que o endpoint de alertas permanece acessível para compatibilidade.

## Cenário 9 — Falha parcial do dashboard

Indisponibilizar uma seção em ambiente controlado, sem derrubar as demais.

Esperado: falha de uma fonte apresenta estado próprio e não remove os valores válidos das outras seções.

## Cenário 10 — Responsividade

Executar os cenários principais em:

- smartphone;
- tablet;
- desktop.

Esperado:

- nenhum card ou tabela causa rolagem horizontal da página;
- valores, rótulos e natureza “Snapshot”/“Potencial” permanecem legíveis;
- o dashboard não deixa lacunas visuais incoerentes após a remoção dos blocos.

## Cenário 11 — Desempenho das leituras

Com massa representativa do volume atual, executar dez carregamentos de cada seção de compras e patrimônio e registrar a duração observada.

Esperado:

- ao menos nove dos dez carregamentos de cada seção concluem em até 2 segundos;
- a inspeção da consulta confirma filtro e projeção no banco, sem materialização do histórico integral;
- a home não realiza a chamada de alertas removida.

## Evidências de execução

Preencher durante a implementação; uma linha por execução relevante.

| Data/hora | Ambiente e massa | Cenário | Resultado | Duração | Evidência/observação |
| --- | --- | --- | --- | --- | --- |
| 2026-07-02 | Aprovação do responsável pelo produto | Gate T001 | PASS | N/A | “Aprovo a implementação funcional da F026 conforme spec, plan e tasks atuais.” |
| 2026-07-02 | Validação isolada da política pura em .NET 8 | Checkpoint T003–T004 | PASS | < 2 s após build | Massa A/B recompôs `TotalCompra = 380,00` e `ValorPendenteCusto = 170,05`. |
| 2026-07-02 | Auditoria estática do diff local | Gates T028–T029 | PASS | N/A | Rotas/controllers preservados; nenhuma migration, coluna de total, backfill ou alteração nas regras de recebimento, perda, movimentação e custo médio. O controller existente está no arquivo singular `CompraController.cs`, com classe/rota `ComprasController`. |
| 2026-07-02 | Workspace local, SDK .NET 10 / alvo net8.0 | Gate T030 | PASS | 4,30 s | `dotnet build Amani_ImportadosERP.sln`: 0 erros; 8 avisos NU1900 pela fonte privada de auditoria de pacotes indisponível. |
| 2026-07-02 | Workspace local, Node/Next.js 15 | Gate T031 | PASS | lint 15,8 s; typecheck 6,2 s; build 64 s | `npm run lint`, `npm run typecheck` e `npm run build` passaram. Há 1 warning preexistente de import não usado em `dashboard-chart-section.tsx`, sem erro. |
| Pendente | Pendente | Pendente | Pendente | Pendente | Pendente |

## Gate final

- Registrar os resultados dos cenários 1–11 na tabela de evidências.
- Atualizar `docs/roadmap/RoadMap_AmaniERP.md` ao término da implementação.
- Não liberar a feature se total, pendência, estoque e posição patrimonial não conciliarem exatamente com este roteiro.
