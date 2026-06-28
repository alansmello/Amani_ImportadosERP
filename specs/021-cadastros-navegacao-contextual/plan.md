# Implementation Plan: Cadastros Auxiliares, Fornecedores e Navegação Contextual

**Branch**: `021-cadastros-navegacao-contextual` | **Date**: 2026-06-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/021-cadastros-navegacao-contextual/spec.md`

## Summary

Estender o cadastro de Fornecedor com telefone opcional e retrocompatível, remover GUIDs visíveis de Fornecedor, Cliente e Produto, permitir criação rápida de Fornecedor em Nova Compra/Novo Produto e de Categoria em Novo Produto sem desmontar o rascunho, e substituir retornos fixos por navegação contextual segura. O backend continuará responsável pela normalização e validação do telefone; o frontend reutilizará campos e mutations existentes, inserirá o registro retornado no cache para seleção imediata e reconciliará as listas. A navegação usará origem interna explícita validada e um marcador cliente de uso único vinculado ao destino, com fallback por rota e sem confiar em `history.back()` ou no tipo global de carregamento do documento.

## Technical Context

**Language/Version**: C# 12 com .NET 8 no backend; TypeScript 5.7, React 19 e Next.js 15 no frontend

**Primary Dependencies**: ASP.NET Core, Entity Framework Core e Npgsql; TanStack React Query 5, Radix Dialog, Tailwind CSS 3 e componentes do Design System existente

**Storage**: PostgreSQL; nova coluna nullable de até 50 caracteres em `fornecedores`, sem índice único e sem preenchimento retroativo

**Testing**: `dotnet build`; `npm run lint`, `npm run typecheck` e `npm run build`; roteiro manual end-to-end em smartphone, tablet e desktop, sem nova infraestrutura automatizada conforme decisão do roadmap

**Target Platform**: Aplicação web responsiva executada em navegadores modernos, com API .NET e frontend Next.js

**Project Type**: Aplicação web full stack em Clean Architecture

**Performance Goals**: Referência criada disponível e selecionada imediatamente a partir da resposta da criação, sem depender de nova leitura da lista; abertura e fechamento dos modais sem reinicializar o formulário hospedeiro; decisão de retorno contextual sem chamada de rede

**Constraints**: Compatibilidade com fornecedores sem telefone; limite de 50 caracteres após trim; nenhuma exposição nova de entidade; nenhuma regra crítica somente no frontend; apenas caminhos sob os prefixos operacionais reconhecidos aceitos como origem; origem válida somente com marcador cliente correspondente e de uso único; fallback obrigatório em todas as 21 páginas atualmente identificadas com retorno fixo; preservação de Mobile First e Dark Theme

**Scale/Scope**: Uma entidade e três DTOs de Fornecedor, uma migration, contratos frontend de Fornecedor, dois modais rápidos, dois formulários hospedeiros, telas com GUID visível/fallback técnico e 21 páginas de criação, edição ou detalhe com ação Voltar fixa

## Constitution Check

*GATE: aprovado antes da pesquisa e reavaliado após o design.*

- **Arquitetura e responsabilidades**: PASS — telefone é validado/normalizado em Domain/Application; controllers mantêm apenas tradução de contrato; modais consomem casos de uso existentes.
- **Estoque por movimentacoes**: PASS — saldo e movimentações de estoque não são alterados.
- **Compras e mercadorias em transito**: PASS — cadastro rápido de Fornecedor apenas preenche a referência da Compra; registrar Compra continua sem gerar entrada de estoque.
- **Recebimentos, perdas e rastreabilidade**: PASS — recebimentos e perdas não são modificados; o rascunho de Compra é preservado.
- **Vendas, custo medio e inventario inicial**: PASS — Venda, validação de estoque, custo médio e inventário inicial permanecem inalterados.
- **Contratos de API e DTOs**: PASS — DTOs explícitos de Fornecedor são estendidos; entidades não são expostas e não haverá AutoMapper.
- **Persistencia e mapeamentos**: PASS — Fluent API recebe coluna nullable, Repository Pattern existente é preservado e dados históricos não são reescritos.
- **Backend como fonte das regras**: PASS — trim, opcionalidade e limite do telefone são garantidos no backend; frontend apenas antecipa feedback.
- **Analytics e escalabilidade**: PASS — a feature não adiciona dashboard, relatório ou carregamento de histórico; caches de listas existentes são atualizados pontualmente.
- **Mobile First**: PASS — modais, seletores, formulários, tabelas e retorno serão validados em smartphone, tablet e desktop.
- **Experiencia operacional**: PASS — referências são criadas sem abandonar o fluxo e o retorno preserva a origem real com fallback previsível.
- **Priorizacao do produto**: PASS — aprimora diretamente Compras, Produtos e cadastros operacionais antes de integrações ou analytics.
- **Identidade visual**: PASS — Dialog, Button, Input, Card, estados e tokens existentes serão reutilizados no Dark Theme.
- **Simplicidade antes de sofisticacao**: PASS — endpoints e mutations existentes são reutilizados; os novos compartilhamentos limitam-se a campos/modal de cadastro e retorno seguro.

**Reavaliação pós-design**: PASS. `research.md`, `data-model.md`, contratos e `quickstart.md` preservam todos os gates. Não há violação constitucional nem dependência adicional a justificar.

## Project Structure

### Documentation (this feature)

```text
specs/021-cadastros-navegacao-contextual/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── cadastros-rapidos.md
│   ├── fornecedores-api.md
│   ├── apresentacao-identificadores.md
│   └── navegacao-contextual.md
└── checklists/
    └── requirements.md
```

`tasks.md` será criado posteriormente por `/speckit-tasks` e não faz parte deste comando.

### Source Code (repository root)

```text
src/
├── Amani.ImportadosERP.Domain/
│   └── Entities/Fornecedor.cs
├── Amani.ImportadosERP.Application/
│   ├── DTOs/{FornecedorDto,CriarFornecedorDto,AtualizarFornecedorDto}.cs
│   └── Services/FornecedorService.cs
├── Amani.ImportadosERP.Infra.Data/
│   ├── EntityConfigurations/FornecedorMapping.cs
│   └── Migrations/<timestamp>_AddTelefoneFornecedor.cs
└── Amani.ImportadosERP.Api/
    └── Controllers/FornecedoresController.cs

frontend/src/
├── app/
│   ├── clientes/{novo,[id],[id]/editar}/page.tsx
│   ├── compras/{nova,[id]}/page.tsx
│   ├── configuracoes/formas-pagamento/page.tsx
│   ├── estoque/[produtoId]/page.tsx
│   ├── financeiro/contas-receber/{nova,[id]/editar,cliente/[clienteId]}/page.tsx
│   ├── financeiro/{despesas/nova,despesas/categorias,despesas-operadora}/page.tsx
│   ├── fornecedores/{novo,[id],[id]/editar}/page.tsx
│   ├── produtos/{novo,[id],[id]/editar}/page.tsx
│   └── vendas/{nova,[vendaId]}/page.tsx
├── components/
│   ├── compras/purchase-form.tsx
│   ├── fornecedores/{supplier-form-fields,supplier-form,supplier-table,supplier-details,supplier-quick-create-dialog}.tsx
│   ├── produtos/{product-form-fields,product-form,category-form-fields,category-quick-create-dialog,product-details}.tsx
│   ├── clientes/customer-details.tsx
│   ├── financeiro/{receivables-list,receivable-client-detail}.tsx
│   └── layout/{contextual-back-button,contextual-link}.tsx
├── hooks/{use-suppliers,use-categories}.ts
├── lib/contextual-navigation.ts
├── services/suppliers.ts
└── types/{supplier,category}.ts
```

**Structure Decision**: preservar a aplicação full stack existente. A única mudança persistente atravessa Domain, Application, Infra.Data e API para adicionar telefone ao Fornecedor. Cadastros rápidos e navegação ficam no frontend, usando componentes e hooks compartilhados somente onde há reutilização real. Nenhum projeto ou pacote novo será criado.

## Complexity Tracking

Nenhuma violação constitucional identificada. Não há exceção de complexidade a justificar.
