# Quickstart: Financeiro Contas a Receber — Guia de Validação

## Pré-requisitos

- Backend rodando em `http://localhost:5001` (ou porta configurada)
- Frontend rodando com `npm run dev` em `frontend/`
- Ao menos 1 cliente cadastrado via `/clientes`
- Ao menos 1 venda registrada via `/vendas` (para testar link de origem)
- Extensões B1 e B2 de backend implementadas (ver `plan.md`)

## Comandos de verificação estática

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

Todos devem passar sem erros antes de validar manualmente.

---

## Cenários de Validação

### C01 — Criar conta a receber manualmente

1. Acesse `/financeiro/contas-receber`
2. Clique em "Nova conta a receber"
3. Selecione um cliente existente
4. Informe valor (ex: 250,00) e data de vencimento
5. Confirme

**Esperado**: conta aparece na lista com Status "Pendente", ValorTotal 250,00,
Saldo 250,00 e Origem "Manual". O campo NomeCliente exibe o nome selecionado.

### C02 — Validação de campos obrigatórios na criação

1. Acesse `/financeiro/contas-receber/nova`
2. Tente confirmar sem informar cliente, valor ou data

**Esperado**: envio bloqueado; campos obrigatórios destacados. Nenhuma chamada
à API é feita antes de todos os campos estarem válidos.

### C03 — Registrar pagamento via modal

1. Na lista, selecione uma conta com Status "Pendente"
2. Abra a ação "Registrar pagamento" (modal/bottom-sheet)
3. Informe um valor menor que o saldo (ex: 100,00)
4. Confirme

**Esperado**: modal fecha após sucesso; conta atualiza TotalPago, Saldo e Status
na lista sem recarregar a página. Status permanece "Pendente" pois ainda há saldo.

### C04 — Quitar conta com pagamento total

1. Na lista, selecione a conta do C03 (saldo = 150,00)
2. Abra modal de pagamento e informe 150,00
3. Confirme

**Esperado**: Status passa para "Pago"; Saldo = 0.

### C05 — Filtro por status

1. Com lista carregada contendo contas "Pendente" e "Pago"
2. Selecione filtro "Pendente"

**Esperado**: apenas contas com Status "Pendente" visíveis. Ao selecionar
"Pago", apenas as pagas. Ao limpar filtro, todas voltam.

### C06 — Busca por nome de cliente

1. Com lista carregada contendo múltiplos clientes
2. Digite parte do nome de um cliente no campo de busca

**Esperado**: lista filtra localmente mostrando apenas contas desse cliente.
Limpar a busca restaura a lista completa.

### C07 — Link navegável para venda de origem

1. Com uma conta criada automaticamente por uma venda (Origem = "Venda")
2. Clique no link de origem exibido na lista ou no detalhe

**Esperado**: navegação para `/vendas/[vendaId]` sem erro de rota.

### C08 — Editar conta a receber

1. Selecione uma conta com Status "Pendente"
2. Acesse a edição (`/financeiro/contas-receber/[id]/editar`)
3. Altere o valor e/ou a data de vencimento
4. Confirme

**Esperado**: dados atualizados na lista após retorno. A fonte oficial confirma
a alteração; erro exibido se backend rejeitar.

### C09 — Excluir conta sem pagamentos

1. Selecione uma conta "Pendente" sem pagamentos registrados
2. Clique em excluir
3. Confirme no diálogo

**Esperado**: conta removida da lista. O diálogo não fecha e a conta permanece
até o backend confirmar. Se backend rejeitar, mensagem exibida e conta preservada.

### C10 — Cancelar exclusão

1. Selecione qualquer conta e abra diálogo de exclusão
2. Clique em cancelar

**Esperado**: nenhuma chamada à API; conta permanece na lista.

### C11 — Visão por cliente (tab "Por Cliente")

1. Em `/financeiro/contas-receber`, alterne para a tab "Por Cliente"

**Esperado**: lista de clientes com `NomeCliente` e `TotalAReceber`; apenas
clientes com saldo em aberto aparecem.

### C12 — Detalhe por cliente

1. Na tab "Por Cliente", clique em um cliente
2. Navegue para `/financeiro/contas-receber/cliente/[clienteId]`

**Esperado**: contas em aberto do cliente exibidas com ValorTotal, TotalPago,
Saldo, Status, DataVencimento e lista de pagamentos individuais (após extensão B2).

### C13 — Estado vazio

1. Acesse `/financeiro/contas-receber` sem nenhuma conta cadastrada

**Esperado**: estado vazio informativo com botão ou link para criar.

### C14 — Estado de erro

1. Pare o backend
2. Acesse `/financeiro/contas-receber`

**Esperado**: estado de erro exibido com opção de nova tentativa. Nenhum dado
simulado é apresentado.

### C15 — Validação de pagamento inválido

1. Abra modal de pagamento de uma conta
2. Tente confirmar com valor 0 ou negativo

**Esperado**: envio bloqueado com mensagem clara antes de chamar a API.

---

## Validação Mobile First

Repita os cenários C01, C03, C05, C11 e C12 nas seguintes resoluções:

| Dispositivo | Largura  |
|-------------|----------|
| Smartphone  | 390px    |
| Tablet      | 768px    |
| Desktop     | 1280px   |

**Esperado em todos**: campos, botões, modal/bottom-sheet, tabs e lista legíveis
e acionáveis sem sobreposição de conteúdo ou controles inacessíveis.

---

## Referências

- Spec: [spec.md](./spec.md)
- Data model: [data-model.md](./data-model.md)
- Contrato de API: [contracts/receivables-frontend.md](./contracts/receivables-frontend.md)
- Extensões de backend: ver seção "API Contract Findings" em [plan.md](./plan.md)
