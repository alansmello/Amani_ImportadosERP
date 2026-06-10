# Implementation Plan: Configuracao Inicial do Frontend Amani ERP

**Branch**: `005-frontend-base` | **Date**: 2026-06-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-frontend-base/spec.md`

## Summary

Criar a fundacao oficial do frontend do Amani ERP como aplicacao web Mobile First, Dark Only e preparada para crescimento operacional. A solucao planejada introduz um projeto frontend separado na raiz do repositorio, usando Next.js App Router, TypeScript, Tailwind CSS, Shadcn/UI, TanStack Query e Lucide React. O escopo entrega layout responsivo, navegacao desktop/mobile, Design System inicial, dashboard placeholder, rotas placeholder e camada base de comunicacao com backend, sem CRUDs completos, autenticacao, integracoes externas, dashboards reais ou regras de negocio no frontend.

## Technical Context

**Language/Version**: TypeScript com React e Next.js App Router; versoes exatas devem ser fixadas na criacao do projeto conforme releases estaveis disponiveis no momento da implementacao.

**Primary Dependencies**: Next.js, TypeScript, Tailwind CSS, Shadcn/UI, TanStack Query, Lucide React. Next.js fornece roteamento, layouts e renderizacao; TypeScript reduz ambiguidades em contratos internos; Tailwind transforma tokens visuais em classes reutilizaveis; Shadcn/UI fornece componentes acessiveis e editaveis; TanStack Query padroniza estados de dados; Lucide React padroniza iconografia leve.

**Storage**: N/A para esta feature. O frontend nao persiste dados operacionais; configuracoes visuais e rotas sao codigo-fonte. Persistencia operacional continua no backend.

**Testing**: Validacao por lint/typecheck/build do frontend e validacao manual responsiva em smartphone, tablet e desktop. Se o projeto de testes frontend for criado nesta feature, priorizar testes leves de renderizacao/navegacao e evitar suite extensa antes dos fluxos operacionais.

**Target Platform**: Web responsiva para navegadores modernos em smartphone, tablet e desktop.

**Project Type**: Frontend web application separado do backend existente.

**Performance Goals**: Primeira tela operacional deve carregar sem depender do backend; navegacao entre rotas placeholder deve parecer imediata; componentes base devem evitar re-renderizacao ou dependencias desnecessarias. O dashboard placeholder nao deve buscar metricas reais.

**Constraints**: Dark Only; Mobile First; sem autenticacao; sem CRUDs completos; sem regras de negocio no frontend; sem integracoes externas; sem dashboards reais; sem dados ficticios que possam ser confundidos com indicadores operacionais; backend permanece fonte das regras e metricas criticas; visual premium sem complexidade decorativa.

**Scale/Scope**: Base para aproximadamente 8 modulos iniciais: Dashboard, Clientes, Produtos, Compras, Vendas, Estoque, Financeiro e Configuracoes. A estrutura deve suportar crescimento para telas operacionais futuras sem reorganizacao principal.

## Technology Decisions

### Next.js App Router

- **Decision**: Usar Next.js com App Router em `frontend/src/app`.
- **Maintenance**: layouts aninhados e rotas por pasta reduzem acoplamento entre modulos.
- **Productivity**: novas telas entram como segmentos de rota previsiveis.
- **Scalability**: permite separar layouts globais, areas operacionais e futuras rotas por modulo.
- **Mobile experience**: facilita carregar a mesma arquitetura responsiva para todas as classes de viewport.

### TypeScript

- **Decision**: TypeScript obrigatorio em componentes, servicos, hooks e contratos internos.
- **Maintenance**: tipos explicitos para rotas, itens de navegacao, estados de dados e respostas futuras reduzem regressao.
- **Productivity**: autocomplete e checagem de tipos aceleram criacao de telas.
- **Scalability**: contratos evoluem com menos ambiguidade conforme modulos aumentam.
- **Mobile experience**: tipos para variantes de navegacao e layout reduzem inconsistencias entre viewports.

### Tailwind CSS

- **Decision**: Tailwind sera a camada de estilos utilitarios, alimentada por tokens Amani no tema.
- **Maintenance**: tokens centralizados evitam cores soltas e estilos divergentes.
- **Productivity**: classes utilitarias reduzem ida e volta entre arquivos para ajustes de layout.
- **Scalability**: padroes de spacing, radius, superficies e estados podem ser reutilizados em todos os modulos.
- **Mobile experience**: breakpoints e classes responsivas favorecem construcao Mobile First.

### Shadcn/UI

- **Decision**: Usar Shadcn/UI como base editavel para componentes essenciais.
- **Maintenance**: componentes ficam no codigo do projeto e podem seguir a identidade Amani sem depender de uma caixa-preta.
- **Productivity**: componentes acessiveis aceleram botoes, inputs, dialogs, tables, badges e estados.
- **Scalability**: cada componente pode ser padronizado no Design System antes de ser usado por modulos futuros.
- **Mobile experience**: componentes podem ser ajustados para toque, densidade mobile e estados de foco.

### TanStack Query

- **Decision**: Configurar QueryClient e convencoes de query hooks desde a base.
- **Maintenance**: loading, erro, retry e cache ficam padronizados em vez de espalhados por tela.
- **Productivity**: futuras features criam hooks de dados com padrao unico.
- **Scalability**: chaves de query por modulo e servicos tipados reduzem duplicidade.
- **Mobile experience**: estados de carregamento e erro ficam consistentes em conexoes instaveis.

### Lucide React

- **Decision**: Usar Lucide React para iconografia de navegacao e acoes.
- **Maintenance**: biblioteca unica evita mistura de estilos de icones.
- **Productivity**: icones comuns para modulos operacionais ficam disponiveis sem SVG manual.
- **Scalability**: mesma linguagem visual pode acompanhar novos modulos.
- **Mobile experience**: icones legiveis em bottom navigation reduzem carga textual em telas pequenas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Arquitetura e responsabilidades**: PASS. O frontend fica separado do backend existente e nao altera API, Application, Domain, Infra.Data ou Infra.IoC.
- **Estoque por movimentacoes**: PASS. A feature nao implementa estoque nem saldo; qualquer estoque futuro sera consumido do backend.
- **Compras e mercadorias em transito**: PASS. A feature nao implementa compras nem recebimentos; placeholders nao calculam transito.
- **Recebimentos, perdas e rastreabilidade**: PASS. A feature nao cria nem altera eventos operacionais.
- **Vendas, custo medio e inventario inicial**: PASS. A feature nao implementa vendas, custo medio, lucro ou inventario.
- **Contratos de API e DTOs**: PASS. O frontend planejado usa contratos tipados de servico e nao expoe entidades de dominio; contratos reais continuam definidos pelo backend.
- **Persistencia e mapeamentos**: PASS. Sem persistencia operacional, migrations ou mapeamentos nesta feature.
- **Backend como fonte das regras**: PASS. O plano define que frontend nao calcula regras criticas, metricas, rankings, alertas ou dashboards reais.
- **Analytics e escalabilidade**: PASS. Dashboard inicial e placeholder; futuras metricas devem vir de endpoints agregados do backend.
- **Mobile First**: PASS. Smartphone e experiencia principal, com tablet e desktop como extensoes naturais.
- **Experiencia operacional**: PASS. Navegacao privilegia destinos frequentes, densidade controlada e leitura rapida.
- **Priorizacao do produto**: PASS. Base prepara modulos operacionais e evita autenticacao, marketplace, SaaS, multiempresa, integracoes e dashboards reais.
- **Identidade visual**: PASS. Dark Theme oficial, Design System Amani e visual SaaS premium sao parte central do plano.
- **Simplicidade antes de sofisticacao**: PASS. Dependencias sao poucas, justificadas e diretamente ligadas a base frontend.

## Project Structure

### Documentation (this feature)

```text
specs/005-frontend-base/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- frontend-foundation-contract.md
|-- checklists/
|   `-- requirements.md
`-- spec.md
```

### Source Code (repository root)

```text
frontend/
|-- package.json
|-- next.config.ts
|-- tsconfig.json
|-- tailwind.config.ts
|-- postcss.config.mjs
|-- components.json
|-- src/
|   |-- app/
|   |   |-- layout.tsx
|   |   |-- page.tsx
|   |   |-- globals.css
|   |   |-- clientes/page.tsx
|   |   |-- produtos/page.tsx
|   |   |-- compras/page.tsx
|   |   |-- vendas/page.tsx
|   |   |-- estoque/page.tsx
|   |   |-- financeiro/page.tsx
|   |   `-- configuracoes/page.tsx
|   |-- components/
|   |   |-- layout/
|   |   |   |-- app-shell.tsx
|   |   |   |-- desktop-sidebar.tsx
|   |   |   |-- mobile-bottom-nav.tsx
|   |   |   |-- page-container.tsx
|   |   |   `-- page-header.tsx
|   |   |-- dashboard/
|   |   |   |-- dashboard-placeholder.tsx
|   |   |   |-- metric-placeholder-card.tsx
|   |   |   `-- quick-action-grid.tsx
|   |   |-- states/
|   |   |   |-- empty-state.tsx
|   |   |   |-- error-state.tsx
|   |   |   `-- loading-state.tsx
|   |   `-- ui/
|   |       `-- shadcn components copied and themed here
|   |-- config/
|   |   |-- navigation.ts
|   |   `-- routes.ts
|   |-- lib/
|   |   |-- cn.ts
|   |   |-- query-client.ts
|   |   `-- design-tokens.ts
|   |-- providers/
|   |   `-- app-providers.tsx
|   |-- services/
|   |   |-- api-client.ts
|   |   `-- errors.ts
|   |-- hooks/
|   |   `-- use-responsive-shell.ts
|   `-- types/
|       |-- navigation.ts
|       |-- api.ts
|       `-- ui-state.ts
`-- tests/
    |-- responsive/
    `-- components/
```

**Structure Decision**: Criar `frontend/` na raiz do repositorio, separado de `src/` porque `src/` ja representa a solucao backend .NET em Clean Architecture. Dentro do frontend, usar `src/app` para rotas, `src/components` para Design System e composicao, `src/services` para comunicacao HTTP, `src/hooks` para hooks reutilizaveis, `src/config` para navegacao/rotas, `src/providers` para provedores globais e `src/types` para contratos internos.

## Responsive Strategy

### Breakpoints

- **Smartphone**: `< 768px`. Experiencia principal. Bottom navigation fixa, conteudo em coluna unica, alvo de toque minimo de 44px, densidade compacta e headers curtos.
- **Tablet**: `768px - 1023px`. Experiencia intermediaria. Conteudo pode usar duas colunas quando ajudar leitura; navegacao deve evitar duplicidade e pode usar sidebar compacta ou bottom navigation estendida conforme implementacao visual mais estavel.
- **Desktop**: `>= 1024px`. Sidebar persistente, conteudo com largura maxima legivel de `1440px` no `PageContainer`, grids de dashboard em multiplas colunas e top area operacional discreta.

### Navigation Behavior

- **Desktop**: sidebar persistente com Dashboard, Clientes, Produtos, Compras, Vendas, Estoque, Financeiro e Configuracoes. Justificativa: desktop comporta navegacao completa e usuarios podem alternar entre modulos com frequencia.
- **Mobile**: bottom navigation com Dashboard, Vendas, Estoque, Compras e Mais. Justificativa: esses destinos privilegiam operacao em campo e reduzem o numero de alvos em telas pequenas; "Mais" agrupa Clientes, Produtos, Financeiro e Configuracoes enquanto esses modulos ainda sao placeholders.
- **Tablet**: manter comportamento adaptativo sem duplicidade. A decisao final de sidebar compacta ou bottom navigation ampliada deve ser validada visualmente; o criterio e preservar acesso rapido e area util de conteudo.

## Design System Initial Plan

### Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#0B0B0F` | Fundo global da aplicacao |
| `surface` | `#13131A` | Superficies principais, sidebar, cards |
| `surface-light` | `#1C1C25` | Hover, cards destacados, containers secundarios |
| `primary` | `#7C3AED` | Acao primaria, foco principal, rota ativa |
| `primary-hover` | `#8B5CF6` | Hover/pressed de acoes primarias |
| `accent` | `#A855F7` | Destaques visuais controlados |
| `text-primary` | `#F8FAFC` | Texto principal |
| `text-secondary` | `#94A3B8` | Texto secundario e metadados |
| `success` | `#22C55E` | Feedback positivo |
| `warning` | `#F59E0B` | Avisos |
| `danger` | `#EF4444` | Erros e estados destrutivos futuros |
| `info` | `#3B82F6` | Informacao contextual |

Os tokens devem ser definidos em `tailwind.config.ts`, refletidos em variaveis CSS de `globals.css` e expostos em `design-tokens.ts` quando componentes ou documentacao precisarem de nomes estaveis. Cores diretas devem ser evitadas em componentes fora da definicao de tokens.

### Component Rules

- **Tipografia**: usar Inter como fonte oficial do frontend Amani ERP; hierarquia compacta, sem hero text, com titulos de pagina objetivos e headings internos menores.
- **Espacamento**: base 4px/8px; telas mobile usam padding de 16px; tablet 20px; desktop 24px a 32px conforme area.
- **PageContainer**: componente padrao para limitar largura e aplicar padding responsivo nas paginas; desktop usa largura maxima de `1440px`, centralizada dentro da area util apos a sidebar.
- **Bordas**: radius padrao 8px ou menos; bordas sutis com contraste suficiente contra superficies escuras.
- **Cards**: apenas para itens ou blocos repetidos; evitar cards dentro de cards; usar superficies planas e densidade operacional.
- **Botoes**: variantes primary, secondary, ghost, destructive futuro; altura adequada a toque; icone Lucide quando representar acao conhecida.
- **Inputs**: previstos no Design System, mas sem formularios operacionais nesta feature; estados focus, disabled, error e helper text devem ser padronizados.
- **Tabelas**: preparar estilo base para uso futuro, com densidade compacta, divisores discretos e scroll horizontal controlado em mobile quando inevitavel.
- **Modais**: base acessivel para uso futuro, sem fluxos operacionais nesta feature.
- **Badges**: variantes neutral, success, warning, danger, info e accent.
- **Estados vazios**: titulo curto, descricao direta e sem CTA operacional quando a rota ainda for placeholder.

## Dashboard Placeholder Plan

- **Estrutura visual**: pagina inicial com header operacional, secao de boas-vindas curta, grade de cards placeholder e bloco de atalhos para modulos futuros.
- **Cards**: reservar regioes para indicadores financeiros, operacionais, alertas e atividade recente, todos com estado "em preparacao" ou equivalente, sem numeros reais.
- **Componentes reutilizaveis**: `MetricPlaceholderCard`, `DashboardPlaceholder`, `QuickActionGrid`, `EmptyState`.
- **Organizacao responsiva**: smartphone em coluna unica; tablet em duas colunas; desktop em grid de tres ou quatro colunas conforme densidade.
- **Restricao constitucional**: nenhuma formula, ranking, grafico real ou metricas de negocio deve existir no frontend nesta feature.

## Backend Communication Strategy

- **API client**: criar `services/api-client.ts` como wrapper fino sobre `fetch`, com base URL configuravel por variavel de ambiente e tratamento padrao de erro HTTP.
- **Service modules**: futuras chamadas ficam em arquivos por modulo dentro de `services/`, evitando chamadas diretas espalhadas em componentes.
- **Query client**: configurar `QueryClient` em `providers/app-providers.tsx`, com retry conservador e estados de erro padronizados.
- **Hooks**: futuras queries devem usar hooks por caso de uso, com chaves de query estaveis por modulo.
- **Loading**: componentes usam `LoadingState` ou skeletons padronizados.
- **Errors**: mensagens de erro para usuario devem ser simples; detalhes tecnicos ficam restritos a logs de desenvolvimento quando necessario.
- **Empty states**: ausencia de dados deve ter tratamento visual proprio, sem parecer erro.
- **Regra central**: frontend orquestra exibicao e estados de rede; backend calcula regras, validacoes operacionais, dashboards, rankings, alertas e metricas.

## Implementation Strategy

1. Criar projeto `frontend/` com Next.js App Router, TypeScript e Tailwind.
2. Instalar e configurar Shadcn/UI, TanStack Query e Lucide React.
3. Definir tokens Amani em Tailwind/CSS e estilos globais Dark Only.
4. Criar provedores globais e shell responsivo.
5. Criar configuracao central de rotas e navegacao.
6. Implementar desktop sidebar, mobile bottom navigation e comportamento tablet.
7. Criar rotas placeholder dos modulos.
8. Criar dashboard placeholder sem dados reais.
9. Criar componentes base de UI e estados de dados.
10. Criar camada base de API client e QueryClient sem integrar funcionalidades reais.
11. Validar smartphone, tablet e desktop por build, navegacao e inspecao visual.

## Risks and Trade-offs

- **Introduzir frontend separado aumenta numero de toolchains**: aceito porque o produto exige frontend oficial e a separacao preserva o backend .NET existente.
- **Shadcn/UI exige manutencao local dos componentes copiados**: aceito porque permite identidade visual propria e evita dependencia de componente fechado.
- **TanStack Query antes de chamadas reais adiciona uma dependencia antecipada**: aceito porque a proxima fase operacional precisara de estados de dados consistentes; uso deve ficar restrito ao provider e convencoes iniciais.
- **Bottom navigation mobile limita destinos visiveis**: aceito porque prioriza operacao rapida; destinos menos frequentes ficam em "Mais".
- **Dark Only reduz flexibilidade de preferencia do usuario**: aceito porque e requisito de identidade visual oficial nesta fase.
- **Tablet pode exigir ajuste fino entre mobile e desktop**: mitigar com validacao visual explicita em viewport intermediario antes de concluir implementacao.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design and Contracts

See [data-model.md](./data-model.md), [contracts/frontend-foundation-contract.md](./contracts/frontend-foundation-contract.md), and [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- **Arquitetura e responsabilidades**: PASS. Artefatos mantem frontend separado e sem regra de backend.
- **Estoque por movimentacoes**: PASS. Design nao calcula estoque.
- **Compras e mercadorias em transito**: PASS. Design nao calcula compras ou transito.
- **Recebimentos, perdas e rastreabilidade**: PASS. Design nao cria eventos operacionais.
- **Vendas, custo medio e inventario inicial**: PASS. Design nao calcula vendas, custo ou lucro.
- **Contratos de API e DTOs**: PASS. Contrato frontend define interface visual e servicos tipados sem expor entidades de dominio.
- **Persistencia e mapeamentos**: PASS. Sem persistencia operacional.
- **Backend como fonte das regras**: PASS. Contrato e quickstart validam ausencia de regras criticas no frontend.
- **Analytics e escalabilidade**: PASS. Dashboard placeholder reserva areas sem metricas reais; analytics futuro vem do backend.
- **Mobile First**: PASS. Breakpoints, navegacao mobile e quickstart exigem validacao smartphone/tablet/desktop.
- **Experiencia operacional**: PASS. Navegacao e Design System priorizam uso diario e leitura rapida.
- **Priorizacao do produto**: PASS. Plano prepara base operacional sem escopos avancados.
- **Identidade visual**: PASS. Tokens oficiais e Dark Only documentados.
- **Simplicidade antes de sofisticacao**: PASS. Estrutura evita abstrair dominios futuros antes da necessidade.

## Complexity Tracking

No constitution violations.
