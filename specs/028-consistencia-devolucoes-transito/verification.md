# Consistência de devoluções em trânsito verification

**Verdict**: FAIL
**Profile**: standard
**Diff range**: `9c0bcb3..393746d` (`origin/main...HEAD`); application HEAD `393746d`
**Round**: 3 - scoped (isolated-copy attempt; Docker gate blocked HTTP)
**Verifier**: independent sub-agent (author != verifier)

This round re-ran static proofs at HEAD and re-verified the Docker identity gate with an 8s timeout. HTTP/UI/SQL-isolated proofs remain unexecuted because the isolated copy was never created. That is an environment limitation, not an implementation FAIL. No check was converted from BLOCKED to PASS by reading C# in place of a named HTTP/SQL/UI proof. C6 is newly PASS because `checks.md` now names three static `rg` proofs. 0 implementation FAIL found (including no seventh `CompraStatus` member).

## Binding sources

Profile `standard` does not require this step. PLAN sources were opened so BUILD is not treated as authority.

| Source | Opened | Contradiction | Uncovered |
| --- | --- | --- | --- |
| `specs/028-consistencia-devolucoes-transito/plan.md` Surface/Landing | yes - reopened round 3 | none | `GET /api/compras/produtos-pendentes` `401` named in Observable, no check |
| `docs/diagnosticos/compras-devolucoes-transito.md` | carried from `393746d` round 2 | none on the four-term formula | dashboard contribution of the 12 production rows remains unproven (as C43 itself warns) |
| `CONTEXT.md` labels | carried from round 2 | none | - |
| `specs/027-devolucoes-reembolsos-compras/spec.md` | carried from round 2 | none | - |

## Environment limitations (not implementation defects)

- Docker Desktop processes are running (`Docker Desktop`, `com.docker.backend`, …). `com.docker.service` is **Stopped** (StartType Manual). `docker version` and `docker ps -a --filter name=amani-f028-pg` **hung** on the npipe and were killed at 8s. Container `amani-f028-pg` on `127.0.0.1:55432` was never created. Identity gate failed **before** migration. No seed, no API, no JWT, no fixtures.
- This session did not use `localhost:5433`, `neon.tech`, `neondb`, old-poetry, or password `surf22bob`.
- `$env:DATABASE_URL`, `$env:API`, `$env:TOKEN`, and fixture ids are unset. Production `DATABASE_URL` absent. Production `auditoria.sql` was **not** executed.
- No POST/PUT/PATCH/DELETE/UPDATE against production. No migrations run. Application tree not edited.
- `dotnet build Amani_ImportadosERP.sln --no-restore --configuration Release` exit 1: `NU1301` Azure Artifacts `Nuget-Mongeral` 401. C14 HTTP claim stays BLOCKED (env), not FAIL of F028 logic.
- Port 5433 / Neon were not used as a substitute isolated copy.

## Checks

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | vigente = `Q - R(t) - P(t) - DA(t)` | isolated `psql` of auditoria.sql — not run (no `amani-f028-pg`; `DATABASE_URL` unset) | named proof is isolated SQL, not `CompraPendenciaLogistica.cs:21` | BLOCKED |
| C2 | dashboard operacional/financeiro only counts vigente > 0 | curls not run (Docker gate) | no HTTP | BLOCKED |
| C3 | RecusaTotal contributes 0 / 0.00 / 0.00 | curl not run | no HTTP | BLOCKED |
| C4 | RecusaParcial cost card 600.00 | curl not run | no HTTP | BLOCKED |
| C5 | RecusaParcial sale card 900.00 | curl not run | no HTTP | BLOCKED |
| C6 | live `Produto` cannot be created/updated without non-negative `PrecoVenda`; dashboard nulls sale transit only on missing product join (AC 5) | re-run round 3: `rg "public decimal PrecoVenda"` on Produto/Criar/Atualizar DTOs; `rg "precoVenda < 0"` Produto.cs; `rg "PrecoVenda = produto == null"` + `motivoVenda ??=` | `Produto.cs:10` `public decimal PrecoVenda` (not `decimal?`); `CriarProdutoDto.cs:8` / `AtualizarProdutoDto.cs:8` same; `Produto.cs:20` and `:36` `if (precoVenda < 0) throw`; `DashboardOperacionalRepository.cs:70` `PrecoVenda = produto == null ? (decimal?)null : produto.PrecoVenda`; `:165` `motivoVenda ??= "…nao possui referencia valida."` — 0 is accepted (no `== 0` reject) | PASS |
| C7 | posterior return does not double-discount remaining 6 | curl not run | not the named HTTP proof | BLOCKED |
| C8 | patrimônio realista/potencial add corrected transit | curl not run | no HTTP | BLOCKED |
| C9 | filter Em trânsito membership | roteiro not run; `npm --prefix frontend run typecheck` exit 0 | typecheck does not settle RecusaTotal absent; `purchase-situation.ts:19` `possuiPendenciaVigente === true` is not the roteiro | BLOCKED |
| C10 | `GET /api/compras/em-transito` 200 + membership + `valorPendenteCusto` | curl not run | no HTTP | BLOCKED |
| C11 | `GET /api/compras/produtos-pendentes` only vigente > 0 | curl not run | no HTTP | BLOCKED |
| C12 | RecusaTotal absent from filter, em-transito and produtos-pendentes | depends on C9–C11 | no HTTP/UI | BLOCKED |
| C13 | unfiltered 30-day window is not patrimonial `t` | roteiro not run | no UI | BLOCKED |
| C14 | `GET /api/compras` 200 + `possuiPendenciaVigente` | curl not run; `dotnet build --no-restore --configuration Release` exit 1 (`NU1301` Mongeral 401) | HTTP claim unexecuted; build failure is NuGet env, not F028 formula | BLOCKED |
| C15 | `GET /api/compras` without token = 401 | curl not run | no HTTP | BLOCKED |
| C16 | `GET /api/compras/em-transito` without token = 401 | curl not run | no HTTP | BLOCKED |
| C17 | RecusaTotal logistic tag `DevolvidaAntesDoRecebimento` | curls not run | no HTTP | BLOCKED |
| C18 | RecusaParcial `ParcialmenteDevolvida` | curls not run | no HTTP | BLOCKED |
| C19 | multi-item keeps B in transit, not purchase-level AntesDoRecebimento | curls not run | no HTTP | BLOCKED |
| C20 | list and detail agree at same `t` | depends on C17/C18 | no HTTP | BLOCKED |
| C21 | RecusaTotal JSON `status` stays `EmTransito`, not `Recebida` | curls not run | no HTTP | BLOCKED |
| C46 | RecusaTotal on a listing/detail that returns it: operational situation "Devolvida antes do recebimento"; no current badge Em trânsito while `possuiPendenciaVigente=false` | isolated-copy roteiro not run (Docker gate) | C21 curls also not run | BLOCKED |
| C22 | `enum CompraStatus` stays exactly 6 members; no devolução/recusa member | `rg "enum CompraStatus" -A 8 src/Amani.ImportadosERP.Domain/Entities/Compra.cs` re-run at `393746d` | `Compra.cs:169-176` `Criada`, `EmTransito`, `ParcialmenteRecebida`, `Recebida`, `Finalizada`, `Cancelada` — no seventh name | PASS |
| C23 | `GET /api/compras/{id}` existing = 200 | curl not run | no HTTP | BLOCKED |
| C24 | empty guid = 400 | curl not run | no HTTP | BLOCKED |
| C25 | detail without token = 401 | curl not run | no HTTP | BLOCKED |
| C26 | unknown id = 404 | curl not run | no HTTP | BLOCKED |
| C27 | receipt qty 1 on RecusaTotal = 400 `{ error }` contains `exceder`; no persist | POST skipped (no isolated copy; production writes forbidden) | no HTTP | BLOCKED |
| C28 | loss qty 1 on RecusaTotal = 400 `exceder`; no persist | POST skipped | no HTTP | BLOCKED |
| C29 | receipt qty 1 on RecusaParcial = 201 | POST skipped | no HTTP | BLOCKED |
| C30 | loss qty 1 on RecusaParcial = 201 | POST skipped | no HTTP | BLOCKED |
| C31 | receipt without token = 401 | POST skipped | no HTTP | BLOCKED |
| C32 | loss without token = 401 | POST skipped | no HTTP | BLOCKED |
| C33 | receipt unknown item = 404 | POST skipped | no HTTP | BLOCKED |
| C34 | loss unknown item = 404 | POST skipped | no HTTP | BLOCKED |
| C35 | receipt on Cancelada/Finalizada = 409 via `COMPRA_FINALIZADA_ID`/`ITEM_FINALIZADA_ID` | POST skipped | no HTTP; fixture ids unused because API never started | BLOCKED |
| C36 | loss on Cancelada/Finalizada = 409; not RecusaEmD timeline | POST skipped | no HTTP | BLOCKED |
| C37 | `t` before `DataDevolucao` ignores DA (RecusaEmD, no compensação yet) | curl not run | no HTTP | BLOCKED |
| C38 | `t` on/after `DataDevolucao` includes DA (still before compensação) | curl not run | no HTTP | BLOCKED |
| C39 | compensação at D+1 restores 10, no stock | curl not run; compensação POST not issued | no HTTP | BLOCKED |
| C40 | `CompraReembolso` does not change vigente membership/cards | curls not run | no HTTP | BLOCKED |
| C41 | feature diff has no UPDATE/DELETE on event tables | `git diff origin/main...HEAD --name-only`; `rg "UPDATE \|DELETE FROM"` on `*.sql` / `*Migration*` | no `src/.../Migrations` path in feature files; only SQL in diff is `docs/diagnosticos/compras-devolucoes-transito-auditoria.sql` (SELECT + `BEGIN` READ ONLY); no `UPDATE ` / `DELETE FROM` on `compras`, `compra_items`, `compra_item_recebimentos`, `compra_item_perdas`, `compra_item_devolucoes`, `compra_item_devolucao_compensacoes` | PASS |
| C42 | no EF migration, no persisted pendency column, no mass status rewrite | `git diff --name-only origin/main...HEAD -- src/Amani.ImportadosERP.Infra.Data/Migrations` empty; C22 enum | empty migration name-only; six `CompraStatus` members as C22 | PASS |
| C43 | production 12/10/61/liquid 0 + isolated RecusaTotal dashboard 0 | production SQL not executed; isolated HTTP/roteiro not run | no production credentials invented | BLOCKED |
| C44 | revert is code-only | same empty migration diff as C42 | `git diff --name-only origin/main...HEAD -- src/Amani.ImportadosERP.Infra.Data/Migrations` produced no files | PASS |
| C45 | production validation of C43 performs no writes | this session issued no production HTTP/SQL writes; `auditoria.sql` not executed (no production `DATABASE_URL`) | `compras-devolucoes-transito-auditoria.sql:7` `BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY`; `:71` `ROLLBACK`; env `DATABASE_URL` unset | PASS |

Counts: **6 PASS** (C6, C22, C41, C42, C44, C45) · **0 FAIL** · **40 BLOCKED** · **0 NOT RUN**.

## Coverage

Recomputed from PLAN `Surface`/`Landing` and from `enum CompraStatus` / `PrecoVenda` in code, not from the author's table copied back.

| Set (size) | Recomputed from | Member -> proof | Unproven |
| --- | --- | --- | --- |
| `GET /api/compras` statuses (2) | plan Surface | `200` C14 BLOCKED · `401` C15 BLOCKED | `200`, `401` |
| `GET /api/compras/{id}` statuses (4) | plan Surface | `200` C23 · `400` C24 · `401` C25 · `404` C26 all BLOCKED | `200`, `400`, `401`, `404` |
| `GET /api/compras/em-transito` statuses (2) | plan Surface | `200` C10 · `401` C16 both BLOCKED | `200`, `401` |
| `POST .../recebimentos` statuses (5) | plan Surface | C29/C27/C31/C33/C35 all BLOCKED | `201`, `400`, `401`, `404`, `409` |
| `POST .../perdas` statuses (5) | plan Surface | C30/C28/C32/C34/C36 all BLOCKED | `201`, `400`, `401`, `404`, `409` |
| Landing doors (3) | plan Landing | derived pendency C1 BLOCKED · `DevolvidaAntesDoRecebimento` C17 BLOCKED · `PossuiPendenciaVigente` C14 BLOCKED | all 3 |
| `CompraStatus` members (6) | `Compra.cs:169` | C22 table-driven over all 6 | - |
| Recusa / trânsito shapes (5) | checks fixture table | C3/C4/C19/C7/C39 all BLOCKED | total, parcial, multi-item, posterior, compensação |
| RecusaTotal UI (2) | plan Observable + C46 | list C46 BLOCKED · detail C46 BLOCKED | list, detail |
| Temporal `t` (3) | plan AC 22–24 | C37 → C38 → compensação → C39 all BLOCKED | before, on/after, after compensação |
| AC 5 `PrecoVenda` (1) | C6 static `rg` at HEAD | C6 PASS | - |
| Pendency consumers (7) | plan Flow | C2/C10/C11/C14/C23/C27/C28 BLOCKED | all 7 |
| Cards and patrimônio (3) | plan AC 4/5/2 | C4/C5 BLOCKED · C6 PASS (null-price path) · C8 BLOCKED | custo, venda card HTTP, patrimônio |
| Audit 12×61 (1) | plan AC 28 | C43 BLOCKED | C43 |
| Production write ban (1) | plan AC 26 / C45 | C45 PASS (session + SQL artifact; script not run on production) | - |
| `GET /api/compras/produtos-pendentes` statuses (2) | plan Observable (no Surface row) | `200` C11 BLOCKED · `401` no check | `200`, `401` |

## Test policy rows

| Row | Files it classifies | Required proof | Expectation met |
| --- | --- | --- | --- |
| Decides, reached across a boundary | `DashboardOperacionalRepository.cs`, `ObterComprasEmTransitoQueryHandler.cs`, `ObterListaComprasQueryHandler.cs`, `CompraMapper.cs`, `CompraItem.cs`/`CompraService.cs`, `frontend/src/app/compras/page.tsx`, `purchase-list.tsx`/`purchase-detail.tsx` | one HTTP/UI at the boundary and one SQL/`rg` of the same claim | not met — HTTP/UI/SQL named proofs did not run; C6/C22 `rg` only cover PrecoVenda and enum |
| Decides, not reached across a boundary | `CompraPendenciaLogistica` four-term formula; C6 PrecoVenda; C22 enum | one SQL/`rg` at own layer | partial — C22 and C6 `rg` met; C1 SQL not executed |
| Entry point that decides nothing | `ComprasController` 400/404/409 mapping | one at the boundary | not met — C24/C26/C27/C35 HTTP not run |
| Instrumentation, pass-throughs | `ComprasController` | none of its own | yes — covered by consumer proofs when those run; none ran |

Level gap (carried): C1's named proof is diagnostic SQL, independent of `CompraPendenciaLogistica.Calcular`. Dashboard HTTP (C2) is the application-level covering proof and was not run.

## Faults injected

Worktree `.verify-f028-r3` at `393746d`, then `git worktree remove --force`. Real-tree porcelain matched the pre-injection baseline (`M` specs/plan/checks, `M` `frontend/tsconfig.tsbuildinfo`, `??` `.specs/`, `??` `verification.md`). Application files in the real tree were not mutated. HTTP mutants were not required because those proofs never ran.

| Mutation | Location | Killed |
| --- | --- | --- |
| `public decimal PrecoVenda` → `public decimal? PrecoVenda` | scratch `Produto.cs` | yes — named `rg "public decimal PrecoVenda"` no longer hits; `decimal?` visible |
| add `CompraStatus.Devolvida` (7th member) | scratch `Compra.cs` enum | yes — C22 `rg` showed `Cancelada,` plus `Devolvida` |
| HTTP/UI/SQL mutants (C1–C5, C9 membership, C35/C36, RecusaEmD) | not injected | covering proofs BLOCKED by Docker gate — not scored as surviving |

## Swept existing (re-read)

Carried from round 2 at `393746d` except C22 enum re-read this round:

- F027 `OperacaoId` unique and at-most-one compensação still in mappings (existing, not re-proven by HTTP).
- Global `AuthorizeFilter` still present; 401 checks still BLOCKED.
- Unfiltered Compras 30-day window still present (AC 11).
- `CompraItem.QuantidadePendente` remains `Q - R - P`; live GET em-transito uses the handler.

## Ranked gaps

1. 40 checks BLOCKED — Docker identity gate (`com.docker.service` Stopped; `docker version`/`docker ps` hung 8s). Isolated HTTP/SQL/UI and production READ ONLY C43 did not run. Environment, not a demonstrated formula regression.
2. Test policy / level gap — C1 SQL cannot kill a C# formula mutant until the isolated DB exists; dashboard/list/write claims have no executed boundary proof at this HEAD.
3. Coverage set `GET /api/compras/produtos-pendentes` `401` has no check (Observable names it). Artifact gap, not an implementation FAIL.
4. `dotnet build` not reproduced — `NU1301` Mongeral 401. Env. C14 stays BLOCKED.

## Residual risks

- Production 12×61 not remeasured at HEAD.
- Dead `CompraService` transit methods still ignore DA if anything calls them.
- PLAN assumption “no clamp” (`Math.Max(0, …)` on DTO quantities) remains unconfirmed.
- RecusaEmD timeline C37→C38→compensação→C39 and C35/C36 Finalizada ids were never exercised.

## Ready for code-review?

VERIFY is incomplete (40 env BLOCKED). **0 FAIL of implementation** from static proofs that the checks name. Diff-only code-review of `9c0bcb3..393746d` is possible. Do not treat F028 as VERIFY-complete, do not merge on this report, do not mark the Roadmap complete, and do not start BUILD. A later round still owes the isolated-copy identity gate on `127.0.0.1:55432` and the HTTP/UI/SQL proofs (including C46 roteiro and RecusaEmD order).

## Gate

- Docker: `com.docker.service` Stopped; `docker version` hung 8s; `docker ps` hung 8s; no `amani-f028-pg`
- `npm --prefix frontend run typecheck` — exit 0 (does not settle C9)
- `dotnet build Amani_ImportadosERP.sln --no-restore --configuration Release` — exit 1 (`NU1301`)
- production: no writes; `auditoria.sql` not executed
- application tree: unchanged at `393746d`
- C6/C22/C41/C42/C44/C45 re-run this round at `393746d`
- `python .codex/skills/tlc-spec-lean/scripts/validate_verification.py specs/028-consistencia-devolucoes-transito` — expected exit 1
