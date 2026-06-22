# Data Model: Financeiro Contas a Receber Frontend

## Backend Entities (existentes)

### ContaReceber (Domain Entity)

| Campo          | Tipo       | Restrições                                           |
|----------------|------------|------------------------------------------------------|
| Id             | Guid       | PK, gerado pelo BaseEntity                           |
| VendaId        | Guid?      | FK Venda; null quando Origem != "Venda"              |
| ClienteId      | Guid?      | FK Cliente; null quando conta originada de venda     |
| Valor          | decimal    | > 0                                                  |
| DataVencimento | DateTime   | UTC, somente parte de data                           |
| Origem         | string     | "Venda" \| "SaldoInicial" \| "ImplantacaoInicial" \| "Manual" (extensão B1) |
| Pagamentos     | ICollection\<PagamentoRecebido\> | Navigation property         |

**Invariantes**:
- `Valor > 0` (validado no construtor e em `Atualizar`)
- `DataVencimento` sempre UTC, sem componente de hora
- `Origem = "Venda"` exige `VendaId` não nulo; construtores manuais/iniciais
  exigem `ClienteId` não nulo

### PagamentoRecebido (Domain Entity — inferido do repositório)

| Campo         | Tipo     | Notas                            |
|---------------|----------|----------------------------------|
| Id            | Guid     | PK                               |
| ContaReceberId| Guid     | FK ContaReceber                  |
| Valor         | decimal  | > 0                              |
| DataPagamento | DateTime | UTC                              |

### Extensão B1 — Novo construtor em ContaReceber

```csharp
// Construtor para criação manual pelo operador
public ContaReceber(Guid clienteId, decimal valor, DateTime dataVencimento)
{
    // clienteId != Guid.Empty; valor > 0; dataVencimento != default
    ClienteId = clienteId;
    VendaId   = null;
    Valor     = valor;
    DataVencimento = DateTime.SpecifyKind(dataVencimento.Date, DateTimeKind.Utc);
    Origem    = "Manual";
    Pagamentos = new List<PagamentoRecebido>();
}
```

---

## Backend DTOs (existentes + extensões)

### ContaReceberListDto (existente, sem alteração)

```csharp
public Guid     Id              { get; set; }
public Guid?    VendaId         { get; set; }
public Guid?    ClienteId       { get; set; }
public string   Origem          { get; set; }   // "Manual"|"Venda"|"SaldoInicial"|...
public decimal  ValorTotal      { get; set; }
public decimal  TotalPago       { get; set; }
public decimal  Saldo           { get; set; }
public string   Status          { get; set; }   // "Pago" | "Pendente"
public DateTime DataVencimento  { get; set; }
```

> Nota: `ClienteId` pode ser nulo para contas originadas de venda; o frontend
> deve resolver o nome do cliente a partir do campo retornado pelo endpoint
> de listagem (o handler não retorna o nome do cliente — ver seção Limitações).

### ContaReceberPorClienteDto (existente, sem alteração)

```csharp
public Guid    ClienteId    { get; set; }
public string  NomeCliente  { get; set; }
public decimal TotalAReceber{ get; set; }   // soma dos saldos em aberto
```

### PagamentoDetalheDto (novo — extensão B2)

```csharp
public Guid     Id             { get; set; }
public decimal  Valor          { get; set; }
public DateTime DataPagamento  { get; set; }
```

### ContaReceberDetalheDto (estendido — extensão B2)

```csharp
public Guid     ContaId        { get; set; }
public Guid?    VendaId        { get; set; }
public Guid?    ClienteId      { get; set; }
public string   Origem         { get; set; }
public decimal  ValorTotal     { get; set; }
public decimal  TotalPago      { get; set; }
public decimal  Saldo          { get; set; }
public string   Status         { get; set; }   // ← NOVO (extensão B2)
public DateTime DataVencimento { get; set; }
public List<PagamentoDetalheDto> Pagamentos { get; set; }  // ← NOVO (extensão B2)
```

### CriarContaReceberCommand (estendido — extensão B1)

```csharp
public Guid?    ClienteId      { get; set; }   // ← NOVO; opcional
public Guid     VendaId        { get; set; }   // existente; ignorado se ClienteId informado
public decimal  Valor          { get; set; }
public DateTime DataVencimento { get; set; }
```

> O handler verifica: se `ClienteId` informado → usa construtor manual;
> caso contrário → usa construtor existente com `VendaId`.

---

## Frontend Types (novos — `types/receivable.ts`)

### Tipos de listagem e visão por cliente

```typescript
export type ReceivableStatus = "Pago" | "Pendente";

export type ReceivableOrigin =
  | "Manual"
  | "Venda"
  | "SaldoInicial"
  | "ImplantacaoInicial";

export interface ReceivableListItem {
  id: string;
  vendaId:        string | null;
  clienteId:      string | null;
  nomeCliente:    string | null;   // resolvido no frontend via lista de clientes
  origem:         ReceivableOrigin;
  valorTotal:     number;
  totalPago:      number;
  saldo:          number;
  status:         ReceivableStatus;
  dataVencimento: string;          // ISO 8601 (UTC)
}

export interface ReceivablesByClient {
  clienteId:     string;
  nomeCliente:   string;
  totalAReceber: number;
}

export interface PaymentDetail {
  id:            string;
  valor:         number;
  dataPagamento: string;   // ISO 8601 (UTC)
}

export interface ReceivableClientDetail {
  contaId:        string;
  vendaId:        string | null;
  clienteId:      string | null;
  origem:         ReceivableOrigin;
  valorTotal:     number;
  totalPago:      number;
  saldo:          number;
  status:         ReceivableStatus;
  dataVencimento: string;
  pagamentos:     PaymentDetail[];
}
```

### Payloads de mutação

```typescript
export interface CreateReceivablePayload {
  clienteId:      string;          // obrigatório para criação manual
  valor:          number;
  dataVencimento: string;          // YYYY-MM-DD (sem hora)
}

export interface UpdateReceivablePayload {
  valor:          number;
  dataVencimento: string;          // YYYY-MM-DD (sem hora)
}

export interface RegisterPaymentPayload {
  valor: number;
}
```

### Filtros e estado local

```typescript
export interface ReceivableFilters {
  status?: ReceivableStatus | "";
  nomeCliente?: string;
}

export interface CreateReceivableResponse {
  id: string;
}
```

---

## Limitações conhecidas

- `ContaReceberListDto` não retorna `NomeCliente`. O frontend pode manter o
  campo como `null` na lista ou cruzar com a lista de clientes carregada
  separadamente. Recomendado: cruzar com `useCustomers()` para exibição do nome.
- `ContaReceberPorClienteDto` só retorna contas com saldo > 0 (em aberto).
  Contas já quitadas não aparecem na visão "por cliente".
- `ContaReceberDetalheDto` (após extensão B2) só retorna contas em aberto do
  cliente; contas quitadas não estão presentes nessa visão.
- Datas chegam como `DateTime` UTC do .NET; o frontend deve formatá-las para
  exibição local sem recalcular nenhum valor financeiro.
