# Research: Vendas Frontend

## Decision: Implementar F013 somente no frontend

**Rationale**: O roadmap indica que `VendasController` ja possui criar, obter,
listar e cancelar. O backend tambem e a fonte oficial de validacao de estoque,
saida, lucro e custo medio. A F013 deve substituir o placeholder por telas
operacionais consumindo esses contratos.

**Alternatives considered**:

- Criar novos endpoints de venda: rejeitado porque o escopo exato e frontend
  sobre controller existente.
- Alterar backend para incluir status, cancelabilidade ou forma de pagamento:
  rejeitado porque F013 deve consumir o contrato atual; forma de pagamento e
  recebiveis ficam fora da F013 e pertencem ao financeiro.

## Decision: Criar service/hook/type de Vendas seguindo Compras e Estoque

**Rationale**: O frontend ja usa services por modulo, tipos explicitos,
TanStack Query e `queryKeys` por dominio. Repetir esse padrao reduz risco e
mantem cache/loading/error consistentes com os modulos operacionais recentes.

**Alternatives considered**:

- Fazer chamadas diretas nos componentes: rejeitado por quebrar padrao local e
  dificultar invalidacao de cache.
- Criar store global para rascunho de venda: rejeitado porque o rascunho e
  temporario e local ao fluxo de nova venda.

## Decision: Backend permanece fonte final de saldo, lucro e custo medio

**Rationale**: A constituicao exige backend como fonte das regras de negocio.
F013 pode usar estoque/produtos como apoio visual, mas a venda so e concluida
quando o backend aceita. Lucro nunca deve ser recalculado no cliente, e custo
medio permanece como base interna do calculo oficial.

**Alternatives considered**:

- Bloquear venda localmente usando saldo carregado em `/estoque`: rejeitado como
  fonte final porque saldo pode ficar defasado.
- Calcular lucro local a partir de preco e custo medio exibido: rejeitado por
  violar a constituicao e a spec.

## Decision: Consolidar produtos duplicados no rascunho da venda

**Rationale**: A clarificacao da spec definiu que o mesmo produto adicionado mais
de uma vez deve virar uma unica linha. Isso torna a validacao de quantidade,
preco, desconto e acrescimo mais previsivel e simplifica a leitura mobile.

**Alternatives considered**:

- Bloquear nova inclusao e pedir edicao manual: rejeitado por aumentar friccao.
- Permitir duplicidade e deixar o backend somar: rejeitado por criar experiencia
  ambigua e mensagens de saldo menos claras.

## Decision: Manter financeiro fora da F013

**Rationale**: A clarificacao da spec definiu que forma de pagamento, geracao de
recebiveis e controle financeiro pertencem ao fluxo financeiro futuro. A F013
deve focar venda operacional, estoque e lucro oficial.

**Alternatives considered**:

- Campo textual de pagamento: rejeitado por criar dado financeiro solto e sem
  controle posterior.
- Forma de pagamento obrigatoria: rejeitado porque o contrato atual de venda nao
  possui esse campo e F014 cobre recebiveis.

## Decision: Cancelamento como acao confirmada no detalhe

**Rationale**: Cancelar venda altera estado operacional e estoque. A acao deve
exigir confirmacao explicita, depender do sucesso do backend e invalidar leituras
de venda e estoque.

**Alternatives considered**:

- Cancelar diretamente pela lista: rejeitado para reduzir risco de acao acidental
  no MVP.
- Permitir desfazer localmente: rejeitado porque cancelamento real depende do
  backend e da rastreabilidade oficial.

## Decision: Sem dependencia nova

**Rationale**: O Design System local, React, App Router e TanStack Query ja
cobrem lista, formulario, dialogs e estados. Nova dependencia nao resolve
complexidade real neste escopo.

**Alternatives considered**:

- Biblioteca de formulario: rejeitada porque os formularios existentes de Compras
  ja mostram um padrao local suficiente.
- Biblioteca de tabela: rejeitada porque listas operacionais atuais usam
  componentes locais responsivos.
