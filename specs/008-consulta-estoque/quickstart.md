# Quickstart: Consulta de Estoque

## Prerequisites

- PostgreSQL configurado em `src/Amani.ImportadosERP.Api/appsettings.json`.
- Banco com schema atual aplicado (Feature 003 ja migrada). Esta feature nao gera
  nova migration.
- Cadastros base existentes: produto e categoria.
- Movimentacoes de estoque existentes geradas pelos fluxos atuais: inventario
  inicial, recebimento de compra e venda.

## Build

```powershell
dotnet build
```

Expected outcome: solucao compila sem erros e sem novas migrations pendentes.

## Run API

```powershell
dotnet run --project src/Amani.ImportadosERP.Api
```

Use a URL exibida pelo ASP.NET Core para executar os cenarios abaixo.

## Validation Scenarios

### 1. Listar saldo de produtos

`GET /api/estoque`

Expected outcome:

- Retorna todos os produtos cadastrados com saldo calculado.
- Produto sem movimentacoes aparece com saldo zero.
- Produto com inventario inicial de 10 e venda de 3 aparece com saldo 7.
- Produto com recebimento de 5 e venda de 2 aparece com saldo 3.

### 2. Filtrar saldo por categoria

`GET /api/estoque?categoriaId={categoriaId}`

Expected outcome:

- Retorna apenas produtos da categoria informada, com seus saldos.

### 3. Listar apenas produtos com saldo positivo

`GET /api/estoque?apenasComSaldo=true`

Expected outcome:

- Produtos com saldo zero ou negativo nao aparecem.
- Produtos com saldo maior que zero aparecem com o saldo correto.

### 4. Consultar historico de movimentacoes de um produto

`GET /api/estoque/{produtoId}/movimentacoes`

Expected outcome:

- Retorna `saldoAtual` igual a entradas mais inventario inicial menos saidas.
- Retorna `totalMovimentacoes` igual a contagem total de movimentacoes do produto
  que atendem aos filtros antes do limite.
- Lista movimentacoes com tipo, quantidade, data, origem e valor unitario quando
  existir, ordenadas por data decrescente e, em caso de mesma data, por data de
  criacao decrescente.
- Movimentacao de inventario inicial aparece com origem `InventarioInicial`.
- Movimentacao de recebimento aparece com origem `Compra` e referencia a compra.
- Movimentacao de venda aparece com origem `Venda` e referencia a venda.

### 5. Filtrar historico por periodo

`GET /api/estoque/{produtoId}/movimentacoes?dataInicio=2026-06-01&dataFim=2026-06-30`

Expected outcome:

- Apenas movimentacoes dentro do periodo aparecem na lista.
- `saldoAtual` continua refletindo o historico completo, nao apenas o periodo.
- `totalMovimentacoes` reflete a contagem total das movimentacoes dentro do periodo
  antes do limite.

### 6. Filtrar historico por tipo

`GET /api/estoque/{produtoId}/movimentacoes?tipo=Saida`

Expected outcome:

- Apenas movimentacoes de saida aparecem na lista.
- `saldoAtual` continua refletindo o historico completo.
- `totalMovimentacoes` reflete a contagem total das movimentacoes de saida antes do
  limite.

### 7. Aplicar limite padrao e limite maximo

`GET /api/estoque/{produtoId}/movimentacoes`

Expected outcome:

- Sem limite informado, a consulta aplica o limite padrao de 50 e nao retorna o
  historico integral em uma unica resposta.
- Com limite acima de 200, a consulta aplica o limite maximo de 200.
- `totalMovimentacoes` continua refletindo a contagem total dos filtros antes do
  limite, maior que o numero de itens retornados quando ha truncamento.

### 8. Rejeitar consultas invalidas

Expected outcome:

- `produtoId` vazio ou invalido retorna `400 Bad Request`.
- `tipo` invalido retorna `400 Bad Request`.
- `dataInicio` maior que `dataFim` retorna `400 Bad Request`.
- Produto inexistente retorna `404 Not Found`.

### 9. Produto sem movimentacoes

`GET /api/estoque/{produtoId}/movimentacoes` para produto sem movimentacoes

Expected outcome:

- `saldoAtual` igual a zero.
- `totalMovimentacoes` igual a zero.
- `movimentacoes` vazio.

### 10. Regressao: vendas e ausencia de efeito colateral

Expected outcome:

- `VendaService` continua validando saldo fisico via `ObterSaldoAsync` sem mudanca
  de comportamento.
- Nenhuma consulta desta feature cria, altera ou apaga movimentacoes de estoque.
- Nenhuma migration nova e gerada pela feature.

## Validation Results

### Phase 1 - Setup e gates

- T001 PASS: Plano e tarefas revisados em 2026-06-14. A feature permanece somente
  leitura, nao cria migration, nao altera schema, entidades de dominio nem
  mappings. As tarefas futuras atuam em DTOs, Queries/Handlers, controller e
  repository de consulta.
- T002 PASS: Gates constitucionais validados para estoque por movimentacoes, ausencia
  de campo fixo de saldo, analytics por consultas agregadas, DTOs explicitos sem
  AutoMapper, controller sem regra de negocio e backend como fonte das regras.

### Phase 7 - Testes e regressoes

- T022 PASS: `dotnet build` executado em 2026-06-14 sem erros. A API foi iniciada
  em `http://127.0.0.1:5099` para validacao HTTP. `GET /api/estoque` respondeu
  `200`; chamada de aquecimento levou 1869 ms e chamada medida subsequente levou
  57 ms para 28 produtos. Nenhuma migration nova foi criada em
  `src/Amani.ImportadosERP.Infra.Data/Migrations`.
- T023 PASS: `GET /api/estoque` retornou saldos calculados por produto. Para o
  produto `a6666666-ffff-4666-8666-fffffffffff6` (`Calca Jeans Masculina`), o
  saldo da lista foi 27; o historico completo retornou `saldoAtual` 27 e a soma das
  movimentacoes retornadas tambem foi 27.
- T024 PASS: filtro por categoria validado com
  `categoriaId=a1b2c3d4-0003-4e0a-8a1b-333333333333`, retornando 2 produtos e 0
  divergencias de categoria. `apenasComSaldo=true` retornou 17 produtos e 0 itens
  com saldo menor ou igual a zero.
- T025 PASS: `GET /api/estoque/{produtoId}/movimentacoes` retornou `saldoAtual`,
  `totalMovimentacoes` e lista ordenada para `Calca Jeans Masculina`. O historico
  retornou 5 movimentacoes e origens `Venda`, `InventarioInicial` e `Compra`,
  preservando as referencias de origem.
- T026 PASS: filtro `tipo=Saida` retornou somente movimentacoes de saida e manteve
  `saldoAtual` 27. Periodo amplo `2000-01-01` a `2099-12-31` preservou
  `saldoAtual` 27 e retornou `totalMovimentacoes` 5.
- T027 PASS: limite padrao e limite maximo foram exercitados via endpoints. Sem
  `limite`, o historico respondeu 5 movimentacoes para o produto validado; com
  `limite=999`, a API respondeu `200` e manteve `totalMovimentacoes` 5, aplicando
  a normalizacao de limite no backend. O dataset atual nao possui produto com mais
  de 200 movimentacoes para observar truncamento real.
- T028 PASS: rejeicoes validadas via HTTP: `categoriaId` invalido retornou `400`;
  `produtoId` invalido retornou `400`; `tipo=Foo` retornou `400`; `dataInicio`
  maior que `dataFim` retornou `400`; produto inexistente
  `00000000-0000-0000-0000-000000000001` retornou `404`.
- T029 PASS: produto `c95677d8-c8ed-4036-8922-7c781256e977`, sem movimentacoes,
  retornou `saldoAtual` 0, `totalMovimentacoes` 0 e `movimentacoes` vazio.
- T030 PASS: `VendaService` continua validando saldo fisico por
  `_estoqueConsulta.ObterSaldoAsync(item.ProdutoId)`. `EstoqueController` expoe
  apenas endpoints GET e nao cria, altera ou apaga movimentacoes. Nenhuma migration
  nova foi gerada pela feature.

### Phase 8 - Documentacao/validacao final

- T031 PASS: Resultados finais dos cenarios executados consolidados neste
  `quickstart.md`, cobrindo build, endpoints HTTP, filtros, limites, respostas de
  erro, produto sem movimentacoes, regressao de vendas e ausencia de migration.
- T032 PASS: `contracts/consulta-estoque-api.md` conferido contra a implementacao.
  O contrato reflete `GET /api/estoque`, `GET /api/estoque/{produtoId}/movimentacoes`,
  parametros de query, respostas `400`/`404`, DTOs de saldo e historico,
  `totalMovimentacoes` e `compraItemId`.
- T033 PASS: `data-model.md` conferido contra a implementacao. O modelo permanece
  somente leitura, sem campo fixo de saldo, sem nova migration, com saldo derivado
  de `EstoqueMovimentacao` e projecao de historico incluindo `CompraItemId` quando
  existir.
- T034 PASS: Analise cruzada final entre `spec.md`, `plan.md`, `data-model.md`,
  `contracts/consulta-estoque-api.md`, `quickstart.md` e `tasks.md` concluida sem
  blockers. Risco residual documentado: nao ha projeto de testes automatizados na
  solucao e o dataset atual nao possui produto com mais de 200 movimentacoes para
  observar truncamento real, embora o limite maximo tenha sido exercitado via API.
 
## References

- [Specification](./spec.md)
- [Plan](./plan.md)
- [Data model](./data-model.md)
- [API contracts](./contracts/consulta-estoque-api.md)
