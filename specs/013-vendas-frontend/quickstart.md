# Quickstart: Vendas Frontend

## Prerequisites

- Backend executando com endpoints de Produtos, Clientes, Estoque e Vendas.
- Frontend configurado para apontar para a API local.
- Pelo menos um cliente ativo cadastrado.
- Pelo menos dois produtos cadastrados.
- Saldo disponivel gerado por implantacao inicial ou compras/recebimentos.

## Run

```powershell
cd frontend
npm install
npm run lint
npm run typecheck
npm run build
npm run dev
```

Abrir o frontend no endereco exibido pelo `npm run dev`.

## Validation scenarios

### 1. Listar e filtrar vendas

1. Acessar `/vendas`.
2. Confirmar que o placeholder foi substituido por lista operacional.
3. Aplicar filtro por periodo.
4. Aplicar filtro por cliente.
5. Limpar filtros.

**Expected**: lista reflete os filtros aplicados, mostra estados loading/erro/vazio
e abre detalhe de venda sem dados simulados.

### 2. Criar venda com saldo suficiente

1. Acessar `/vendas/nova`.
2. Selecionar cliente.
3. Adicionar produto com saldo disponivel.
4. Informar quantidade, preco, desconto e acrescimo.
5. Confirmar venda.

**Expected**: venda e aceita pela fonte oficial, usuario recebe confirmacao,
leituras de vendas e estoque sao atualizadas, e nenhum campo de forma de
pagamento aparece.

### 3. Consolidar produto duplicado

1. Em `/vendas/nova`, adicionar um produto.
2. Adicionar o mesmo produto novamente.

**Expected**: o rascunho consolida o produto em uma unica linha, somando
quantidade e mantendo preco/desconto/acrescimo claros antes da confirmacao.

### 4. Bloquear venda sem saldo suficiente

1. Acessar `/vendas/nova`.
2. Selecionar cliente.
3. Adicionar produto sem saldo suficiente ou quantidade acima do disponivel.
4. Confirmar venda.

**Expected**: backend rejeita a operacao, mensagem clara de estoque insuficiente
aparece, a venda permanece nao concluida e nenhum saldo/lucro e recalculado no
cliente.

### 5. Consultar detalhe com lucro oficial

1. Abrir uma venda existente em `/vendas/[vendaId]`.
2. Conferir cliente, data, itens, valores, total e lucro.

**Expected**: valores exibidos correspondem ao retorno oficial; se lucro nao
estiver disponivel, a interface comunica ausencia sem calcular valor substituto.

### 6. Cancelar venda

1. Abrir uma venda registrada.
2. Acionar cancelar.
3. Confirmar no dialog.

**Expected**: cancelamento so aparece apos confirmacao explicita, sucesso aparece
somente apos aceite oficial e atualiza venda/lista/estoque; falha preserva estado
anterior e permite nova tentativa.

### 7. Ausencias obrigatorias de escopo

Verificar em lista, nova venda e detalhe que nao existem:

- forma de pagamento;
- geracao de recebiveis;
- edicao de venda;
- devolucao parcial;
- emissao fiscal;
- calculo local de saldo, custo medio ou lucro.

### 8. Responsividade

Executar os cenarios principais em:

- smartphone em torno de 390px de largura;
- tablet;
- desktop.

**Expected**: textos, filtros, itens, totais, mensagens e acoes permanecem
legiveis e acionaveis sem sobreposicao.

## References

- Data model: [data-model.md](./data-model.md)
- Contract: [contracts/vendas-frontend.md](./contracts/vendas-frontend.md)
- Spec: [spec.md](./spec.md)
