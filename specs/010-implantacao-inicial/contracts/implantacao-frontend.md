# Frontend/API Contract: Implantacao Inicial

## Scope

Este contrato descreve como o frontend da F010 deve consumir os endpoints
existentes de implantacao. O backend e fonte oficial das validacoes, registros,
movimentacoes e rejeicoes.

## Supporting Data

### Produtos

Use a listagem oficial de produtos existente para preencher inventario inicial.

```http
GET /api/produtos
```

Campos usados no fluxo:

- `id`
- `nome`
- `custo`

### Clientes

Use a listagem oficial de clientes ativos existente para preencher recebiveis
iniciais.

```http
GET /api/clientes?ativo=true
```

Campos usados no fluxo:

- `id`
- `nome`
- `email`
- `telefone`
- `ativo`

## Register Initial Inventory

```http
POST /api/implantacao/inventario-inicial
Content-Type: application/json
```

### Request

```json
{
  "data": "2026-06-15T00:00:00.000Z",
  "origem": "ImplantacaoInicial",
  "itens": [
    {
      "produtoId": "00000000-0000-0000-0000-000000000000",
      "quantidade": 10,
      "valorUnitario": 25.5
    }
  ]
}
```

### Response 200

```json
{
  "data": "2026-06-15T00:00:00Z",
  "origem": "ImplantacaoInicial",
  "quantidadeItens": 1,
  "movimentacoesIds": [
    "00000000-0000-0000-0000-000000000000"
  ]
}
```

### Validation

- `data` obrigatoria.
- `origem` deve ser `ImplantacaoInicial`.
- `itens` deve conter ao menos um item.
- `produtoId` obrigatorio.
- `quantidade` maior que zero.
- `valorUnitario`, quando informado, nao pode ser negativo.
- Produtos duplicados no mesmo lote devem ser impedidos no frontend e tambem sao
  rejeitados pela fonte oficial.

### Frontend Behavior

- Enviar inventario como um unico lote.
- Marcar etapa como concluida somente apos `200`.
- Bloquear novo envio apos sucesso.
- Em erro, manter dados preenchidos para correcao.

## Register Initial Cash Balance

```http
POST /api/implantacao/saldo-inicial-caixa
Content-Type: application/json
```

### Request

```json
{
  "valor": 1500.0,
  "data": "2026-06-15T00:00:00.000Z",
  "origem": "SaldoInicial",
  "descricao": "Saldo inicial informado na implantacao"
}
```

### Response 200

```json
{
  "eventoFinanceiroId": "00000000-0000-0000-0000-000000000000",
  "valor": 1500.0,
  "data": "2026-06-15T00:00:00Z",
  "origem": "SaldoInicial"
}
```

### Validation

- `valor` obrigatorio.
- `data` obrigatoria.
- `origem` obrigatoria, usando `SaldoInicial` nesta feature.
- `descricao` opcional.

### Frontend Behavior

- Exibir revisao antes do envio.
- Marcar etapa como concluida somente apos `200`.
- Bloquear novo envio apos sucesso.
- Em erro, mostrar mensagem retornada pela fonte oficial.

## Register Initial Receivable

```http
POST /api/implantacao/contas-receber-iniciais
Content-Type: application/json
```

### Request

```json
{
  "clienteId": "00000000-0000-0000-0000-000000000000",
  "valor": 350.0,
  "dataVencimento": "2026-07-15T00:00:00.000Z",
  "origem": "ImplantacaoInicial",
  "descricao": "Conta anterior ao uso do ERP"
}
```

### Response 200

```json
{
  "contaReceberId": "00000000-0000-0000-0000-000000000000",
  "clienteId": "00000000-0000-0000-0000-000000000000",
  "valor": 350.0,
  "dataVencimento": "2026-07-15T00:00:00Z",
  "origem": "ImplantacaoInicial"
}
```

### Validation

- `clienteId` obrigatorio.
- `valor` maior que zero.
- `dataVencimento` obrigatoria.
- `origem` deve ser `ImplantacaoInicial` para esta feature.
- `descricao` opcional.

### Frontend Behavior

- A UX permite montar um lote local de contas, mas o endpoint registra uma conta
  por chamada.
- Validar todos os itens locais antes de iniciar envios.
- Enviar itens sequencialmente ou com controle simples, sem marcar sucesso por
  item na UI.
- Marcar a etapa como concluida somente se todos os envios retornarem sucesso.
- Se qualquer envio falhar, a etapa permanece com erro/pendente e nenhum item do
  lote e exibido como concluido.

## Error Contract

Erros conhecidos podem retornar:

```json
{
  "error": "Mensagem de erro da fonte oficial"
}
```

O `apiClient` atual normaliza mensagens HTTP de erro. A implementacao deve, se
necessario, melhorar a leitura de `{ error }` para exibir a mensagem especifica
retornada pelo backend sem depender de dados mockados.

## Cache and State Contract

- Dados confirmados ficam na fonte oficial; o frontend nao persiste estado local
  como fonte de verdade.
- Estado `completed` e bloqueio de reenvio sao feedback local apos sucesso da
  etapa.
- Reabertura, edicao em massa e importacao de planilha estao fora do contrato da
  F010.
