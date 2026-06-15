# Phase 0 Research: Implantacao Inicial

## Decision: Implementar F010 somente no frontend

**Rationale**: O backend ja possui `ImplantacaoController` com endpoints para
inventario inicial, saldo inicial de caixa e contas a receber iniciais. A spec da
F010 pede superficie operacional sobre esses registros, nao novas regras ou
persistencia.

**Alternatives considered**:

- Criar endpoints novos de status/reabertura: rejeitado porque reabertura e
  edicao em massa estao fora do escopo, e a feature deve evitar backend novo.
- Adicionar migrations ou entidades de implantacao: rejeitado porque os eventos
  definitivos ja existem como movimentacao de estoque, evento financeiro e conta
  a receber.

## Decision: Hospedar a experiencia em Configuracoes

**Rationale**: Implantacao inicial e um passo de preparacao do sistema, nao uma
operacao recorrente como compra, venda ou financeiro diario. A rota
`/configuracoes` ja existe como placeholder e e o ponto natural para expor a
entrada, com subrota dedicada `/configuracoes/implantacao`.

**Alternatives considered**:

- Criar rota raiz `/implantacao`: simples, mas adiciona uma area principal nova
  para um fluxo nao recorrente.
- Colocar dentro de Financeiro: cobre caixa e recebiveis, mas nao inventario
  inicial, criando ambiguidade operacional.

## Decision: Etapas independentes com progresso parcial

**Rationale**: A clarificacao definiu que inventario, caixa e recebiveis podem ser
concluidos separadamente, e a implantacao geral deve mostrar progresso parcial.
Isso reduz bloqueio operacional e permite iniciar com os dados disponiveis.

**Alternatives considered**:

- Enviar tudo como pacote unico: rejeitado porque bloquearia a implantacao quando
  uma area ainda nao estiver pronta.
- Exigir inventario primeiro: rejeitado porque a spec nao impõe dependencia
  funcional entre as tres etapas.

## Decision: Bloquear etapa concluida apos sucesso

**Rationale**: A clarificacao definiu que uma etapa concluida fica bloqueada para
novo envio. Isso reduz duplo lancamento e respeita a ausencia de reabertura no
escopo.

**Alternatives considered**:

- Permitir novo envio com aviso: rejeitado por risco de duplicidade.
- Permitir novo envio com confirmacao reforcada: rejeitado por ainda permitir
  duplicidade dentro da feature.

## Decision: Tratar envio em lote como tudo-ou-nada para conclusao da etapa

**Rationale**: A clarificacao definiu que se qualquer item do lote falhar, nenhum
item da etapa deve ser marcado como concluido. Para inventario, o backend ja
recebe uma lista de itens em uma unica chamada. Para contas a receber iniciais, o
backend atual recebe uma conta por chamada; portanto a interface deve validar todo
o lote antes de enviar e so marcar a etapa como concluida se todas as chamadas
retornarem sucesso.

**Alternatives considered**:

- Sucesso parcial por item: rejeitado porque complicaria auditoria e UX.
- Usuario escolher modo de envio: rejeitado por adicionar sofisticacao
  desnecessaria.

## Decision: Validacao basica no frontend, validacao definitiva no backend

**Rationale**: A Constituicao permite validacao de formulario para melhorar a
experiencia, mas regras operacionais e consistencia pertencem ao backend. O
frontend deve validar campos obrigatorios, formato, duplicidade local de produto e
valores obviamente invalidos, mas deve exibir rejeicoes oficiais sem recalcular
estado.

**Alternatives considered**:

- Reproduzir regras de negocio completas no frontend: rejeitado por violar backend
  como fonte das regras.
- Enviar tudo sem validacao local: rejeitado por piorar experiencia e aumentar
  erros previsiveis.

## Decision: Nao adicionar dependencias

**Rationale**: O fluxo pode ser implementado com componentes locais, React Query,
Dialog existente e UI base. Nao ha necessidade de biblioteca de wizard, grafico ou
form externo.

**Alternatives considered**:

- Biblioteca de forms/wizard: rejeitada porque aumentaria dependencia para um
  fluxo pequeno e especifico.
- Biblioteca de importacao de planilha: fora do escopo pos-MVP.
