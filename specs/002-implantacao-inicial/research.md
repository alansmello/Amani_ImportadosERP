# Research: Implantacao Inicial

## Decision: Inventario inicial como tipo especifico de movimentacao

Inventario inicial deve ser registrado como movimentacao de estoque com tipo
`InventarioInicial`, produto, quantidade positiva, data informada e valor
unitario/custo quando aplicavel.

**Rationale**: A Constituicao exige estoque por movimentacoes. Um tipo especifico
permite distinguir entrada de compra de saldo inicial e evita distorcer compras,
custo medio ou relatorios futuros.

**Alternatives considered**:

- Usar `Entrada` com observacao textual: rejeitado porque mistura compra/entrada
  normal com implantacao e reduz rastreabilidade.
- Criar campo de estoque inicial em Produto: rejeitado por violar estoque por
  movimentacoes.
- Criar entidade separada de saldo de estoque: rejeitado porque duplica a fonte
  de verdade do estoque.

## Decision: Produto continua sem saldo fixo

Produto nao deve receber campo de saldo inicial, saldo atual ou estoque fixo.
Saldos continuam derivados de movimentacoes.

**Rationale**: Mantem a regra central do ERP e evita divergencia entre cadastro e
historico.

**Alternatives considered**:

- Campo `EstoqueInicial` em Produto: rejeitado por criar saldo paralelo.
- Campo `SaldoAtual` materializado: rejeitado por ficar fora do escopo e exigir
  estrategia de sincronizacao.

## Decision: Conta a receber inicial reaproveita o modelo existente com origem

Contas a receber iniciais devem reaproveitar `ContaReceber` sempre que possivel,
mas precisam de origem rastreavel (`SaldoInicial` ou `ImplantacaoInicial`) e
devem permitir ausencia de venda associada quando a origem for inicial.

**Rationale**: O fluxo de pagamento recebido ja existe e deve continuar servindo
para baixar debitos. Ao mesmo tempo, debitos antigos nao nasceram de uma venda
registrada no ERP e nao devem ser forçados a uma venda artificial.

**Alternatives considered**:

- Criar venda ficticia para cada debito antigo: rejeitado porque distorce vendas,
  lucro e estoque.
- Criar uma entidade paralela de recebivel inicial: rejeitado porque duplicaria
  pagamentos e consultas financeiras.
- Manter `VendaId` obrigatorio: rejeitado porque nao representa a origem real do
  debito anterior ao ERP.

## Decision: Saldo inicial de caixa como evento financeiro historico

Saldo inicial de caixa deve ser registrado como evento financeiro rastreavel com
valor, data e origem de implantacao, separado de venda, despesa e dashboard.

**Rationale**: O saldo preexistente nao e receita nova nem venda registrada. Um
evento historico evita valor manual sem origem e permite consulta/auditoria.

**Implementation reuse review (T036)**: As estruturas financeiras existentes
foram inspecionadas antes da implementacao do saldo inicial de caixa.
`Despesa` representa gasto e afetaria relatorios de despesa; `ContaReceber` e
`PagamentoRecebido` pertencem ao fluxo de recebiveis/vendas; o dashboard
financeiro calcula caixa a partir desses fluxos operacionais. Nenhuma dessas
estruturas registra saldo de caixa inicial sem distorcer receita, despesa ou
venda. Portanto, a decisao de implementacao e criar `EventoFinanceiro` como
registro historico simples e rastreavel, sem conectar esse evento ao dashboard
financeiro nesta story.

**Alternatives considered**:

- Registrar como venda ou receita operacional: rejeitado por distorcer resultado.
- Registrar como despesa negativa: rejeitado por semantica incorreta e impacto
  em relatorios de despesas.
- Manter configuracao fixa de caixa inicial: rejeitado por nao preservar
  historico.

## Decision: Operacoes manuais, sem importacao por planilha

O plano cobre contratos backend para registro direto de implantacao inicial. Nao
inclui upload, parse ou importacao em massa por planilha.

**Rationale**: A specification coloca importacao por planilha fora do escopo e
limita o volume esperado a operacao guiada de ate 50 itens.

**Alternatives considered**:

- Importacao CSV/XLSX: rejeitada por escopo.
- Fila assíncrona de processamento: rejeitada por complexidade desnecessaria
  para o volume previsto.

## Decision: Validacoes centralizadas no backend

Produto, cliente, quantidade, valor, data e origem devem ser validados em
Application/Domain, com controllers apenas repassando contratos.

**Rationale**: Mantem backend como fonte unica das regras e segue o padrao da
Feature 001.

**Alternatives considered**:

- Validar apenas na interface: rejeitado porque nao ha frontend no escopo e
  violaria a Constituicao.
- Validar somente por constraints de banco: rejeitado porque mensagens e regras
  de negocio ficariam dispersas.
