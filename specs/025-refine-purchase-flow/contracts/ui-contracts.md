# UI and Integration Contracts: Refinamento do Fluxo de Nova Compra

**Feature**: [Refinamento do Fluxo de Nova Compra](../spec.md)

## 1. Contrato de integração preservado

A feature continua realizando uma única criação oficial após a revisão do carrinho.

### Operação

`POST /api/compras`

### Corpo existente

```json
{
  "fornecedorId": "guid",
  "dataCompra": "2026-07-01T00:00:00.000Z",
  "desconto": 0,
  "acrescimo": 0,
  "items": [
    {
      "produtoId": "guid",
      "quantidade": 3,
      "custoUnitario": 100,
      "desconto": 5,
      "acrescimo": 0
    }
  ]
}
```

### Resposta existente

```json
{
  "id": "guid"
}
```

Não são adicionados campos, endpoints ou chamadas intermediárias. Identificadores locais e estado de edição nunca fazem parte do corpo.

## 2. PurchaseItemComposer

Responsabilidade: exibir e alterar exatamente um item temporário, sem possuir o array oficial de itens.

### Entradas

- `item`: cópia atual do item em composição.
- `products`: referências disponíveis para seleção.
- `errors`: erros associados ao identificador do item temporário.
- `disabled`: impede alterações durante o envio.
- `isEditing`: altera título e ação principal para o modo de edição.

### Eventos

- `onChange(field, value)`: comunica alteração de um campo.
- `onInclude()`: solicita validação e inclusão ou confirmação da edição.
- `onCancelEdit()`: encerra a edição sem modificar o original.
- `onClear()`: descarta explicitamente conteúdo de uma nova composição.

### Garantias

- Não envia requisições.
- Não altera itens confirmados diretamente.
- Exibe erros junto ao campo correspondente.
- Oferece cancelamento no modo de edição e limpeza explícita quando houver conteúdo em nova composição.

## 3. PurchaseSummary

Responsabilidade: listar os itens confirmados, apresentar a prévia e emitir intenções de edição ou remoção.

### Entradas

- `draft`: dados gerais e itens confirmados.
- `products`: referências para resolução do nome dos produtos.
- `canSubmit`: resultado consultivo da validação completa.
- `disabled`: bloqueio durante envio ou outra transição incompatível.
- `editingItemId`: item atualmente copiado para o compositor, quando houver.

### Eventos

- `onEditItem(itemId)`: solicita edição de um item confirmado.
- `onRemoveItem(itemId)`: solicita remoção de um item confirmado.

### Garantias

- Mantém a ordem de `draft.items`.
- Mostra estado vazio quando não há itens.
- Exibe quantidade, custo, ajustes e líquido por item.
- Indica visualmente o item em edição.
- Não edita valores em linha.
- Não apresenta a prévia como valor oficial persistido.

## 4. Validação individual

`validatePurchaseItemDraft(item, products, existingItems, editingItemId?)`

### Resultado

Coleção de erros com `field`, `itemId` e `message`.

### Regras

- Produto obrigatório e existente.
- Produto não pode estar em outro item confirmado.
- Quantidade inteira maior que zero.
- Custo unitário maior ou igual a zero.
- Desconto e acréscimo vazios ou não negativos.

## 5. Validação final

O registro fica indisponível quando qualquer condição ocorrer:

- dados gerais inválidos;
- carrinho vazio;
- item confirmado inválido;
- compositor com conteúdo significativo;
- edição ativa;
- mutation de criação em andamento.

Ao tentar enviar com conteúdo não confirmado, a mensagem deve orientar: incluir/atualizar o item ou limpar/cancelar antes de registrar.

## 6. Falha e sucesso

### Falha

- Preservar dados gerais, itens confirmados, compositor e edição ativa.
- Exibir a mensagem normalizada do serviço.
- Permitir correção e nova tentativa.

### Sucesso

- Encaminhar para o detalhe da compra conforme o fluxo atual.
- A compra aparece como mercadoria em trânsito.
- Nenhuma entrada de estoque ocorre nessa transição.

