\set ON_ERROR_STOP on
\pset pager off

SELECT current_database() AS banco, current_setting('server_version') AS postgres_version, now() AS coletado_em;

SELECT "MigrationId", "ProductVersion"
FROM "__EFMigrationsHistory"
ORDER BY "MigrationId";

SELECT 'produtos' AS entidade, count(*) AS registros FROM produtos
UNION ALL SELECT 'vendas', count(*) FROM vendas
UNION ALL SELECT 'venda_items', count(*) FROM venda_items
UNION ALL SELECT 'estoque_movimentacoes', count(*) FROM estoque_movimentacoes
UNION ALL SELECT 'compra_items', count(*) FROM compra_items
UNION ALL SELECT 'compra_item_recebimentos', count(*) FROM compra_item_recebimentos
UNION ALL SELECT 'compra_item_perdas', count(*) FROM compra_item_perdas
ORDER BY entidade;

SELECT "ProdutoId", "Tipo", count(*) AS movimentos, sum("Quantidade"::numeric) AS quantidade
FROM estoque_movimentacoes
GROUP BY "ProdutoId", "Tipo"
ORDER BY "ProdutoId", "Tipo";

SELECT "ProdutoId",
       sum(CASE WHEN "Tipo" = 1 THEN -"Quantidade"::numeric ELSE "Quantidade"::numeric END) AS saldo_decimal_legado
FROM estoque_movimentacoes
GROUP BY "ProdutoId"
ORDER BY "ProdutoId";

SELECT md5(COALESCE(string_agg(
           "Id"::text || '|' || "ProdutoId"::text || '|' || "Tipo"::text || '|' || round("Quantidade"::numeric, 12)::text || '|' ||
           COALESCE("CompraId"::text, '') || '|' || COALESCE("CompraItemId"::text, '') || '|' ||
           COALESCE("VendaId"::text, '') || '|' || COALESCE("ValorUnitario"::text, ''),
           E'\n' ORDER BY "Id"), '')) AS hash_movimentacoes_legadas
FROM estoque_movimentacoes;

SELECT md5(COALESCE(string_agg(
           "Id"::text || '|' || "ProdutoId"::text || '|' || "Quantidade"::text || '|' ||
           "PrecoUnitario"::text || '|' || "Desconto"::text || '|' || "Acrescimo"::text,
           E'\n' ORDER BY "Id"), '')) AS hash_itens_venda_legados
FROM venda_items;

SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'produto_apresentacoes'
) AS f024_schema \gset

\if :f024_schema
SELECT count(*) AS apresentacoes_criadas_automaticamente FROM produto_apresentacoes;

SELECT count(*) FILTER (WHERE "ProdutoApresentacaoId" IS NOT NULL) AS itens_com_apresentacao,
       count(*) FILTER (WHERE "FatorNumeradorAplicado" IS NULL AND "FatorDenominadorAplicado" IS NULL) AS itens_legados_sem_fracao
FROM venda_items;

SELECT count(*) FILTER (WHERE "QuantidadeExataNumerador" IS NOT NULL) AS movimentos_exatos,
       count(*) FILTER (WHERE "QuantidadeExataNumerador" IS NULL AND "QuantidadeExataDenominador" IS NULL) AS movimentos_legados
FROM estoque_movimentacoes;
\endif
