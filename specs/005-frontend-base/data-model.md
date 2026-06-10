# Data Model: Configuracao Inicial do Frontend Amani ERP

Esta feature nao cria entidades persistidas. O modelo abaixo descreve entidades conceituais de interface, configuracao e estado usadas pela base frontend.

## Modulo de Navegacao

Representa uma area principal ou agrupamento de areas do ERP.

**Fields**:

- `id`: identificador estavel do modulo.
- `label`: nome exibido ao usuario.
- `href`: rota inicial.
- `icon`: referencia ao icone padronizado.
- `desktopVisible`: indica exibicao na sidebar desktop.
- `mobileVisible`: indica exibicao direta na bottom navigation.
- `mobileOrder`: prioridade de exibicao mobile.
- `group`: agrupamento opcional para o destino "Mais".
- `status`: `placeholder` nesta feature ou `ready` em features futuras.

**Validation Rules**:

- Todo modulo deve ter `id`, `label` e `href`.
- A sidebar desktop deve conter Dashboard, Clientes, Produtos, Compras, Vendas, Estoque, Financeiro e Configuracoes.
- A bottom navigation mobile deve conter Dashboard, Vendas, Estoque, Compras e Mais.
- Rotas placeholder nao podem disparar CRUD completo ou operacao real.

**Relationships**:

- Usado por `Desktop Sidebar`, `Mobile Bottom Navigation` e paginas placeholder.

## Layout Responsivo

Define como shell, navegacao e conteudo se comportam por viewport.

**Fields**:

- `viewportClass`: `smartphone`, `tablet` ou `desktop`.
- `navigationMode`: `bottom`, `compact` ou `sidebar`.
- `contentColumns`: numero maximo de colunas de conteudo.
- `contentPadding`: padding aplicado ao conteudo principal.
- `maxContentWidth`: largura maxima para leitura em telas largas.

**Validation Rules**:

- Smartphone deve usar bottom navigation e coluna unica.
- Desktop deve usar sidebar persistente.
- Tablet deve evitar duplicidade confusa de sidebar e bottom navigation.
- Nenhuma classe pode gerar rolagem horizontal no shell principal.

**Relationships**:

- Determina comportamento de `App Shell`, `Dashboard Placeholder` e containers de pagina.

## Tema Visual Amani

Representa os tokens visuais oficiais Dark Only.

**Fields**:

- `background`: `#0B0B0F`.
- `surface`: `#13131A`.
- `surfaceLight`: `#1C1C25`.
- `primary`: `#7C3AED`.
- `primaryHover`: `#8B5CF6`.
- `accent`: `#A855F7`.
- `textPrimary`: `#F8FAFC`.
- `textSecondary`: `#94A3B8`.
- `success`: `#22C55E`.
- `warning`: `#F59E0B`.
- `danger`: `#EF4444`.
- `info`: `#3B82F6`.
- `radius`: escala de bordas ate 8px como padrao operacional.
- `spacing`: escala baseada em 4px/8px.

**Validation Rules**:

- Componentes devem consumir tokens, nao cores arbitrarias.
- Tema claro nao deve ser exposto.
- Tokens precisam suportar estados hover, focus, active, disabled, loading e error.

**Relationships**:

- Consumido por Tailwind, CSS global, componentes base e documentacao de Design System.

## Componente Base

Representa elemento reutilizavel padronizado.

**Fields**:

- `name`: nome do componente.
- `category`: `layout`, `navigation`, `input`, `feedback`, `display` ou `overlay`.
- `variants`: variantes visuais permitidas.
- `states`: estados interativos ou de feedback.
- `mobileBehavior`: regra especifica para toque ou largura pequena.
- `accessibilityExpectation`: requisito de foco, rotulo ou semantica.

**Validation Rules**:

- Botao deve ter estado focus, hover, active e disabled.
- Card deve ter radius ate 8px e nao deve ser usado como container aninhado desnecessario.
- Estado vazio deve evitar CTA operacional quando a rota for placeholder.
- Modal e input podem existir como base, mas nao devem formar fluxo operacional completo nesta feature.

**Relationships**:

- Usa `Tema Visual Amani`.
- Compoe `Dashboard Placeholder`, paginas placeholder e navegacao.

## Estado de Dados

Representa padrao visual e tipado para areas que futuramente consumirao backend.

**Fields**:

- `status`: `idle`, `loading`, `success`, `empty` ou `error`.
- `message`: texto para usuario.
- `retryAvailable`: indica se tentativa novamente e apropriada.
- `technicalCode`: codigo opcional restrito para diagnostico, sem expor detalhes sensiveis ao usuario.

**Validation Rules**:

- `loading` deve ter feedback visual nao bloqueante.
- `error` deve ter mensagem clara e nao tecnica.
- `empty` deve indicar ausencia de dados ou funcionalidade futura sem parecer falha.
- Nenhum estado pode calcular regra de negocio.

**State Transitions**:

- `idle` -> `loading` quando uma consulta futura iniciar.
- `loading` -> `success` quando dados forem recebidos.
- `loading` -> `empty` quando resposta valida nao tiver conteudo.
- `loading` -> `error` quando houver falha.
- `error` -> `loading` quando retry for acionado.

## Pagina Placeholder

Representa rota inicial de modulo ainda sem funcionalidade operacional.

**Fields**:

- `moduleId`: referencia ao modulo de navegacao.
- `title`: titulo da pagina.
- `description`: texto curto de contexto.
- `reservedRegions`: regioes previstas para conteudo futuro.
- `allowedActions`: lista vazia ou acoes nao operacionais, quando necessario.

**Validation Rules**:

- Nao pode exibir dados reais, mock numerico operacional ou formularios persistentes.
- Deve comunicar que o modulo sera implementado em feature futura.
- Deve manter navegacao e layout responsivos.

**Relationships**:

- Usa `Modulo de Navegacao`, `Layout Responsivo`, `Componente Base` e `Estado de Dados`.

## Dashboard Placeholder

Representa a pagina inicial da aplicacao.

**Fields**:

- `summaryRegions`: regioes reservadas para indicadores futuros.
- `operationsRegions`: regioes reservadas para vendas, estoque, compras e financeiro.
- `alertRegions`: regioes reservadas para alertas futuros.
- `quickActions`: atalhos para modulos, sem executar operacoes reais.

**Validation Rules**:

- Nao pode exibir metricas reais, rankings reais, graficos reais ou valores financeiros reais.
- Deve reorganizar cards em smartphone, tablet e desktop.
- Deve usar componentes base e tokens oficiais.

**Relationships**:

- E uma especializacao de `Pagina Placeholder` para a rota principal.
