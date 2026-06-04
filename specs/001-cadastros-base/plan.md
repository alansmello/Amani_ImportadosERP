# Implementation Plan: Cadastros Base

**Branch**: `001-cadastros-base` | **Date**: 2026-06-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-cadastros-base/spec.md`

## Summary

Completar os cadastros publicos de Clientes, Fornecedores, Produtos e Categorias
para que compras e vendas possam usar dados mestres consistentes. O plano
mantem o escopo no backend, reaproveita entidades, mappings e repositorios
existentes quando ja houver base implementada, completa lacunas de Application e
Infra.Data, e adiciona controllers sem regra de negocio.

Nao serao alteradas regras de estoque, compras, vendas, custo medio, lucro,
despesas, contas a receber, dashboard financeiro ou frontend.

## Technical Context

**Language/Version**: C# / .NET 8

**Primary Dependencies**: ASP.NET Core, Entity Framework Core, Npgsql,
MediatR ja existente no projeto

**Storage**: PostgreSQL via `AmaniDbContext`

**Testing**: Validacao por build da solucao e chamadas HTTP dos contratos; nao
ha projeto de testes automatizados existente nesta solucao

**Target Platform**: Backend web API

**Project Type**: ASP.NET Core web service em Clean Architecture

**Performance Goals**: Listagens simples de cadastros base devem responder de
forma adequada para uso operacional diario; nao ha requisito de alto volume nesta
feature

**Constraints**: Sem frontend, sem bibliotecas externas novas, sem AutoMapper,
DTOs obrigatorios, controllers sem regra de negocio, Fluent API mantido,
Repository Pattern mantido, sem alterar estoque/compras/vendas/custo medio/lucro

**Scale/Scope**: Quatro cadastros base: Cliente, Fornecedor, Produto e
Categoria; CRUD parcial conforme spec, com inativacao apenas para Cliente

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Arquitetura e responsabilidades**: PASS. O plano mantem controllers apenas
  como camada de entrada e delega regras para Application/Domain.
- **Estoque por movimentacoes**: PASS. A feature nao adiciona saldo fixo de
  estoque e nao altera movimentacoes.
- **Compras, vendas, custos e lucro**: PASS. Nenhum fluxo operacional de compra,
  venda, custo medio ou lucro sera alterado.
- **Contratos de API e DTOs**: PASS. Entradas e saidas dos cadastros serao
  descritas como DTOs explicitos; AutoMapper nao sera usado.
- **Persistencia, historico e mapeamentos**: PASS. Fluent API existente sera
  preservado e ajustado apenas quando necessario para Cliente ativo/inativo.
- **Backend como fonte das regras**: PASS. Validacoes de cadastro ficam no
  backend.
- **Simplicidade antes de sofisticacao**: PASS. O plano reaproveita services,
  repositories, entidades e mappings existentes sem novas dependencias.

## Project Structure

### Documentation (this feature)

```text
specs/001-cadastros-base/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- cadastros-base-api.md
|-- checklists/
|   `-- requirements.md
`-- spec.md
```

### Source Code (repository root)

```text
src/
|-- Amani.ImportadosERP.Api/
|   `-- Controllers/
|       |-- ClientesController.cs
|       |-- FornecedoresController.cs
|       |-- ProdutosController.cs
|       `-- CategoriasController.cs
|-- Amani.ImportadosERP.Application/
|   |-- DTOs/
|   |-- Interfaces/
|   `-- Services/
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

**Structure Decision**: Usar a estrutura Clean Architecture ja existente em
`src/`. Esta feature nao cria frontend nem novo projeto. Controllers entram em
`Amani.ImportadosERP.Api`; casos de uso e DTOs em `Application`; regras simples
de invariantes nas entidades de `Domain`; persistencia via repositories,
DbContext, Fluent API e migration em `Infra.Data`; registros de DI em
`Infra.IoC`.

## Existing Code Reuse

- `Cliente`, `Fornecedor`, `Categoria` e `Produto` ja existem em Domain.
- `ClienteMapping`, `FornecedorMapping`, `CategoriaMapping` e `ProdutoMapping`
  ja existem em Infra.Data.
- `IClienteRepository`, `IFornecedorRepository`, `IProdutoRepository` e suas
  implementacoes ja existem, mas precisam de listagem, obtencao rastreada para
  atualizacao e persistencia de alteracoes.
- `ClienteService`, `FornecedorService` e `ProdutoService` ja existem, mas
  precisam de metodos de listagem e atualizacao; `ClienteService` tambem precisa
  de inativacao.
- `CriarClienteDto`, `CriarFornecedorDto`, `CriarProdutoDto` e `ProdutoDto`
  ja existem; faltam DTOs de resposta/listagem e atualizacao para clientes,
  fornecedores e categorias, alem de categoria create/update/list.
- Categoria ainda nao possui repository interface, repository concreto, service
  ou controller.
- `DependencyInjection.cs` ja registra repositories principais, mas registra
  apenas `CompraService` e `VendaService`; os services de cadastros precisam ser
  registrados.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design and Contracts

See [data-model.md](./data-model.md), [contracts/cadastros-base-api.md](./contracts/cadastros-base-api.md)
and [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- **Controllers sem regra de negocio**: PASS. Contratos definem endpoints
  publicos, mas validacoes e mutacoes ficam em Application/Domain.
- **DTOs obrigatorios**: PASS. Data model e contratos requerem DTOs de entrada
  e saida para cada cadastro.
- **Sem AutoMapper**: PASS. Mapeamento explicito permanece como decisao de
  pesquisa.
- **Fluent API**: PASS. Qualquer novo campo persistente, como status de Cliente,
  deve ser mapeado por Fluent API.
- **Historico operacional preservado**: PASS. Inativacao de Cliente e updates de
  cadastros nao removem compras, vendas, contas a receber ou movimentacoes.
- **Sem alteracao operacional fora do escopo**: PASS. Contratos e data model nao
  tocam estoque, compras, vendas, custo medio ou lucro.

## Complexity Tracking

No constitution violations.
