# Research: Estoque Frontend

## Decision: Implementar F012 somente no frontend

**Rationale**: A F008 e a F011 fornecem as leituras oficiais necessarias: saldos,
historico de movimentacoes e produtos pendentes. A feature de Estoque deve trocar
o placeholder por uma superficie operacional de leitura, preservando o backend
como fonte de saldo, historico e pendencias.

**Alternatives considered**:

- Criar endpoints novos nesta feature: rejeitado porque a feature e frontend e
  depende de F008/F011.
- Calcular saldo a partir do historico no cliente: rejeitado por violar a regra
  de backend como fonte das regras e estoque por movimentacoes oficiais.
- Adicionar ajuste manual ou transferencia: rejeitado por estar fora do escopo da
  F012 e por aumentar risco operacional.

## Decision: Criar `services/stock.ts`, `hooks/use-stock.ts` e `types/stock.ts`

**Rationale**: O frontend ja usa service modules para encapsular endpoints e
hooks TanStack Query para cache/loading/error por modulo. Seguir esse padrao
mantem componentes sem chamadas diretas ao `apiClient` e evita acoplamento com
contratos de transporte.

**Alternatives considered**:

- Chamar `apiClient` diretamente nos componentes: rejeitado por contrariar a
  convencao local documentada em `api-client.ts`.
- Misturar estoque em `services/products.ts`: rejeitado porque saldo/historico
  pertencem ao modulo operacional de Estoque, nao ao cadastro de Produto.
- Reutilizar `use-purchases.ts` para tudo: rejeitado porque saldos e historico
  precisam de chaves/cache proprios de Estoque.

## Decision: Reutilizar `usePendingPurchaseProducts()` para pendencias

**Rationale**: A tela de Compras ja possui service, hook e tipo para
`produtos-pendentes`. Reutilizar esse contrato evita duplicacao e garante que a
visao de Estoque leia a mesma fonte operacional da F011.

**Alternatives considered**:

- Criar chamada duplicada em `stockService`: rejeitado por duplicar contrato e
  cache de pendencias.
- Incorporar pendencias ao saldo: rejeitado porque pendencia nao e estoque
  disponivel.
- Registrar recebimento/perda a partir de Estoque: rejeitado para manter a F012
  somente leitura e deixar acoes auditaveis no fluxo de Compras.

## Decision: Lista padrao mostra todos os produtos, com filtro "com saldo"

**Rationale**: A clarificacao da spec definiu que o estado padrao deve incluir
saldo zero. Isso evita esconder itens cadastrados e torna a diferenca entre "sem
saldo" e "nao encontrado" mais clara. O filtro "com saldo" melhora foco sem
alterar a fonte oficial.

**Alternatives considered**:

- Mostrar somente produtos com saldo por padrao: rejeitado porque esconderia
  saldo zero e dificultaria auditoria.
- Separar em abas com/sem saldo: rejeitado por adicionar complexidade sem ganho
  essencial para o MVP.

## Decision: Saldo negativo deve ser exibido, destacado e nao corrigido

**Rationale**: Saldo negativo e uma inconsistencia operacional do historico
oficial. Corrigir, ocultar ou bloquear no cliente criaria uma segunda fonte de
verdade. O destaque visual ajuda o usuario a notar o problema sem alterar o
valor.

**Alternatives considered**:

- Converter saldo negativo para zero: rejeitado porque altera dado oficial.
- Ocultar produto negativo: rejeitado porque esconde inconsistencia relevante.
- Bloquear detalhe: rejeitado porque o historico pode ser necessario para
  investigar a causa.

## Decision: Historico com filtros de periodo e tipo

**Rationale**: F008 ja define filtros e limites para historico. Expor periodo e
tipo no frontend reduz ruido em produtos com muitas movimentacoes e ajuda o
usuario a auditar entradas, saidas e origens.

**Alternatives considered**:

- Mostrar somente lista recente sem filtros: rejeitado porque dificulta auditoria
  de produtos movimentados.
- Filtrar apenas periodo ou apenas tipo: rejeitado porque ambos ja tem valor
  operacional claro e sao suportados pela fonte oficial.

## Decision: Sem dependencia nova

**Rationale**: A interface pode ser entregue com Next.js, React, TanStack Query,
lucide-react e componentes locais. Graficos, tabelas avancadas ou bibliotecas de
virtualizacao nao sao necessarios para o escopo validado.

**Alternatives considered**:

- Adicionar biblioteca de tabela: rejeitado por nao ser necessaria para lista e
  filtros planejados.
- Adicionar graficos de movimentacao: rejeitado por se aproximar de dashboards e
  relatorios, fora do escopo da F012.
