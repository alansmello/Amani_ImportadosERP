# Validation: Estoque Frontend

**Date**: 2026-06-17

## Implementation Status

F012 is implementation-ready in the frontend for:

- `/estoque` stock balance list, summary, search, and positive-balance filter.
- `/estoque/[produtoId]` product movement history with period/type filters.
- Pending receipt visibility in `/estoque`, using the existing purchases source.
- Navigation status updated from placeholder to ready.

## Automated Checks

Executed from `frontend/`:

- `npm run lint` - PASS on 2026-06-17
- `npm run typecheck` - PASS on 2026-06-17
- `npm run build` - PASS on 2026-06-17

## Scope Checks

- No manual stock adjustment action was added.
- No stock transfer action was added.
- No minimum-stock alert was added.
- No movement create, edit, or delete action was added.
- Pending receipt quantities are displayed as awaiting receipt and are not added
  to `saldoAtual`.
- Stock balances and movement history are consumed from `/api/estoque`.
- Static scope scan found no create/edit/delete movement action, manual stock
  adjustment, stock transfer, minimum-stock alert, dashboard metric, profit
  calculation, average-cost calculation, or local `saldoAtual` arithmetic in the
  F012 frontend surface.

## Compras Regression

- `/compras` still renders the existing pending products panel.
- Purchase receipt and loss actions remain in the purchase detail flow.
- Estoque only links pending receipt items to the existing purchase detail route.

## Manual Data Requirements

The quickstart scenarios that depend on business data require a running backend
with:

- at least one product with positive balance;
- at least one product with zero balance;
- preferably one product with negative balance for inconsistency highlighting;
- at least one pending purchase item;
- ideally 100 or more products to validate search/filter timing at target scale.

These are dataset prerequisites, not frontend code blockers.

No repository-local seed or fixture with 100 products was found during final
validation. Run the timing checks against a backend/database that satisfies this
dataset requirement before production acceptance.
