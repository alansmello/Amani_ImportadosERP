# Contratos de API — F027 Devoluções e Reembolsos de Compras

**Feature**: `027-devolucoes-reembolsos-compras`

**Base**: `/api/compras`

**Compatibilidade**: todos os acréscimos em endpoints existentes são aditivos; nenhum campo ou significado atual é removido.

## Convenções

- Valores monetários usam decimal com duas casas e devem ser enviados como número JSON.
- Datas civis usam `YYYY-MM-DD`; instantes retornados pelo servidor usam ISO 8601 UTC.
- Toda confirmação recebe um novo `operacaoId` (GUID gerado pelo cliente). Dentro do mesmo tipo de comando, o mesmo identificador e conteúdo devolve o resultado já criado; reutilização no mesmo tipo com conteúdo diferente retorna `409 Conflict`. Tipos diferentes de comando não compartilham identidade operacional.
- Nenhuma data efetiva pode estar no futuro. Reembolso e devolução anterior não podem anteceder a compra; devolução posterior não pode anteceder a compra nem o recebimento referenciado; compensação não pode anteceder a devolução; cancelamento não pode anteceder o reembolso.
- Recursos devem pertencer à compra e ao item indicados na rota. Referências cruzadas retornam `404 Not Found`, sem revelar dados de outra compra.
- Enquanto `DevolucoesReembolsosComprasEnabled=false`, comandos da feature retornam `409 Conflict` com o código `FEATURE_DESABILITADA`; consultas permanecem compatíveis e retornam os novos totais zerados ou listas vazias.
- Correções são feitas por compensação ou cancelamento. Não existem `PUT`, `PATCH` ou `DELETE` para registros financeiros, de estoque ou de devolução.

## Enumerações públicas

### MomentoDevolucao

- `AntesDoRecebimento`
- `DepoisDoRecebimento`

### MotivoDevolucao

- `ProdutoFalsificado`
- `Avaria`
- `ProdutoIncorreto`
- `DesistenciaRecusa`
- `Outro`

### SituacaoReembolso

- `SemReembolso`
- `Parcial`
- `Integral`

## Devoluções

### Registrar devolução

`POST /api/compras/{compraId}/itens/{itemId}/devolucoes`

```json
{
  "operacaoId": "d9ab78f4-4f70-4897-802a-09b78da476c9",
  "momento": "DepoisDoRecebimento",
  "compraItemRecebimentoId": "c48ef025-f98d-42a9-b69b-3fc71525d37f",
  "quantidade": 2,
  "motivo": "ProdutoFalsificado",
  "dataDevolucao": "2026-08-16",
  "observacao": "Devolução autorizada pelo fornecedor"
}
```

Regras específicas:

- `quantidade` deve ser inteira e maior que zero.
- Em `AntesDoRecebimento`, `compraItemRecebimentoId` deve ser nulo e a quantidade líquida não pode ultrapassar a quantidade ainda pendente do item.
- Em `DepoisDoRecebimento`, `compraItemRecebimentoId` é obrigatório, deve pertencer ao item e a quantidade líquida não pode ultrapassar o saldo elegível daquele recebimento.
- A devolução posterior exige estoque disponível suficiente e cria uma movimentação `Saida` na mesma transação serializável.
- O valor de custo revertido usa `quantidade × ValorUnitario` do recebimento referenciado. O valor comercial bruto usa o rateio oficial da compra definido na F026.

Resposta inicial: `201 Created`. Repetição idempotente: `200 OK`.

```json
{
  "id": "46d70ee2-c717-471d-9a78-b37447bf8e78",
  "compraId": "71bdb6d0-91c0-45f2-a508-f9644c080366",
  "compraItemId": "37fcb0b8-ebc1-4619-8d33-68da1d06c683",
  "compraItemRecebimentoId": "c48ef025-f98d-42a9-b69b-3fc71525d37f",
  "estoqueMovimentacaoId": "8db69c35-385f-47e3-bb89-4e2495184f90",
  "momento": "DepoisDoRecebimento",
  "quantidade": 2,
  "quantidadeCompensada": 0,
  "quantidadeVigente": 2,
  "motivo": "ProdutoFalsificado",
  "dataDevolucao": "2026-08-16",
  "observacao": "Devolução autorizada pelo fornecedor",
  "valorComercialBruto": 120.00,
  "valorCustoEstoque": 105.40,
  "compensada": false,
  "criadoEm": "2026-08-16T15:20:00Z"
}
```

### Listar devoluções da compra

`GET /api/compras/{compraId}/devolucoes`

Resposta `200 OK`:

```json
{
  "items": [],
  "quantidadeVigenteAntesRecebimento": 0,
  "quantidadeVigenteDepoisRecebimento": 0,
  "valorComercialBrutoVigente": 0.00
}
```

### Compensar devolução lançada por engano

`POST /api/compras/{compraId}/devolucoes/{devolucaoId}/compensacoes`

```json
{
  "operacaoId": "0b75cf87-b2a3-422f-b9f2-937c1cf533cc",
  "dataCompensacao": "2026-08-16",
  "motivo": "Lançamento duplicado",
  "presencaFisicaConfirmada": true
}
```

Regras específicas:

- Só uma compensação é aceita por devolução.
- Para devolução posterior ao recebimento, `presencaFisicaConfirmada=true` é obrigatório e a compensação cria uma movimentação `Entrada`, restaurando quantidade e custo pelo mesmo snapshot do recebimento.
- Para devolução anterior ao recebimento, não há movimentação de estoque.
- A compensação não apaga o evento original nem altera retroativamente datas passadas.

Resposta inicial: `201 Created`. Repetição idempotente: `200 OK`.

## Reembolsos

### Registrar crédito recebido do fornecedor

`POST /api/compras/{compraId}/reembolsos`

```json
{
  "operacaoId": "5105fbbb-d856-4683-85b8-31499ff9b7e4",
  "valor": 80.00,
  "dataReembolso": "2026-08-16",
  "referenciaExterna": "SHOPEE-REF-123",
  "observacao": "Crédito parcial",
  "alocacoes": [
    {
      "compraItemId": "37fcb0b8-ebc1-4619-8d33-68da1d06c683",
      "compraItemPerdaId": null,
      "compraItemDevolucaoId": "46d70ee2-c717-471d-9a78-b37447bf8e78",
      "valor": 60.00
    }
  ]
}
```

Regras específicas:

- `valor` deve ser maior que zero.
- A soma das alocações não pode ultrapassar `valor`; o restante pode ficar não alocado.
- Cada alocação deve apontar para o item da compra e, opcionalmente, para uma única perda ou devolução desse item.
- O total líquido de reembolsos da compra, após cancelamentos, não pode ultrapassar o valor oficial total da compra definido na F026.
- `referenciaExterna`, quando informada, é única dentro da compra.
- Registrar reembolso não movimenta estoque e não exige devolução prévia.

Resposta inicial: `201 Created`. Repetição idempotente: `200 OK`.

```json
{
  "id": "47455b7f-dff4-44e8-987b-a3d1961b2406",
  "compraId": "71bdb6d0-91c0-45f2-a508-f9644c080366",
  "valor": 80.00,
  "valorAlocado": 60.00,
  "valorNaoAlocado": 20.00,
  "dataReembolso": "2026-08-16",
  "referenciaExterna": "SHOPEE-REF-123",
  "cancelado": false,
  "criadoEm": "2026-08-16T15:30:00Z",
  "alocacoes": []
}
```

### Listar reembolsos da compra

`GET /api/compras/{compraId}/reembolsos`

Resposta `200 OK`:

```json
{
  "items": [],
  "valorTotalCompra": 300.00,
  "totalReembolsadoLiquido": 80.00,
  "saldoReembolsavel": 220.00,
  "situacaoReembolso": "Parcial"
}
```

### Cancelar reembolso lançado por engano

`POST /api/compras/{compraId}/reembolsos/{reembolsoId}/cancelamentos`

```json
{
  "operacaoId": "323be832-5213-44ed-93b8-b72bd55f30f8",
  "dataCancelamento": "2026-08-17",
  "motivo": "Crédito estornado pelo fornecedor"
}
```

- Só um cancelamento é aceito por reembolso.
- O cancelamento entra no financeiro pela própria data efetiva, não reescreve o passado e invalida as alocações para apuração posterior à data.
- Não movimenta estoque.

Resposta inicial: `201 Created`. Repetição idempotente: `200 OK`.

## Extensões aditivas em compras

### `GET /api/compras/{compraId}`

Acrescentar ao DTO raiz:

```json
{
  "totalReembolsadoLiquido": 80.00,
  "saldoReembolsavel": 220.00,
  "custoFinanceiroLiquido": 220.00,
  "situacaoReembolso": "Parcial",
  "possuiDevolucao": true
}
```

Acrescentar a cada item:

```json
{
  "quantidadeDevolvidaAntesRecebimento": 0,
  "quantidadeDevolvidaDepoisRecebimento": 2,
  "quantidadeElegivelDevolucaoPosRecebimento": 3
}
```

### `GET /api/compras`

Acrescentar ao resumo de cada compra:

```json
{
  "totalReembolsadoLiquido": 80.00,
  "custoFinanceiroLiquido": 220.00,
  "situacaoReembolso": "Parcial",
  "possuiDevolucao": true
}
```

O status logístico existente conserva seu significado. A situação de reembolso é apresentada separadamente.

## Extensões aditivas em dashboards e estoque

Os endpoints existentes de dashboard recebem, conforme o recorte já aceito por cada rota:

```json
{
  "reembolsosComprasPeriodo": 80.00,
  "entradasCaixaPeriodo": 1080.00,
  "devolucoesRegistradasQuantidade": 2,
  "devolucoesRegistradasValor": 120.00,
  "valorRecuperadoAssociado": 60.00,
  "prejuizoLiquidoNaoRecuperado": 60.00
}
```

Semântica financeira:

- `reembolsosComprasPeriodo = créditos por data do reembolso − cancelamentos por data do cancelamento`.
- `entradasCaixaPeriodo = valoresRecebidosClientes + reembolsosComprasPeriodo`.
- `saldoOperacional = entradasCaixaPeriodo − comprasBrutasPeriodo − despesasPeriodo`.
- `saldoCaixaFinal = saldoCaixaInicial + ajustes + entradasCaixaPeriodo − saídasPeriodo`.
- O campo legado de valores recebidos conserva exclusivamente recebimentos de clientes.

Semântica operacional:

- Ocorrências brutas são selecionadas pela data da perda ou devolução.
- Recuperações associadas consideram alocações efetivas até a data de referência.
- `prejuizoLiquidoNaoRecuperado = max(0, ocorrenciasBrutasDoRecorte − recuperacoesAssociadasEfetivas)`.

Nas consultas de movimentação de estoque, acrescentar origens derivadas:

- `DevolucaoCompra`, resolvida pela relação com `CompraItemDevolucao`.
- `CompensacaoDevolucaoCompra`, resolvida pela relação com `CompraItemDevolucaoCompensacao`.

## Erros de domínio

| HTTP | Código | Quando ocorre |
|---|---|---|
| 400 | `DADOS_INVALIDOS` | Formato, data, quantidade, valor ou combinação de campos inválida |
| 404 | `COMPRA_NAO_ENCONTRADA` | Compra inexistente ou fora do escopo |
| 404 | `ITEM_NAO_ENCONTRADO` | Item não pertence à compra |
| 404 | `RECEBIMENTO_NAO_ENCONTRADO` | Recebimento não pertence ao item |
| 404 | `DEVOLUCAO_NAO_ENCONTRADA` | Devolução não pertence à compra |
| 404 | `REEMBOLSO_NAO_ENCONTRADO` | Reembolso não pertence à compra |
| 409 | `FEATURE_DESABILITADA` | Escrita tentada antes da ativação controlada |
| 409 | `OPERACAO_ID_REUTILIZADA` | Mesmo `operacaoId`, no mesmo tipo de comando, com conteúdo diferente |
| 409 | `QUANTIDADE_DEVOLUCAO_EXCEDIDA` | Quantidade supera o saldo elegível |
| 409 | `ESTOQUE_INSUFICIENTE` | Devolução posterior não pode gerar a saída |
| 409 | `LIMITE_REEMBOLSO_EXCEDIDO` | Crédito líquido ultrapassaria o total oficial da compra |
| 409 | `REFERENCIA_EXTERNA_DUPLICADA` | Referência já usada na mesma compra |
| 409 | `REGISTRO_JA_COMPENSADO` | Segunda compensação ou cancelamento |
| 409 | `CONCORRENCIA_DETECTADA` | Estado mudou durante a operação; cliente deve recarregar |

## Compatibilidade e versionamento

- Clientes antigos continuam válidos porque campos novos são apenas de resposta e rotas novas são independentes.
- O frontend deve tolerar campos ausentes durante implantação gradual, usando zero, lista vazia ou `SemReembolso` como fallback de leitura.
- A ativação do frontend que envia comandos só ocorre depois que a migration e o backend compatível estiverem implantados.
- Nenhum endpoint autoriza exclusão física ou edição destrutiva dos eventos.
