# Implementation Plan: Formas de Pagamento na Venda + Taxas de Operadora

**Branch**: `015-formas-pagamento-taxas` | **Date**: 2026-06-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/015-formas-pagamento-taxas/spec.md`

## Summary

Integrar forma de pagamento ao fechamento da venda antes da persistencia final,
roteando automaticamente o financeiro: dinheiro/PIX/debito quitam a conta no
ato, credito/fiado geram recebivel pendente, e taxas de cartao viram despesas de
operadora rastreaveis. A implementacao cruza backend e frontend: dominio,
DTOs/commands/queries, migrations, repositories, controllers, services/hooks e
telas de venda, contas a receber, configuracoes e despesas de operadora.

No codigo atual a venda e criada por `VendaService.CreateAsync`, nao por
`CriarVendaCommandHandler`. O plano usa o ponto real de integracao, preservando a
intencao do roadmap: centralizar o roteamento financeiro no backend durante a
criacao da venda.

## Technical Context

**Language/Version**: Backend .NET 8 / C# com ASP.NET Core, EF Core e Npgsql;
frontend TypeScript 5.7 com React 19 e Next.js 15.

**Primary Dependencies**: MediatR, Entity Framework Core, Fluent API,
Repository Pattern, TanStack React Query, `apiClient`, componentes UI locais,
Radix Dialog, lucide-react. Nenhuma dependencia nova planejada.

**Storage**: PostgreSQL via EF Core. A feature exige migrations para adicionar
forma de pagamento em venda, configuracoes de formas de pagamento, despesas de
operadora, desconto de pagamento e quaisquer campos necessarios para manter
rastreabilidade do pagamento liquido/bruto.

**Testing**: Backend com `dotnet build` e testes existentes quando disponiveis;
frontend com `npm run lint`, `npm run typecheck`, `npm run build`; validacao
manual orientada por [quickstart.md](./quickstart.md).

**Target Platform**: ERP web oficial da Amani, operavel em smartphone, tablet e
desktop, com API ASP.NET Core e frontend Next.js.

**Project Type**: Aplicacao web full stack em repositorio unico: backend em
`src/` e frontend em `frontend/`.

**Performance Goals**: Manter os resultados da spec: selecao de forma e feedback
em ate 30 segundos; atualizacao de taxa e validacao em nova venda em ate 2
minutos; localizar despesas por periodo/forma em ate 30 segundos. Consultas de
despesas devem aplicar filtros no backend.

**Constraints**: Backend e fonte das regras; frontend nao calcula taxa final nem
saldo financeiro; Dark Theme e Mobile First; historico financeiro preservado;
sem parcelamento, split, estorno com devolucao ou conciliacao bancaria
automatica; D+1 de credito significa proximo dia util; qualquer usuario
autenticado pode editar taxas ate existir autorizacao granular.

**Scale/Scope**: Uma feature operacional com 5 formas de pagamento, 2 novas
areas de tela, extensao do fluxo de venda, extensao do pagamento de contas a
receber, e consulta filtrada de despesas de operadora. Volume esperado de MVP:
dezenas a centenas de vendas e despesas por mes, com filtros por periodo.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Arquitetura e responsabilidades**: PASS. Regras de roteamento ficam em
  Application/Domain; controllers apenas recebem DTOs e delegam.
- **Estoque por movimentacoes**: PASS. Venda continua gerando saida por
  movimentacao; nenhum saldo fixo sera introduzido.
- **Compras e mercadorias em transito**: PASS. Feature nao altera compras nem
  recebimentos de compra.
- **Recebimentos, perdas e rastreabilidade**: PASS. Pagamentos, descontos e
  despesas de operadora sao historicos financeiros preservados.
- **Vendas, custo medio e inventario inicial**: PASS. Validacao de estoque e
  calculo de lucro permanecem no backend; forma de pagamento nao altera custo
  medio.
- **Contratos de API e DTOs**: PASS. Contratos serao DTOs explicitos; entidades
  internas nao serao expostas.
- **Persistencia e mapeamentos**: PASS. Novas entidades e campos exigem Fluent
  API e migrations; repositories mediam acesso.
- **Backend como fonte das regras**: PASS. Taxas, valores liquidos, vencimento
  D+1 util, saldo e desconto serao validados no backend.
- **Analytics e escalabilidade**: PASS. Listagem de despesas usa filtros no
  backend; sem carregar historico integral no frontend.
- **Mobile First**: PASS. Fluxos de modal, configuracao e listagem possuem
  validacao mobile/tablet/desktop no quickstart.
- **Experiencia operacional**: PASS. Pagamentos imediatos eliminam o passo
  manual de baixar recebiveis para dinheiro/PIX/debito.
- **Priorizacao do produto**: PASS. Entrega controle financeiro operacional
  antes de parcelamento, split, conciliacao e dashboards avancados.
- **Identidade visual**: PASS. Frontend reutiliza Design System e Dark Theme
  oficiais.
- **Simplicidade antes de sofisticacao**: PASS. Sem nova dependencia; modelos e
  endpoints seguem padroes existentes.

## Project Structure

### Documentation (this feature)

```text
specs/015-formas-pagamento-taxas/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- api-formas-pagamento.md
|   |-- api-despesas-operadora.md
|   |-- api-vendas-contas-receber.md
|   `-- frontend-flows.md
|-- checklists/
|   `-- requirements.md
`-- spec.md
```

### Source Code (repository root)

```text
src/Amani.ImportadosERP.Domain/
|-- Entities/
|   |-- Venda.cs
|   |-- ContaReceber.cs
|   |-- PagamentoRecebido.cs
|   |-- ConfiguracaoFormaPagamento.cs       # novo
|   `-- DespesaOperadora.cs                 # novo
`-- Enums/
    `-- FormaPagamento.cs                   # novo

src/Amani.ImportadosERP.Application/
|-- Commands/
|   `-- RegistrarPagamentoCommand.cs        # adicionar Desconto e dados de liquidacao
|-- Commands/Handlers/
|   `-- RegistrarPagamentoCommandHandler.cs
|-- DTOs/
|   |-- CriarVendaDto.cs                    # adicionar FormaPagamento/PercentualTaxaOverride
|   |-- VendaResultDto.cs                   # enriquecer feedback financeiro
|   |-- RegistrarPagamentoDto.cs            # adicionar Desconto e ValorBrutoLiquidado
|   |-- ConfiguracaoFormaPagamentoDto.cs    # novo
|   `-- DespesaOperadoraListDto.cs          # novo
|-- Interfaces/
|   |-- IConfiguracaoFormaPagamentoRepository.cs  # novo
|   `-- IDespesaOperadoraRepository.cs            # novo
|-- Queries/
|   |-- ObterConfiguracoesFormasPagamentoQuery.cs # novo
|   `-- ObterDespesasOperadoraQuery.cs            # novo
|-- Queries/Handlers/
`-- Services/
    `-- VendaService.cs                     # integrar roteamento financeiro

src/Amani.ImportadosERP.Api/Controllers/
|-- VendasController.cs
|-- ContasReceberController.cs
|-- ConfiguracoesFormasPagamentoController.cs # novo
`-- DespesasOperadoraController.cs            # novo

src/Amani.ImportadosERP.Infra.Data/
|-- EntityConfigurations/
|   |-- VendaMapping.cs
|   |-- ContaReceberMapping.cs
|   |-- PagamentoRecebidoMapping.cs
|   |-- ConfiguracaoFormaPagamentoMapping.cs # novo
|   `-- DespesaOperadoraMapping.cs           # novo
|-- Repositories/
|   |-- ConfiguracaoFormaPagamentoRepository.cs # novo
|   `-- DespesaOperadoraRepository.cs           # novo
`-- Migrations/
    `-- *FormasPagamentoTaxas*

frontend/src/
|-- app/
|   |-- configuracoes/formas-pagamento/page.tsx       # novo
|   |-- financeiro/despesas-operadora/page.tsx        # novo
|   `-- vendas/nova/page.tsx                          # ajustar fluxo
|-- components/
|   |-- vendas/sale-payment-modal.tsx                 # novo
|   |-- financeiro/receivable-payment-modal.tsx       # adicionar desconto
|   |-- financeiro/operator-expenses-list.tsx         # novo
|   `-- configuracoes/payment-fees-form.tsx           # novo
|-- hooks/
|   |-- use-sales.ts
|   |-- use-receivables.ts
|   |-- use-payment-settings.ts                       # novo
|   `-- use-operator-expenses.ts                      # novo
|-- services/
|   |-- sales.ts
|   |-- receivables.ts
|   |-- payment-settings.ts                           # novo
|   `-- operator-expenses.ts                          # novo
|-- types/
|   |-- sale.ts
|   |-- receivable.ts
|   |-- payment-settings.ts                           # novo
|   `-- operator-expense.ts                           # novo
`-- config/routes.ts                                  # novas rotas
```

**Structure Decision**: Full stack dentro da estrutura existente. Backend segue
Clean Architecture do projeto, com regras financeiras em Application/Domain e
persistencia em Infra.Data. Frontend segue o padrao service/hook/type/component
das features F013/F014.

## Phase 0 Research Summary

Ver [research.md](./research.md). Todas as decisoes foram resolvidas sem
marcadores pendentes.

## Phase 1 Design Summary

- Data model: [data-model.md](./data-model.md)
- API contracts: [contracts/api-vendas-contas-receber.md](./contracts/api-vendas-contas-receber.md),
  [contracts/api-formas-pagamento.md](./contracts/api-formas-pagamento.md),
  [contracts/api-despesas-operadora.md](./contracts/api-despesas-operadora.md)
- Frontend flow contract: [contracts/frontend-flows.md](./contracts/frontend-flows.md)
- Validation guide: [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

- **Arquitetura e responsabilidades**: PASS. Contratos separam DTOs, services,
  repositories e controllers; controller nao calcula taxa.
- **Estoque por movimentacoes**: PASS. Data model preserva `EstoqueMovimentacao`
  como unica fonte de saldo.
- **Compras e mercadorias em transito**: PASS. Sem impacto.
- **Recebimentos, perdas e rastreabilidade**: PASS. Desconto, pagamento e taxa
  ficam historicos em entidades apropriadas.
- **Vendas, custo medio e inventario inicial**: PASS. Venda continua validando
  estoque fisico e calculando lucro por custo medio existente.
- **Contratos de API e DTOs**: PASS. Contracts definem payloads explicitos e
  respostas sem expor entidades.
- **Persistencia e mapeamentos**: PASS. Data model identifica mappings e
  migrations obrigatorias.
- **Backend como fonte das regras**: PASS. Contracts deixam taxa estimada como
  retorno do backend e proibem formula final no frontend.
- **Analytics e escalabilidade**: PASS. Despesas de operadora possuem filtros
  de periodo/forma no contrato.
- **Mobile First**: PASS. Frontend contract e quickstart cobrem smartphone,
  tablet e desktop.
- **Experiencia operacional**: PASS. Modal obrigatorio antes de persistir venda
  reduz retrabalho financeiro e evita estado intermediario.
- **Priorizacao do produto**: PASS. Itens fora de escopo continuam fora.
- **Identidade visual**: PASS. Frontend contract exige Design System e Dark
  Theme existentes.
- **Simplicidade antes de sofisticacao**: PASS. Sem dependencias novas; uso dos
  padroes existentes.

## Validation and Regression Scope

- Criar venda com Dinheiro, PIX, CartaoDebito, CartaoCredito e Fiado.
- Garantir que venda sem forma de pagamento nao e persistida.
- Validar que dinheiro/PIX quitam conta pelo bruto.
- Validar que debito quita conta pelo liquido e registra despesa de operadora.
- Validar que credito gera conta pendente com vencimento no proximo dia util.
- Registrar recebimento de credito com valor liquido e taxa reconhecida,
  quitando saldo bruto e criando despesa.
- Registrar pagamento fiado com desconto, bloqueando `Valor + Desconto > Saldo`.
- Editar taxa padrao e usar nova taxa em venda posterior.
- Validar override de taxa por transacao sem alterar configuracao padrao.
- Listar despesas de operadora por periodo e forma.
- Garantir que cancelamento de venda com financeiro associado preserva historico
  ou exige compensacao explicita planejada na implementacao.
- Executar `dotnet build`, migrations e comandos de frontend `lint`,
  `typecheck`, `build`.

## Required Future Task Coverage

O `/speckit-tasks` deve gerar tarefas explicitas para:

- criar enum `FormaPagamento` e adicionar campo em `Venda`;
- criar `ConfiguracaoFormaPagamento` com seed de taxas padrao;
- criar `DespesaOperadora` e seu mapping/repository;
- estender `ContaReceber`/`PagamentoRecebido` para desconto e liquidacao por
  taxa de operadora, conforme necessario para rastreabilidade;
- gerar migrations e revisar snapshot;
- estender `CriarVendaDto`, `VendaResultDto`, `RegistrarPagamentoDto` e
  `RegistrarPagamentoCommand`;
- integrar `VendaService.CreateAsync` com roteamento financeiro dentro do fluxo
  de criacao;
- implementar queries/handlers/controllers de configuracoes e despesas de
  operadora;
- registrar repositorios novos em `Infra.IoC`;
- atualizar services, hooks e types do frontend;
- criar modal obrigatorio de forma de pagamento antes de persistir venda;
- adicionar desconto no modal de pagamento de contas a receber;
- criar telas `/configuracoes/formas-pagamento` e
  `/financeiro/despesas-operadora`;
- atualizar navegacao/rotas;
- validar responsividade, Dark Theme, ausencia de calculos financeiros criticos
  no frontend e todos os cenarios do quickstart.

## Complexity Tracking

No constitution violations.
