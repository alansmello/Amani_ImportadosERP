# F024 — Runbook de rollout e rollback lógico

## Estado e autorização

- A implementação pode ser validada localmente.
- A feature permanece `false` por padrão em `appsettings.json`.
- Produção só pode ser habilitada por configuração externa após aprovação dos gates deste documento.

## Pré-deploy

1. Confirmar backup restaurável e janela compatível com o tamanho de `estoque_movimentacoes`.
2. Executar `artifacts/f024-stock-fraction-baseline.sql` e guardar a saída.
3. Gerar/revisar `artifacts/f024-migration.sql`; rejeitar se houver `UPDATE`, `DELETE`, backfill ou default de apresentação.
4. Ensaiar a migration em clone da mesma versão do PostgreSQL e medir lock/duração.
5. Executar build backend, lint, typecheck e build frontend.

## Deploy com feature desligada

1. Aplicar a migration.
2. Publicar backend/frontend com `Features__ApresentacoesFracionadasEnabled=false`.
3. Reexecutar o baseline e confirmar:
   - mesmos hashes das colunas históricas;
   - mesmas contagens e saldos legados;
   - zero apresentações automáticas;
   - snapshots e razões antigas nulos.
4. Validar compra, recebimento, perda, venda legada, cancelamento, estoque e dashboard.

## Habilitação controlada

1. Definir `Features__ApresentacoesFracionadasEnabled=true` somente após aprovação.
2. Cadastrar Caixa 1/1, Ampola 1/4 e Dose 1/24 em produto de homologação.
3. Executar os cenários do `quickstart.md`, incluindo 4 vendas separadas de ampola e 24 de dose.
4. Confirmar saldo exato, custo/lucro proporcional, snapshot e cancelamento sem resíduo.

## Rollback

### Antes da primeira movimentação exata

- Desabilitar a feature.
- O schema expansivo pode permanecer; não há obrigação de executar `Down`.
- Reverter binário apenas se ele continuar compatível com `numeric(28,12)`.

### Depois da primeira movimentação exata

- Desabilitar imediatamente novas apresentações/vendas fracionadas.
- Manter binário capaz de ler razão e quantidade decimal.
- Não executar `Down`: a migration bloqueia reversão quando houver razão ou quantidade não inteira.
- Corrigir eventual saldo somente por movimentação compensatória auditável.
- Não restaurar backup sobre operações posteriores.

## Evidências obrigatórias

- Saída pré/pós do baseline.
- Tempo e lock da migration.
- Resultado dos cenários 1/1, 1/4, 1/24, cancelamento e legado.
- Aprovação nominal/data para habilitação.
