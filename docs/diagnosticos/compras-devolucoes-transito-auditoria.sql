-- Somente leitura. Confirmar ambiente antes de executar. Nao executado nesta investigacao.
-- NULL: todos os eventos cadastrados; timestamp UTC: recorte historico exato.
-- Status persistido e atual, nao historico. Divergencia nao prova corrupcao.
-- Dinheiro exige conciliacao separada pelo rateio oficial F026.
-- Diferenca geral inclui canceladas; metrica dashboard abaixo exclui canceladas.
-- Auditoria inicial por item: nao valida todos os vinculos/datas nem limite por recebimento.
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL statement_timeout = '15s';
SET LOCAL lock_timeout = '2s';
SELECT current_database() AS database_name,
       current_setting('transaction_read_only') AS read_only,
       transaction_timestamp() AS captured_at,
       to_regclass('public.compra_item_devolucoes') AS devolucoes_table;
WITH parametros AS (
 SELECT NULL::timestamptz AS referencia
), recebimentos AS (
 SELECT r."CompraItemId", sum(r."Quantidade") AS quantidade
 FROM compra_item_recebimentos r CROSS JOIN parametros p
 WHERE p.referencia IS NULL OR r."DataRecebimento" <= p.referencia
 GROUP BY r."CompraItemId"
), perdas AS (
 SELECT r."CompraItemId", sum(r."Quantidade") AS quantidade
 FROM compra_item_perdas r CROSS JOIN parametros p
 WHERE p.referencia IS NULL OR r."DataPerda" <= p.referencia
 GROUP BY r."CompraItemId"
), devolucoes AS (
 SELECT d."CompraItemId",
 sum(d."Quantidade") FILTER (WHERE d."Momento" = 'AntesDoRecebimento') AS antes_historico,
 sum(d."Quantidade") FILTER (WHERE d."Momento" = 'AntesDoRecebimento'
   AND (c."Id" IS NULL OR (p.referencia IS NOT NULL AND c."DataCompensacao" > p.referencia))) AS antes_vigente,
 sum(d."Quantidade") FILTER (WHERE d."Momento" = 'DepoisDoRecebimento'
   AND (c."Id" IS NULL OR (p.referencia IS NOT NULL AND c."DataCompensacao" > p.referencia))) AS depois_vigente
 FROM compra_item_devolucoes d
 LEFT JOIN compra_item_devolucao_compensacoes c ON c."CompraItemDevolucaoId" = d."Id"
 CROSS JOIN parametros p
 WHERE p.referencia IS NULL OR d."DataDevolucao" <= p.referencia
 GROUP BY d."CompraItemId"
), saldos AS (
 SELECT i."CompraId", i."Id" AS item_id, c."Status" AS status_persistido,
 i."Quantidade" AS comprada, coalesce(r.quantidade, 0) AS recebida,
 coalesce(l.quantidade, 0) AS perdida,
 coalesce(d.antes_historico, 0) AS devolvida_antes_historica,
 coalesce(d.antes_vigente, 0) AS devolvida_antes_vigente,
 coalesce(d.depois_vigente, 0) AS devolvida_depois_vigente,
 i."Quantidade" - coalesce(r.quantidade, 0) - coalesce(l.quantidade, 0) AS pendencia_base
 FROM compra_items i JOIN compras c ON c."Id" = i."CompraId"
 LEFT JOIN recebimentos r ON r."CompraItemId" = i."Id"
 LEFT JOIN perdas l ON l."CompraItemId" = i."Id"
 LEFT JOIN devolucoes d ON d."CompraItemId" = i."Id"
 CROSS JOIN parametros p
 WHERE p.referencia IS NULL OR c."DataCompra" <= p.referencia
), auditados AS (
 SELECT *, pendencia_base - devolvida_antes_vigente AS pendencia_liquida_bruta,
 greatest(0, pendencia_base - devolvida_antes_vigente) AS pendencia_liquida_dominio
 FROM saldos
), candidatos AS (
 SELECT * FROM auditados WHERE devolvida_antes_historica > 0
 OR devolvida_depois_vigente > 0 OR pendencia_liquida_bruta < 0
)
SELECT (SELECT referencia FROM parametros) AS referencia,
 count(*) AS itens_candidatos,
 count(*) FILTER (WHERE pendencia_liquida_bruta < 0) AS itens_saldo_negativo,
 count(*) FILTER (WHERE pendencia_base > pendencia_liquida_dominio) AS itens_com_diferenca_pendencia,
 coalesce(sum(greatest(0, pendencia_base) - pendencia_liquida_dominio), 0) AS quantidade_diferenca_pendencia,
 count(*) FILTER (WHERE status_persistido <> 'Cancelada' AND pendencia_base > pendencia_liquida_dominio) AS itens_com_diferenca_dashboard,
 coalesce(sum(greatest(0, pendencia_base) - pendencia_liquida_dominio) FILTER (WHERE status_persistido <> 'Cancelada'), 0) AS quantidade_diferenca_dashboard,
 (SELECT coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) FROM (
 SELECT * FROM candidatos ORDER BY "CompraId", item_id LIMIT 100
 ) x) AS amostra_ate_100_itens
FROM candidatos;
ROLLBACK;
