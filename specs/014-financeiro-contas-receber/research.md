# Research: Financeiro Contas a Receber Frontend

## Decision: Backend precisa de extensões mínimas antes do frontend

**Rationale**: A inspeção do contrato real revelou dois gaps:
(1) `CriarContaReceberCommand` só aceita `VendaId`, impossibilitando criação
manual com `ClienteId` diretamente; (2) `ContaReceberDetalheDto` não inclui
`Status` nem pagamentos individuais, impossibilitando o detalhe por cliente como
prometido na spec. Ambas as extensões operam sobre tabelas e entidades
existentes, sem migration.

**Alternatives considered**:

- Usar endpoint de implantação (`POST /api/implantacao/contas-receber-iniciais`)
  como proxy para criação manual: rejeitado porque o contrato de implantação usa
  `Origem = "ImplantacaoInicial"` com semântica de saldo inicial e não é
  operacional.
- Criar nova entidade separada de "ContaManual": rejeitado por violar
  Simplicidade (Princípio XII) e adicionar complexidade ao domínio desnecessariamente.
- Filtrar lista principal por `ClienteId` no frontend para montar "detalhe":
  rejeitado pelo usuário na clarificação (Q2 → Opção B). O endpoint dedicado
  será enriquecido.

## Decision: Criação manual requer construtor novo na entidade ContaReceber

**Rationale**: A entidade hoje tem dois caminhos: via `VendaId` (construtore
público, `Origem = "Venda"`) e via `CriarInicial` (factory, `Origem` restrita a
`SaldoInicial` ou `ImplantacaoInicial`). Nenhum suporta `Origem = "Manual"`. Um
terceiro construtor público com `clienteId` e `Origem = "Manual"` segue o
padrão constitucional: regra no Domain, handler delega, controller apenas roteia.

**Alternatives considered**:

- Reutilizar `CriarInicial` passando `"Manual"` como origem: rejeitado porque
  `OrigemInicialValida` bloqueia explicitamente qualquer string fora de
  `SaldoInicial`/`ImplantacaoInicial`.
- Criar command separado `CriarContaReceberManualCommand`: considerado válido,
  mas ampliar o command existente com `ClienteId` opcional é igualmente correto
  e mais simples, desde que o handler selecione o construtor correto.

## Decision: Implementar somente no frontend + extensões cirúrgicas de backend

**Rationale**: O roadmap declara explicitamente F014 como "frontend sobre
`ContasReceberController` (completo)". As extensões B1/B2 são pré-requisito
técnico para a feature ser completa, mas não adicionam entidade, endpoint ou
migration — apenas preenchem contratos incompletos.

**Alternatives considered**:

- Implementar apenas o frontend consumindo o contrato atual (sem criação manual,
  sem detalhe enriquecido): rejeitado porque a spec exige criação com cliente e
  detalhe com pagamentos, e o usuário confirmou extensão do backend (Q2).
- Adiar a extensão para F015 ou F018: rejeitado porque sem ela o módulo entrega
  apenas listagem e pagamento, incompleto para o critério de aceite.

## Decision: Criar service/hook/type de Receivables seguindo padrão Vendas/Compras

**Rationale**: O frontend já usa services por módulo (`sales.ts`, `purchases.ts`,
`stock.ts`), tipos explícitos e TanStack Query com `queryKeys` por domínio.
Repetir esse padrão mantém consistência, facilita invalidação de cache e não
exige nova dependência.

**Alternatives considered**:

- Misturar receivables dentro de `services/sales.ts`: rejeitado por misturar
  domínios e dificultar invalidação seletiva de cache.
- Criar store global para estado de modal/filtros: rejeitado porque estado de
  modal e filtros é local ao componente/página e não precisa ser compartilhado.

## Decision: Modal para registrar pagamento (sem página dedicada)

**Rationale**: Registrar pagamento envolve um único campo (`valor`). Modal ou
bottom-sheet é padrão já usado no projeto para ações rápidas (ex: registrar
recebimento de compra). Navegação para página dedicada adicionaria duas telas
desnecessárias no fluxo mais frequente. Confirmado pelo usuário na clarificação
(Q3 → Opção A).

**Alternatives considered**:

- Página dedicada `/financeiro/contas-receber/[id]/pagamento`: rejeitada por
  custo de navegação desproporcional à complexidade do formulário.
- Formulário inline na linha da lista: considerado; rejeitado para manter
  responsividade mobile sem colapsar a linha da lista.

## Decision: Filtro por status + busca por cliente na lista principal

**Rationale**: O caso de uso central da lista é localizar contas pendentes
rapidamente. Filtro por status ("Pendente"/"Pago") resolve isso diretamente.
Busca por nome de cliente complementa para quando o operador conhece o cliente
mas não quer usar a visão "por cliente". Confirmado pelo usuário (Q4 → Opção C).
Ambos são aplicados localmente sobre o conjunto já carregado — tamanho esperado
é de dezenas a poucas centenas de registros, adequado para filtragem local.

**Alternatives considered**:

- Filtro somente por status: considerado e oferecido como recomendado; usuário
  preferiu incluir busca por cliente também.
- Filtro por data de vencimento: não solicitado; pode ser adicionado pós-MVP.
- Filtragem server-side: desnecessária no escopo atual; pode ser considerada
  quando o volume de contas justificar.

## Decision: Exibir Origem e link navegável para venda quando VendaId presente

**Rationale**: O campo `Origem` ("Manual", "Venda", "SaldoInicial",
"ImplantacaoInicial") contextualiza cada recebível. Quando `VendaId` não é nulo
e `Origem = "Venda"`, oferecer link para `/vendas/[vendaId]` fecha o ciclo de
rastreabilidade venda → recebível sem adicionar complexidade. Confirmado pelo
usuário (Q5 → Opção B).

**Alternatives considered**:

- Exibir apenas Origem sem link: era a recomendação padrão (Q5 → Opção A);
  usuário preferiu incluir o link para rastreabilidade.
- Não exibir Origem nem VendaId: rejeitado por esconder informação de contexto
  disponível no contrato.

## Decision: Tab "Por Cliente" na mesma rota; detalhe em rota dedicada

**Rationale**: A spec define "lista + visão por cliente" como a mesma área de
trabalho. Tabs na mesma rota `/financeiro/contas-receber` seguem o padrão de
Compras (lista / em trânsito / pendências). O detalhe de um cliente específico,
por ter conteúdo distinto e link navegável, merece rota própria
`/financeiro/contas-receber/cliente/[clienteId]`.

**Alternatives considered**:

- Rota separada para "por cliente": aumentaria a complexidade de navegação sem
  benefício claro para o usuário; tabs são mais ágeis.
- Detalhe por cliente como modal: rejeitado porque o volume de informação
  (lista de contas + pagamentos) não cabe bem em modal.

## Decision: Sem dependência nova

**Rationale**: Design System local, React, App Router e TanStack Query cobrem
todos os requisitos desta feature: lista, modal, tabs, formulário e estados.

**Alternatives considered**:

- Biblioteca de formulário (react-hook-form): o formulário de criação/edição tem
  dois campos; a validação local já é suficiente com useState.
- Biblioteca de tabela: listas operacionais atuais usam componentes locais
  responsivos e funcionam bem para o volume esperado.
