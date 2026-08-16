-- F027 production baseline
-- Read-only script. Execute before and after the rehearsal migration on an
-- isolated production-like copy and compare every row returned by this file.
-- It intentionally avoids writes, locks beyond normal SELECT behavior, and any
-- dependency on F027 tables.

SELECT
    now() AT TIME ZONE 'UTC' AS captured_at_utc,
    current_database() AS database_name,
    current_user AS executed_by,
    version() AS postgres_version;

WITH legacy_counts AS (
    SELECT 'compras' AS table_name, count(*)::numeric AS metric_value FROM compras
    UNION ALL SELECT 'compra_items', count(*)::numeric FROM compra_items
    UNION ALL SELECT 'compra_item_recebimentos', count(*)::numeric FROM compra_item_recebimentos
    UNION ALL SELECT 'compra_item_perdas', count(*)::numeric FROM compra_item_perdas
    UNION ALL SELECT 'estoque_movimentacoes', count(*)::numeric FROM estoque_movimentacoes
    UNION ALL SELECT 'vendas', count(*)::numeric FROM vendas
    UNION ALL SELECT 'venda_items', count(*)::numeric FROM venda_items
    UNION ALL SELECT 'pagamentos_recebidos', count(*)::numeric FROM pagamentos_recebidos
    UNION ALL SELECT 'despesas', count(*)::numeric FROM despesas
    UNION ALL SELECT 'eventos_financeiros', count(*)::numeric FROM eventos_financeiros
)
SELECT 'count' AS metric_group, table_name, metric_value
FROM legacy_counts
ORDER BY table_name;

SELECT
    'compras_totais' AS metric_group,
    count(*)::numeric AS compras_count,
    coalesce(sum(c."Desconto"), 0)::numeric(18, 2) AS desconto_total,
    coalesce(sum(c."Acrescimo"), 0)::numeric(18, 2) AS acrescimo_total,
    coalesce(sum(i.item_total), 0)::numeric(18, 2) AS itens_total_bruto,
    (coalesce(sum(i.item_total), 0) - coalesce(sum(c."Desconto"), 0) + coalesce(sum(c."Acrescimo"), 0))::numeric(18, 2) AS compras_total_oficial_aproximado
FROM compras c
LEFT JOIN (
    SELECT
        "CompraId",
        sum(("Quantidade" * "CustoUnitario") - "Desconto" + "Acrescimo") AS item_total
    FROM compra_items
    GROUP BY "CompraId"
) i ON i."CompraId" = c."Id";

SELECT
    'logistica_compras' AS metric_group,
    coalesce(sum("Quantidade"), 0)::numeric AS quantidade_comprada,
    (SELECT coalesce(sum("Quantidade"), 0)::numeric FROM compra_item_recebimentos) AS quantidade_recebida,
    (SELECT coalesce(sum("Quantidade"), 0)::numeric FROM compra_item_perdas) AS quantidade_perdida
FROM compra_items;

SELECT
    'estoque_movimentacoes' AS metric_group,
    "Tipo",
    count(*)::numeric AS movimentos_count,
    coalesce(sum("Quantidade"), 0)::numeric(18, 4) AS quantidade_total,
    coalesce(sum("Quantidade" * coalesce("ValorUnitario", 0)), 0)::numeric(18, 2) AS valor_total
FROM estoque_movimentacoes
GROUP BY "Tipo"
ORDER BY "Tipo";

SELECT
    'financeiro_legacy' AS metric_group,
    (SELECT coalesce(sum("Valor"), 0)::numeric(18, 2) FROM pagamentos_recebidos) AS pagamentos_recebidos_total,
    (SELECT coalesce(sum("Desconto"), 0)::numeric(18, 2) FROM pagamentos_recebidos) AS descontos_recebidos_total,
    (SELECT coalesce(sum("Valor"), 0)::numeric(18, 2) FROM despesas) AS despesas_total,
    (SELECT coalesce(sum("Valor"), 0)::numeric(18, 2) FROM eventos_financeiros) AS eventos_financeiros_total;

SELECT
    'legacy_table_hash' AS metric_group,
    source.table_name,
    md5(string_agg(source.row_id, ',' ORDER BY source.row_id)) AS ordered_id_hash
FROM (
    SELECT 'compras' AS table_name, "Id"::text AS row_id FROM compras
    UNION ALL SELECT 'compra_items', "Id"::text FROM compra_items
    UNION ALL SELECT 'compra_item_recebimentos', "Id"::text FROM compra_item_recebimentos
    UNION ALL SELECT 'compra_item_perdas', "Id"::text FROM compra_item_perdas
    UNION ALL SELECT 'estoque_movimentacoes', "Id"::text FROM estoque_movimentacoes
    UNION ALL SELECT 'vendas', "Id"::text FROM vendas
    UNION ALL SELECT 'venda_items', "Id"::text FROM venda_items
    UNION ALL SELECT 'pagamentos_recebidos', "Id"::text FROM pagamentos_recebidos
    UNION ALL SELECT 'despesas', "Id"::text FROM despesas
    UNION ALL SELECT 'eventos_financeiros', "Id"::text FROM eventos_financeiros
) source
GROUP BY source.table_name
ORDER BY source.table_name;
