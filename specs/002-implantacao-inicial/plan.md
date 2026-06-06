# Implementation Plan: Implantacao Inicial

**Branch**: `002-implantacao-inicial` | **Date**: 2026-06-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-implantacao-inicial/spec.md`

## Summary

Permitir iniciar o Amani ERP em uma operacao ja existente por meio de tres
registros historicos: inventario inicial por movimentacoes de estoque, saldo
inicial de caixa como evento financeiro rastreavel e contas a receber iniciais
com origem de implantacao. A implementacao deve reaproveitar a arquitetura atual,
preservar historico operacional e manter fora do escopo dashboard, frontend,
mobile, autenticacao, importacao por planilha e regra de cliente inativo.

Inventario inicial sera tratado como movimentacao historica de estoque do tipo
`InventarioInicial`, sem criar saldo fixo em Produto. Contas a receber iniciais
devem reaproveitar o modelo de contas a receber existente, adicionando origem
rastreavel e permitindo debitos sem venda associada quando a origem for inicial.
Saldo inicial de caixa deve entrar como evento financeiro historico, separado de
venda, receita operacional ou dashboard financeiro.

## Technical Context

**Language/Version**: C# / .NET 8

**Primary Dependencies**: ASP.NET Core, Entity Framework Core, Npgsql, MediatR
ja existente no projeto

**Storage**: PostgreSQL via `AmaniDbContext`

**Testing**: Validacao por build da solucao e cenarios HTTP descritos em
`quickstart.md`; nao ha projeto de testes automatizados existente nesta solucao

**Target Platform**: Backend web API

**Project Type**: ASP.NET Core web service em Clean Architecture

**Performance Goals**: Registro de ate 50 itens de inventario inicial em uma
operacao deve ser adequado para uso manual de implantacao; nao ha requisito de
alto volume ou importacao em massa

**Constraints**: Sem frontend, sem migrations nesta fase de planejamento, sem
AutoMapper, DTOs obrigatorios, controllers sem regra de negocio, Fluent API
mantido, Repository Pattern mantido, estoque somente por movimentacoes, sem
alterar compras, vendas, custo medio, lucro, dashboard financeiro ou regra de
cliente inativo

**Scale/Scope**: Tres fluxos de implantacao: inventario inicial, saldo inicial de
caixa e contas a receber iniciais; registros manuais via contratos backend

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Arquitetura e responsabilidades**: PASS. O plano mantem controllers apenas
  como entrada HTTP e delega validacoes e criacao de eventos para Application e
  Domain.
- **Estoque por movimentacoes**: PASS. Inventario inicial sera uma movimentacao
  de estoque; Produto continuara sem saldo fixo.
- **Compras, vendas, custos e lucro**: PASS. Inventario inicial nao cria compra
  nem venda; saldo inicial de caixa nao e receita de venda; regra de cliente
  inativo fica fora do escopo.
- **Contratos de API e DTOs**: PASS. Operacoes de implantacao terao DTOs de
  entrada e saida explicitos e nao usarao AutoMapper.
- **Persistencia, historico e mapeamentos**: PASS. Novos tipos/campos
  persistidos serao mapeados por Fluent API e preservarao historico.
- **Backend como fonte das regras**: PASS. Validacoes de quantidade, valor,
  origem e referencias ficam no backend.
- **Simplicidade antes de sofisticacao**: PASS. O plano evita importacao por
  planilha, relatorios avancados e alteracoes de dashboard.

## Project Structure

### Documentation (this feature)

```text
specs/002-implantacao-inicial/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- implantacao-inicial-api.md
|-- checklists/
|   `-- requirements.md
`-- spec.md
```

### Source Code (repository root)

```text
src/
|-- Amani.ImportadosERP.Api/
|   `-- Controllers/
|       `-- ImplantacaoController.cs
|-- Amani.ImportadosERP.Application/
|   |-- DTOs/
|   |-- Interfaces/
|   `-- Services/
|       `-- ImplantacaoService.cs
|-- Amani.ImportadosERP.Domain/
|   `-- Entities/
|-- Amani.ImportadosERP.Infra.Data/
|   |-- Context/
|   |-- EntityConfigurations/
|   |-- Migrations/
|   `-- Repositories/
`-- Amani.ImportadosERP.Infra.IoC/
    `-- DependencyInjection.cs
```

**Structure Decision**: Usar a estrutura Clean Architecture existente em `src/`.
A feature adiciona contratos e fluxo de Application para implantacao inicial,
reaproveitando repositorios de Produto, EstoqueMovimentacao, Cliente e
ContaReceber quando possivel. Persistencia de novos campos/tipos ficara em
Infra.Data com Fluent API. Nenhum projeto novo sera criado.

## Existing Code Reuse

- `EstoqueMovimentacao` ja existe e deve ser estendida para aceitar o tipo
  `InventarioInicial`, data informada e origem sem `CompraId` ou `VendaId`.
- `TipoMovimentacao` ja existe com `Entrada` e `Saida`; precisa receber
  `InventarioInicial` no momento de implementacao.
- `ProdutoRepository` ja permite obter produto por identificador e pode ser
  reutilizado para validar itens de inventario.
- `EstoqueMovimentacaoRepository` ja centraliza movimentacoes e deve ser
  reutilizado ou estendido para registrar inventario inicial.
- `ContaReceber`, DTOs, repository e handlers de pagamento ja existem; devem ser
  reaproveitados para contas iniciais, adicionando origem rastreavel e permitindo
  ausencia de `VendaId` apenas para origem inicial.
- `ClienteRepository` ja existe e deve ser reutilizado para validar contas a
  receber iniciais.
- Nao ha entidade clara para evento financeiro generico de caixa; sera necessario
  introduzir um registro historico simples de evento financeiro de implantacao,
  sem conectar ao dashboard financeiro nesta feature.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design and Contracts

See [data-model.md](./data-model.md), [contracts/implantacao-inicial-api.md](./contracts/implantacao-inicial-api.md)
and [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- **Controllers sem regra de negocio**: PASS. Contratos definem endpoints de
  implantacao; regras de validacao e criacao de registros historicos ficam em
  Application/Domain.
- **DTOs obrigatorios**: PASS. Data model e contratos definem DTOs explicitos
  para inventario, saldo inicial de caixa e contas a receber iniciais.
- **Sem AutoMapper**: PASS. Mapeamento explicito permanece decisao obrigatoria.
- **Estoque por movimentacoes**: PASS. Inventario inicial gera
  `EstoqueMovimentacao` do tipo `InventarioInicial`; Produto nao recebe saldo.
- **Historico operacional preservado**: PASS. Correcoes futuras devem ocorrer
  por novos eventos rastreaveis, nao por apagar ou sobrescrever historico.
- **Sem alteracao operacional fora do escopo**: PASS. Plano nao altera dashboard,
  frontend, mobile, autenticacao, importacao por planilha, vendas para cliente
  inativo, compras, vendas, custo medio ou lucro.

## Complexity Tracking

No constitution violations.
