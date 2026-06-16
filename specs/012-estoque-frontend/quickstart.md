# Quickstart: Estoque Frontend

## Prerequisites

- Backend com F008 disponivel para consulta oficial de estoque.
- Backend/frontend da F011 disponivel para produtos pendentes de recebimento.
- Produtos cadastrados.
- Ao menos um produto com saldo positivo, um produto com saldo zero e, quando
  possivel, um produto com saldo negativo para validar destaque de
  inconsistencia.
- Ao menos uma compra com item pendente para validar pendencias.

## Run

```powershell
cd frontend
npm run lint
npm run typecheck
npm run build
npm run dev
```

Abrir a aplicacao no navegador e acessar `/estoque`.

## Validation Scenarios

### 1. Lista padrao de estoque

1. Acessar `/estoque` sem filtros.
2. Confirmar que todos os produtos retornados pela fonte oficial aparecem,
   inclusive produtos com saldo zero.
3. Confirmar que cada saldo exibido corresponde ao valor oficial.
4. Confirmar que nenhum saldo e calculado a partir de pendencias.

Expected outcome: lista operacional carrega com saldos oficiais, sem dados
mockados e sem mensagem de placeholder.

### 2. Busca e filtro com saldo

1. Pesquisar um produto por nome, codigo ou identificacao equivalente.
2. Confirmar que a lista exibe somente produtos correspondentes.
3. Ativar filtro para produtos com saldo.
4. Confirmar que produtos com saldo zero deixam de aparecer.
5. Limpar filtros.

Expected outcome: a lista volta ao estado padrao com todos os produtos oficiais.

### 3. Saldo negativo

1. Abrir a lista com um produto cujo saldo oficial seja negativo.
2. Confirmar que o valor negativo aparece sem ser convertido para zero.
3. Confirmar que a interface destaca a inconsistencia operacional.
4. Abrir o detalhe do produto.

Expected outcome: o detalhe continua acessivel para auditoria do historico.

### 4. Detalhe e historico de movimentacoes

1. Abrir o detalhe de um produto com entradas e saidas.
2. Confirmar saldo atual, tipo, quantidade, data e origem das movimentacoes.
3. Aplicar filtro por periodo.
4. Aplicar filtro por tipo de movimentacao.
5. Limpar filtros.

Expected outcome: historico respeita filtros da fonte oficial e sinaliza lista
vazia ou limitada quando aplicavel.

### 5. Produto sem movimentacoes

1. Abrir o detalhe de um produto sem movimentacoes.
2. Confirmar que o saldo exibido vem da fonte oficial.
3. Confirmar estado vazio de historico.

Expected outcome: historico vazio nao aparece como erro.

### 6. Produtos pendentes de recebimento

1. Acessar a visao de pendencias dentro de `/estoque`.
2. Confirmar produto, fornecedor, compra de origem e quantidade pendente.
3. Confirmar que a quantidade pendente nao aparece como saldo disponivel.
4. Acionar uma pendencia com compra de origem.

Expected outcome: a aplicacao abre o detalhe da compra de origem.

### 7. Estados de erro e retry

1. Simular indisponibilidade da consulta de estoque.
2. Confirmar estado de erro da lista e acao de nova tentativa.
3. Simular indisponibilidade de pendencias com saldos ja carregados.
4. Confirmar que erro de pendencias nao bloqueia a lista de saldos.

Expected outcome: erros sao compreensiveis e recuperaveis sem dados falsos.

### 8. Mobile First

Validar os cenarios principais em:

- smartphone aproximado de 390px de largura;
- tablet;
- desktop.

Expected outcome: lista, filtros, detalhe, historico e pendencias permanecem
legiveis, acionaveis e sem sobreposicao.

## Regression Checks

- `/compras` continua exibindo produtos pendentes.
- Atalho de pendencia em Estoque abre a mesma rota de detalhe de compra.
- Recebimento e perda continuam indisponiveis em Estoque e permanecem no modulo
  de Compras.
- Navegacao marca Estoque como modulo pronto quando a feature for implementada.
