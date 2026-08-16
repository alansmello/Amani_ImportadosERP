# Implementation Plan: Devoluções e Reembolsos de Compras

**Branch**: `027-devolucoes-reembolsos-compras` | **Date**: 2026-08-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/027-devolucoes-reembolsos-compras/spec.md`

**Authorization**: este plano autoriza somente design e documentação. Implementação de código e geração da migration permanecem bloqueadas até conclusão e remediação de Tasks/Analyze e uma solicitação explícita posterior para `/speckit-implement`. Aplicar migration sobre dados produtivos, habilitar a feature ou liberar em produção exige uma segunda aprovação explícita, posterior a backup, ensaio da migration já gerada em cópia representativa e conciliação documentada.

## Summary

Introduzir dois históricos independentes e append-only: devoluções logísticas por item e reembolsos financeiros por compra. Devoluções anteriores ao recebimento encerram pendência sem estoque; devoluções posteriores referenciam um recebimento específico, geram saída de estoque e revertem da base de custo a mesma quantidade e o mesmo valor unitário que entraram. Reembolsos e seus cancelamentos entram no caixa por suas próprias datas, preservando compras brutas, pagamentos de clientes e total original. Correções usam registros compensatórios. A persistência será expand-only, composta somente por novas tabelas com referências a dados existentes, sem `UPDATE`, backfill, nova semântica em colunas históricas ou execução de `Down` após uso. Um feature flag permitirá aplicar schema, validar compatibilidade e habilitar o fluxo separadamente.

## Technical Context

**Language/Version**: C# 12 com .NET 8 no backend; TypeScript 5.7, React 19 e Next.js 15 no frontend

**Primary Dependencies**: ASP.NET Core, Entity Framework Core 8.0.8, Npgsql 8.0.8, MediatR 12.1 e Repository Pattern; Next.js App Router, TanStack Query 5, Tailwind CSS 3, Lucide React e Design System local; nenhuma dependência nova de produção

**Storage**: PostgreSQL existente em produção; cinco novas tabelas append-only para devoluções, compensações, reembolsos, cancelamentos e alocações; nenhuma alteração ou atualização de linha em tabelas atuais

**Testing**: `dotnet build Amani_ImportadosERP.sln`, `npm run lint`, `npm run typecheck`, `npm run build`, roteiro manual, auditoria do SQL gerado, baseline pré/pós e ensaio de migration/rollback lógico em cópia representativa; sem nova infraestrutura automatizada sem autorização explícita

**Target Platform**: API .NET em Linux/container com PostgreSQL e aplicação web responsiva em navegadores modernos

**Project Type**: aplicação web full stack em monorepo com Clean Architecture no backend e Next.js App Router no frontend

**Performance Goals**: detalhe e histórico da compra e seções gerenciais afetadas em até 2 segundos em ao menos 9 de 10 carregamentos com massa representativa; validações de saldo, limite e idempotência sem materializar o histórico integral; consultas gerenciais filtradas e agregadas no banco

**Constraints**: produção ativa; zero DML histórico; schema expand-only; rollback lógico sem `Down`; feature desligada por padrão até aprovação; transações serializáveis; idempotência por operação; total original imutável; reembolso máximo igual ao total oficial; estoque somente por movimentos; compras na unidade principal; custo da devolução derivado do recebimento; contratos aditivos; backend como fonte oficial; Mobile First e Dark Theme

**Scale/Scope**: cinco entidades persistidas novas, duas políticas de domínio, cinco grupos de operações HTTP, extensões em compra/estoque/custo/dashboard, aproximadamente 25 arquivos backend e 12 arquivos frontend diretamente afetados, uma migration exclusivamente expansiva e um pacote de rollout produtivo

## Constitution Check

*GATE: aprovado antes da Phase 0 e reavaliado após o design da Phase 1.*

- **I. Arquitetura e separação**: PASS — invariantes ficam no Domain; Application orquestra transações; repositories persistem/agregam; controllers apenas validam contrato e delegam.
- **II. Estoque por movimentações**: PASS — devolução posterior cria saída e sua compensação cria entrada; devolução anterior e reembolso não movimentam estoque; saldo fixo não é criado.
- **III. Compras, recebimentos, vendas, custos e lucro**: PASS — recebimento original permanece; devolução referencia a entrada e usa seu custo; vendas históricas não são regravadas; pendência muda somente por eventos logísticos aplicáveis.
- **IV. DTOs e mapeamento explícito**: PASS — entradas e saídas usam DTOs aditivos e mappers explícitos; entidades não são expostas; AutoMapper não será introduzido.
- **V. Persistência e histórico**: PASS — eventos e cancelamentos são append-only; novas tabelas usam Fluent API e FKs restritivas; não há alteração destrutiva ou backfill.
- **VI. Backend como fonte**: PASS — limites, situação de reembolso, pendência, saldo, custo, caixa e prejuízo líquido são oficiais no backend.
- **VII. Analytics e escalabilidade**: PASS — leituras filtram por compra/data, agregam no PostgreSQL e materializam somente compras e itens relevantes ao rateio.
- **VIII. Mobile First**: PASS — cards, diálogos e histórico serão validados em 360 px, 768 px e 1440 px sem rolagem horizontal da página.
- **IX. Experiência operacional**: PASS — ações ficam no detalhe existente, com revisão, motivo, limites visíveis e histórico único; logística e dinheiro permanecem legíveis separadamente.
- **X. Priorização do produto**: PASS — resolve recuperação financeira e correção de estoque do fluxo produtivo antes de integrações com marketplaces ou contas a pagar.
- **XI. Identidade visual**: PASS — Design System, tokens, badges, dialogs e Dark Theme existentes serão reutilizados.
- **XII. Simplicidade**: PASS — tabelas novas evitam modificar estruturas produtivas centrais; não há mensageria, nova biblioteca, integração externa ou framework adicional.

**Reavaliação pós-design**: PASS. [research.md](research.md) resolve vínculo ao recebimento, custo, cancelamento temporal, idempotência, indicadores e rollout. [data-model.md](data-model.md) mantém todas as relações novas apontando para dados existentes, e [contracts/api-contracts.md](contracts/api-contracts.md) evolui rotas e respostas por adição. A liberação permanece condicionada aos gates de [quickstart.md](quickstart.md).

## Core Design Decisions

1. `CompraItemDevolucao` registra somente a devolução original e informa se ocorreu antes ou depois do recebimento. Depois do recebimento, `CompraItemRecebimentoId` é obrigatório e determina quantidade elegível e `ValorUnitario` de custo.
2. `CompraItemDevolucaoCompensacao` é no máximo uma por devolução e neutraliza seus efeitos na data da correção; a devolução original nunca é apagada.
3. `CompraReembolso` representa crédito positivo; `CompraReembolsoCancelamento` representa a compensação negativa na data do cancelamento. O total original da compra não muda.
4. `CompraReembolsoAlocacao` associa opcionalmente parcelas do crédito a itens, perdas ou devoluções. O saldo não alocado continua válido financeiramente, mas não reduz o prejuízo líquido de uma ocorrência específica.
5. Cada confirmação mutável recebe um novo `OperacaoId` gerado pelo cliente. O identificador é único na tabela correspondente ao tipo de comando e torna idempotente o replay da mesma confirmação; ele não representa identidade compartilhada entre tipos diferentes de comando. Referência externa informada também é única dentro da compra.
6. Devolução posterior e sua compensação referenciam suas movimentações de estoque pela FK mantida na nova tabela. `estoque_movimentacoes` não recebe coluna nem backfill.
7. O custo médio passa a combinar entradas atuais com saídas/entradas de devolução identificadas pelas novas relações. Cada devolução usa o `ValorUnitario` congelado no recebimento, não o total comercial rateado.
8. Valor bruto de perda/devolução para análise comercial usa o rateio oficial da F026; custo de estoque usa o snapshot do recebimento. As duas medidas não são intercambiáveis.
9. Reembolso e devolução são comandos independentes e atomicamente consistentes em si; a interface não cria transação distribuída entre fatos que podem ocorrer em datas diferentes.
10. O schema é aplicado com a feature desligada; após baseline e smoke test, a habilitação ocorre por configuração. Recuo mantém schema e dados novos e desliga novas operações.
11. A apresentação operacional deve diferenciar fato histórico de efeito vigente: recebimentos continuam aparecendo como recebidos, devoluções pós-recebimento aparecem como devolvidas, e compensações aparecem como neutralização auditável. A lista de compras deve usar tag logística derivada desses fatos, sem misturar com tag financeira de reembolso.
12. Débito técnico identificado na homologação: ao compensar uma devolução vinculada ou alocada a reembolso, a UI e o backend devem evoluir para apresentar uma escolha explícita de cancelamento/estorno do reembolso relacionado ou manutenção justificada do crédito. A entrega atual preserva a independência entre eventos e exige conciliação operacional manual desse caso.

## Migration and Production Rollout Strategy

- Gerar uma única migration que apenas crie tabelas, constraints e índices novos; rejeitar SQL contendo `ALTER` destrutivo sobre tabelas atuais, `UPDATE`, `DELETE`, `TRUNCATE`, backfill ou remoção.
- Usar FKs `Restrict` para Compra, CompraItem, CompraItemRecebimento, CompraItemPerda e movimentos; nenhum cascade delete é permitido.
- Aplicar índice único em `OperacaoId` dentro de cada tabela de comando, uma compensação por devolução, um cancelamento por reembolso e referência externa não nula por compra.
- Aplicar migration com `Features__DevolucoesReembolsosComprasEnabled=false`, mantendo backend anterior compatível com as tabelas adicionais.
- Antes do deploy: backup restaurável, baseline de contagens/hashes/saldos, script idempotente revisado e ensaio com mesma versão/volume representativo do PostgreSQL.
- Depois da migration: repetir baseline, validar zero registros nas tabelas novas e executar regressão de compra, recebimento, perda, venda, cancelamento, estoque, custo e dashboard com flag desligada.
- Habilitar somente após aprovação nominal; executar smoke test da F027 e conciliar estoque, custo, trânsito e caixa.
- Em incidente, desligar a feature e reverter aplicação apenas para versão que ignore com segurança as tabelas novas; não executar `Down` depois do primeiro registro F027 e não restaurar backup sobre operações posteriores.

## Project Structure

### Documentation (this feature)

```text
specs/027-devolucoes-reembolsos-compras/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api-contracts.md
├── checklists/
│   └── requirements.md
└── tasks.md                 # criado somente por /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── Amani.ImportadosERP.Domain/
│   ├── Entities/
│   │   ├── Compra.cs
│   │   ├── CompraItem.cs
│   │   ├── CompraItemDevolucao.cs
│   │   ├── CompraItemDevolucaoCompensacao.cs
│   │   ├── CompraReembolso.cs
│   │   ├── CompraReembolsoCancelamento.cs
│   │   └── CompraReembolsoAlocacao.cs
│   └── Services/{CompraCalculoFinanceiro,CompraRecuperacaoFinanceira}.cs
├── Amani.ImportadosERP.Application/
│   ├── DTOs/{Devolucoes,Reembolsos,Response,Dashboards,Estoque}/
│   ├── Interfaces/{ICompraItemDevolucaoRepository,ICompraReembolsoRepository,IDashboardFinanceiroRepository,IDashboardOperacionalRepository}.cs
│   ├── Services/CompraService.cs
│   ├── Mappers/{Compra,CompraDevolucao,CompraReembolso}.cs
│   └── Queries/Handlers/{ObterListaCompras,ObterComprasEmTransito,ObterProdutosPendentesRecebimento,ObterDashboardFinanceiroGerencial,ObterDashboardOperacional}*.cs
├── Amani.ImportadosERP.Infra.Data/
│   ├── Context/AmaniDbContext.cs
│   ├── EntityConfigurations/{CompraItemDevolucao,CompraItemDevolucaoCompensacao,CompraReembolso,CompraReembolsoCancelamento,CompraReembolsoAlocacao}Mapping.cs
│   ├── Repositories/{Compra,CompraItemDevolucao,CompraReembolso,EstoqueConsulta,CustoProduto,DashboardCustoMedioReadService,DashboardFinanceiro,DashboardOperacional,DashboardAlerta}*.cs
│   └── Migrations/
├── Amani.ImportadosERP.Infra.IoC/{DependencyInjection.cs,Services/ConfigurationFeatureSettings.cs}
└── Amani.ImportadosERP.Api/Controllers/CompraController.cs

frontend/src/
├── app/compras/[id]/page.tsx
├── types/{purchase,dashboard,stock}.ts
├── services/purchases.ts
├── hooks/use-purchases.ts
└── components/compras/
    ├── purchase-detail.tsx
    ├── purchase-list.tsx
    ├── purchase-history.tsx
    ├── return-dialog.tsx
    ├── refund-dialog.tsx
    └── purchase-event-cancel-dialog.tsx

artifacts/
├── f027-production-baseline.sql
├── f027-migration-generated.sql
└── f027-post-migration-check.sql
```

**Structure Decision**: manter a Clean Architecture e os módulos atuais. Novos agregados de devolução e reembolso ficam no Domain; `CompraService` coordena casos de uso com repositories e transação serializável; Infra.Data identifica movimentos de devolução por joins às novas tabelas; API estende `ComprasController`; frontend consome contratos oficiais sem calcular saldo, custo ou caixa.

## Affected Behavior Inventory

- **Pendência e status**: `CompraItem.QuantidadePendente`, `Compra.RecalcularStatusOperacional`, `CompraRepository`, handlers de trânsito/produtos pendentes e repositories de dashboard/alertas devem incluir devoluções anteriores ao recebimento e suas compensações pela data de referência.
- **Estoque**: devolução posterior cria `Saida`; compensação com presença física confirmada cria `Entrada`; histórico deve resolver origem pela relação nova, sem classificar como venda.
- **Custo**: `CustoProdutoRepository`, `DashboardCustoMedioReadService` e consumidores de estoque/lucro devem subtrair devoluções e somar compensações pelo custo do recebimento.
- **Financeiro**: `DashboardFinanceiroRepository`, resumo de caixa e handler gerencial adicionam reembolsos líquidos atuais e anteriores, preservando compras/despesas brutas e `ValoresRecebidos` de clientes.
- **Operacional**: perdas e devoluções usam rateio F026 para valor bruto; recuperações alocadas formam prejuízo líquido; valores por ocorrência e caixa por data de crédito permanecem distintos.
- **Contratos/UI**: lista/detalhe ganham resumo de reembolso; itens ganham quantidades devolvidas vigentes e compensadas; histórico reúne quatro tipos de evento e compensações; a lista exibe tag logística derivada como parcialmente devolvida, devolvida, parcialmente compensada ou devolução compensada; mutations invalidam compras, estoque, financeiro e dashboard.
- **Débito técnico - Compensação financeira associada à compensação logística**: quando a devolução compensada possuir reembolso relacionado, o fluxo futuro deve oferecer cancelar/estornar o reembolso ou manter o crédito com justificativa auditável.
- **Legado**: sem registros novos, todas as fórmulas recompõem exatamente os resultados anteriores.

## Implementation Sequence

1. Confirmar gates, baseline produtivo e feature flag desligado.
2. Implementar entidades/políticas append-only e contratos de Application sem habilitar operações.
3. Criar mappings, repositories e migration expand-only; revisar SQL e ensaiar em cópia representativa.
4. Integrar pendência, status, movimentos, custo e consultas históricas.
5. Integrar reembolsos ao caixa e indicadores de recuperação sem alterar valores brutos existentes.
6. Expor operações HTTP finas e idempotentes, depois integrar tipos, hooks, diálogos e histórico Mobile First.
7. Após solicitação explícita de implementação, executar builds, gerar a migration e ensaiá-la somente em cópia representativa; executar baseline pós-migration, regressão legada, cenários F027, concorrência e desempenho com flag desligada.
8. Obter a segunda aprovação explícita; somente então aplicar/publicar schema e código desligados, validar produção e habilitar gradualmente mediante aprovação nominal.

## Complexity Tracking

Não há violação constitucional. As cinco entidades novas representam fatos de negócio distintos e evitam alteração destrutiva das tabelas produtivas existentes; consolidá-las artificialmente criaria estados anuláveis ambíguos, perderia constraints e dificultaria a trilha compensatória.
