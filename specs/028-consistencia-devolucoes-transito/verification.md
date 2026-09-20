# Consistência de devoluções em trânsito verification

**Verdict**: FAIL
**Profile**: standard
**Diff range**: `9c0bcb3..669e9fc` (includes `d65623d`, `f80a3f6`, `bdac465`; HEAD `669e9fc`)
**Round**: 6 - full VERIFY at HEAD
**Verifier**: independent sub-agent (author != verifier)

Identity was re-confirmed before writes: `amani_f028 | 127.0.0.1/32 | 5433 | PostgreSQL 16.3`. All fixture writes were confined to `amani_f028`; fault data used `amani_f028_r6mut` and API port 5012. No production `DATABASE_URL` existed, no Neon/neondb/old-poetry value was used, and no production write was attempted.

## Binding sources

| Source | Opened | Contradiction | Uncovered |
| --- | --- | --- | --- |
| `specs/028-consistencia-devolucoes-transito/plan.md` Surface/Landing/Observable | yes, at `669e9fc` | none | `GET /api/compras/produtos-pendentes` names `401`, but no check proves it |
| `docs/diagnosticos/compras-devolucoes-transito.md` | yes, at `669e9fc` | none | - |
| `CONTEXT.md:8-38` | yes, at `669e9fc` | none | - |
| `specs/027-devolucoes-reembolsos-compras/spec.md:164-199` | yes, at `669e9fc` | none | - |

## Checks

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | vigente = `Q-R-P-DA` | isolated audit SQL | `checks.md:33-34`; RecusaParcial `pendencia_liquida_bruta=6` | PASS |
| C2 | dashboard includes only vigente > 0 | both authenticated dashboard GETs | `checks.md:36-39`; RecusaTotal-only quantity/cost/sale all `0`; financeiro transit values `0` | PASS |
| C3 | RecusaTotal contributes zero | operacional GET | `checks.md:41-42`; quantity/cost/sale `0/0/0` | PASS |
| C4 | RecusaParcial cost = 600 | operacional GET | `checks.md:44-45`; quantity `6`, cost `600` | PASS |
| C5 | RecusaParcial sale = 900 | operacional GET | `checks.md:47-48`; sale `900` | PASS |
| C6 | live `PrecoVenda` is required/non-negative; missing join remains unavailable | all three static searches | `Produto.cs:10,20,36`; DTOs `:8`; `DashboardOperacionalRepository.cs:89,184` | PASS |
| C7 | posterior return is not double-subtracted | receipt 4 + posterior return 4, then operacional/detail GETs | `checks.md:55-56`; quantity `6`, cost `600`; detail received `4`, posterior `4`, pending `6` | PASS |
| C8 | patrimônio uses corrected transit values | financeiro GET | `checks.md:58-59`; transit cost `600`, sale `900`; realistic `-1400`, potential `-1100` | PASS |
| C9 | UI Em trânsito uses vigente membership | committed operator roteiro, 2026-09-20, `http://127.0.0.1:3000/compras`; typecheck at HEAD | operator observed RecusaTotal absent and RecusaParcial present; `purchase-situation.ts:19-20`, `page.tsx:74`; `checks.md:63-65` | PASS |
| C10 | em-transito membership/value | authenticated GET | `checks.md:67-68`; total absent; partial pending `6`, cost `600` | PASS |
| C11 | produtos-pendentes only vigente > 0 | authenticated GET | `checks.md:70-71`; total absent; partial pending `6` | PASS |
| C12 | RecusaTotal absent on all three surfaces | C9 operator roteiro plus C10/C11 HTTP | `checks.md:73-74`; UI absent, em-transito `[]`, produtos-pendentes `[]` | PASS |
| C13 | unfiltered 30-day UI window is not patrimonial `t` | committed operator roteiro, 2026-09-20, `http://127.0.0.1:3000/compras` | operator observed last-30-days window; selectors `page.tsx:35-41,71-79`; `checks.md:76-77` | PASS |
| C14 | list `possuiPendenciaVigente` iff pending | authenticated GET + release build | `checks.md:79-81`; total `false`, partial `true`; build exit 0 | PASS |
| C15 | list unauthenticated = 401 | GET | `checks.md:83-84`; observed `401` | PASS |
| C16 | em-transito unauthenticated = 401 | GET | `checks.md:86-87`; observed `401` | PASS |
| C17 | total refusal tag on list/detail | list + detail GETs | `checks.md:91-93`; both returned `DevolvidaAntesDoRecebimento` / `Devolvida antes do recebimento` | PASS |
| C18 | partial refusal tag on list/detail | list + detail GETs | `checks.md:95-97`; both returned `ParcialmenteDevolvida` | PASS |
| C19 | multi-item keeps only B in transit | detail + em-transito GETs | `checks.md:99-101`; A pending `0`, B `5`, purchase partial; transit included only B | PASS |
| C20 | list/detail agree | total and partial list/detail GETs | `checks.md:103-104`; membership and logistic codes agreed | PASS |
| C21 | status remains persisted, not Recebida | list + detail GETs | `checks.md:106-107`; RecusaTotal `status=EmTransito`, `possuiPendenciaVigente=false` | PASS |
| C46 | UI operational situation suppresses Em trânsito badge | committed operator roteiro, 2026-09-20, list with active filter and detail at `http://127.0.0.1:3000` | operator observed `Devolvida antes do recebimento`, no current Em trânsito badge; `purchase-situation.ts:5,34`, `purchase-list.tsx:154-168`, `purchase-detail.tsx:144-158`; C21 JSON as above | PASS |
| C22 | exact six-member `CompraStatus` | enum search | `Compra.cs:169-176`; exactly six named members | PASS |
| C23 | existing detail = 200 | GET | `checks.md:119-120`; observed `200` | PASS |
| C24 | empty detail id = 400 | GET | `checks.md:122-123`; observed `400`, `Id da compra e obrigatorio` | PASS |
| C25 | detail unauthenticated = 401 | GET | `checks.md:125-126`; observed `401` | PASS |
| C26 | unknown detail = 404 | GET | `checks.md:128-129`; observed `404` | PASS |
| C27 | over-receipt rejected without persistence | POST + SQL counts | `checks.md:133-134`; `400`, error contained `exceder`; receipt/loss/stock counts stayed `0/0/0` | PASS |
| C28 | over-loss rejected without persistence | POST + SQL counts | `checks.md:136-137`; `400`, error contained `exceder`; counts stayed `0/0/0` | PASS |
| C29 | valid receipt = 201 | POST after C40 | `checks.md:139-140`; observed `201` | PASS |
| C30 | valid loss = 201 | POST after C29 | `checks.md:142-143`; observed `201` | PASS |
| C31 | receipt unauthenticated = 401 | POST | `checks.md:145-146`; observed `401` | PASS |
| C32 | loss unauthenticated = 401 | POST | `checks.md:148-149`; observed `401` | PASS |
| C33 | receipt unknown item = 404 | POST | `checks.md:151-152`; observed `404` | PASS |
| C34 | loss unknown item = 404 | POST | `checks.md:154-155`; observed `404` | PASS |
| C35 | receipt on Finalizada = 409 | POST using Finalizada purchase's own item | `checks.md:157-158`; observed `409`, `Compra Finalizada nao aceita registro de recebimento`; guard at `CompraService.cs:94` | PASS |
| C36 | loss on Finalizada = 409 | POST using same Finalizada fixture | `checks.md:160-161`; observed `409`, `Compra Finalizada nao aceita registro de perda`; guard at `CompraService.cs:142` | PASS |
| C37 | before DA date shows 10/1000 | paired-date GET | `checks.md:165-166`; `dataInicial=2026-09-17&dataFinal=2026-09-18` returned `200`, quantity `10`, cost `1000` | PASS |
| C38 | on DA date shows zero | paired-date GET before compensation | `checks.md:168-169`; returned `200`, quantity/cost/sale `0` | PASS |
| C39 | compensation restores 10 without stock | compensation POST + paired-date GET + SQL count | `checks.md:171-174`; POST `201`; quantity `10`, cost `1000`; stock count `0` | PASS |
| C40 | refund leaves logistics/cards unchanged | before/after dashboard and list, then valid writes | `checks.md:176-177`; stayed `6/600/900`, membership `true`; refund POST `201` | PASS |
| C41 | no destructive event-table DML | feature diff + SQL/migration search | `checks.md:181-183`; no named-table DML in `9c0bcb3..669e9fc` | PASS |
| C42 | no migration/persisted pendency/status rewrite | migration diff + enum search | `checks.md:185-187`; migration diff empty; enum unchanged | PASS |
| C43 | production 12/10/61 plus isolated same-shape evidence | isolated RecusaTotal proofs ran; production SQL did not | `checks.md:189-192`; isolated dashboard zero, transit/filter omission and detail pending zero passed; production `DATABASE_URL` absent | BLOCKED |
| C44 | revert leaves events unchanged | migration diff | `checks.md:194-195`; no feature migration | PASS |
| C45 | production validation makes no writes | session audit + script inspection | `checks.md:197-198`; no production write; audit starts READ ONLY at `auditoria.sql:7` and rolls back at `:71` | PASS |

Counts: **45 PASS · 0 FAIL · 1 BLOCKED**. C43 is the only BLOCKED check.

## Coverage

Recomputed at `669e9fc` from plan Surface/Landing/Observable, code enumerations, and check claims.

| Set (size) | Recomputed from | Member -> proof | Unproven |
| --- | --- | --- | --- |
| `GET /api/compras` statuses (2) | plan Surface | 200 C14 · 401 C15 | - |
| `GET /api/compras/{id}` statuses (4) | plan Surface | 200 C23 · 400 C24 · 401 C25 · 404 C26 | - |
| `GET /api/compras/em-transito` statuses (2) | plan Surface | 200 C10 · 401 C16 | - |
| receipt POST statuses (5) | plan Surface/controller | 201 C29 · 400 C27 · 401 C31 · 404 C33 · 409 C35 | - |
| loss POST statuses (5) | plan Surface/controller | 201 C30 · 400 C28 · 401 C32 · 404 C34 · 409 C36 | - |
| dashboard GET success (2) | C2 claim | operacional C2 · financeiro C2 | - |
| produtos-pendentes statuses (2) | plan Observable/controller route | 200 C11 · 401 has no check | `401` |
| Landing doors (3) | plan Landing | formula C1 · derived tag C17 · membership bool C14 | - |
| `CompraStatus` members (6) | `Compra.cs:169-176` | C22 all six | - |
| transit shapes (5) | fixture authority | total C3 · partial C4 · multi C19 · posterior C7 · compensation C39 | - |
| temporal positions (3) | plan AC 22-24 + `CompraPendenciaLogisticaConsulta.cs:25-26` | before C37 · on/after C38 · after compensation C39 | - |
| RecusaTotal UI (2) | plan Observable/C46 + committed operator evidence | list C46 · detail C46 | - |
| pendency consumers (7) | plan Flow | dashboard C2 · transit C10 · pending C11 · list C14 · detail C23 · receipt C27 · loss C28 | - |
| cards/patrimônio (3) | plan AC 2-5 | cost C4 · sale C5/C6 · patrimônio C8 | - |
| production audit shape (1) | plan AC 28 | C43 | production 12×61 BLOCKED |

## Test policy rows

| Row | Files it classifies | Required proof | Expectation met |
| --- | --- | --- | --- |
| Decides, reached across a boundary | dashboard/transit/list/mapper/service/frontend decision surfaces | boundary plus SQL/rg of same claim | no — named checks cover F028 cases, but the mapper's advertised 5+ logistic-code decision table is not fully asserted at the boundary |
| Decides, not reached across a boundary | formula, `PrecoVenda`, enum, mapper table | own-layer SQL/rg, one case per row | no — formula/price/enum pass; mapper rows `ParcialmenteCompensada` and `DevolucaoCompensada` lack check-defined own-layer cases |
| Entry point that decides nothing | controller 200/201/400/401/404/409 paths | accepted input and every rejected/error path | yes — all Surface status members executed and passed |
| Instrumentation/pass-throughs | controller forwarding | consumer proof | yes for all executed F028 consumers |

## Faults injected

Real-tree baseline was clean. Faults ran only in detached worktree `Amani_ImportadosERP.verify-f028-r6`; the behavior mutant used cloned database `amani_f028_r6mut` and port 5012. No stash, live API 5001, or `amani_f028` was used for mutants. The API, clone and worktree were discarded; real-tree porcelain returned to the clean baseline.

| Mutation | Location | Killed |
| --- | --- | --- |
| `PrecoVenda` non-nullable -> nullable | scratch `Produto.cs:10` | yes — C6 exact search lost its required hit |
| add seventh `CompraStatus.Devolvida` | scratch `Compra.cs:176` | yes — C22 enumeration exposed seven members |
| add `DELETE FROM compras` to audit SQL | scratch `auditoria.sql` | yes — C41 DML search found it |
| add an EF migration file | scratch migrations directory | yes — C42 migration-path proof found it |
| four-term formula `- DA` -> `+ DA` | scratch `CompraPendenciaLogistica.cs:21-25` | yes — cloned-database dashboard changed from expected `200`/valid totals to `400`, `Quantidade pendente deve estar entre zero e a quantidade comprada` |

## Swept existing

- validation/failure persistence: C27/C28 passed with unchanged SQL counts
- idempotency: F027 `OperacaoId` uniqueness remains existing; no new command
- authorization: C15/C16/C25/C31/C32 passed; produtos-pendentes `401` remains an uncovered set member
- concurrency: C35/C36 passed terminal-state conflict paths
- data lifecycle: C41/C42/C44/C45 passed; no migration or production write
- dependency failure: n/a - no new external service
- state transitions: C21/C22/C46 passed
- observability: n/a - no new log or metric requirement

## Ranked gaps

1. C43 is BLOCKED: no production READ ONLY `DATABASE_URL`; the isolated RecusaTotal-shaped half passed, but production 12 items / 10 purchases / 61 units was not remeasured.
2. Coverage gap: `GET /api/compras/produtos-pendentes` `401` is named by plan Observable but has no check.
3. Test-policy gap: `CompraMapper.CalcularSituacaoLogisticaDevolucao` advertises 5+ codes, but its compensated rows are not each proven by a check-defined case.

## Gate

- identity — PASS: PostgreSQL 16.3, `amani_f028`, loopback, port 5433
- `dotnet build Amani_ImportadosERP.sln --no-restore --configuration Release` — exit 0
- `npm --prefix frontend run lint` — exit 0
- `npm --prefix frontend run typecheck` — exit 0
- `npm --prefix frontend run build` — exit 0
- named HTTP/SQL/static proofs — 45 PASS, C43 production half BLOCKED
- faults — 5 injected, 5 killed
- production writes — none
- real-tree status after faults — matched clean baseline before this report write
- overall — FAIL because C43 is BLOCKED; Coverage and Test policy also contain independent unmet rows
