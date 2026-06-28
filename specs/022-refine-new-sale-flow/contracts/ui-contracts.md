# UI and API Payload Contracts: Refinamento do Fluxo de Nova Venda

**Feature**: [Refinamento do Fluxo de Nova Venda](../spec.md)

Este documento define os contratos de interface visual, as APIs consumidas no frontend e o contrato do payload final de envio para o backend.

---

## 1. API de Criação de Cliente (Cadastro Rápido)

Consome o endpoint existente `POST /api/clientes` no backend.

### Request Payload (`CustomerPayload`)
```json
{
  "nome": "João da Silva",
  "email": "joao@email.com",
  "telefone": "11999999999"
}
```

### Response Payload (`Customer`)
```json
{
  "id": "e2a1b920-a612-421c-8e4d-587ad0487d21",
  "nome": "João da Silva",
  "email": "joao@email.com",
  "telefone": "11999999999",
  "ativo": true
}
```

---

## 2. API de Vendas (Payload de Envio)

A Nova Venda envia os dados para `POST /api/vendas` preservando integralmente o contrato original.

### Request Payload (`CreateSalePayload`)
```json
{
  "clienteId": "e2a1b920-a612-421c-8e4d-587ad0487d21",
  "dataVenda": "2026-06-28T12:00:00.000Z",
  "desconto": 10.00,
  "acrescimo": 5.00,
  "items": [
    {
      "produtoId": "8f89b910-c11d-44a3-b4cf-81bcf0bcf0a2",
      "quantidade": 2,
      "precoUnitario": 120.00,
      "desconto": 5.00,
      "acrescimo": 0.00
    }
  ],
  "formaPagamento": "Dinheiro",
  "percentualTaxaOverride": null
}
```

---

## 3. UI Component Contracts

### 3.1 Modal de Cliente Rápido (`QuickCustomerDialog`)
- **Propriedades**:
  - `open: boolean`: Controla visibilidade.
  - `onOpenChange: (open: boolean) => void`: Callback de fechamento/abertura.
  - `onSuccess: (customer: Customer) => void`: Chamado após criação bem-sucedida, repassando o objeto do cliente.
- **Validação Local**:
  - `nome` obrigatório.
  - `email` deve conter `@` e domínio se informado.
- **Ações**:
  - **Salvar**: Dispara a mutation, exibe loading e fecha se sucesso.
  - **Cancelar/Fechar**: Limpa campos locais e fecha o modal.

### 3.2 Compositor de Itens (`SaleItemComposer`)
- **Propriedades**:
  - `products: Product[]`: Lista completa de produtos ativos para seleção.
  - `stockByProductId: Map<string, StockProduct>`: Mapeamento de saldos de estoque consultivos.
  - `editingItem: SaleItemDraft | null`: Item atualmente carregado para edição (nulo se for nova inserção).
  - `onInclude: (item: SaleItemDraft) => void`: Callback ao clicar em "Incluir Item" (passa a cópia validada).
  - `onCancelEdit: () => void`: Callback se o usuário cancelar a edição do item.
- **Interface**:
  - Seletor de produto, input de quantidade, input de preço, input de desconto, input de acréscimo.
  - Botão "Incluir item" (ou "Atualizar item" se em modo edição) e botão opcional "Cancelar" (se em modo edição).
