# Contract: Contextual Navigation

## Public UI contract

`ContextualLink` requires a destination and derives the current location as `returnTo`. On an unmodified primary click, it records a short-lived, one-time client-transition marker before navigation.

`ContextualBackButton` requires:

- `fallbackHref`: valid internal route, mandatory
- optional label/visual props compatible with existing Button usage

The marker stores normalized destination, normalized origin, creation time and contract version and expires after 10 seconds. Modified clicks, opening in a new tab/window and non-client transitions do not register a marker and therefore use fallback at the destination.

## Internal path validation

A candidate is accepted only when all conditions hold:

1. It is a non-empty string.
2. It begins with one `/` and not `//`.
3. Parsing it against the current origin produces the same origin.
4. It contains no explicit protocol, credentials or host.
5. Its pathname is `/`, equals an allowed prefix or starts with an allowed prefix followed by `/`.

Allowed prefixes: `/clientes`, `/fornecedores`, `/produtos`, `/compras`, `/vendas`, `/estoque`, `/financeiro`, `/configuracoes`.

Explicitly rejected spaces include `/login`, `/api`, `/_next` and any unknown top-level prefix.

Invalid, external, protocol-relative or malformed values are ignored.

Before serializing the current location into a new link, remove its own `returnTo` parameter to avoid nested chains.

## Return resolution

```text
marker = consumeSessionMarker()

if marker is at most 10 seconds old and matches current destination + valid returnTo:
    destination = returnTo
else:
    destination = fallbackHref

navigate to destination
```

The component never calls uncontrolled browser back navigation.

## Fallback matrix

| Destination page | Required fallback |
| --- | --- |
| `/clientes/novo` | `/clientes` |
| `/clientes/[id]` | `/clientes` |
| `/clientes/[id]/editar` | `/clientes/[id]` |
| `/compras/nova` | `/compras` |
| `/compras/[id]` | `/compras` |
| `/configuracoes/formas-pagamento` | `/configuracoes` |
| `/estoque/[produtoId]` | `/estoque` |
| `/financeiro/contas-receber/nova` | `/financeiro/contas-receber` |
| `/financeiro/contas-receber/[id]/editar` | `/financeiro/contas-receber` |
| `/financeiro/contas-receber/cliente/[clienteId]` | `/financeiro/contas-receber` |
| `/financeiro/despesas/nova` | `/financeiro/despesas` |
| `/financeiro/despesas/categorias` | `/financeiro/despesas` |
| `/financeiro/despesas-operadora` | `/financeiro` |
| `/fornecedores/novo` | `/fornecedores` |
| `/fornecedores/[id]` | `/fornecedores` |
| `/fornecedores/[id]/editar` | `/fornecedores/[id]` |
| `/produtos/novo` | `/produtos` |
| `/produtos/[id]` | `/produtos` |
| `/produtos/[id]/editar` | `/produtos/[id]` |
| `/vendas/nova` | `/vendas` |
| `/vendas/[vendaId]` | `/vendas` |

## Controlled-link propagation

- List/action links entering a mapped create, detail or edit page include the current internal location as `returnTo`.
- Detail-to-edit links use the detail page itself as the new origin.
- Cross-module links use the same helper; no page accepts an arbitrary external return URL.
- The destination consumes the matching marker on first mount; a refresh has no marker and uses the page fallback even if the query still contains `returnTo`.
- Modal Cancel buttons remain local actions and do not use this contract.

## Expected examples

| Current location | Destination | Resulting behavior |
| --- | --- | --- |
| `/compras?status=transito` | `/compras/abc` | Detail Voltar returns to filtered purchases path |
| `/fornecedores/abc` | `/fornecedores/abc/editar` | Edit Voltar returns to Supplier detail |
| Direct `/produtos/abc` | none | Voltar uses `/produtos` |
| Reload `/clientes/abc?returnTo=%2Fvendas%2Fnova` | supplied but reload | Voltar uses `/clientes` |
| `returnTo=https://example.com` | any mapped page | Candidate rejected; fallback used |
| `returnTo=//example.com/path` | any mapped page | Candidate rejected; fallback used |

## Controlled source inventory

All entry points to mapped destinations must use `ContextualLink`, including list actions, pending panels, receivable/customer drill-downs, sale/customer cross-module links and navigation-shell items that target Forms of Payment or Operator Expenses. Post-submit redirects may remain explicit workflow transitions when returning to the submitted form would be undesirable.
