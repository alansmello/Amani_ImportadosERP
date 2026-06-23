# Research: Financeiro: Despesas + Categorias de Despesa

## Decision: CategoriaDespesa ganha status ativo/inativo

**Rationale**: A spec exige que categorias antigas possam deixar de ser usadas
sem quebrar historico. Inativacao preserva despesas ja classificadas e evita
exclusao destrutiva.

**Alternatives considered**:

- Manter todas as categorias sempre ativas: simples, mas polui novos
  lancamentos com categorias antigas.
- Excluir categoria: viola preservacao historica e conflita com despesas
  existentes.

## Decision: Despesa usa uma unica data de competencia/ocorrencia

**Rationale**: F016 nao implementa contas a pagar nem conciliacao. Uma data
unica atende filtros, dashboard e fechamento mensal sem introduzir ciclo de
pagamento separado.

**Alternatives considered**:

- Competencia + data de pagamento: util futuramente, mas expande para contas a
  pagar.
- Data de lancamento sempre: rapido, mas distorce fechamento quando uma despesa
  passada e cadastrada depois.

## Decision: Forma de pagamento obrigatoria em despesa operacional

**Rationale**: O usuario escolheu tornar forma de pagamento obrigatoria. Isso
melhora conferencia financeira e obriga dados completos no lancamento.

**Alternatives considered**:

- Sem forma de pagamento: escopo menor, mas nao atende a decisao de produto.
- Forma opcional: reduz validacao, mas gera registros inconsistentes.

## Decision: Formas permitidas em despesa sao Dinheiro, PIX, CartaoDebito e CartaoCredito

**Rationale**: Reaproveita a linguagem financeira ja usada em vendas e exclui
Fiado para nao representar divida pendente sem modulo de contas a pagar.

**Alternatives considered**:

- Incluir Fiado: confundiria despesa operacional com conta a pagar.
- Limitar a Dinheiro/PIX/Debito: impediria registrar despesas pagas no credito.

## Decision: Backend valida categoria ativa, duplicidade e forma de pagamento

**Rationale**: A constituicao define backend como fonte das regras de negocio.
Frontend pode melhorar UX, mas validacao autoritativa deve ficar em
Application/Domain.

**Alternatives considered**:

- Validar apenas no frontend: inconsistente para API, testes e futuras
  integracoes.
- Validar no controller: simples, mas espalha regra fora da camada adequada.

## Decision: Frontend segue fluxo financeiro existente sem dependencia nova

**Rationale**: A tela pode ser implementada com o Design System local,
TanStack Query, services/hooks/types e componentes de formulario/lista ja usados
em F014/F015. Nao ha necessidade de biblioteca nova.

**Alternatives considered**:

- Adicionar biblioteca de formulario/tabela: aumenta manutencao sem resolver
  complexidade real nesta feature.

## Decision: Listagem de despesas usa filtros no backend

**Rationale**: A constituicao exige analytics e escalabilidade por filtros,
limites e agregacoes adequadas. Filtros por periodo/categoria devem ser
aplicados na consulta de dados.

**Alternatives considered**:

- Carregar todas as despesas e filtrar no frontend: simples no MVP, mas viola a
  regra de nao carregar historico integral.
