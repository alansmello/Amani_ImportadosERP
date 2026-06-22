# Frontend/API Contract: Financeiro Contas a Receber

**Base path**: `/api/contas-receber`
**Service file**: `frontend/src/services/receivables.ts`
**Types file**: `frontend/src/types/receivable.ts`
**Hook file**: `frontend/src/hooks/use-receivables.ts`

---

## Endpoints consumidos

### GET /api/contas-receber — Lista todas as contas

**Query params**: nenhum  
**Response**: `ReceivableListItem[]`

```typescript
// Mapeamento DTO → tipo frontend
// ContaReceberListDto → ReceivableListItem
{
  id:             string,            // c.Id
  vendaId:        string | null,     // c.VendaId
  clienteId:      string | null,     // c.ClienteId
  nomeCliente:    string | null,     // resolvido via useCustomers (não vem do DTO)
  origem:         ReceivableOrigin,  // c.Origem
  valorTotal:     number,            // c.ValorTotal
  totalPago:      number,            // c.TotalPago
  saldo:          number,            // c.Saldo
  status:         ReceivableStatus,  // "Pago" | "Pendente"
  dataVencimento: string             // ISO 8601 UTC
}
```

**Erros esperados**: 500 em falha de banco.

---

### GET /api/contas-receber/por-cliente — Visão agrupada por cliente

**Query params**: nenhum  
**Response**: `ReceivablesByClient[]`  
**Nota**: Apenas clientes com saldo total em aberto > 0.

```typescript
// ContaReceberPorClienteDto → ReceivablesByClient
{
  clienteId:     string,
  nomeCliente:   string,
  totalAReceber: number
}
```

---

### GET /api/contas-receber/cliente/{clienteId} — Detalhe por cliente

**Path param**: `clienteId` (UUID)  
**Response**: `ReceivableClientDetail[]`  
**Nota**: Apenas contas em aberto (saldo > 0). Após extensão B2 inclui `Status`
e `Pagamentos`.

```typescript
// ContaReceberDetalheDto (estendido) → ReceivableClientDetail
{
  contaId:        string,
  vendaId:        string | null,
  clienteId:      string | null,
  origem:         ReceivableOrigin,
  valorTotal:     number,
  totalPago:      number,
  saldo:          number,
  status:         ReceivableStatus,  // "Pago" | "Pendente"
  dataVencimento: string,
  pagamentos: [
    { id: string, valor: number, dataPagamento: string }
  ]
}
```

**Erros esperados**: lista vazia quando cliente sem contas em aberto; 500 em
falha de banco.

---

### POST /api/contas-receber — Criar conta a receber

**Request body**: `CreateReceivablePayload`

```typescript
// Enviado ao backend como CriarContaReceberCommand
{
  clienteId:      string,   // UUID — obrigatório para criação manual
  valor:          number,   // > 0
  dataVencimento: string    // "YYYY-MM-DD" (controller converte para UTC)
}
```

**Response**: `CreateReceivableResponse`

```typescript
{ id: string }
```

**Erros esperados**:
- `400 BadRequest` com `ModelState` quando campos inválidos
- `Exception("Valor inválido")` mapeada pelo middleware como 500 quando `valor <= 0`

**Invalidação de cache após sucesso**: `queryKeys.financeiro`

---

### POST /api/contas-receber/{id}/pagamentos — Registrar pagamento

**Path param**: `id` (UUID)  
**Request body**: `RegisterPaymentPayload`

```typescript
{ valor: number }   // > 0
```

**Response**: `200 OK` (sem body)  
**Erros esperados**: `500` se conta não encontrada ou valor inválido (tratado
pelo handler via exception).

**Invalidação de cache após sucesso**: `queryKeys.financeiro`

---

### PUT /api/contas-receber/{id} — Editar conta a receber

**Path param**: `id` (UUID)  
**Request body**: `UpdateReceivablePayload`

```typescript
// Enviado como AtualizarContaReceberDto
{
  valor:          number,   // > 0
  dataVencimento: string    // "YYYY-MM-DD"
}
```

**Response**: `200 OK` (sem body)  
**Erros esperados**: `400 BadRequest` quando ModelState inválido; `500` quando
conta não encontrada ou valor inválido.

**Invalidação de cache após sucesso**: `queryKeys.financeiro`

---

### DELETE /api/contas-receber/{id} — Excluir conta a receber

**Path param**: `id` (UUID)  
**Response**: `200 OK` (sem body)  
**Erros esperados**: `500` quando conta não encontrada ou regra de negócio
bloqueia exclusão. A interface deve exibir a mensagem da fonte oficial.

**Invalidação de cache após sucesso**: `queryKeys.financeiro`

---

## Service Frontend

```typescript
// frontend/src/services/receivables.ts (estrutura esperada)

const BASE = "/api/contas-receber";

export const receivablesService = {
  list():                              Promise<ReceivableListItem[]>
  listByClient():                      Promise<ReceivablesByClient[]>
  getClientDetail(clienteId: string):  Promise<ReceivableClientDetail[]>
  create(p: CreateReceivablePayload):  Promise<CreateReceivableResponse>
  registerPayment(id: string, p: RegisterPaymentPayload): Promise<void>
  update(id: string, p: UpdateReceivablePayload): Promise<void>
  delete(id: string):                  Promise<void>
}
```

---

## Hook Frontend

```typescript
// frontend/src/hooks/use-receivables.ts (estrutura esperada)

export const receivableQueryKeys = {
  all:          queryKeys.financeiro,
  list:         [...queryKeys.financeiro, "list"]         as const,
  byClient:     [...queryKeys.financeiro, "by-client"]    as const,
  clientDetail: (id: string) =>
                [...queryKeys.financeiro, "client", id]   as const,
}

export function useReceivables():            UseQueryResult<ReceivableListItem[]>
export function useReceivablesByClient():    UseQueryResult<ReceivablesByClient[]>
export function useReceivableClientDetail(
  clienteId: string | undefined
):                                           UseQueryResult<ReceivableClientDetail[]>

// Mutações — todas invalidam queryKeys.financeiro
export function useCreateReceivable():       UseMutationResult<...>
export function useRegisterPayment():        UseMutationResult<...>
export function useUpdateReceivable():       UseMutationResult<...>
export function useDeleteReceivable():       UseMutationResult<...>
```

---

## Rotas Frontend

```typescript
// Adições em frontend/src/config/routes.ts
contasReceber:       "/financeiro/contas-receber"
contasReceberNova:   "/financeiro/contas-receber/nova"

// Funções auxiliares
contaReceberEditar(id: string):          "/financeiro/contas-receber/{id}/editar"
contaReceberClienteDetalhe(cid: string): "/financeiro/contas-receber/cliente/{cid}"
vendaDetalhe(id: string):                "/vendas/{id}"  // já existente; reutilizar
```

---

## Tratamento de erros

O `apiClient` existente propaga erros via `throw`. Os hooks TanStack Query
expõem o erro em `error` e `isError`. Os componentes devem:

1. Exibir `<ErrorState>` nas queries com botão de nova tentativa.
2. No modal de pagamento e nos formulários, exibir a mensagem de erro retornada
   pelo backend (`error.message` ou texto fixo de fallback) sem fechar o modal.
3. Diálogo de exclusão não deve fechar nem remover o item da lista até que a
   mutation retorne sucesso.
4. Não simular estado de sucesso localmente antes da confirmação do backend.
