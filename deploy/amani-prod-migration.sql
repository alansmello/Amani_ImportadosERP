CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318011634_InitialCreate') THEN
    CREATE TABLE categoria_despesas (
        "Id" uuid NOT NULL,
        "Nome" character varying(150) NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_categoria_despesas" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318011634_InitialCreate') THEN
    CREATE TABLE categorias (
        "Id" uuid NOT NULL,
        "Nome" character varying(150) NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_categorias" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318011634_InitialCreate') THEN
    CREATE TABLE clientes (
        "Id" uuid NOT NULL,
        "Nome" character varying(150) NOT NULL,
        "Email" character varying(200),
        "Telefone" character varying(50),
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_clientes" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318011634_InitialCreate') THEN
    CREATE TABLE compras (
        "Id" uuid NOT NULL,
        "FornecedorId" uuid NOT NULL,
        "DataCompra" timestamp with time zone NOT NULL,
        "Desconto" numeric(18,2) NOT NULL DEFAULT 0.0,
        "Acrescimo" numeric(18,2) NOT NULL DEFAULT 0.0,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_compras" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318011634_InitialCreate') THEN
    CREATE TABLE fornecedores (
        "Id" uuid NOT NULL,
        "Nome" character varying(150) NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_fornecedores" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318011634_InitialCreate') THEN
    CREATE TABLE vendas (
        "Id" uuid NOT NULL,
        "ClienteId" uuid NOT NULL,
        "DataVenda" timestamp with time zone NOT NULL,
        "Desconto" numeric(18,2) NOT NULL DEFAULT 0.0,
        "Acrescimo" numeric(18,2) NOT NULL DEFAULT 0.0,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_vendas" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318011634_InitialCreate') THEN
    CREATE TABLE despesas (
        "Id" uuid NOT NULL,
        "Descricao" character varying(250) NOT NULL,
        "Valor" numeric(18,2) NOT NULL,
        "Data" timestamp with time zone NOT NULL,
        "CategoriaDespesaId" uuid NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_despesas" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_despesas_categoria_despesas_CategoriaDespesaId" FOREIGN KEY ("CategoriaDespesaId") REFERENCES categoria_despesas ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318011634_InitialCreate') THEN
    CREATE TABLE compra_items (
        "Id" uuid NOT NULL,
        "ProdutoId" uuid NOT NULL,
        "CompraId" uuid NOT NULL,
        "Quantidade" integer NOT NULL,
        "CustoUnitario" numeric(18,2) NOT NULL,
        "Desconto" numeric(18,2) NOT NULL DEFAULT 0.0,
        "Acrescimo" numeric(18,2) NOT NULL DEFAULT 0.0,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_compra_items" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_compra_items_compras_CompraId" FOREIGN KEY ("CompraId") REFERENCES compras ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318011634_InitialCreate') THEN
    CREATE TABLE produtos (
        "Id" uuid NOT NULL,
        "Nome" character varying(150) NOT NULL,
        "PrecoVenda" numeric(18,2) NOT NULL,
        "Custo" numeric(18,2) NOT NULL,
        "CategoriaId" uuid NOT NULL,
        "FornecedorId" uuid,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_produtos" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_produtos_categorias_CategoriaId" FOREIGN KEY ("CategoriaId") REFERENCES categorias ("Id") ON DELETE RESTRICT,
        CONSTRAINT "FK_produtos_fornecedores_FornecedorId" FOREIGN KEY ("FornecedorId") REFERENCES fornecedores ("Id") ON DELETE SET NULL
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318011634_InitialCreate') THEN
    CREATE TABLE estoque_movimentacoes (
        "Id" uuid NOT NULL,
        "ProdutoId" uuid NOT NULL,
        "Quantidade" integer NOT NULL,
        "Tipo" integer NOT NULL,
        "CompraId" uuid,
        "VendaId" uuid,
        "Data" timestamp with time zone NOT NULL,
        "ValorUnitario" numeric(18,2),
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_estoque_movimentacoes" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_estoque_movimentacoes_compras_CompraId" FOREIGN KEY ("CompraId") REFERENCES compras ("Id") ON DELETE SET NULL,
        CONSTRAINT "FK_estoque_movimentacoes_vendas_VendaId" FOREIGN KEY ("VendaId") REFERENCES vendas ("Id") ON DELETE SET NULL
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318011634_InitialCreate') THEN
    CREATE TABLE venda_items (
        "Id" uuid NOT NULL,
        "ProdutoId" uuid NOT NULL,
        "Quantidade" integer NOT NULL,
        "PrecoUnitario" numeric(18,2) NOT NULL,
        "Desconto" numeric(18,2) NOT NULL DEFAULT 0.0,
        "Acrescimo" numeric(18,2) NOT NULL DEFAULT 0.0,
        "VendaId" uuid NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_venda_items" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_venda_items_vendas_VendaId" FOREIGN KEY ("VendaId") REFERENCES vendas ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318011634_InitialCreate') THEN
    CREATE INDEX "IX_compra_items_CompraId" ON compra_items ("CompraId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318011634_InitialCreate') THEN
    CREATE INDEX "IX_despesas_CategoriaDespesaId" ON despesas ("CategoriaDespesaId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318011634_InitialCreate') THEN
    CREATE INDEX "IX_estoque_movimentacoes_CompraId" ON estoque_movimentacoes ("CompraId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318011634_InitialCreate') THEN
    CREATE INDEX "IX_estoque_movimentacoes_VendaId" ON estoque_movimentacoes ("VendaId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318011634_InitialCreate') THEN
    CREATE INDEX "IX_produtos_CategoriaId" ON produtos ("CategoriaId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318011634_InitialCreate') THEN
    CREATE INDEX "IX_produtos_FornecedorId" ON produtos ("FornecedorId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318011634_InitialCreate') THEN
    CREATE INDEX "IX_venda_items_VendaId" ON venda_items ("VendaId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318011634_InitialCreate') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260318011634_InitialCreate', '8.0.8');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318155713_AddDespesa') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260318155713_AddDespesa', '8.0.8');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318192145_AddContaReceberEPagamentoRecebido') THEN
    CREATE TABLE contas_receber (
        "Id" uuid NOT NULL,
        "VendaId" uuid NOT NULL,
        "Valor" numeric(18,2) NOT NULL,
        "DataVencimento" timestamp with time zone NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_contas_receber" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_contas_receber_vendas_VendaId" FOREIGN KEY ("VendaId") REFERENCES vendas ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318192145_AddContaReceberEPagamentoRecebido') THEN
    CREATE TABLE pagamentos_recebidos (
        "Id" uuid NOT NULL,
        "ContaReceberId" uuid NOT NULL,
        "Valor" numeric(18,2) NOT NULL,
        "DataPagamento" timestamp with time zone NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_pagamentos_recebidos" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_pagamentos_recebidos_contas_receber_ContaReceberId" FOREIGN KEY ("ContaReceberId") REFERENCES contas_receber ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318192145_AddContaReceberEPagamentoRecebido') THEN
    CREATE INDEX "IX_contas_receber_VendaId" ON contas_receber ("VendaId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318192145_AddContaReceberEPagamentoRecebido') THEN
    CREATE INDEX "IX_pagamentos_recebidos_ContaReceberId" ON pagamentos_recebidos ("ContaReceberId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260318192145_AddContaReceberEPagamentoRecebido') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260318192145_AddContaReceberEPagamentoRecebido', '8.0.8');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260319134708_AddPropCanceladaEmVenda') THEN
    ALTER TABLE vendas ADD "Cancelada" boolean NOT NULL DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260319134708_AddPropCanceladaEmVenda') THEN
    ALTER TABLE vendas ADD "DataCancelamento" timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260319134708_AddPropCanceladaEmVenda') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260319134708_AddPropCanceladaEmVenda', '8.0.8');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260604190000_AddClienteAtivo') THEN
    ALTER TABLE clientes ADD "Ativo" boolean NOT NULL DEFAULT TRUE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260604190000_AddClienteAtivo') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260604190000_AddClienteAtivo', '8.0.8');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260606001634_AddEventoFinanceiroSaldoInicialCaixa') THEN
    CREATE TABLE eventos_financeiros (
        "Id" uuid NOT NULL,
        "Tipo" integer NOT NULL,
        "Valor" numeric(18,2) NOT NULL,
        "Data" timestamp with time zone NOT NULL,
        "Origem" character varying(50) NOT NULL,
        "Descricao" character varying(250) NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_eventos_financeiros" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260606001634_AddEventoFinanceiroSaldoInicialCaixa') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260606001634_AddEventoFinanceiroSaldoInicialCaixa', '8.0.8');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260606003634_AddContaReceberInicialOrigemCliente') THEN
    ALTER TABLE contas_receber ALTER COLUMN "VendaId" DROP NOT NULL;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260606003634_AddContaReceberInicialOrigemCliente') THEN
    ALTER TABLE contas_receber ADD "ClienteId" uuid;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260606003634_AddContaReceberInicialOrigemCliente') THEN
    ALTER TABLE contas_receber ADD "Origem" character varying(50) NOT NULL DEFAULT 'Venda';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260606003634_AddContaReceberInicialOrigemCliente') THEN
    CREATE INDEX "IX_contas_receber_ClienteId" ON contas_receber ("ClienteId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260606003634_AddContaReceberInicialOrigemCliente') THEN
    ALTER TABLE contas_receber ADD CONSTRAINT "FK_contas_receber_clientes_ClienteId" FOREIGN KEY ("ClienteId") REFERENCES clientes ("Id") ON DELETE RESTRICT;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260606003634_AddContaReceberInicialOrigemCliente') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260606003634_AddContaReceberInicialOrigemCliente', '8.0.8');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607130408_AddMercadoriasTransitoRecebimentoParcial') THEN
    ALTER TABLE estoque_movimentacoes ADD "CompraItemId" uuid;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607130408_AddMercadoriasTransitoRecebimentoParcial') THEN
    ALTER TABLE compras ADD "Status" character varying(30) NOT NULL DEFAULT 'Criada';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607130408_AddMercadoriasTransitoRecebimentoParcial') THEN
    UPDATE compras
    SET "Status" = 'Recebida'
    WHERE "Status" = 'Criada';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607130408_AddMercadoriasTransitoRecebimentoParcial') THEN
    CREATE TABLE compra_item_perdas (
        "Id" uuid NOT NULL,
        "CompraId" uuid NOT NULL,
        "CompraItemId" uuid NOT NULL,
        "ProdutoId" uuid NOT NULL,
        "Quantidade" integer NOT NULL,
        "Motivo" character varying(30) NOT NULL,
        "DataPerda" timestamp with time zone NOT NULL,
        "Observacao" character varying(500),
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_compra_item_perdas" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_compra_item_perdas_compra_items_CompraItemId" FOREIGN KEY ("CompraItemId") REFERENCES compra_items ("Id") ON DELETE RESTRICT,
        CONSTRAINT "FK_compra_item_perdas_compras_CompraId" FOREIGN KEY ("CompraId") REFERENCES compras ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607130408_AddMercadoriasTransitoRecebimentoParcial') THEN
    CREATE TABLE compra_item_recebimentos (
        "Id" uuid NOT NULL,
        "CompraId" uuid NOT NULL,
        "CompraItemId" uuid NOT NULL,
        "ProdutoId" uuid NOT NULL,
        "Quantidade" integer NOT NULL,
        "ValorUnitario" numeric(18,2) NOT NULL,
        "DataRecebimento" timestamp with time zone NOT NULL,
        "EstoqueMovimentacaoId" uuid,
        "Origem" character varying(30) NOT NULL,
        "Observacao" character varying(500),
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_compra_item_recebimentos" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_compra_item_recebimentos_compra_items_CompraItemId" FOREIGN KEY ("CompraItemId") REFERENCES compra_items ("Id") ON DELETE RESTRICT,
        CONSTRAINT "FK_compra_item_recebimentos_compras_CompraId" FOREIGN KEY ("CompraId") REFERENCES compras ("Id") ON DELETE RESTRICT,
        CONSTRAINT "FK_compra_item_recebimentos_estoque_movimentacoes_EstoqueMovim~" FOREIGN KEY ("EstoqueMovimentacaoId") REFERENCES estoque_movimentacoes ("Id") ON DELETE SET NULL
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607130408_AddMercadoriasTransitoRecebimentoParcial') THEN
    CREATE INDEX "IX_estoque_movimentacoes_CompraItemId" ON estoque_movimentacoes ("CompraItemId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607130408_AddMercadoriasTransitoRecebimentoParcial') THEN
    CREATE INDEX "IX_compra_item_perdas_CompraId" ON compra_item_perdas ("CompraId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607130408_AddMercadoriasTransitoRecebimentoParcial') THEN
    CREATE INDEX "IX_compra_item_perdas_CompraItemId" ON compra_item_perdas ("CompraItemId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607130408_AddMercadoriasTransitoRecebimentoParcial') THEN
    CREATE INDEX "IX_compra_item_perdas_ProdutoId" ON compra_item_perdas ("ProdutoId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607130408_AddMercadoriasTransitoRecebimentoParcial') THEN
    CREATE INDEX "IX_compra_item_recebimentos_CompraId" ON compra_item_recebimentos ("CompraId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607130408_AddMercadoriasTransitoRecebimentoParcial') THEN
    CREATE INDEX "IX_compra_item_recebimentos_CompraItemId" ON compra_item_recebimentos ("CompraItemId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607130408_AddMercadoriasTransitoRecebimentoParcial') THEN
    CREATE UNIQUE INDEX "IX_compra_item_recebimentos_EstoqueMovimentacaoId" ON compra_item_recebimentos ("EstoqueMovimentacaoId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607130408_AddMercadoriasTransitoRecebimentoParcial') THEN
    CREATE INDEX "IX_compra_item_recebimentos_ProdutoId" ON compra_item_recebimentos ("ProdutoId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607130408_AddMercadoriasTransitoRecebimentoParcial') THEN
    ALTER TABLE estoque_movimentacoes ADD CONSTRAINT "FK_estoque_movimentacoes_compra_items_CompraItemId" FOREIGN KEY ("CompraItemId") REFERENCES compra_items ("Id") ON DELETE SET NULL;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607130408_AddMercadoriasTransitoRecebimentoParcial') THEN
    INSERT INTO compra_item_recebimentos (
        "Id",
        "CompraId",
        "CompraItemId",
        "ProdutoId",
        "Quantidade",
        "ValorUnitario",
        "DataRecebimento",
        "EstoqueMovimentacaoId",
        "Origem",
        "Observacao",
        "CreatedAt",
        "UpdatedAt"
    )
    SELECT
        (
            substr(md5(ci."Id"::text || '-legacy-receipt'), 1, 8) || '-' ||
            substr(md5(ci."Id"::text || '-legacy-receipt'), 9, 4) || '-' ||
            substr(md5(ci."Id"::text || '-legacy-receipt'), 13, 4) || '-' ||
            substr(md5(ci."Id"::text || '-legacy-receipt'), 17, 4) || '-' ||
            substr(md5(ci."Id"::text || '-legacy-receipt'), 21, 12)
        )::uuid,
        ci."CompraId",
        ci."Id",
        ci."ProdutoId",
        ci."Quantidade",
        ci."CustoUnitario",
        c."DataCompra",
        NULL,
        'LegadoMigrado',
        'Recebimento legado migrado pela Feature 003',
        NOW(),
        NULL
    FROM compra_items ci
    INNER JOIN compras c ON c."Id" = ci."CompraId"
    WHERE NOT EXISTS (
        SELECT 1
        FROM compra_item_recebimentos r
        WHERE r."CompraItemId" = ci."Id"
          AND r."Origem" = 'LegadoMigrado'
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260607130408_AddMercadoriasTransitoRecebimentoParcial') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260607130408_AddMercadoriasTransitoRecebimentoParcial', '8.0.8');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260622204547_AddFormasPagamentoTaxas') THEN
    ALTER TABLE vendas ADD "FormaPagamento" character varying(30) NOT NULL DEFAULT 'Fiado';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260622204547_AddFormasPagamentoTaxas') THEN
    ALTER TABLE vendas ADD "PercentualTaxaAplicado" numeric(9,4);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260622204547_AddFormasPagamentoTaxas') THEN
    ALTER TABLE pagamentos_recebidos ADD "Desconto" numeric(18,2) NOT NULL DEFAULT 0.0;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260622204547_AddFormasPagamentoTaxas') THEN
    ALTER TABLE pagamentos_recebidos ADD "ValorBrutoLiquidado" numeric(18,2) NOT NULL DEFAULT 0.0;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260622204547_AddFormasPagamentoTaxas') THEN
    UPDATE pagamentos_recebidos SET "ValorBrutoLiquidado" = "Valor";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260622204547_AddFormasPagamentoTaxas') THEN
    CREATE TABLE configuracoes_formas_pagamento (
        "Id" uuid NOT NULL,
        "FormaPagamento" character varying(30) NOT NULL,
        "PercentualTaxa" numeric(9,4) NOT NULL,
        "AtualizadoEm" timestamp with time zone NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_configuracoes_formas_pagamento" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260622204547_AddFormasPagamentoTaxas') THEN
    CREATE TABLE despesas_operadora (
        "Id" uuid NOT NULL,
        "VendaId" uuid NOT NULL,
        "FormaPagamento" character varying(30) NOT NULL,
        "ValorBruto" numeric(18,2) NOT NULL,
        "ValorLiquido" numeric(18,2) NOT NULL,
        "PercentualTaxa" numeric(9,4) NOT NULL,
        "DataRegistro" timestamp with time zone NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_despesas_operadora" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_despesas_operadora_vendas_VendaId" FOREIGN KEY ("VendaId") REFERENCES vendas ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260622204547_AddFormasPagamentoTaxas') THEN
    CREATE UNIQUE INDEX "IX_configuracoes_formas_pagamento_FormaPagamento" ON configuracoes_formas_pagamento ("FormaPagamento");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260622204547_AddFormasPagamentoTaxas') THEN
    INSERT INTO configuracoes_formas_pagamento ("Id", "FormaPagamento", "PercentualTaxa", "AtualizadoEm", "CreatedAt", "UpdatedAt")
    VALUES ('5f5f7d1e-ef0f-4c7c-a451-6a3a8fd2b001', 'Dinheiro', 0.0, TIMESTAMPTZ '2026-06-22T00:00:00Z', TIMESTAMPTZ '2026-06-22T00:00:00Z', NULL);
    INSERT INTO configuracoes_formas_pagamento ("Id", "FormaPagamento", "PercentualTaxa", "AtualizadoEm", "CreatedAt", "UpdatedAt")
    VALUES ('5f5f7d1e-ef0f-4c7c-a451-6a3a8fd2b002', 'PIX', 0.0, TIMESTAMPTZ '2026-06-22T00:00:00Z', TIMESTAMPTZ '2026-06-22T00:00:00Z', NULL);
    INSERT INTO configuracoes_formas_pagamento ("Id", "FormaPagamento", "PercentualTaxa", "AtualizadoEm", "CreatedAt", "UpdatedAt")
    VALUES ('5f5f7d1e-ef0f-4c7c-a451-6a3a8fd2b003', 'CartaoDebito', 1.99, TIMESTAMPTZ '2026-06-22T00:00:00Z', TIMESTAMPTZ '2026-06-22T00:00:00Z', NULL);
    INSERT INTO configuracoes_formas_pagamento ("Id", "FormaPagamento", "PercentualTaxa", "AtualizadoEm", "CreatedAt", "UpdatedAt")
    VALUES ('5f5f7d1e-ef0f-4c7c-a451-6a3a8fd2b004', 'CartaoCredito', 3.49, TIMESTAMPTZ '2026-06-22T00:00:00Z', TIMESTAMPTZ '2026-06-22T00:00:00Z', NULL);
    INSERT INTO configuracoes_formas_pagamento ("Id", "FormaPagamento", "PercentualTaxa", "AtualizadoEm", "CreatedAt", "UpdatedAt")
    VALUES ('5f5f7d1e-ef0f-4c7c-a451-6a3a8fd2b005', 'Fiado', 0.0, TIMESTAMPTZ '2026-06-22T00:00:00Z', TIMESTAMPTZ '2026-06-22T00:00:00Z', NULL);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260622204547_AddFormasPagamentoTaxas') THEN
    CREATE INDEX "IX_despesas_operadora_VendaId" ON despesas_operadora ("VendaId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260622204547_AddFormasPagamentoTaxas') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260622204547_AddFormasPagamentoTaxas', '8.0.8');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260623233055_AddDespesasCategorias') THEN
    ALTER TABLE despesas RENAME COLUMN "Data" TO "DataCompetencia";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260623233055_AddDespesasCategorias') THEN
    ALTER TABLE despesas ADD "FormaPagamento" character varying(30) NOT NULL DEFAULT 'Dinheiro';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260623233055_AddDespesasCategorias') THEN
    ALTER TABLE categoria_despesas ADD "Ativa" boolean NOT NULL DEFAULT TRUE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260623233055_AddDespesasCategorias') THEN
    ALTER TABLE categoria_despesas ADD "Descricao" character varying(250);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260623233055_AddDespesasCategorias') THEN
    ALTER TABLE categoria_despesas ADD "NomeNormalizado" character varying(150) NOT NULL DEFAULT '';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260623233055_AddDespesasCategorias') THEN
    UPDATE categoria_despesas SET "NomeNormalizado" = UPPER(TRIM("Nome")) WHERE "NomeNormalizado" = '';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260623233055_AddDespesasCategorias') THEN
    CREATE UNIQUE INDEX "IX_categoria_despesas_NomeNormalizado" ON categoria_despesas ("NomeNormalizado");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260623233055_AddDespesasCategorias') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260623233055_AddDespesasCategorias', '8.0.8');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260625222913_AddAutenticacaoUsuarios') THEN
    CREATE TABLE usuarios (
        "Id" uuid NOT NULL,
        "Login" character varying(150) NOT NULL,
        "LoginNormalizado" character varying(150) NOT NULL,
        "NomeExibicao" character varying(150) NOT NULL,
        "SenhaHash" character varying(500) NOT NULL,
        "Ativo" boolean NOT NULL DEFAULT TRUE,
        "OrigemProvisionamento" character varying(80) NOT NULL,
        "UltimoLoginEm" timestamp with time zone,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_usuarios" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260625222913_AddAutenticacaoUsuarios') THEN
    CREATE TABLE eventos_autenticacao (
        "Id" uuid NOT NULL,
        "UsuarioId" uuid,
        "LoginInformado" character varying(150) NOT NULL,
        "Resultado" character varying(40) NOT NULL,
        "MensagemSegura" character varying(250) NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_eventos_autenticacao" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_eventos_autenticacao_usuarios_UsuarioId" FOREIGN KEY ("UsuarioId") REFERENCES usuarios ("Id") ON DELETE SET NULL
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260625222913_AddAutenticacaoUsuarios') THEN
    CREATE INDEX "IX_eventos_autenticacao_CreatedAt" ON eventos_autenticacao ("CreatedAt");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260625222913_AddAutenticacaoUsuarios') THEN
    CREATE INDEX "IX_eventos_autenticacao_UsuarioId" ON eventos_autenticacao ("UsuarioId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260625222913_AddAutenticacaoUsuarios') THEN
    CREATE UNIQUE INDEX "IX_usuarios_LoginNormalizado" ON usuarios ("LoginNormalizado");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260625222913_AddAutenticacaoUsuarios') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260625222913_AddAutenticacaoUsuarios', '8.0.8');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260626223710_NormalizeNonDebitPaymentFees') THEN
    DO $$
    BEGIN
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'configuracoes_formas_pagamento'
              AND column_name = 'forma_pagamento'
        ) THEN
            UPDATE configuracoes_formas_pagamento
            SET percentual_taxa = 0
            WHERE forma_pagamento <> 'CartaoDebito' AND percentual_taxa <> 0;
        ELSIF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'configuracoes_formas_pagamento'
              AND column_name = 'FormaPagamento'
        ) THEN
            UPDATE "configuracoes_formas_pagamento"
            SET "PercentualTaxa" = 0
            WHERE "FormaPagamento" <> 'CartaoDebito' AND "PercentualTaxa" <> 0;
        END IF;
    END $$;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260626223710_NormalizeNonDebitPaymentFees') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260626223710_NormalizeNonDebitPaymentFees', '8.0.8');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260628113439_AddTelefoneFornecedor') THEN
    ALTER TABLE fornecedores ADD "Telefone" character varying(50);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260628113439_AddTelefoneFornecedor') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260628113439_AddTelefoneFornecedor', '8.0.8');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260630120000_AddDashboardGerencialIndexes') THEN
    CREATE INDEX "IX_vendas_DataVenda_Cancelada" ON vendas ("DataVenda", "Cancelada");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260630120000_AddDashboardGerencialIndexes') THEN
    CREATE INDEX "IX_compras_DataCompra_Status" ON compras ("DataCompra", "Status");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260630120000_AddDashboardGerencialIndexes') THEN
    CREATE INDEX "IX_pagamentos_recebidos_DataPagamento" ON pagamentos_recebidos ("DataPagamento");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260630120000_AddDashboardGerencialIndexes') THEN
    CREATE INDEX "IX_contas_receber_CreatedAt_DataVencimento" ON contas_receber ("CreatedAt", "DataVencimento");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260630120000_AddDashboardGerencialIndexes') THEN
    CREATE INDEX "IX_eventos_financeiros_Tipo_Data" ON eventos_financeiros ("Tipo", "Data");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260630120000_AddDashboardGerencialIndexes') THEN
    CREATE INDEX "IX_estoque_movimentacoes_ProdutoId_Data_Tipo" ON estoque_movimentacoes ("ProdutoId", "Data", "Tipo");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260630120000_AddDashboardGerencialIndexes') THEN
    CREATE INDEX "IX_despesas_DataCompetencia" ON despesas ("DataCompetencia");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260630120000_AddDashboardGerencialIndexes') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260630120000_AddDashboardGerencialIndexes', '8.0.8');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE venda_items ADD "ApresentacaoNomeSnapshot" character varying(100);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE venda_items ADD "FatorConversaoAplicado" numeric(28,12);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE venda_items ADD "FatorDenominadorAplicado" bigint;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE venda_items ADD "FatorNumeradorAplicado" bigint;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE venda_items ADD "ProdutoApresentacaoId" uuid;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE venda_items ADD "QuantidadeConvertidaEstoque" numeric(28,12);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE estoque_movimentacoes ALTER COLUMN "Quantidade" TYPE numeric(28,12);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE estoque_movimentacoes ADD "QuantidadeExataDenominador" bigint;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE estoque_movimentacoes ADD "QuantidadeExataNumerador" bigint;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE estoque_movimentacoes ADD "VendaItemId" uuid;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    CREATE TABLE produto_apresentacoes (
        "Id" uuid NOT NULL,
        "ProdutoId" uuid NOT NULL,
        "Nome" character varying(100) NOT NULL,
        "FatorNumerador" bigint NOT NULL,
        "FatorDenominador" bigint NOT NULL,
        "PermiteCompra" boolean NOT NULL DEFAULT FALSE,
        "PermiteVenda" boolean NOT NULL,
        "PrecoVenda" numeric(18,2),
        "Ativo" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_produto_apresentacoes" PRIMARY KEY ("Id"),
        CONSTRAINT "CK_produto_apresentacoes_FatorAteUm" CHECK ("FatorNumerador" <= "FatorDenominador"),
        CONSTRAINT "CK_produto_apresentacoes_FatorDenominador" CHECK ("FatorDenominador" > 0),
        CONSTRAINT "CK_produto_apresentacoes_FatorNumerador" CHECK ("FatorNumerador" > 0),
        CONSTRAINT "CK_produto_apresentacoes_PermiteCompra" CHECK ("PermiteCompra" = FALSE),
        CONSTRAINT "FK_produto_apresentacoes_produtos_ProdutoId" FOREIGN KEY ("ProdutoId") REFERENCES produtos ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    CREATE INDEX "IX_venda_items_ProdutoApresentacaoId" ON venda_items ("ProdutoApresentacaoId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    CREATE INDEX "IX_estoque_movimentacoes_VendaItemId" ON estoque_movimentacoes ("VendaItemId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE estoque_movimentacoes ADD CONSTRAINT "CK_estoque_movimentacoes_Quantidade" CHECK ("Quantidade" > 0);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE estoque_movimentacoes ADD CONSTRAINT "CK_estoque_movimentacoes_QuantidadeExata" CHECK (("QuantidadeExataNumerador" IS NULL AND "QuantidadeExataDenominador" IS NULL) OR ("QuantidadeExataNumerador" IS NOT NULL AND "QuantidadeExataDenominador" IS NOT NULL AND "QuantidadeExataNumerador" > 0 AND "QuantidadeExataDenominador" > 0 AND "Quantidade" = round("QuantidadeExataNumerador"::numeric / "QuantidadeExataDenominador", 12)));
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE venda_items ADD CONSTRAINT "CK_venda_items_ApresentacaoSnapshot" CHECK (("ProdutoApresentacaoId" IS NULL AND "ApresentacaoNomeSnapshot" IS NULL AND "FatorNumeradorAplicado" IS NULL AND "FatorDenominadorAplicado" IS NULL AND "FatorConversaoAplicado" IS NULL AND "QuantidadeConvertidaEstoque" IS NULL) OR ("ProdutoApresentacaoId" IS NOT NULL AND "ApresentacaoNomeSnapshot" IS NOT NULL AND "FatorNumeradorAplicado" > 0 AND "FatorDenominadorAplicado" > 0 AND "FatorNumeradorAplicado" <= "FatorDenominadorAplicado" AND "FatorConversaoAplicado" > 0 AND "QuantidadeConvertidaEstoque" > 0 AND "FatorConversaoAplicado" = round("FatorNumeradorAplicado"::numeric / "FatorDenominadorAplicado", 12) AND "QuantidadeConvertidaEstoque" = round("Quantidade"::numeric * "FatorNumeradorAplicado" / "FatorDenominadorAplicado", 12)));
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    CREATE INDEX "IX_produto_apresentacoes_ProdutoId_Ativo_PermiteVenda" ON produto_apresentacoes ("ProdutoId", "Ativo", "PermiteVenda");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    CREATE UNIQUE INDEX "IX_produto_apresentacoes_ProdutoId_Nome" ON produto_apresentacoes ("ProdutoId", "Nome");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE estoque_movimentacoes ADD CONSTRAINT "FK_estoque_movimentacoes_venda_items_VendaItemId" FOREIGN KEY ("VendaItemId") REFERENCES venda_items ("Id") ON DELETE SET NULL;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE venda_items ADD CONSTRAINT "FK_venda_items_produto_apresentacoes_ProdutoApresentacaoId" FOREIGN KEY ("ProdutoApresentacaoId") REFERENCES produto_apresentacoes ("Id") ON DELETE RESTRICT;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260701002458_AddProdutoApresentacoesFracionadas', '8.0.8');
    END IF;
END $EF$;
COMMIT;

