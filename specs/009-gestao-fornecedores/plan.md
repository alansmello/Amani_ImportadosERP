# Implementation Plan: Gestao de Fornecedores no Frontend

**Branch**: `009-gestao-fornecedores` | **Date**: 2026-06-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-gestao-fornecedores/spec.md`

## Summary

Criar o modulo frontend de Fornecedores para listar, buscar localmente, consultar,
cadastrar e editar fornecedores usando os endpoints backend ja existentes em
`/api/fornecedores`. A implementacao replica o padrao validado de Produtos
(Feature 006), com rotas App Router dedicadas, componentes de lista/detalhe/form,
hooks React Query, service de API e entrada na navegacao principal.

A feature nao altera backend, banco, DTOs server-side ou regras de negocio. O
contrato de fornecedor no escopo e minimalista: `id` somente leitura e `nome`
editavel. Historico de compras, metricas, rankings, totais, inativacao, exclusao
e qualquer calculo gerencial permanecem fora do escopo.

## Technical Context

**Language/Version**: TypeScript 5.7 com React 19 e Next.js 15 no frontend; backend
existente em .NET 8 apenas como API consumida.

**Primary Dependencies**: Next.js App Router, React, TanStack React Query,
lucide-react, componentes UI locais, `apiClient`, `suppliersService` existente.
Nenhuma dependencia nova.

**Storage**: N/A no frontend. Persistencia fica no backend PostgreSQL existente e
e acessada somente pelos endpoints oficiais de fornecedores.

**Testing**: `npm run lint`, `npm run typecheck`, `npm run build` em `frontend/`.
Validacao operacional pelos cenarios do `quickstart.md` em smartphone, tablet e
desktop. Nao ha suite automatizada especifica desta feature no momento.

**Target Platform**: Frontend web oficial do Amani ERP, responsivo para smartphone,
tablet e desktop.

**Project Type**: Web application frontend dentro de `frontend/`, consumindo API
ASP.NET Core existente.

**Performance Goals**: Listagem e busca local devem permanecer responsivas para a
lista retornada pela API atual; busca normalizada em memoria apenas sobre os
fornecedores carregados, sem metricas, agregacoes ou carregamento de historico.

**Constraints**: Dark Only, Mobile First, sem dados mockados, sem regra de negocio
no frontend, sem calculos gerenciais, sem historico de compras, sem inativacao,
exclusao ou remocao. Expor/editar apenas `nome`; `id` e somente leitura. Manter
consistencia visual e operacional com Produtos.

**Scale/Scope**: Quatro rotas (`/fornecedores`, `/fornecedores/novo`,
`/fornecedores/[id]`, `/fornecedores/[id]/editar`), componentes em
`frontend/src/components/fornecedores/`, extensao de `services/suppliers.ts`,
`hooks/use-suppliers.ts`, `types/supplier.ts`, `config/routes.ts` e
`config/navigation.ts`.

## API Contract Findings

### Estado atual

- `FornecedoresController` ja expoe `GET /api/fornecedores`,
  `GET /api/fornecedores/{id}`, `POST /api/fornecedores` e
  `PUT /api/fornecedores/{id}`.
- `FornecedorDto`, `CriarFornecedorDto` e `AtualizarFornecedorDto` contêm apenas
  `Id` e/ou `Nome`.
- `frontend/src/types/supplier.ts` possui `Supplier` com `id` e `nome`.
- `frontend/src/services/suppliers.ts` atualmente cobre somente listagem.
- `frontend/src/hooks/use-suppliers.ts` atualmente cobre somente query de lista.

### Contrato planejado no frontend

- `Supplier`: `id: string`, `nome: string`.
- `SupplierPayload`: `nome: string`.
- `suppliersService.list()`: `GET /api/fornecedores`.
- `suppliersService.getById(id)`: `GET /api/fornecedores/{id}`.
- `suppliersService.create(payload)`: `POST /api/fornecedores`.
- `suppliersService.update(id, payload)`: `PUT /api/fornecedores/{id}`.
- Hooks React Query devem invalidar lista e detalhe apos criacao/edicao, seguindo
  o padrao de Produtos.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Arquitetura e responsabilidades**: PASS. A feature fica no frontend e consome
  API existente; nenhuma regra de negocio e movida para componentes.
- **Estoque por movimentacoes**: PASS (N/A direto). Fornecedores nao alteram
  saldo, movimentacoes nem modelo de estoque.
- **Compras e mercadorias em transito**: PASS. A feature e pre-requisito cadastral
  para Compras futuras, mas nao registra compras nem recebimentos.
- **Recebimentos, perdas e rastreabilidade**: PASS. Nenhum fluxo de recebimento,
  perda, extravio ou avaria e alterado.
- **Vendas, custo medio e inventario inicial**: PASS. Nenhum fluxo de venda, custo
  medio ou inventario inicial e alterado.
- **Contratos de API e DTOs**: PASS. O frontend usa tipos explicitos e payload
  minimo alinhado aos DTOs existentes; entidades de dominio nao sao expostas.
- **Persistencia e mapeamentos**: PASS (N/A direto). Sem schema, migration,
  mapeamento EF ou repository novo.
- **Backend como fonte das regras**: PASS. Validacoes definitivas e persistencia
  permanecem no backend; frontend faz apenas validacao basica de formulario.
- **Analytics e escalabilidade**: PASS. Nao ha dashboards, relatorios, metricas ou
  agregacoes; busca local atua apenas sobre a lista retornada.
- **Mobile First**: PASS. As telas devem ser planejadas e validadas em smartphone,
  tablet e desktop.
- **Experiencia operacional**: PASS. CRUD simples, poucas interacoes, retorno claro
  entre lista/detalhe/cadastro/edicao.
- **Priorizacao do produto**: PASS. Entrega cadastro operacional essencial antes
  de historico, metricas ou integracoes avancadas.
- **Identidade visual**: PASS. A feature segue Design System existente, Dark Only e
  padrao visual do modulo Produtos.
- **Simplicidade antes de sofisticacao**: PASS. Reusa App Router, React Query,
  componentes e service patterns existentes; sem dependencia nova.

## Project Structure

### Documentation (this feature)

```text
specs/009-gestao-fornecedores/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- fornecedores-frontend.md
|-- checklists/
|   `-- requirements.md
`-- spec.md
```

### Source Code (repository root)

```text
frontend/
`-- src/
    |-- app/
    |   `-- fornecedores/
    |       |-- page.tsx
    |       |-- novo/
    |       |   `-- page.tsx
    |       `-- [id]/
    |           |-- page.tsx
    |           `-- editar/
    |               `-- page.tsx
    |-- components/
    |   `-- fornecedores/
    |       |-- supplier-actions.tsx
    |       |-- supplier-details.tsx
    |       |-- supplier-form.tsx
    |       |-- supplier-form-fields.tsx
    |       `-- supplier-table.tsx
    |-- config/
    |   |-- navigation.ts
    |   `-- routes.ts
    |-- hooks/
    |   `-- use-suppliers.ts
    |-- services/
    |   `-- suppliers.ts
    `-- types/
        `-- supplier.ts

src/
`-- Amani.ImportadosERP.Api/
    `-- Controllers/
        `-- FornecedoresController.cs   # existente; sem alteracao planejada
```

**Structure Decision**: Implementar somente no frontend, seguindo a estrutura de
Produtos ja existente. Nao criar novo projeto, nao criar backend, nao alterar banco
e nao introduzir camada paralela. Componentes de Fornecedores devem ser especificos
do modulo, mas alinhados aos componentes comuns e aos padroes de Produtos.

## Phase 0 Research Summary

Ver [research.md](./research.md). Todas as decisoes tecnicas foram resolvidas sem
marcadores pendentes de esclarecimento.

## Phase 1 Design Summary

- Data model: [data-model.md](./data-model.md)
- Frontend/API contract: [contracts/fornecedores-frontend.md](./contracts/fornecedores-frontend.md)
- Validation guide: [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

- **Arquitetura e responsabilidades**: PASS. O design limita o frontend a
  apresentacao, navegacao, estado de UI, chamadas ao service e validacao basica.
- **Estoque por movimentacoes**: PASS (N/A direto). Nenhum dado de estoque entra no
  modelo ou contrato.
- **Compras e mercadorias em transito**: PASS. O design nao cria fluxo de compra;
  fornecedores ficam como cadastro preparatorio.
- **Recebimentos, perdas e rastreabilidade**: PASS. Sem alteracoes nos fluxos
  rastreaveis existentes.
- **Vendas, custo medio e inventario inicial**: PASS. Sem impacto em vendas, custo
  medio ou inventario.
- **Contratos de API e DTOs**: PASS. Contrato documentado usa `id` e `nome`,
  payload manual `{ nome }`, sem expor entidades internas.
- **Persistencia e mapeamentos**: PASS. Sem persistencia frontend e sem mudancas no
  schema/backend.
- **Backend como fonte das regras**: PASS. Backend segue fonte oficial para
  validacao e rejeicoes; frontend nao calcula regra operacional.
- **Analytics e escalabilidade**: PASS. Nenhum indicador ou historico e planejado.
- **Mobile First**: PASS. Quickstart exige validacao em 390px, tablet e desktop.
- **Experiencia operacional**: PASS. Fluxo replica Produtos com estados claros,
  busca local e acoes diretas.
- **Priorizacao do produto**: PASS. CRUD cadastral essencial antes de recursos
  avancados.
- **Identidade visual**: PASS. Dark Only e Design System existente permanecem
  obrigatorios.
- **Simplicidade antes de sofisticacao**: PASS. Reuso de padroes existentes; sem
  abstracoes ou dependencias novas.

## Validation and Regression Scope

- Lista carrega fornecedores reais e nunca usa mocks.
- Busca local filtra por nome em `pt-BR`.
- Estado vazio orienta cadastro do primeiro fornecedor.
- Estado de erro permite tentar novamente.
- Detalhe mostra nome e ID somente leitura.
- Cadastro valida nome obrigatorio, salva via API e leva o usuario ao registro salvo
  ou lista atualizada.
- Edicao preenche nome atual, salva via API e invalida caches de lista/detalhe.
- Fornecedor inexistente em detalhe/edicao exibe nao encontrado.
- Navegacao principal inclui Fornecedores de forma consistente.
- Nenhuma acao de inativar, excluir ou remover aparece.
- Nenhum historico, metrica, ranking, total comprado ou indicador aparece.
- Telas funcionam sem sobreposicao em smartphone, tablet e desktop.
- `npm run lint`, `npm run typecheck` e `npm run build` passam.

## Required Future Task Coverage

O `/speckit-tasks` deve gerar tarefas explicitas para:

- ampliar `types/supplier.ts` com `SupplierPayload`;
- ampliar `services/suppliers.ts` com detalhe, criacao e atualizacao;
- ampliar `use-suppliers.ts` com query de detalhe e mutations de create/update com
  invalidacao de cache;
- criar componentes `SupplierTable`, `SupplierActions`, `SupplierDetails`,
  `SupplierFormFields` e `SupplierForm`;
- criar rotas `/fornecedores`, `/fornecedores/novo`, `/fornecedores/[id]` e
  `/fornecedores/[id]/editar`;
- adicionar rota e item de navegacao;
- validar estados de loading, vazio, erro, sucesso e nao encontrado;
- validar responsividade Mobile First e Dark Only;
- executar lint, typecheck e build.

## Complexity Tracking

No constitution violations.
