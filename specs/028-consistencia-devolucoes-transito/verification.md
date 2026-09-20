# Consistência de devoluções em trânsito verification

**Verdict**: FAIL
**Profile**: standard
**Diff range**: `3708128..bdac465` (`f80a3f6` status-before-pendency; `bdac465` paired-date proofs)
**Round**: 5 - scoped after C35/C36 BUILD + C37-C39 proof correction; human UI roteiro recorded 2026-09-20 for C9/C12/C13/C46
**Verifier**: independent sub-agent (author != verifier)

Identity was re-confirmed before writes: `amani_f028 | 127.0.0.1/32 | 5433 | PostgreSQL 16.3`. All fixture writes were confined to `amani_f028`; fault data used `amani_f028_r5mut`. No production connection string was available or invented, and no production write was attempted.

## Binding sources

Step 1 is carried from `3708128` / round 4 because the scoped diff changed no interface or binding source.

| Source | Opened | Contradiction | Uncovered |
| --- | --- | --- | --- |
| `specs/028-consistencia-devolucoes-transito/plan.md` Surface/Landing/Observable | carried from `3708128` / round 4 | none | `GET /api/compras/produtos-pendentes` names `401`, but checks contain no unauthenticated proof |
| `docs/diagnosticos/compras-devolucoes-transito.md` | carried from `3708128` / round 4 | none | production 12×61 remains unmeasured |
| `CONTEXT.md:8-38` | carried from `3708128` / round 4 | none | - |
| `specs/027-devolucoes-reembolsos-compras/spec.md:164-199` | carried from `3708128` / round 4 | none | - |

## Checks

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | vigente = `Q-R-P-DA` | carried from `3708128` / round 4 | audit SQL; RecusaParcial `pendencia_liquida_bruta=6` | PASS |
| C2 | dashboard counts only vigente > 0 | carried from `3708128` / round 4 | dashboard GETs: RecusaTotal quantity/cost/sale `0` | PASS |
| C3 | RecusaTotal contributes zero | carried from `3708128` / round 4 | operacional quantity/cost/sale `0` | PASS |
| C4 | RecusaParcial cost = 600 | carried from `3708128` / round 4 | operacional quantity `6`, cost `600` | PASS |
| C5 | RecusaParcial sale = 900 | carried from `3708128` / round 4 | operacional sale `900` | PASS |
| C6 | `PrecoVenda` contract and missing join | carried from `3708128` / round 4 | `Produto.cs:10,20,36`; `DashboardOperacionalRepository.cs:89,184` | PASS |
| C7 | posterior return not double-subtracted | carried from `3708128` / round 4 | quantity `6`, cost `600` after receipt 4 + posterior return 4 | PASS |
| C8 | patrimônio uses corrected transit values | carried from `3708128` / round 4 | financeiro transit cost `600`, sale `900` | PASS |
| C9 | UI Em trânsito filter uses vigente membership | human roteiro 2026-09-20 on isolated-copy `http://127.0.0.1:3000/compras` | operator applied status filter Em transito: RecusaTotal absent, RecusaParcial present; `purchase-situation.ts:19-20` `possuiPendenciaVigente === true`; `page.tsx:74` uses that matcher; typecheck already green | PASS |
| C10 | em-transito membership/value | carried from `3708128` / round 4 | total absent; partial pending `6`, cost `600` | PASS |
| C11 | produtos-pendentes only vigente > 0 | carried from `3708128` / round 4 | total absent; partial pending `6` | PASS |
| C12 | RecusaTotal absent on all three surfaces | C10/C11 HTTP carried from round 4 plus human C9 roteiro 2026-09-20 | em-transito `[]` for RecusaTotal; produtos-pendentes omits that item; UI Em transito filter omits RecusaTotal | PASS |
| C13 | unfiltered 30-day UI window differs from patrimonial `t` | human roteiro 2026-09-20 unfiltered `/compras` vs dashboard period | unfiltered list is last-30-days em-transito (`page.tsx:35-41,71-79`); dashboard `t` remains period end, not that window | PASS |
| C14 | list `possuiPendenciaVigente` iff pending | carried from `3708128` / round 4 | total `false`, partial `true`; release build passed | PASS |
| C15 | list unauthenticated = 401 | carried from `3708128` / round 4 | observed `401` | PASS |
| C16 | em-transito unauthenticated = 401 | carried from `3708128` / round 4 | observed `401` | PASS |
| C17 | total refusal tag on list/detail | carried from `3708128` / round 4 | both returned `DevolvidaAntesDoRecebimento` | PASS |
| C18 | partial refusal tag on list/detail | carried from `3708128` / round 4 | both returned `ParcialmenteDevolvida` | PASS |
| C19 | multi-item keeps only B in transit | carried from `3708128` / round 4 | detail A `0`, B `5`; transit contained only B | PASS |
| C20 | list/detail agree | carried from `3708128` / round 4 | membership and logistic codes agreed | PASS |
| C21 | status remains persisted, not Recebida | carried from `3708128` / round 4 | total returned `status=EmTransito`, vigente `false` | PASS |
| C46 | UI operational situation has no Em trânsito badge | human roteiro 2026-09-20 list with date/supplier filter plus detail | RecusaTotal situation text `Devolvida antes do recebimento`; no current badge `Em transito`/`Em trânsito` on list (`purchase-list.tsx:154-168`) or detail (`purchase-detail.tsx:144-158`); `shouldHidePersistedTransitBadge` at `purchase-situation.ts:5`; C21 JSON still `status=EmTransito` and `possuiPendenciaVigente=false` | PASS |
| C22 | exact six-member `CompraStatus` | carried from `3708128` / round 4 | `Compra.cs:169-176`, exactly six members | PASS |
| C23 | existing detail = 200 | carried from `3708128` / round 4 | observed `200` | PASS |
| C24 | empty detail id = 400 | carried from `3708128` / round 4 | observed `400` | PASS |
| C25 | detail unauthenticated = 401 | carried from `3708128` / round 4 | observed `401` | PASS |
| C26 | unknown detail = 404 | carried from `3708128` / round 4 | observed `404` | PASS |
| C27 | over-receipt rejected without persistence | rerun at `bdac465`: POST + SQL counts | `checks.md:133-134`; observed `400`, error contains `exceder`; receipts/stock remained `0/0`; status check precedes quantity check at `CompraService.cs:94-99` | PASS |
| C28 | over-loss rejected without persistence | rerun at `bdac465`: POST + SQL counts | `checks.md:136-137`; observed `400`, error contains `exceder`; only the fixture's prior Finalizada loss existed; no new loss; `CompraService.cs:142-147` | PASS |
| C29 | valid receipt = 201 | carried from `3708128` / round 4 | observed `201` | PASS |
| C30 | valid loss = 201 | carried from `3708128` / round 4 | observed `201` | PASS |
| C31 | receipt unauthenticated = 401 | carried from `3708128` / round 4 | observed `401` | PASS |
| C32 | loss unauthenticated = 401 | carried from `3708128` / round 4 | observed `401` | PASS |
| C33 | receipt unknown item = 404 | carried from `3708128` / round 4 | observed `404` | PASS |
| C34 | loss unknown item = 404 | carried from `3708128` / round 4 | observed `404` | PASS |
| C35 | receipt on Finalizada = 409 | rerun at `bdac465` with Finalizada purchase's own item | `checks.md:157-158`; expected `409`, observed `409` and `Compra Finalizada nao aceita registro de recebimento`; `CompraService.cs:94`, mapped by `CompraController.cs:327` | PASS |
| C36 | loss on Finalizada = 409 | rerun at `bdac465` with same Finalizada fixture | `checks.md:160-161`; expected `409`, observed `409` and `Compra Finalizada nao aceita registro de perda`; `CompraService.cs:142`, mapped by `CompraController.cs:327` | PASS |
| C37 | before DA date shows 10/1000 | rerun at `bdac465` with paired dates | `checks.md:165-166`; `dataInicial=2026-09-17&dataFinal=2026-09-18` returned `200`, quantity `10`, cost `1000`, sale `1500` | PASS |
| C38 | on DA date shows zero | rerun at `bdac465` before compensation | `checks.md:168-169`; paired-date GET returned `200`, quantity/cost/sale `0` | PASS |
| C39 | after compensation restores 10 without stock | rerun at `bdac465` after compensation | `checks.md:171-174`; compensation `201`; paired-date GET returned `200`, quantity `10`, cost `1000`, sale `1500`; stock count `0` | PASS |
| C40 | refund leaves logistics/cards unchanged | carried from `3708128` / round 4 | dashboard and list unchanged before/after refund | PASS |
| C41 | no destructive event-table DML | carried from `3708128` / round 4 | full feature `9c0bcb3..3708128` had no named-table DML; scoped diff adds none | PASS |
| C42 | no migration/persisted pendency/status rewrite | carried from `3708128` / round 4 | no migration; enum unchanged | PASS |
| C43 | production 12/10/61 plus isolated shape | carried from `3708128` / round 4 | isolated shape passed; no production `DATABASE_URL`, so production counts were not remeasured | BLOCKED |
| C44 | revert leaves events unchanged | carried from `3708128` / round 4 | no feature migration; scoped diff adds none | PASS |
| C45 | production validation makes no writes | carried from `3708128` / round 4 | audit script is READ ONLY and rolls back; no production write issued | PASS |

Counts: **45 PASS · 0 FAIL · 1 BLOCKED**.

## Coverage

Receipt/loss statuses and temporal `t` were recomputed at `bdac465`; unrelated rows are carried from `3708128` / round 4.

| Set (size) | Recomputed from | Member -> proof | Unproven |
| --- | --- | --- | --- |
| `GET /api/compras` statuses (2) | carried: plan Surface | 200 C14 · 401 C15 | - |
| `GET /api/compras/{id}` statuses (4) | carried: plan Surface | 200 C23 · 400 C24 · 401 C25 · 404 C26 | - |
| `GET /api/compras/em-transito` statuses (2) | carried: plan Surface | 200 C10 · 401 C16 | - |
| receipt POST statuses (5) | plan Surface + controller mapping, recomputed at `bdac465` | 201 C29 · 400 C27 · 401 C31 · 404 C33 · 409 C35 | - |
| loss POST statuses (5) | plan Surface + controller mapping, recomputed at `bdac465` | 201 C30 · 400 C28 · 401 C32 · 404 C34 · 409 C36 | - |
| dashboard GET success (2) | carried: C2 claim | operacional C2 · financeiro C2 | - |
| produtos-pendentes statuses (2) | carried: plan Observable | 200 C11 · 401 has no check | `401` |
| Landing doors (3) | carried: plan Landing | formula C1 · derived tag C17 · membership bool C14 | - |
| `CompraStatus` members (6) | carried: `Compra.cs:169-176` | C22 all six | - |
| transit shapes (5) | checks fixtures; compensation rerun at `bdac465` | total C3 · partial C4 · multi C19 · posterior C7 · compensation C39 | - |
| temporal positions (3) | plan AC 22-24 + `CompraPendenciaLogistica.cs:32-40`, recomputed at `bdac465` | before C37 · on/after C38 · after compensation C39 | - |
| RecusaTotal UI (2) | plan Observable/C46; human roteiro 2026-09-20 | list C46 · detail C46 | - |
| pendency consumers (7) | carried: plan Flow; writes rerun | dashboard C2 · transit C10 · pending C11 · list C14 · detail C23 · receipt C27 · loss C28 | - |
| cards/patrimônio (3) | carried: plan AC 2-5 | cost C4 · sale C5/C6 · patrimônio C8 | - |
| production audit shape (1) | carried: plan AC 28 | C43 | production 12×61 BLOCKED |

## Test policy rows

The touched `CompraService` decision surface was re-judged at `bdac465`; unchanged surfaces retain round-4 judgments.

| Row | Files it classifies | Required proof | Expectation met |
| --- | --- | --- | --- |
| Decides, reached across a boundary — scoped service path | `CompraService.cs:94-99,142-147` | boundary plus own-layer/static evidence of status-before-pendency | yes — C27/C28 preserve 400 `exceder`; C35/C36 now prove 409, and source ordering is explicit |
| Decides, reached across a boundary — unchanged surfaces | dashboard/transit/list/mapper/frontend decision surfaces | boundary plus SQL/rg of same claim | yes for C9/C12/C13/C46 after human roteiro 2026-09-20; remaining mapper 5+ codes still not all boundary-asserted |
| Decides, not reached across a boundary | four-term formula, `PrecoVenda`, enum, mapper decision table | own-layer SQL/rg, one case per decision row | no — carried from round 4: mapper's advertised 5+ codes are not all boundary-asserted |
| Entry point that decides nothing | controller 400/404/409 mapping | accepted and every rejected/error path | yes — receipt/loss status sets now include passing 409 members; `CompraController.cs:326-327,341` |
| Instrumentation/pass-throughs | controller forwarding | consumer proof | yes for executed backend consumers |

## Faults injected

The real-tree baseline was `M specs/028-consistencia-devolucoes-transito/verification.md`. The fault ran in detached worktree `Amani_ImportadosERP.verify-f028-r5` against cloned database `amani_f028_r5mut` and API port 5011. No stash, live API 5001, or `amani_f028` was used for the fault. The mutant database and registered worktree were discarded; real-tree porcelain returned to the same baseline.

| Mutation | Location | Killed |
| --- | --- | --- |
| remove the new receipt `GarantirQueAceitaEventosLogisticos` call so pendency validation runs first | scratch `CompraService.cs:94` | yes — narrow C35 proof changed from expected `409` to `400 exceder` |

Remaining faults were capped: the scoped BUILD introduced one new assertion surface (status-before-pendency); the C37-C39 change corrected proof URLs without changing application behavior.

## Ranked gaps

1. C43 remains BLOCKED: no production `DATABASE_URL` was available; no Neon/neondb/old-poetry value was invented. This is the only remaining BLOCKED check.
2. Coverage gap: `GET /api/compras/produtos-pendentes` status `401` is named by plan Observable but has no check.
3. Test-policy gap: the mapper's advertised 5+ logistic codes are not all asserted at the boundary.

## Gate

- identity — PASS: local PostgreSQL 16.3, `amani_f028`, loopback, port 5433
- scoped proofs — C27, C28, C35, C36, C37, C38, C39 all PASS at `bdac465`
- C35-C39 outcomes — **C35 PASS · C36 PASS · C37 PASS · C38 PASS · C39 PASS**
- production writes — none
- real-tree status after fault — matched baseline
- human UI roteiro 2026-09-20 — C9, C12, C13, C46 PASS
- `python .codex/skills/tlc-spec-lean/scripts/validate_verification.py specs/028-consistencia-devolucoes-transito` — exit 1, expected because the report verdict is FAIL while C43 is BLOCKED
- overall verdict remains FAIL because C43 (production READ ONLY audit) is BLOCKED; it is the only remaining BLOCKED check
