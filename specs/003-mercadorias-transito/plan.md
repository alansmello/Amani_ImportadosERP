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
caixa e dashboard financeiro

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
  sera reaproveitada para entradas de recebimento confirmado.
- `EstoqueConsultaRepository` ja calcula saldo por entradas menos saidas e deve
  continuar sem alteracao conceitual.
- `CustoProdutoRepository` ja calcula custo medio a partir de entradas com
  `ValorUnitario`; depois da feature, entradas de compra so existirao por
  recebimento confirmado. O plano tambem recomenda incluir `InventarioInicial`
  com valor unitario no custo medio, conforme Constituicao 2.0.0.
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
  regressao de vendas, inventario inicial e custo medio.
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
- Migrar compras existentes para status `Recebida` ou equivalente resolvido,
  porque o modelo antigo ja criou entradas de estoque para elas.
- Criar tabela `compra_item_recebimentos` com compra, item, produto, quantidade,
  data, valor unitario, movimentacao de estoque relacionada e observacao
  opcional.
- Criar tabela `compra_item_perdas` com compra, item, produto, quantidade, data,
  motivo e observacao opcional.
- Opcionalmente adicionar `CompraItemId` em `estoque_movimentacoes` para
  rastrear entradas por item recebido. Se adicionado, manter nullable para
  preservar movimentacoes historicas de inventario, venda e compras antigas.
- Atualizar `AmaniDbContextModelSnapshot` via migration EF Core.

## Validation and Regression Scope

- Criacao de compra nao altera saldo fisico nem custo medio.
- Recebimento parcial altera saldo somente pela quantidade recebida.
- Recebimentos multiplos do mesmo item acumulam historico e saldo.
- Perdas reduzem pendencia sem criar movimentacao de estoque.
- Recebimento/perda acima da pendencia e rejeitado antes de persistir eventos.
- Compras parcialmente resolvidas continuam em transito.
- Compras totalmente recebidas ou resolvidas por recebimento mais perda saem da
  lista de transito.
- Venda continua validando somente saldo fisico disponivel.
- Inventario inicial continua criando entrada valida e nao e impactado pelo novo
  fluxo de compra.
- Custo medio considera entradas reais: inventario inicial com valor e
  recebimentos confirmados com valor unitario.
- Dashboard financeiro existente nao muda nesta feature.

## Complexity Tracking

No constitution violations.
