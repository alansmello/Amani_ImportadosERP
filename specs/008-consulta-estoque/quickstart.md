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

(Preencher durante a implementacao e validacao final.)

## References

- [Specification](./spec.md)
- [Plan](./plan.md)
- [Data model](./data-model.md)
- [API contracts](./contracts/consulta-estoque-api.md)
