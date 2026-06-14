# Implementation Plan: Consulta de Estoque

**Branch**: `008-consulta-estoque` | **Date**: 2026-06-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-consulta-estoque/spec.md`

## Summary

Expor leitura de estoque por uma API agregada, somente leitura, sem alterar o
schema do banco. Sera criado um `EstoqueController` com dois endpoints: lista de
produtos com saldo calculado e historico de movimentacoes por produto. O saldo
permanece derivado de `EstoqueMovimentacao` (entradas mais inventario inicial menos
saidas), calculado por consultas agregadas na persistencia. A leitura sera mediada
por um repository de consulta especializado, reaproveitando o `IEstoqueConsultaRepository`
existente e estendendo-o com metodos de leitura agregada e de historico filtrado.
Casos de uso de leitura serao expressos por Queries/Handlers MediatR, com DTOs de
resposta explicitos e mapeamento manual, sem AutoMapper.

A feature nao gera, altera ou apaga movimentacoes, nao cria campo fixo de saldo e
nao introduz nova migration. O escopo nao inclui ajuste manual de saldo, reserva,
multi-deposito, transferencias nem inventario ciclico.

## Technical Context

**Language/Version**: C# / .NET 8

**Primary Dependencies**: ASP.NET Core Web API, Entity Framework Core, Npgsql,
MediatR ja existentes no projeto. Nenhuma dependencia nova.

**Storage**: PostgreSQL via `AmaniDbContext`, tabela `estoque_movimentacoes` e
cadastro de produtos ja existentes.

**Testing**: Validacao por build da solucao e chamadas HTTP dos contratos; nao ha
projeto de testes automatizados nesta solucao. Regressao por cenarios do
`quickstart.md`.

**Target Platform**: Backend web API.

**Project Type**: ASP.NET Core web service em Clean Architecture.

**Performance Goals**: Saldos e listas calculados por consultas agregadas no banco
(GROUP BY / SUM), sem materializar o historico integral em memoria. Historico de
movimentacoes com limite padrao e limite maximo para preservar escala conforme o
volume cresce.

**Constraints**: Somente leitura; sem nova migration; sem alteracao de schema; sem
campo fixo de saldo; sem AutoMapper; DTOs manuais obrigatorios; controllers sem
regra de negocio; Repository Pattern mantido; backend como fonte das regras;
historico preservado; saldo exclusivamente por movimentacoes.

**Scale/Scope**: Adicionar dois endpoints de leitura de estoque, Queries/Handlers
de leitura, DTOs de resposta e metodos agregados em um repository de consulta.
Preservar todos os fluxos existentes de compra, recebimento, perda, venda,
inventario inicial, custo medio, financeiro e dashboards.

## API Contract Findings

### Estado atual

- `IEstoqueConsultaRepository.ObterSaldoAsync(produtoId)` ja existe e calcula saldo
  por entradas mais inventario inicial menos saidas, mas e usado apenas internamente
  por `VendaService` e nao e exposto por nenhum controller.
- `EstoqueMovimentacao` ja possui `ProdutoId`, `Quantidade`, `Tipo` (`Entrada`,
  `Saida`, `InventarioInicial`), `CompraId`, `CompraItemId`, `VendaId`, `Data` e
  `ValorUnitario`.
- Nao existe `EstoqueController` nem rota `/api/estoque`.
- O cadastro de produto fornece nome e categoria para enriquecer a lista de saldo.

### Endpoints planejados

- `GET /api/estoque`: lista produtos com saldo calculado, com filtros opcionais de
  categoria e de apenas com saldo positivo.
- `GET /api/estoque/{produtoId}/movimentacoes`: historico de movimentacoes do
  produto com saldo atual, filtros opcionais de periodo e tipo, limite padrao e
  limite maximo.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Arquitetura e responsabilidades**: PASS. `EstoqueController` apenas recebe a
  requisicao, valida contrato basico e delega a Queries/Handlers; o calculo fica na
  Application/persistencia.
- **Estoque por movimentacoes**: PASS. O saldo e derivado de `EstoqueMovimentacao`;
  nenhum campo fixo de saldo e criado.
- **Compras e mercadorias em transito**: PASS. A feature nao cria compra,
  recebimento nem entrada de estoque; apenas le movimentacoes existentes.
- **Recebimentos, perdas e rastreabilidade**: PASS. A feature nao registra
  recebimentos nem perdas; o historico exibido preserva a rastreabilidade existente.
- **Vendas, custo medio e inventario inicial**: PASS. A feature nao registra vendas
  nem recalcula custo medio; le inventario inicial como entrada no saldo.
- **Contratos de API e DTOs**: PASS. Endpoints usam DTOs de resposta explicitos e
  mapeamento manual; entidades de dominio nao sao expostas diretamente.
- **Persistencia e mapeamentos**: PASS. Leitura via Repository Pattern e EF Core;
  sem nova migration, sem alteracao de mapeamento de schema.
- **Backend como fonte das regras**: PASS. Calculo de saldo e agregacoes ficam no
  backend; o consumidor apenas apresenta os resultados.
- **Analytics e escalabilidade**: PASS. Saldos e listas usam consultas agregadas na
  persistencia; historico tem limite padrao e maximo; sem carregar historico
  integral em memoria.
- **Mobile First**: PASS (N/A direto). Feature backend; a responsividade sera
  validada na feature de frontend de Estoque que consumira estes contratos.
- **Experiencia operacional**: PASS. Contratos entregam saldo e historico prontos
  para leitura rapida, com filtros que reduzem ruido.
- **Priorizacao do produto**: PASS. Entrega fundacao operacional de estoque antes de
  recursos analiticos avancados; e pre-requisito do modulo de Estoque do frontend.
- **Identidade visual**: PASS (N/A direto). Sem frontend nesta feature.
- **Simplicidade antes de sofisticacao**: PASS. Reaproveita repository de consulta
  existente, MediatR e DTOs manuais; nenhuma dependencia nova.

## Project Structure

### Documentation (this feature)

```text
specs/008-consulta-estoque/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- consulta-estoque-api.md
|-- checklists/
|   `-- requirements.md
`-- spec.md
```

### Source Code (repository root)

```text
src/
|-- Amani.ImportadosERP.Api/
|   `-- Controllers/
|       `-- EstoqueController.cs            # novo
|-- Amani.ImportadosERP.Application/
|   |-- DTOs/
|   |   `-- Estoque/                          # novos DTOs de resposta
|   |-- Interfaces/
|   |   `-- IEstoqueConsultaRepository.cs     # estendido com leitura agregada
|   `-- Queries/
|       |-- ObterSaldosEstoqueQuery.cs        # nova
|       |-- ObterMovimentacoesProdutoQuery.cs # nova
|       `-- Handlers/
|           |-- ObterSaldosEstoqueQueryHandler.cs
|           `-- ObterMovimentacoesProdutoQueryHandler.cs
|-- Amani.ImportadosERP.Domain/
|   `-- Entities/
|       `-- EstoqueMovimentacao.cs            # sem alteracao (somente leitura)
|-- Amani.ImportadosERP.Infra.Data/
|   `-- Repositories/
|       `-- EstoqueConsultaRepository.cs      # estendido com consultas agregadas
`-- Amani.ImportadosERP.Infra.IoC/
    `-- DependencyInjection.cs                # sem nova interface se estendida
```

**Structure Decision**: Usar a estrutura Clean Architecture ja existente em `src/`.
Nao criar novo projeto. Domain permanece intacto (somente leitura). Application
recebe Queries/Handlers e DTOs de resposta. Infra.Data estende o repository de
consulta com agregacoes EF Core. API expoe o `EstoqueController` sem regra de
negocio. Infra.IoC nao precisa de nova interface se o `IEstoqueConsultaRepository`
existente, ja registrado, for estendido.

## Existing Code Reuse

- `IEstoqueConsultaRepository` e `EstoqueConsultaRepository` ja calculam saldo por
  produto e serao estendidos com metodos de leitura agregada (lista de saldos) e de
  historico filtrado. A logica de entradas mais inventario inicial menos saidas
  permanece a mesma.
- `EstoqueMovimentacao` ja modela tipo, quantidade, data, valor unitario e
  referencias de compra e venda; sera lido sem alteracao de entidade nem mapeamento.
- O cadastro de produto (entidade e repository) fornece nome e categoria para a
  lista de saldo.
- MediatR ja esta configurado; novas Queries/Handlers seguem o mesmo registro de
  assembly da Application.
- O padrao de filtros de data em UTC ja usado em `VendasController`,
  `ComprasController` e `DespesasController` deve ser seguido nos filtros de periodo
  do historico.

## Repository Strategy

- Estender `IEstoqueConsultaRepository` com:
  - `ObterSaldosAsync(Guid? categoriaId, bool apenasComSaldo)`: retorna saldo
    agregado por produto, fazendo join do cadastro de produto com a soma das
    movimentacoes no banco (LEFT JOIN para incluir produtos sem movimentacao).
  - `ObterMovimentacoesAsync(Guid produtoId, DateTime? dataInicio, DateTime? dataFim, TipoMovimentacao? tipo, int limite)`:
    retorna as movimentacoes do produto ordenadas por `Data` decrescente e, no
    desempate, por `CreatedAt` decrescente, aplicando os filtros e o limite na
    consulta (sem materializar o historico integral).
  - `ContarMovimentacoesAsync(Guid produtoId, DateTime? dataInicio, DateTime? dataFim, TipoMovimentacao? tipo)`:
    retorna a contagem total de movimentacoes do produto que atendem aos filtros
    aplicados, antes do limite, por agregacao no banco, para popular
    `totalMovimentacoes`.
- O calculo de saldo na lista MUST ser agregado no banco (GROUP BY / SUM com
  condicao por tipo), nunca por carregamento integral das movimentacoes em memoria.
- Manter `ObterSaldoAsync(Guid produtoId)` existente para nao afetar `VendaService`.

## Performance and Scale Requirements

- A lista de saldo MUST usar agregacao no banco; o numero de produtos cresce
  lentamente, mas o numero de movimentacoes cresce continuamente, portanto a soma
  por produto MUST ocorrer no banco.
- O historico MUST aplicar limite padrao de 50 quando o solicitante nao informar e
  limite maximo de 200 quando o solicitante pedir mais que o permitido.
- Filtros de periodo e tipo MUST ser aplicados na consulta, nao apos carregar tudo.
- A ordenacao do historico MUST ser deterministica: `Data` decrescente e, no
  desempate, `CreatedAt` decrescente.
- A contagem total (`totalMovimentacoes`) MUST ser obtida por agregacao no banco,
  considerando os filtros aplicados antes do limite, nao por carregamento integral
  das movimentacoes.

## Post-Design Constitution Check

- **Arquitetura e responsabilidades**: PASS. Controllers delegam; Queries/Handlers e
  repository concentram a leitura.
- **Estoque por movimentacoes**: PASS. Data model e contratos nao incluem saldo
  fixo; saldo e sempre derivado.
- **Compras e mercadorias em transito**: PASS. Nenhum fluxo de compra/recebimento e
  alterado.
- **Recebimentos, perdas e rastreabilidade**: PASS. Apenas leitura do historico.
- **Vendas, custo medio e inventario inicial**: PASS. Sem alteracao de venda ou
  custo medio; inventario inicial conta como entrada na leitura.
- **Contratos de API e DTOs**: PASS. Contratos documentam DTOs de resposta; sem
  entidades de dominio expostas; sem AutoMapper.
- **Persistencia e mapeamentos**: PASS. Sem nova migration; leitura via EF Core e
  Repository Pattern.
- **Backend como fonte das regras**: PASS. Calculo de saldo permanece no backend.
- **Analytics e escalabilidade**: PASS. Consultas agregadas, filtros e limites.
- **Mobile First**: PASS (N/A direto nesta feature backend).
- **Experiencia operacional**: PASS. Saldo e historico prontos para leitura rapida.
- **Priorizacao do produto**: PASS. Fundacao operacional de estoque.
- **Identidade visual**: PASS (N/A direto nesta feature backend).
- **Simplicidade antes de sofisticacao**: PASS. Reuso de repository e MediatR; sem
  dependencia nova.

## Validation and Regression Scope

- Saldo da lista igual a entradas mais inventario inicial menos saidas por produto.
- Produto sem movimentacoes aparece com saldo zero.
- Filtro por categoria retorna apenas produtos da categoria.
- Filtro de apenas com saldo positivo exclui produtos com saldo zero ou negativo.
- Historico lista tipo, quantidade, data, origem e valor unitario quando aplicavel.
- Origem por compra e por venda referenciam corretamente compra e venda.
- Historico de produto inexistente responde nao encontrado.
- Periodo invalido com data inicial maior que final e rejeitado.
- Limite padrao aplicado sem limite informado; limite maximo aplicado quando excede.
- Nenhuma movimentacao e criada, alterada ou apagada por consultas.
- Regressao: `VendaService` continua validando saldo fisico via `ObterSaldoAsync`.
- Regressao: nenhuma migration nova; build da solucao sem erros.

## Required Future Task Coverage

O `/speckit-tasks` deve gerar tarefas explicitas para:

- estender `IEstoqueConsultaRepository` e `EstoqueConsultaRepository` com leitura
  agregada de saldos e historico filtrado, sem alterar `ObterSaldoAsync`;
- DTOs de resposta de saldo e de historico com mapeamento manual;
- Queries/Handlers MediatR de saldos e de historico;
- `EstoqueController` com os dois endpoints, sem regra de negocio;
- validacao de filtros (produtoId, periodo, tipo, limite) com respostas `400` e
  `404`;
- regressao de `VendaService` e ausencia de nova migration;
- cenarios do `quickstart.md` cobrindo saldo, historico, filtros e limites.

## Complexity Tracking

No constitution violations.
