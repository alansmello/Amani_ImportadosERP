# Phase 0 Research: Compras e Recebimentos

## Decision: Implementar F011 somente no frontend

**Rationale**: O backend ja possui controller, DTOs e services para criar compra,
listar compras, obter detalhe, listar em transito, listar produtos pendentes,
registrar recebimento, registrar perda e consultar historicos. A F011 pede
superficie operacional sobre esses contratos, nao novas regras ou persistencia.

**Alternatives considered**:

- Criar endpoints novos para o frontend: rejeitado porque os fluxos centrais ja
  existem e novas APIs aumentariam escopo sem necessidade para o MVP.
- Alterar backend para filtro de status na listagem: rejeitado nesta fase porque
  a visao de em transito/produtos pendentes ja cobre o recorte operacional
  principal; refinamento server-side pode ser avaliado depois.

## Decision: Usar a visao de compras em transito/produtos pendentes como entrada principal

**Rationale**: A spec define que a lista abre por padrao com compras em transito
ou pendentes dos ultimos 30 dias. O backend oferece visoes oficiais de compras em
transito e produtos pendentes, que preservam a regra de pendencia calculada pela
fonte oficial. O recorte de 30 dias pode ser aplicado na apresentacao, sem
calcular saldo ou regra critica.

**Alternatives considered**:

- Abrir com todas as compras: rejeitado porque aumenta ruido operacional.
- Usar apenas a listagem geral de compras: rejeitado porque ela nao expõe filtro
  server-side de status e nao e tao direta para pendencias.

## Decision: Validar produto duplicado no formulario antes do envio

**Rationale**: A clarificacao definiu que cada produto pode aparecer uma unica vez
por compra. Essa e uma regra de UX da feature para reduzir erro operacional e
evitar ambiguidade no recebimento parcial. O frontend deve impedir duplicidade
antes do envio e ainda tratar rejeicoes oficiais caso a fonte oficial evolua.

**Alternatives considered**:

- Permitir duplicidade e consolidar visualmente: rejeitado por complicar
  pendencia, recebimento e perda.
- Criar backend novo para rejeitar duplicidade: rejeitado nesta feature por fugir
  do escopo frontend-only.

## Decision: Recebimento e perda usam dialogo de revisao antes do envio

**Rationale**: Recebimentos geram entrada rastreavel e perdas registram prejuizo
operacional. Ambas sao acoes auditaveis e precisam de confirmacao explicita para
reduzir erro.

**Alternatives considered**:

- Enviar recebimento direto e revisar apenas perda: rejeitado porque recebimento
  tambem altera estoque.
- Enviar tudo direto: rejeitado por risco operacional.

## Decision: Motivos de perda restritos a Perda, Extravio e Avaria

**Rationale**: Esses sao os motivos oficiais aceitos pelo backend e definidos na
clarificacao. Manter a lista fechada evita payloads rejeitados e preserva
consistencia de historico.

**Alternatives considered**:

- Texto livre: rejeitado por gerar dados inconsistentes e rejeicoes oficiais.
- Campo "Outro": rejeitado por nao existir no contrato oficial atual.

## Decision: Sem dependencias novas

**Rationale**: O fluxo pode ser implementado com App Router, React Query,
componentes UI locais, Dialog existente e services ja padronizados. Nenhuma
biblioteca nova resolve complexidade real nesta fase.

**Alternatives considered**:

- Biblioteca de forms/wizard: rejeitada porque adiciona dependencia para um fluxo
  especifico e controlavel com estado local.
- Biblioteca de tabelas avancadas: rejeitada porque as listas do MVP podem seguir
  padrao local de tabelas/cards responsivos.

## Decision: Frontend nao recalcula estoque, custo medio, lucro ou metricas

**Rationale**: A Constituicao exige backend como fonte das regras criticas. O
frontend pode exibir totais e valores retornados pelo backend e validar entradas
obvias de formulario, mas nao deve calcular saldo de estoque, custo medio, lucro,
ranking ou dashboard.

**Alternatives considered**:

- Calcular pendencia ou saldo manualmente no cliente: rejeitado por risco de
  divergencia operacional.
- Exibir apenas formularios sem historico: rejeitado porque a rastreabilidade de
  recebimentos e perdas e parte do valor da feature.
