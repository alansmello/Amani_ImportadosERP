# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Plan/Checks)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation - do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 - The unfiltered Compras list must not be served from GET em-transito if a recusa-total row has to appear there with a logistic badge.
- signal: `spec_deviation` · recurrence: 1 feature(s) · scope: `compras` · harmful: 0
- features: 028-consistencia-devolucoes-transito
- evidence: frontend/src/app/compras/page.tsx:78 (compras)
- last seen: 2026-09-20T17:21:45Z

### L-002 - Prove the in-process pendency formula with a proof that executes application code, not only a diagnostic SQL file that never loads it.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `pendency` · harmful: 0
- features: 028-consistencia-devolucoes-transito
- evidence: C1 (pendency)
- last seen: 2026-09-20T17:21:45Z

### L-003 - A screen check that requires a row to be visible must name the API path that actually lists that row.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `compras-ui` · harmful: 0
- features: 028-consistencia-devolucoes-transito
- evidence: C46 (compras-ui)
- last seen: 2026-09-20T17:21:45Z

### L-004 - Do not freeze independent-test prose as a check when the numbered acceptance criteria do not require that surface.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `checks` · harmful: 0
- features: 028-consistencia-devolucoes-transito
- evidence: C46 (checks)
- last seen: 2026-09-20T17:34:21Z

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
