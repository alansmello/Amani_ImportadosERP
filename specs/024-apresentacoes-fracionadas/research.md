# Research: Precisão da Conversão Fracionada

## Decisão 1 — Fração exata como fonte de verdade

**Decision**: Persistir numerador e denominador positivos na apresentação e no snapshot da venda. Reduzir frações por máximo divisor comum e executar comparação, soma e multiplicação com aritmética inteira verificada.

**Rationale**: `1/24` não possui representação decimal finita. Persistir apenas `0,041666...` desloca o erro para saldo, cancelamento e conciliação.

**Alternatives considered**:

- Apenas `decimal`: rejeitado porque 24 operações separadas podem acumular resíduo.
- `double`: rejeitado por erro binário e inadequação financeira.
- Produto separado por apresentação: rejeitado por fragmentar cadastro, custo e histórico.
- Migrar todo estoque para dose: rejeitado por risco ao histórico produtivo.

## Decisão 2 — Representação dual na movimentação

**Decision**: A movimentação registra a quantidade decimal final exigida pelos contratos e também a razão exata normalizada. A razão decide saldo; o decimal serve para compatibilidade, leitura e auditoria.

**Rationale**: Guardar a fração somente no cadastro ou no item da venda não basta para somar e reverter movimentações de forma independente e auditável.

**Alternatives considered**:

- Recalcular sempre pela apresentação atual: rejeitado porque configuração pode mudar.
- Usar apenas o snapshot do item: rejeitado porque movimentações de cancelamento e consultas históricas precisam ser autossuficientes.
- Definir uma unidade atômica fixa por produto: rejeitado porque adicionar denominadores futuros exigiria trocar a base ou migrar histórico.

## Decisão 3 — Agregação exata e escalável

**Decision**: Repositories agrupam numeradores assinados por produto e denominador no banco. A camada de aplicação combina poucos agregados como frações reduzidas. Linhas legadas sem par racional equivalem a quantidade inteira sobre 1.

**Rationale**: Evita carregar todas as movimentações, preserva analytics agregada e mantém exatidão entre denominadores diferentes.

**Alternatives considered**:

- Somar projeções decimais no banco: rejeitado como fonte autoritativa.
- Materializar todo o histórico e somar em memória: rejeitado por escalabilidade.
- Tolerância epsilon: rejeitado como regra principal; tolerância mascara resíduos e cresce com o volume.

## Decisão 4 — Projeção decimal

**Decision**: Usar `numeric(28,12)` para fator calculado e quantidade convertida projetada. Arredondamento decimal é explícito e nunca substitui o par racional.

**Rationale**: Compatível com o tipo `decimal` atual e suficiente para exibição/auditoria; a exatidão não depende da escala.

**Alternatives considered**:

- Escala ilimitada: rejeitada por contratos e mapeamento imprevisíveis.
- Escala monetária 2: rejeitada porque zeraria ou distorceria doses pequenas.
- `numeric(38,18)`: rejeitada porque excede a margem segura do `decimal` .NET em operações compostas sem trazer exatidão para periódicos.

## Decisão 5 — Migration e compatibilidade

**Decision**: Criar tabela/colunas nullable sem backfill e ampliar a coluna de quantidade de inteiro para decimal por cast direto. Nenhum `UPDATE` histórico será executado.

**Rationale**: O mesmo campo semântico deve continuar representando a quantidade final da movimentação; uma coluna paralela exigiria sentinel ou semântica dupla e tornaria rollback ainda mais perigoso.

**Alternatives considered**:

- Nova coluna decimal com inteiro antigo igual a zero: rejeitada por criar movimentação enganosa para consumidores antigos.
- Backfill de snapshots/frações: rejeitado por alterar histórico.
- Tabela paralela de saldo: rejeitada por violar estoque exclusivamente por movimentações.

## Decisão 6 — Compras e custo médio

**Decision**: Compra, recebimento, perda e inventário inicial permanecem na unidade principal e inteiros nesta versão. Custo médio continua sendo custo por unidade principal derivado de entradas reais; custo da venda aplica a razão exata.

**Rationale**: Isola o risco ao caso de negócio solicitado e preserva mercadorias em trânsito e recebimentos parciais.

Entradas compensatórias de cancelamento vinculadas a `VendaItemId` não formam uma nova camada de custo e não podem usar o preço de venda como `ValorUnitario`. O custo médio continua baseado apenas em inventário inicial e recebimentos físicos reais. Cancelamentos legados permanecem inalterados.

## Decisão 7 — Dashboard e rankings

**Decision**: Métricas monetárias mantêm valores comerciais. Métricas de quantidade de produto usam equivalente na unidade principal, calculado pela razão exata; a UI identifica essa unidade. Vendas detalhadas mostram quantidade comercial e apresentação.

**Rationale**: Somar “1 caixa + 1 dose” como duas unidades comerciais não é comparável. O equivalente de estoque mantém coerência histórica.

## Decisão 8 — Validação sem novo projeto de testes

**Decision**: Não criar projeto nem tarefas de testes automatizados nesta feature. Usar builds, análise estática e validação manual de razão, migration, venda, cancelamento, custo e consultas no PostgreSQL.

**Rationale**: decisão explícita do responsável ao autorizar a implementação da F024.

## Invariantes verificáveis

- `numerador > 0`, `denominador > 0`, `numerador <= denominador`.
- Frações são equivalentes após redução por MDC.
- `4 × 1/4 = 1/1` e `24 × 1/24 = 1/1`, inclusive somando operações separadas.
- Saída e cancelamento com a mesma razão resultam em zero exato.
- Legado `q` é interpretado como `q/1` sem persistência adicional.
- Decimal projetado nunca participa sozinho de decisão de disponibilidade.
