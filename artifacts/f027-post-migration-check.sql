-- F027 post-migration check
-- Read-only and idempotent. Execute only after applying the generated F027
-- migration on an isolated copy. Expected result: all checks return PASS.

WITH expected_tables(table_name) AS (
    VALUES
        ('compra_item_devolucoes'),
        ('compra_item_devolucao_compensacoes'),
        ('compra_reembolsos'),
        ('compra_reembolso_cancelamentos'),
        ('compra_reembolso_alocacoes')
),
actual_tables AS (
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
)
SELECT
    'expected_table_exists' AS check_name,
    e.table_name AS object_name,
    CASE WHEN a.table_name IS NULL THEN 'FAIL' ELSE 'PASS' END AS status
FROM expected_tables e
LEFT JOIN actual_tables a ON a.table_name = e.table_name
ORDER BY e.table_name;

SELECT
    'new_tables_start_empty' AS check_name,
    table_name AS object_name,
    row_count,
    CASE WHEN row_count = 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM (
    SELECT 'compra_item_devolucoes' AS table_name, count(*) AS row_count FROM compra_item_devolucoes
    UNION ALL SELECT 'compra_item_devolucao_compensacoes', count(*) FROM compra_item_devolucao_compensacoes
    UNION ALL SELECT 'compra_reembolsos', count(*) FROM compra_reembolsos
    UNION ALL SELECT 'compra_reembolso_cancelamentos', count(*) FROM compra_reembolso_cancelamentos
    UNION ALL SELECT 'compra_reembolso_alocacoes', count(*) FROM compra_reembolso_alocacoes
) counts
ORDER BY table_name;

WITH expected_tables(table_name) AS (
    VALUES
        ('compra_item_devolucoes'),
        ('compra_item_devolucao_compensacoes'),
        ('compra_reembolsos'),
        ('compra_reembolso_cancelamentos'),
        ('compra_reembolso_alocacoes')
)
SELECT
    'primary_key_exists' AS check_name,
    e.table_name AS object_name,
    CASE WHEN tc.constraint_name IS NULL THEN 'FAIL' ELSE 'PASS' END AS status
FROM expected_tables e
LEFT JOIN information_schema.table_constraints tc
    ON tc.table_schema = 'public'
    AND tc.table_name = e.table_name
    AND tc.constraint_type = 'PRIMARY KEY'
ORDER BY e.table_name;

WITH expected_fk(table_name, referenced_table) AS (
    VALUES
        ('compra_item_devolucoes', 'compras'),
        ('compra_item_devolucoes', 'compra_items'),
        ('compra_item_devolucoes', 'compra_item_recebimentos'),
        ('compra_item_devolucoes', 'estoque_movimentacoes'),
        ('compra_item_devolucao_compensacoes', 'compra_item_devolucoes'),
        ('compra_item_devolucao_compensacoes', 'estoque_movimentacoes'),
        ('compra_reembolsos', 'compras'),
        ('compra_reembolso_cancelamentos', 'compra_reembolsos'),
        ('compra_reembolso_alocacoes', 'compra_reembolsos'),
        ('compra_reembolso_alocacoes', 'compra_items'),
        ('compra_reembolso_alocacoes', 'compra_item_perdas'),
        ('compra_reembolso_alocacoes', 'compra_item_devolucoes')
),
actual_fk AS (
    SELECT
        tc.table_name,
        ccu.table_name AS referenced_table
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_schema = tc.constraint_schema
        AND ccu.constraint_name = tc.constraint_name
    WHERE tc.table_schema = 'public'
      AND tc.constraint_type = 'FOREIGN KEY'
)
SELECT
    'foreign_key_exists' AS check_name,
    e.table_name || ' -> ' || e.referenced_table AS object_name,
    CASE WHEN a.table_name IS NULL THEN 'FAIL' ELSE 'PASS' END AS status
FROM expected_fk e
LEFT JOIN actual_fk a
    ON a.table_name = e.table_name
    AND a.referenced_table = e.referenced_table
ORDER BY e.table_name, e.referenced_table;

WITH expected_unique(table_name, column_name) AS (
    VALUES
        ('compra_item_devolucoes', 'OperacaoId'),
        ('compra_item_devolucoes', 'EstoqueMovimentacaoId'),
        ('compra_item_devolucao_compensacoes', 'CompraItemDevolucaoId'),
        ('compra_item_devolucao_compensacoes', 'OperacaoId'),
        ('compra_item_devolucao_compensacoes', 'EstoqueMovimentacaoId'),
        ('compra_reembolsos', 'OperacaoId'),
        ('compra_reembolso_cancelamentos', 'CompraReembolsoId'),
        ('compra_reembolso_cancelamentos', 'OperacaoId')
),
actual_unique AS (
    SELECT
        t.relname AS table_name,
        a.attname AS column_name
    FROM pg_index i
    JOIN pg_class t ON t.oid = i.indrelid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(i.indkey)
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND i.indisunique
)
SELECT
    'unique_index_column_exists' AS check_name,
    e.table_name || '.' || e.column_name AS object_name,
    CASE WHEN a.table_name IS NULL THEN 'FAIL' ELSE 'PASS' END AS status
FROM expected_unique e
LEFT JOIN actual_unique a
    ON a.table_name = e.table_name
    AND a.column_name = e.column_name
ORDER BY e.table_name, e.column_name;

WITH expected_tables(table_name) AS (
    VALUES
        ('compra_item_devolucoes'),
        ('compra_item_devolucao_compensacoes'),
        ('compra_reembolsos'),
        ('compra_reembolso_cancelamentos'),
        ('compra_reembolso_alocacoes')
)
SELECT
    'check_constraints_present' AS check_name,
    e.table_name AS object_name,
    count(tc.constraint_name) AS check_count,
    CASE WHEN count(tc.constraint_name) > 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM expected_tables e
LEFT JOIN information_schema.table_constraints tc
    ON tc.table_schema = 'public'
    AND tc.table_name = e.table_name
    AND tc.constraint_type = 'CHECK'
GROUP BY e.table_name
ORDER BY e.table_name;
