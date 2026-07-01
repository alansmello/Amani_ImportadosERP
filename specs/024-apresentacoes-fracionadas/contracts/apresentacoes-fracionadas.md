# Contract: Apresentações Comerciais e Venda Fracionada

Todos os novos campos são aditivos. Campos de apresentação são opcionais em respostas legadas.

## Produto e apresentações

### `GET /api/produtos/{produtoId}` e `GET /api/produtos`

Adicionam `apresentacoes`:

```json
{
  "id": "guid",
  "nome": "Medicamento X",
  "precoVenda": 120.00,
  "apresentacoes": [
    {
      "id": "guid",
      "nome": "Dose",
      "fatorNumerador": 1,
      "fatorDenominador": 24,
      "fatorCalculado": 0.041666666667,
      "permiteCompra": false,
      "permiteVenda": true,
      "precoVenda": 8.00,
      "ativo": true
    }
  ]
}
```

### `POST /api/produtos/{produtoId}/apresentacoes`

```json
{
  "nome": "Ampola",
  "fatorNumerador": 1,
  "fatorDenominador": 4,
  "permiteCompra": false,
  "permiteVenda": true,
  "precoVenda": 35.00,
  "ativo": true
}
```

Retorna `201`. Retorna `400` para numerador/denominador inválidos, numerador maior que denominador, `permiteCompra=true`, nome duplicado ou produto inexistente.

### `PUT /api/produtos/{produtoId}/apresentacoes/{id}`

Atualiza configuração para novas vendas. Não altera snapshots existentes. Retorna `204`, `400` ou `404`.

### `POST /api/produtos/{produtoId}/apresentacoes/{id}/desativar`

Desativa para novas vendas sem exclusão física. Retorna `204` ou `404`.

## Criar venda

### `POST /api/vendas`

Item legado continua aceito quando o produto não possui apresentações configuradas:

```json
{
  "produtoId": "guid",
  "quantidade": 2,
  "precoUnitario": 120.00
}
```

Item com apresentação adiciona `produtoApresentacaoId`; numerador, denominador e conversão são calculados no backend e não são confiados ao cliente:

```json
{
  "produtoId": "guid",
  "produtoApresentacaoId": "guid",
  "quantidade": 2,
  "precoUnitario": 35.00,
  "desconto": 0.00,
  "acrescimo": 0.00
}
```

Erros `400`: apresentação ausente quando obrigatória, inativa, sem permissão, de outro produto, saldo exato insuficiente ou configuração alterada durante a confirmação.

## Resposta de venda

```json
{
  "id": "guid",
  "produtoId": "guid",
  "quantidade": 2,
  "precoUnitario": 35.00,
  "produtoApresentacaoId": "guid",
  "apresentacaoNome": "Ampola",
  "fatorNumeradorAplicado": 1,
  "fatorDenominadorAplicado": 4,
  "fatorConversaoAplicado": 0.250000000000,
  "quantidadeConvertidaEstoque": 0.500000000000,
  "valorTotal": 70.00
}
```

Para venda legada, os campos novos retornam `null` e `quantidade` conserva o significado anterior.

## Estoque

Contratos existentes mantêm nomes e passam a retornar `saldo` e `quantidade` como números decimais. O backend usa razão exata internamente; a resposta é uma projeção formatável.

## Concorrência e atomicidade

A validação definitiva e a persistência da venda, snapshot e saída ocorrem na mesma unidade transacional. O cliente deve tratar rejeição de saldo como resultado definitivo e recarregar o saldo.
