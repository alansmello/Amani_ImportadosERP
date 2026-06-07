# Implementation Plan: Mercadorias em Transito e Recebimento Parcial

**Branch**: `main` | **Date**: 2026-06-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-mercadorias-transito/spec.md`

## Summary

Alterar o fluxo de compras para separar aquisicao comercial de entrada fisica em
estoque. A criacao de compra deixara de gerar `EstoqueMovimentacao` do tipo
`Entrada`; os itens ficarao pendentes como mercadorias em transito ate que
recebimentos fisicos sejam confirmados por item. Recebimentos parciais gerarao
movimentacoes de entrada apenas para a quantidade recebida. Perdas, extravios e
avarias serao eventos historicos por item, rastreados como prejuizo operacional,
sem gerar estoque.

Compras registradas antes da Feature 003 serao tratadas como legadas. Como o
modelo antigo ja gerou estoque no momento da compra, a migration deve criar
recebimentos `LegadoMigrado` por item, sem gerar nova movimentacao de estoque,
para manter status, quantidade recebida e quantidade pendente consistentes.

O plano mantem Clean Architecture e DDD Lite: invariantes em Domain/Application,
controllers apenas delegando, DTOs manuais, repositories para persistencia,
Fluent API para mappings e nenhuma dependencia nova.

## Technical Context

**Language/Version**: C# / .NET 8

**Primary Dependencies**: ASP.NET Core Web API, Entity Framework Core, Npgsql,
MediatR ja existente no projeto

**Storage**: PostgreSQL via `AmaniDbContext`

**Testing**: Validacao por build da solucao e chamadas HTTP dos contratos; nao
ha projeto de testes automatizados existente nesta solucao

**Target Platform**: Backend web API

**Project Type**: ASP.NET Core web service em Clean Architecture

**Performance Goals**: Consultas operacionais de mercadorias em transito e
historicos devem responder adequadamente para uso diario; calculos de pendencia
devem ser feitos por agregacao historica, sem campo fixo de estoque

**Constraints**: Sem frontend, sem novas bibliotecas externas, sem AutoMapper,
DTOs manuais obrigatorios, controllers sem regra de negocio, Fluent API
obrigatorio, Repository Pattern mantido, backend como fonte das regras, historico
preservado, estoque por movimentacoes

**Scale/Scope**: Alterar compras, recebimentos, perdas e consultas logisticas;
preservar vendas, inventario inicial, contas a receber iniciais, saldo inicial de
caixa e dashboard financeiro. O regime financeiro nao muda: o dashboard
financeiro continua considerando compra registrada como impacto financeiro
imediato, enquanto estoque fisico passa a considerar apenas recebimento
confirmado.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Arquitetura e responsabilidades**: PASS. Controllers continuarao como
  entrada HTTP; regras de quantidade, status, recebimento e perda ficam em
  Application/Domain.
- **Estoque por movimentacoes**: PASS. Nenhum saldo fixo sera criado; saldo
  fisico permanece derivado de `EstoqueMovimentacao`.
- **Compras e mercadorias em transito**: PASS. O plano remove entrada automatica
  na criacao de compra e introduz recebimento fisico confirmado como gatilho de
  entrada.
- **Recebimentos, perdas e rastreabilidade**: PASS. Recebimentos e perdas serao
  eventos por item; perdas nao geram estoque e ficam auditaveis.
- **Vendas, custo medio e inventario inicial**: PASS. Vendas continuam validando
  saldo fisico; custo medio considera entradas reais; inventario inicial segue
  como movimentacao valida.
- **Contratos de API e DTOs**: PASS. Novos endpoints e consultas usam DTOs
  explicitos e mapeamento manual.
- **Persistencia e mapeamentos**: PASS. Novas entidades e campos serao mapeados
  por Fluent API; repositories mediam acesso a dados; historico nao sera apagado.
- **Backend como fonte das regras**: PASS. Validacoes de pendencia, status,
  recebimento e perda ficam no backend.
- **Simplicidade antes de sofisticacao**: PASS. A solucao reaproveita
  `CompraService`, repositories e `EstoqueMovimentacao`, adicionando apenas os
  eventos necessarios.

## Project Structure

### Documentation (this feature)

```text
specs/003-mercadorias-transito/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- compras-transito-api.md
|-- checklists/
|   `-- requirements.md
`-- spec.md
```

### Source Code (repository root)

```text
src/
|-- Amani.ImportadosERP.Api/
|   `-- Controllers/
|       `-- CompraController.cs
|-- Amani.ImportadosERP.Application/
|   |-- DTOs/
|   |-- Interfaces/
|   |-- Mappers/
|   `-- Services/
|       `-- CompraService.cs
|-- Amani.ImportadosERP.Domain/
|   `-- Entities/
|       |-- Compra.cs
|       |-- CompraItem.cs
|       |-- CompraItemRecebimento.cs
|       `-- CompraItemPerda.cs
|-- Amani.ImportadosERP.Infra.Data/
|   |-- Context/
|   |-- EntityConfigurations/
|   |-- Migrations/
|   `-- Repositories/
`-- Amani.ImportadosERP.Infra.IoC/
    `-- DependencyInjection.cs
```

**Structure Decision**: Usar a estrutura Clean Architecture ja existente em
`src/`. Nao criar novo projeto. A camada Domain recebe eventos de recebimento e
perda e status da compra; Application coordena casos de uso e DTOs; Infra.Data
persiste via Fluent API e migrations; API expõe endpoints sem regra de negocio;
Infra.IoC registra novos repositories/services se necessarios.

## Existing Code Reuse

- `CompraService.CreateAsync` ja cria compra e itens, mas hoje tambem cria
  movimentacoes `Entrada`; esta geracao automatica deve ser removida.
- `EstoqueMovimentacao` ja representa `Entrada`, `Saida` e `InventarioInicial`;
  sera reaproveitada para entradas de recebimento confirmado. Movimentacoes
  antigas permanecem rastreaveis por `CompraId + ProdutoId`; novas entradas de
  recebimento devem preencher `CompraItemId`.
- `EstoqueConsultaRepository` ja calcula saldo por entradas menos saidas e deve
  continuar sem alteracao conceitual.
- `CustoProdutoRepository` ja calcula custo medio a partir de entradas com
  `ValorUnitario`; depois da feature, deve considerar apenas `InventarioInicial`
  com valor unitario e `Entrada` gerada por recebimento confirmado. Compra criada
  sem recebimento e perda/extravio/avaria nao entram no custo medio.
- `VendaService` ja valida saldo antes da venda e deve ser preservado como
  regressao obrigatoria.
- `CompraRepository`, `CompraMapper` e DTOs de compra existentes serao
  expandidos para status, quantidades recebidas, perdidas e pendentes.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design and Contracts

See [data-model.md](./data-model.md), [contracts/compras-transito-api.md](./contracts/compras-transito-api.md)
and [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- **Arquitetura e responsabilidades**: PASS. Contratos indicam endpoints, mas
  validacoes e transicoes ficam em services/domain.
- **Estoque por movimentacoes**: PASS. Data model nao adiciona saldo fixo; itens
  expõem pendencia calculada por quantidade comprada menos eventos historicos.
- **Compras e mercadorias em transito**: PASS. Contratos de criacao de compra
  preservam compra sem entrada automatica; recebimento cria entrada.
- **Recebimentos, perdas e rastreabilidade**: PASS. Data model define eventos
  historicos separados para recebimento e perda.
- **Vendas, custo medio e inventario inicial**: PASS. Quickstart inclui
  regressao de vendas, inventario inicial e custo medio. Produtos com inventario
  inicial valorizado podem ter lucro/custo medio alterado porque essa entrada
  passa a compor o custo medio.
- **Contratos de API e DTOs**: PASS. Contratos documentam DTOs de request e
  response; sem entidades de dominio expostas.
- **Persistencia e mapeamentos**: PASS. Migrations e Fluent API estao previstos
  para novos campos, tabelas e relacionamentos.
- **Backend como fonte das regras**: PASS. Regras de pendencia e bloqueios de
  status sao verificadas no backend.
- **Simplicidade antes de sofisticacao**: PASS. Nao ha nova dependencia nem
  mecanismo de workflow externo.

## Migrations Necessarias

- Adicionar status operacional em `compras`, com valores compativeis com
  `Criada`, `EmTransito`, `ParcialmenteRecebida`, `Recebida`, `Finalizada` e
  `Cancelada`.
- Migrar compras existentes para status `Recebida`, porque o modelo antigo ja
  criou entradas de estoque para elas.
- Criar recebimentos `LegadoMigrado` para cada item de compra existente antes
  da Feature 003, com quantidade igual a quantidade comprada, data baseada na
  data da compra, valor unitario do item, e sem criar nova movimentacao de
  estoque.
- Criar tabela `compra_item_recebimentos` com compra, item, produto, quantidade,
  data, valor unitario, movimentacao de estoque relacionada, origem
  (`Operacional` ou `LegadoMigrado`) e observacao opcional.
- Criar tabela `compra_item_perdas` com compra, item, produto, quantidade, data,
  motivo e observacao opcional.
- Adicionar `CompraItemId` nullable em `estoque_movimentacoes` para rastrear
  entradas novas por item recebido. Movimentacoes antigas devem permanecer com
  `CompraItemId` nulo e continuar rastreaveis por `CompraId + ProdutoId`.
- Atualizar `AmaniDbContextModelSnapshot` via migration EF Core.

## Transaction and Atomicity Requirements

- Recebimento de item MUST ocorrer em uma unica transacao: registrar
  `CompraItemRecebimento`, gerar `EstoqueMovimentacao` de entrada, vincular a
  movimentacao ao recebimento e atualizar status da compra.
- Perda/extravio/avaria MUST ocorrer em uma unica transacao: registrar
  `CompraItemPerda`, registrar a rastreabilidade de prejuizo operacional e
  atualizar status da compra.
- Falha em qualquer etapa da transacao MUST impedir persistencia parcial. Nao
  pode existir recebimento sem entrada correspondente nem entrada sem
  recebimento correspondente para eventos operacionais novos.

## Purchase Status Rules

- `Recebida`: 100% dos itens foram recebidos fisicamente, sem perdas.
- `Finalizada`: todos os itens foram resolvidos, mas houve pelo menos uma perda,
  extravio ou avaria.
- `ParcialmenteRecebida`: existe recebimento fisico parcial e ainda existe
  quantidade pendente.
- `EmTransito`: compra criada e ainda sem recebimento fisico total, podendo ter
  pendencias e podendo ter perdas sem recebimento total.
- `Cancelada`: compra cancelada conforme regra futura ou existente.
- Consultas de mercadorias em transito MUST excluir compras `Recebida`,
  `Finalizada` e `Cancelada`.

## Financial Dashboard Decision

Nesta feature, o dashboard financeiro continua considerando compras registradas
como impacto financeiro imediato. A Feature 003 altera o fluxo fisico e
operacional de estoque, nao o regime financeiro. Assim:

- financeiro considera compra registrada;
- estoque considera apenas recebimento fisico confirmado;
- recebimentos e perdas desta feature nao criam novo contrato financeiro;
- dashboard financeiro existente deve manter o comportamento atual.

## Validation and Regression Scope

- Criacao de compra nao altera saldo fisico nem custo medio.
- Compras legadas migradas ficam com status `Recebida`, recebimentos
  `LegadoMigrado`, pendencia zero e nenhuma movimentacao nova de estoque.
- Recebimento parcial altera saldo somente pela quantidade recebida.
- Recebimentos multiplos do mesmo item acumulam historico e saldo.
- Perdas reduzem pendencia sem criar movimentacao de estoque.
- Recebimento e perda sao atomicos com atualizacao de status.
- Recebimento/perda acima da pendencia e rejeitado antes de persistir eventos.
- Compras parcialmente resolvidas continuam em transito.
- Compras totalmente recebidas ficam `Recebida` e saem da lista de transito.
- Compras totalmente resolvidas com qualquer perda ficam `Finalizada` e saem da
  lista de transito.
- Venda continua validando somente saldo fisico disponivel.
- Inventario inicial continua criando entrada valida e nao e impactado pelo novo
  fluxo de compra.
- Custo medio considera entradas reais: inventario inicial com valor e
  recebimentos confirmados com valor unitario.
- Compra criada sem recebimento, perda, extravio e avaria nao entram no custo
  medio.
- Dashboard financeiro existente continua considerando compras registradas como
  impacto financeiro imediato.

## Required Future Task Coverage

O `/speckit-tasks` deve gerar tarefas explicitas para:

- migration/compatibilidade de compras legadas com recebimentos
  `LegadoMigrado` sem nova movimentacao de estoque;
- `CompraItemId` nullable em movimentacoes e preenchimento obrigatorio nas novas
  entradas por recebimento;
- transacao do caso de uso de recebimento;
- transacao do caso de uso de perda/extravio/avaria;
- atualizacao do custo medio para incluir `InventarioInicial` e entradas por
  recebimento confirmado;
- regressao de inventario inicial;
- regressao de vendas existentes e validacao de estoque fisico;
- regressao de estoque e movimentacoes antigas;
- regressao de compras antigas migradas;
- regressao do dashboard financeiro mantendo impacto por compra registrada.

## Complexity Tracking

No constitution violations.
