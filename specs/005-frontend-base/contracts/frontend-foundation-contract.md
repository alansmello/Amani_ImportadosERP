# Frontend Foundation Contract: Feature 005

Este contrato define as superficies publicas da fundacao frontend para as proximas features. Ele nao define endpoints reais de negocio nem substitui contratos da API backend.

## Route Contract

| Route | Purpose | Status in Feature 005 | Navigation |
|-------|---------|-----------------------|------------|
| `/` | Dashboard inicial placeholder | Placeholder structured | Desktop + Mobile |
| `/clientes` | Area futura de clientes | Placeholder | Desktop + More |
| `/produtos` | Area futura de produtos | Placeholder | Desktop + More |
| `/compras` | Area futura de compras | Placeholder | Desktop + Mobile |
| `/vendas` | Area futura de vendas | Placeholder | Desktop + Mobile |
| `/estoque` | Area futura de estoque | Placeholder | Desktop + Mobile |
| `/financeiro` | Area futura financeira | Placeholder | Desktop + More |
| `/configuracoes` | Area futura de configuracoes | Placeholder | Desktop + More |

## Navigation Contract

### Desktop Sidebar

Must include:

- Dashboard -> `/`
- Clientes -> `/clientes`
- Produtos -> `/produtos`
- Compras -> `/compras`
- Vendas -> `/vendas`
- Estoque -> `/estoque`
- Financeiro -> `/financeiro`
- Configuracoes -> `/configuracoes`

Rules:

- Active route must be visually distinct.
- Sidebar must remain visible at desktop viewport.
- Items must use Lucide React icons.
- Labels must remain readable in dark theme.

### Mobile Bottom Navigation

Must include direct items:

- Dashboard -> `/`
- Vendas -> `/vendas`
- Estoque -> `/estoque`
- Compras -> `/compras`
- Mais -> grouped access to Clientes, Produtos, Financeiro, Configuracoes

Rules:

- Bottom navigation must remain accessible on smartphone.
- Direct items must fit without text overlap.
- "Mais" must not hide the current route state when a grouped route is active.

## Design Token Contract

Tokens must be available through Tailwind theme names and CSS variables.

| Token Name | Value |
|------------|-------|
| `background` | `#0B0B0F` |
| `surface` | `#13131A` |
| `surface-light` | `#1C1C25` |
| `primary` | `#7C3AED` |
| `primary-hover` | `#8B5CF6` |
| `accent` | `#A855F7` |
| `text-primary` | `#F8FAFC` |
| `text-secondary` | `#94A3B8` |
| `success` | `#22C55E` |
| `warning` | `#F59E0B` |
| `danger` | `#EF4444` |
| `info` | `#3B82F6` |

Rules:

- Dark theme is the only supported theme in Feature 005.
- Components must use token names or CSS variables instead of hard-coded visual values.
- Focus states must be visible against `background` and `surface`.

## Component Contract

Minimum base components:

- `AppShell`: wraps global layout and responsive navigation.
- `DesktopSidebar`: renders full module navigation for desktop.
- `MobileBottomNav`: renders mobile direct destinations and "Mais".
- `PageHeader`: renders title and optional description/action region.
- `EmptyState`: renders placeholder/empty content.
- `LoadingState`: renders standardized loading feedback.
- `ErrorState`: renders standardized user-safe error feedback.
- `MetricPlaceholderCard`: reserves future dashboard metric regions without values.
- `QuickActionGrid`: displays non-operational navigation shortcuts.

Rules:

- Components must be usable in smartphone, tablet and desktop.
- Component text must not overflow containers.
- Cards must not be nested inside cards for page-level layout.
- Components must support accessible labels when icon-only controls are used.

## Backend Service Contract

Minimum service layer:

- `apiClient`: wrapper for HTTP requests.
- `ApiError`: normalized error shape.
- `queryClient`: configured TanStack Query client.
- Future service modules grouped by ERP module.

Expected normalized error shape:

```ts
type ApiError = {
  status?: number
  message: string
  code?: string
}
```

Rules:

- Components must not call backend endpoints directly when a service module exists.
- Query hooks must not calculate critical business rules.
- Loading, error and empty states must be represented by shared state components.
- Feature 005 may include no real business endpoint calls.

## Dashboard Placeholder Contract

Dashboard must reserve regions for:

- Financial summary.
- Operational summary.
- Stock attention area.
- Purchases and sales attention area.
- Future alerts.
- Future quick actions.

Rules:

- No real metrics.
- No mock numeric operational values.
- No real charts or rankings.
- Placeholder copy must be short and operational.
