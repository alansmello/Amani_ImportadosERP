# Consistência de devoluções em trânsito checks

Profile: standard
Plan: `specs/028-consistencia-devolucoes-transito/plan.md`

46 checks in 6 slices · 3 one-way doors · 0 open, of which 0 block

Provas autorizadas: `dotnet build Amani_ImportadosERP.sln`, `npm --prefix frontend run lint`, `npm --prefix frontend run typecheck`, `npm --prefix frontend run build`, HTTP na **cópia isolada**, roteiro manual na cópia, SQL somente leitura com `ROLLBACK`. Produção: só o SQL de auditoria em transação `READ ONLY`. Nenhum `dotnet test` novo, nenhum projeto de teste, nenhum framework de teste.

Os ids `C1`…`C46` são só o heading `**Cx**`. Esta skill não tem runner que aceite `--name`. Cada `Proof:` é o comando ou o roteiro a executar como está escrito.

Ambiente HTTP (PowerShell, cópia isolada): `$env:API`, `$env:TOKEN`, `$env:COMPRA_RECUSA_TOTAL_ID`, `$env:ITEM_RECUSA_TOTAL_ID`, `$env:COMPRA_RECUSA_PARCIAL_ID`, `$env:ITEM_RECUSA_PARCIAL_ID`, `$env:COMPRA_MULTI_ID`, `$env:ITEM_MULTI_A_ID`, `$env:ITEM_MULTI_B_ID`, `$env:COMPRA_POSTERIOR_ID`, `$env:ITEM_POSTERIOR_ID`, `$env:RECEBIMENTO_POSTERIOR_ID`, `$env:COMPRA_RECUSA_EM_D_ID`, `$env:ITEM_RECUSA_EM_D_ID`, `$env:DEVOLUCAO_RECUSA_EM_D_ID`, `$env:COMPRA_FINALIZADA_ID`, `$env:ITEM_FINALIZADA_ID`, `$env:DATA_COMPRA_RECUSA_EM_D`, `$env:DATA_D_MINUS_1`, `$env:DATA_D`, `$env:DATA_D_PLUS_1`, `$env:DATABASE_URL` (cópia) e, só para C43/C45, a sessão SQL de produção já usada na auditoria.

Fixture HTTP recorrente, sem ajustes comerciais, custo unitário R$ 100,00, um produto com `PrecoVenda` R$ 150,00. Não existe fixture HTTP de produto sem `PrecoVenda` (C6 é prova estática).

| Nome | Eventos | Pendência vigente |
| --- | --- | ---: |
| RecusaTotal | Q=10, DA=10, R=0, P=0 | 0 |
| RecusaParcial | Q=10, DA=4, R=0, P=0 | 6 até C40; C29/C30 depois mutam |
| MultiItem | item A Q=5 DA=5; item B Q=5 DA=0 | 5 (só B) |
| PosteriorSemDupla | Q=10, receber 4, devolver posteriormente essas 4, DA=0 | 6 (posterior não entra em `DA(t)`) |
| RecusaEmD | Q=10, R=0, P=0, DA=10 com `DataDevolucao`=D, sem compensação até depois de C38 | 10 se t<D; 0 se t≥D e vigente |
| Finalizada | Q=1, P=1, R=0, DA=0 → `status=Finalizada` | 0 |

PosteriorSemDupla não pode ser substituída por Q=6 sem devolução: o ponto é R=4 + devolução `DepoisDoRecebimento`=4 e pendência final 6.

Não há API que grave `CompraStatus.Cancelada`. C35/C36 usam a compra Finalizada e o item **dessa** compra (`COMPRA_FINALIZADA_ID` / `ITEM_FINALIZADA_ID`). Não reutilizar `ITEM_RECUSA_PARCIAL_ID`.

## Checks

### S1 - Cards de trânsito · 5 files · 45 KB · ~11k

**C1** - Vigente pendency at `t` equals `Q - R(t) - P(t) - DA(t)` (AC 1)
Proof: `psql "$env:DATABASE_URL" -v ON_ERROR_STOP=1 -f docs/diagnosticos/compras-devolucoes-transito-auditoria.sql` on the isolated copy that contains RecusaParcial; that item has `pendencia_liquida_bruta = 6`

**C2** - `GET /api/dashboard-gerencial/operacional` and `GET /api/dashboard-gerencial/financeiro` at `t` include only quantities with vigente pendency > 0 (AC 2)
Proof: `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/dashboard-gerencial/operacional"`
Proof: `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/dashboard-gerencial/financeiro"`
Expect RecusaTotal to add 0 to `quantidadePendente` and to both transit amounts

**C3** - Recusa total before receipt (Q=10, DA=10, R=0, P=0) contributes 0 units and 0.00 to both transit cards (AC 3)
Proof: `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/dashboard-gerencial/operacional"` on isolated copy whose only extra transit fixture is RecusaTotal; `quantidadePendente`, `valorAoCusto` and `valorAoPrecoVenda` contributions of that purchase are 0, 0.00 and 0.00

**C4** - Recusa parcial Q=10 DA=4 with no receipt/loss values the cost card at 600.00, not 1000.00, via the F026 rateio of 6/10 (AC 4)
Proof: `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/dashboard-gerencial/operacional"` on isolated copy with RecusaParcial as the only extra transit fixture; `valorAoCusto` contribution is 600.00

**C5** - Recusa parcial of C4 values the sale card at 6 × 150.00 = 900.00 (AC 2, valor a venda)
Proof: `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/dashboard-gerencial/operacional"` on isolated copy with RecusaParcial as the only extra transit fixture; `valorAoPrecoVenda` contribution is 900.00

**C6** - A live `Produto` cannot be created or updated without a non-negative `PrecoVenda`, so the isolated copy cannot seed the HTTP fixture “pending item with null `PrecoVenda`”. AC 5 still holds: the dashboard maps a missing product join to null sale-price transit and fills `motivoValorAoPrecoVendaIndisponivel` instead of inventing a price. `PrecoVenda = 0` is valid and would contribute `0.00`, not null. (AC 5)
Proof: `rg "public decimal PrecoVenda" -A 2 src/Amani.ImportadosERP.Domain/Entities/Produto.cs src/Amani.ImportadosERP.Application/DTOs/CriarProdutoDto.cs src/Amani.ImportadosERP.Application/DTOs/AtualizarProdutoDto.cs` — property is `decimal`, not `decimal?`
Proof: `rg "precoVenda < 0" src/Amani.ImportadosERP.Domain/Entities/Produto.cs` — constructor/`Atualizar` reject negatives and accept 0
Proof: `rg "PrecoVenda = produto == null" -A 1 src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardOperacionalRepository.cs` plus the `motivoVenda ??=` string in the same method — null sale value only on missing product join, never a fabricated price

**C7** - PosteriorSemDupla (Q=10, R=4, devolução posterior das mesmas 4, DA=0) keeps vigente pendency 6: the posterior return is not subtracted again (AC 6)
Proof: `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/dashboard-gerencial/operacional"` on isolated copy with PosteriorSemDupla as the only extra transit fixture; `quantidadePendente` contribution is 6 and `valorAoCusto` contribution is 600.00. A Q=6 purchase with no return does not prove this.

**C8** - Patrimônio realista adds the corrected cost transit; potencial adds the corrected sale transit (AC 2)
Proof: `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/dashboard-gerencial/financeiro"` on isolated copy with RecusaParcial as the only extra transit fixture; `valorTotalRealista` includes 600.00 and `valorTotalPotencial` includes 900.00

### S2 - Filtro e listagens de trânsito · 6 files · 36 KB · ~9k

**C9** - Compras filter "Em trânsito" lists only purchases with at least one item whose vigente pendency > 0 (AC 7)
Proof: roteiro on isolated-copy `/compras` with filter status Em transito: RecusaTotal is absent; RecusaParcial is present
Proof: `npm --prefix frontend run typecheck`

**C10** - `GET /api/compras/em-transito` returns 200, the same membership as C9, omits items with vigente pendency 0, and sets `valorPendenteCusto` from the vigente quantity (AC 8)
Proof: `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/compras/em-transito"` RecusaTotal absent; RecusaParcial present with item `quantidadePendente=6` and `valorPendenteCusto=600.00`

**C11** - `GET /api/compras/produtos-pendentes` returns only items with vigente pendency > 0 (AC 9)
Proof: `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/compras/produtos-pendentes"` RecusaTotal item absent; RecusaParcial item `quantidadePendente=6`

**C12** - A purchase with vigente pendency 0 on every item is absent from the Em trânsito filter, `GET /api/compras/em-transito` and `GET /api/compras/produtos-pendentes` (AC 10)
Proof: C9 roteiro plus the two curls of C10 and C11; RecusaTotal absent from all three

**C13** - The unfiltered Compras 30-day window remains a list window and is not the patrimonial `t` (AC 11)
Proof: roteiro on isolated-copy unfiltered `/compras` still restricts to the last 30 days while `GET /api/dashboard-gerencial/operacional` uses period end as `t`

**C14** - `GET /api/compras` returns 200 and `possuiPendenciaVigente=true` iff at least one item has vigente pendency > 0 (AC 12)
Proof: `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/compras"` RecusaTotal `possuiPendenciaVigente=false` with persisted `status=EmTransito`; RecusaParcial `possuiPendenciaVigente=true`
Proof: `dotnet build Amani_ImportadosERP.sln --no-restore --configuration Release`

**C15** - `GET /api/compras` without a token returns 401
Proof: `curl.exe -sS -o NUL -w "%{http_code}" "$env:API/api/compras"` equals 401

**C16** - `GET /api/compras/em-transito` without a token returns 401
Proof: `curl.exe -sS -o NUL -w "%{http_code}" "$env:API/api/compras/em-transito"` equals 401

### S3 - Identificação lista/detalhe · 4 files · 32 KB · ~8k

**C17** - Recusa total before any receipt returns `situacaoLogisticaDevolucao=DevolvidaAntesDoRecebimento` and `descricaoSituacaoLogisticaDevolucao=Devolvida antes do recebimento` on list and detail (AC 13)
Proof: `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/compras"`
Proof: `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/compras/$env:COMPRA_RECUSA_TOTAL_ID"`

**C18** - Recusa parcial with remainder > 0 returns `situacaoLogisticaDevolucao=ParcialmenteDevolvida` and `descricaoSituacaoLogisticaDevolucao=Parcialmente devolvida` (AC 14)
Proof: `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/compras"`
Proof: `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/compras/$env:COMPRA_RECUSA_PARCIAL_ID"`

**C19** - Multi-item: item A DA=Q and item B pending keeps the purchase in transit for B only and does not use `DevolvidaAntesDoRecebimento` at purchase level (AC 15)
Proof: `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/compras/$env:COMPRA_MULTI_ID"` item A `quantidadePendente=0`, item B `quantidadePendente=5`, purchase `situacaoLogisticaDevolucao=ParcialmenteDevolvida`
Proof: `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/compras/em-transito"` contains `$env:COMPRA_MULTI_ID` with only B

**C20** - `GET /api/compras` and `GET /api/compras/{id}` at the same `t` agree on membership and `situacaoLogisticaDevolucao` (AC 16)
Proof: the C17 and C18 curls; list `possuiPendenciaVigente` matches detail item sum > 0; both `situacaoLogisticaDevolucao` codes equal

**C21** - When pendency is 0 only because of anterior returns and there is no receipt, list and detail JSON `status` is not `Recebida` (AC 17)
Proof: `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/compras"` and `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/compras/$env:COMPRA_RECUSA_TOTAL_ID"` both return persisted `status=EmTransito`

**C46** - When a RecusaTotal purchase is present on a list or detail surface that returns it, that surface shows "Devolvida antes do recebimento" as the operational situation and does not show "Em transito" / "Em trânsito" as the current badge or situation while `possuiPendenciaVigente=false`; the JSON `status` field may remain `EmTransito`. Absence from the unfiltered `/compras` 30-day transit window is not a defect (AC 11, AC 13)
Proof: roteiro isolated-copy `/compras` on a listing that includes RecusaTotal because it uses `GET /api/compras` (date, supplier, or any active filter other than the default transit window): operational situation text is `Devolvida antes do recebimento`; no situation/status badge on that row equals `Em transito` or `Em trânsito`
Proof: roteiro isolated-copy `/compras/$env:COMPRA_RECUSA_TOTAL_ID`: same operational situation text; no current-status badge equals `Em transito` or `Em trânsito`
Proof: C21 curls still return `status=EmTransito` and `possuiPendenciaVigente=false`

C46 was rewritten after VERIFY round 1 on 2026-09-20. The previous fixture required RecusaTotal visible on unfiltered `/compras` (“clear the filter and it remains in the general list”). That exceeded the approved business rule and AC 7/10/11/13. The rewrite restores the visual proof on surfaces that actually return the purchase. It is not a BUILD miss of a valid requirement.

**C22** - `enum CompraStatus` members stay exactly `Criada`, `EmTransito`, `ParcialmenteRecebida`, `Recebida`, `Finalizada`, `Cancelada`; no member for devolução/recusa (AC 18)
Proof: `rg "enum CompraStatus" -A 8 src/Amani.ImportadosERP.Domain/Entities/Compra.cs` table-driven over all 6 members, no seventh name

**C23** - `GET /api/compras/{id}` of an existing purchase returns 200 (AC 16)
Proof: `curl.exe -sS -o NUL -w "%{http_code}" -H "Authorization: Bearer $env:TOKEN" "$env:API/api/compras/$env:COMPRA_RECUSA_PARCIAL_ID"` equals 200

**C24** - `GET /api/compras/00000000-0000-0000-0000-000000000000` returns 400
Proof: `curl.exe -sS -o NUL -w "%{http_code}" -H "Authorization: Bearer $env:TOKEN" "$env:API/api/compras/00000000-0000-0000-0000-000000000000"` equals 400

**C25** - `GET /api/compras/{id}` without a token returns 401
Proof: `curl.exe -sS -o NUL -w "%{http_code}" "$env:API/api/compras/$env:COMPRA_RECUSA_PARCIAL_ID"` equals 401

**C26** - `GET /api/compras/{id}` for an unknown id returns 404
Proof: `curl.exe -sS -o NUL -w "%{http_code}" -H "Authorization: Bearer $env:TOKEN" "$env:API/api/compras/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"` equals 404

### S4 - Recebimento e perda · 2 files · 44 KB · ~11k

**C27** - `POST /api/compras/{compraId}/itens/{itemId}/recebimentos` with quantidade 1 on RecusaTotal returns 400 `{ error }` containing `exceder` and persists no `CompraItemRecebimento` and no `EstoqueMovimentacao` (AC 19)
Proof: `curl.exe -sS -w "%{http_code}" -H "Authorization: Bearer $env:TOKEN" -H "Content-Type: application/json" -d "{\"quantidade\":1}" "$env:API/api/compras/$env:COMPRA_RECUSA_TOTAL_ID/itens/$env:ITEM_RECUSA_TOTAL_ID/recebimentos"` HTTP 400; counts of recebimento and estoque unchanged

**C28** - `POST /api/compras/{compraId}/itens/{itemId}/perdas` with quantidade 1 on RecusaTotal returns 400 `{ error }` containing `exceder` and persists no `CompraItemPerda` (AC 20)
Proof: `curl.exe -sS -w "%{http_code}" -H "Authorization: Bearer $env:TOKEN" -H "Content-Type: application/json" -d "{\"quantidade\":1,\"motivo\":\"Perda\"}" "$env:API/api/compras/$env:COMPRA_RECUSA_TOTAL_ID/itens/$env:ITEM_RECUSA_TOTAL_ID/perdas"` HTTP 400; perda count unchanged

**C29** - `POST /api/compras/{compraId}/itens/{itemId}/recebimentos` with quantidade 1 on RecusaParcial (vigente 6) returns 201 (AC 21)
Proof: `curl.exe -sS -o NUL -w "%{http_code}" -H "Authorization: Bearer $env:TOKEN" -H "Content-Type: application/json" -d "{\"quantidade\":1}" "$env:API/api/compras/$env:COMPRA_RECUSA_PARCIAL_ID/itens/$env:ITEM_RECUSA_PARCIAL_ID/recebimentos"` equals 201

**C30** - `POST /api/compras/{compraId}/itens/{itemId}/perdas` with quantidade 1 on RecusaParcial (vigente 6) returns 201 (AC 21)
Proof: `curl.exe -sS -o NUL -w "%{http_code}" -H "Authorization: Bearer $env:TOKEN" -H "Content-Type: application/json" -d "{\"quantidade\":1,\"motivo\":\"Perda\"}" "$env:API/api/compras/$env:COMPRA_RECUSA_PARCIAL_ID/itens/$env:ITEM_RECUSA_PARCIAL_ID/perdas"` equals 201

**C31** - `POST /api/compras/{compraId}/itens/{itemId}/recebimentos` without a token returns 401
Proof: `curl.exe -sS -o NUL -w "%{http_code}" -H "Content-Type: application/json" -d "{\"quantidade\":1}" -X POST "$env:API/api/compras/$env:COMPRA_RECUSA_PARCIAL_ID/itens/$env:ITEM_RECUSA_PARCIAL_ID/recebimentos"` equals 401

**C32** - `POST /api/compras/{compraId}/itens/{itemId}/perdas` without a token returns 401
Proof: `curl.exe -sS -o NUL -w "%{http_code}" -H "Content-Type: application/json" -d "{\"quantidade\":1,\"motivo\":\"Perda\"}" -X POST "$env:API/api/compras/$env:COMPRA_RECUSA_PARCIAL_ID/itens/$env:ITEM_RECUSA_PARCIAL_ID/perdas"` equals 401

**C33** - `POST /api/compras/{compraId}/itens/{itemId}/recebimentos` for an unknown item returns 404
Proof: `curl.exe -sS -o NUL -w "%{http_code}" -H "Authorization: Bearer $env:TOKEN" -H "Content-Type: application/json" -d "{\"quantidade\":1}" "$env:API/api/compras/$env:COMPRA_RECUSA_PARCIAL_ID/itens/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/recebimentos"` equals 404

**C34** - `POST /api/compras/{compraId}/itens/{itemId}/perdas` for an unknown item returns 404
Proof: `curl.exe -sS -o NUL -w "%{http_code}" -H "Authorization: Bearer $env:TOKEN" -H "Content-Type: application/json" -d "{\"quantidade\":1,\"motivo\":\"Perda\"}" "$env:API/api/compras/$env:COMPRA_RECUSA_PARCIAL_ID/itens/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/perdas"` equals 404

**C35** - `POST /api/compras/{compraId}/itens/{itemId}/recebimentos` on a `Cancelada` or `Finalizada` purchase returns 409. Isolated copy uses a `Finalizada` purchase (perda total); there is no write API for `Cancelada`. The item must belong to that purchase.
Proof: `curl.exe -sS -o NUL -w "%{http_code}" -H "Authorization: Bearer $env:TOKEN" -H "Content-Type: application/json" -d "{\"quantidade\":1}" "$env:API/api/compras/$env:COMPRA_FINALIZADA_ID/itens/$env:ITEM_FINALIZADA_ID/recebimentos"` equals 409

**C36** - `POST /api/compras/{compraId}/itens/{itemId}/perdas` on a `Cancelada` or `Finalizada` purchase returns 409. Same Finalizada fixture as C35; this check is not part of the RecusaEmD timeline.
Proof: `curl.exe -sS -o NUL -w "%{http_code}" -H "Authorization: Bearer $env:TOKEN" -H "Content-Type: application/json" -d "{\"quantidade\":1,\"motivo\":\"Perda\"}" "$env:API/api/compras/$env:COMPRA_FINALIZADA_ID/itens/$env:ITEM_FINALIZADA_ID/perdas"` equals 409

### S5 - Tempo, compensação e reembolso · 3 files · 28 KB · ~7k

**C37** - When `t` is strictly before `DataDevolucao` of an anterior return, that return is ignored in `DA(t)` (AC 22). RecusaEmD already has DA dated D; compensação has **not** run. C36 is not this step. `DashboardFiltroService` requires `dataInicial` and `dataFinal` together; `t` is the period end. This proof pairing is a correction of an invalid single-`dataFinal` URL, not a product-requirement change.
Proof: `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/dashboard-gerencial/operacional?dataInicial=$env:DATA_COMPRA_RECUSA_EM_D&dataFinal=$env:DATA_D_MINUS_1"` on isolated copy with RecusaEmD as the only extra transit fixture; contribution 10 units / 1000.00

**C38** - When `t` is on or after `DataDevolucao` and the return is vigente, it is included in `DA(t)` (AC 23). Same RecusaEmD row as C37; still **before** compensação. Same paired-date proof as C37.
Proof: `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/dashboard-gerencial/operacional?dataInicial=$env:DATA_COMPRA_RECUSA_EM_D&dataFinal=$env:DATA_D"` on isolated copy with RecusaEmD as the only extra transit fixture; contribution 0

After C38, POST compensação of `$env:DEVOLUCAO_RECUSA_EM_D_ID` with `dataCompensacao` = `$env:DATA_D_PLUS_1` and `presencaFisicaConfirmada=true`.

**C39** - Compensating that anterior return at D+1 restores pendency 10 without creating stock (AC 24). Same paired-date proof as C37.
Proof: `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/dashboard-gerencial/operacional?dataInicial=$env:DATA_COMPRA_RECUSA_EM_D&dataFinal=$env:DATA_D_PLUS_1"` after the compensação above; RecusaEmD still the only extra transit fixture; contribution 10 units / 1000.00 and zero new `EstoqueMovimentacao`

**C40** - Creating, omitting or cancelling a `CompraReembolso` leaves vigente pendency, membership and both cards unchanged (AC 25)
Proof: `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/dashboard-gerencial/operacional"` and `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/compras"` before and after refund on RecusaParcial; cards stay 6 / 600.00 / 900.00 and `possuiPendenciaVigente=true`

### S6 - Produção e regressão 12/61 · 2 files · 8 KB · ~2k

**C41** - The feature diff contains no `UPDATE` or `DELETE` against `compras`, `compra_items`, `compra_item_recebimentos`, `compra_item_perdas`, `compra_item_devolucoes` or `compra_item_devolucao_compensacoes` (AC 26)
Proof: `git diff origin/main...HEAD --name-only`
Proof: `rg "UPDATE |DELETE FROM" -g "*.sql" -g "*Migration*"` empty on those tables

**C42** - The feature adds no EF migration, no persisted pendency column and no mass status rewrite (AC 27)
Proof: `git diff --name-only origin/main...HEAD -- src/Amani.ImportadosERP.Infra.Data/Migrations` empty
Proof: `rg "enum CompraStatus" -A 8 src/Amani.ImportadosERP.Domain/Entities/Compra.cs` same six members as C22

**C43** - Production READ ONLY audit still finds 12 items, 10 purchases, 61 units and liquid pendency 0 on those rows; it does not prove each row's contribution to the aggregated Dashboard cards. Isolated-copy fixtures with the same event shape (R=0, P=0, posterior vigente=0, DA vigente=Q) prove Dashboard contribution 0, absence from `em-transito` and the Em trânsito filter, and detail pendency 0 (AC 28)
Proof: on production, execute `docs/diagnosticos/compras-devolucoes-transito-auditoria.sql` as written (`BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY` … `ROLLBACK`); assert 12 items, 10 distinct `CompraId`, 61 units of `quantidade_diferenca_pendencia`, and `pendencia_liquida` = 0 on those 12. Do not treat `GET /api/dashboard-gerencial/operacional` production totals as a per-item proof of these 12 rows
Proof: on isolated copy, seed only RecusaTotal-shaped fixtures (same event shape as the 12, not the production ids); `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/dashboard-gerencial/operacional"` contribution 0; `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/compras/em-transito"` omits them; roteiro filter "Em trânsito" omits them; `curl.exe -sS -H "Authorization: Bearer $env:TOKEN" "$env:API/api/compras/$env:COMPRA_RECUSA_TOTAL_ID"` `quantidadePendente=0`
Proof: any post-deploy production check of these 12 rows stays the same READ ONLY SQL; no production HTTP write

**C44** - Reverting this application version leaves stored events unchanged (AC 29)
Proof: `git diff origin/main...HEAD -- src/Amani.ImportadosERP.Infra.Data/Migrations` empty, so revert is code-only

**C45** - Production validation of C43 performs no POST, PUT, PATCH, DELETE or `UPDATE` against production data
Proof: the production execution of `docs/diagnosticos/compras-devolucoes-transito-auditoria.sql` starts with `BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY` and ends with `ROLLBACK`; no HTTP write is issued against production

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| `GET /api/compras` statuses (2) | `200` C14 · `401` C15 | - |
| `GET /api/compras/{id}` statuses (4) | `200` C23 · `400` C24 · `401` C25 · `404` C26 | - |
| `GET /api/compras/em-transito` statuses (2) | `200` C10 · `401` C16 | - |
| `POST /api/compras/{compraId}/itens/{itemId}/recebimentos` statuses (5) | `201` C29 · `400` C27 · `401` C31 · `404` C33 · `409` C35 | - |
| `POST /api/compras/{compraId}/itens/{itemId}/perdas` statuses (5) | `201` C30 · `400` C28 · `401` C32 · `404` C34 · `409` C36 | - |
| Landing doors (3) | derived pendency C1 · `DevolvidaAntesDoRecebimento` C17 · `PossuiPendenciaVigente` C14 | - |
| `CompraStatus` members (6) | C22, table-driven over all 6 | - |
| Recusa / trânsito shapes (5) | total C3 · parcial C4 · multi-item C19 · posterior no double C7 · compensação C39 | - |
| RecusaTotal UI (2) | list C46 · detail C46 | - |
| Temporal `t` (3) | before DA date C37 · on/after DA date C38 · after compensação C39 | - |
| AC 5 `PrecoVenda` (1) | C6 static (HTTP null-price fixture unreachable) | - |
| Pendency consumers (7) | dashboard C2 · `em-transito` C10 · produtos-pendentes C11 · lista C14 · detalhe C23 · recebimento C27 · perda C28 | - |
| Cards and patrimônio (3) | custo C4 · venda C5 · patrimônio C8 | - |
| Audit 12×61 (1) | C43 | - |
| Production write ban (1) | C45 | - |

- Claims naming a status code, route or response shape: C10, C14, C15, C16, C23, C24, C25, C26, C27, C28, C29, C30, C31, C32, C33, C34, C35, C36 - each has a proof that crosses the HTTP boundary
- No other check claims more than the single case its proof exercises

## Test policy

The repo (F020–F027, roadmap 26/06/2026, CI `dotnet test` without a test project) says where builds live and that new test infra is unauthorized. It does not say which level proves a decision table. These rows are the bar this build runs under. Own-layer xUnit/NUnit projects are out of scope; the substitute for "own layer" is the read-only SQL four-term formula (independent of the C# consumers) plus `rg` on `enum CompraStatus`.

| Code | Required proofs | Coverage expectation |
| --- | --- | --- |
| Decides, reached across a boundary | one HTTP/UI at the boundary **and** one SQL/`rg` of the same claim | contract status and field at the boundary; one asserted fixture row per decision |
| Decides, not reached across a boundary | one SQL/`rg` at its own layer | one asserted case per row of the decision table |
| Entry point that decides nothing | one at the boundary | accepted input, each rejected input, each error path |
| Instrumentation, pass-throughs | none of its own | covered by its consumer's proof |

Evidence:

- `DashboardOperacionalRepository.ObterMercadoriasEmTransitoAsync`: decides membership and both card values over DA vs no-DA, 4 quantity terms, 2 valuation branches (custo rateio, venda × preço) -> decides, reached across `GET` dashboard
- `ObterComprasEmTransitoQueryHandler`: decides item inclusion and `ValorPendenteCusto` input quantity (FromEntity vs vigente) -> decides, reached across `GET /api/compras/em-transito`
- `ObterListaComprasQueryHandler`: decides `PossuiPendenciaVigente` and logistic tag including anterior returns -> decides, reached across `GET /api/compras`
- `CompraMapper.CalcularSituacaoLogisticaDevolucao`: dispatch over anterior/posterior/compensated quantities, 5+ codes -> decides
- `CompraItem.CalcularQuantidadePendente` / `CompraService` receipt and loss validation: boundary `quantidade > vigente` vs `<=` -> decides, reached across POST
- `frontend/src/app/compras/page.tsx` filter: `status === EmTransito` vs `possuiPendenciaVigente` -> decides, reached across the Compras screen
- `frontend/src/components/compras/purchase-list.tsx` and `purchase-detail.tsx`: decide which badge is the operational situation vs persisted `status` -> decides, reached across C46
- `ComprasController`: maps exceptions to 400/404/409, no formula -> instrumentation
- closest analogue in the repo: `CompraCalculoFinanceiro` (F026), same pure-policy shape, proven by HTTP/quickstart rather than a test project

Cost: 8 decision surfaces × (1 boundary + 1 SQL/`rg`) = 16 proofs across those files. Without these rows, Dashboard SQL, `FromEntity`, the list tag and the filter would be proven only by a path that happens to traverse them. CI `dotnet test` is not a proof of any check here: there is no test project and this feature will not add one.

## Swept

- validation: C27, C28
- failure modes: C27, C28 persist nothing on 400
- idempotency: existing - F027 `OperacaoId` unique on devolução; this feature adds no new write command
- authorization: C15, C16, C25, C31, C32
- concurrency: C35, C36
- data lifecycle: C41, C42, C44, C45
- dependency failure: n/a - no new external service
- state transitions: C21, C22, C46
- observability: n/a - no new log or metric requirement; `ComprasController` already logs devolução writes

## Handoff

Under the budget — one builder, no ask:

- S1 cards ~11k (DashboardOperacional + financeiro handler) · S2 membership ~9k (lista, em-transito, produtos-pendentes, `compras/page.tsx`) · S3 tags ~8k (CompraMapper, detail, C46 UI) · S4 writes ~11k (`CompraService`) · S5 temporal ~7k (same read path) · S6 preservation ~2k (`rg`/`git diff`) = ~48k across ~154 KB of existing files, under the 150k budget
- Mechanism: one builder

- **Boundary:** C1-C40 and C41-C45 closed at `4cdd77d`; C9, C12, C13 closed at `f3f47d6`; C46 spec corrected after VERIFY round 1 (2026-09-20) — unfiltered-list visibility dropped because it exceeded the approved business rule, not because BUILD missed a valid requirement
- **Corrective BUILD (performance, 2026-09-20):** `ObterMercadoriasEmTransitoAsync` restored the F026 SQL prefilter `Q - R(t) - P(t) > 0` to select candidate purchase ids before `ToListAsync`, then applies vigente `DA(t)`. Functional ACs 1–6 unchanged: RecusaTotal still enters the superset (`Q-R-P > 0`) and contributes 0 after `DA`.
- **Settled mid-build:** none
- **Abandoned:** unused `CompraService.ObterComprasEmTransitoAsync` was left as a compile-only fix; live GET uses `ObterComprasEmTransitoQueryHandler`
- **Technical debt (deferred, code-review 2026-09-20):** leftover `CompraService` transit methods still `Q-R-P`; N+1 `foreach` + `ObterPorCompraAsync` on list/em-transito/produtos-pendentes; DTO `Math.Max(0, …)` vs unclamped formula assumption; unused `CalcularStatusOperacional(obterQuantidadePendente)` hook; frontend `possuiPendenciaVigente?: boolean | null`
- **Spec correction (2026-09-20, isolated-copy runbook):** PosteriorSemDupla stays Q=10/R=4/posterior=4; RecusaEmD timeline is C37 → C38 → compensação → C39 (C36 is Finalizada 409, not temporal); C35/C36 use `COMPRA_FINALIZADA_ID`/`ITEM_FINALIZADA_ID`; C6 is static because a live product cannot have null `PrecoVenda`. Application code unchanged. Do not start BUILD from this rewrite.
- **Corrective BUILD (C35/C36, 2026-09-20):** `RegistrarRecebimentoItemAsync` / `RegistrarPerdaItemAsync` call `Compra.GarantirQueAceitaEventosLogisticos` before pendency validation, so Finalizada/Cancelada return 409 instead of the 400 `exceder` path.
- **Proof correction (C37–C39, 2026-09-20):** temporal GETs now send `dataInicial=$env:DATA_COMPRA_RECUSA_EM_D` with `dataFinal` as `t`. This fixes an invalid proof URL against existing `DashboardFiltroService` pairing. Product requirement and filter service are unchanged.

## Isolated-copy execution order

Dashboard proofs that name “only extra transit fixture” need that purchase as the only one with vigente pendency > 0 (Finalizada may coexist; RecusaTotal may coexist only when the claim is contribution 0). Recreate the container or truncate purchase tables between those groups. Do not run C29/C30/C40 until every RecusaParcial **read** has passed. Do not compensate RecusaEmD until C38 has passed.

1. Identity gate of `amani_f028` on `127.0.0.1:55432` (never 5433 / Neon).
2. Catalog + RecusaTotal. Exclusive: C3, C2 (zeros). RecusaTotal reads that do not need RecusaParcial: C12, C17, C21, C46, C27, C28.
3. Add RecusaParcial (leave RecusaTotal in place; it adds 0). C1, C4, C5, C8, C9–C11, C14, C18, C20, C23–C26, C31–C34. **Not** C29, C30, C40 yet.
4. Recreate transit data. Seed **only** PosteriorSemDupla (Q=10, POST recebimento 4, POST devolução `DepoisDoRecebimento` 4). C7.
5. Recreate transit data. Seed RecusaEmD with DA dated D, **no** compensação. Set `$env:DATA_COMPRA_RECUSA_EM_D` to that purchase `DataCompra`. C37 (`dataInicial=DATA_COMPRA_RECUSA_EM_D`, `dataFinal=D-1`) then C38 (`dataInicial` same, `dataFinal=D`). Then POST compensação. Then C39 (`dataInicial` same, `dataFinal=D+1`). C36 is not in this sequence.
6. Seed the combined read set: RecusaTotal, RecusaParcial, MultiItem, PosteriorSemDupla, Finalizada (Q=1 + perda 1). C19, C35, C36, remaining list/detail proofs that need several fixtures at once.
7. RecusaParcial still at vigente 6: C40 (reembolso). **Then** C29, **then** C30.
8. C41–C45 (`git` / production READ ONLY SQL). C6 any time (static `rg`).

Do not start BUILD until this checks.md is approved.
