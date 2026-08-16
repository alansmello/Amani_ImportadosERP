# Research: Devoluções e Reembolsos de Compras

## 1. Separação entre logística e financeiro

**Decision**: modelar devolução de item e reembolso de compra como agregados independentes. Uma devolução pode existir sem reembolso e um reembolso pode existir sem devolução.

**Rationale**: fornecedor e marketplace podem creditar em outra data, conceder compensação sem retorno físico ou recusar crédito após a mercadoria sair. Um único registro produziria estados parciais ambíguos e acoplaria estoque a caixa.

**Alternatives considered**:

- Adicionar `Reembolso` ao enum de perda: rejeitado porque perda é quantidade logística e não possui valor/data do crédito.
- Criar um único processo de devolução com valor opcional: rejeitado porque não representa vários créditos nem datas independentes.
- Usar conta a receber: rejeitado porque a feature registra dinheiro já creditado, não dívida de cliente ou módulo completo de contas a pagar/receber de fornecedor.

## 2. Devolução antes e depois do recebimento

**Decision**: uma entidade de devolução possui `Momento = AntesDoRecebimento | DepoisDoRecebimento`. Antes do recebimento, reduz pendência e não movimenta estoque. Depois do recebimento, exige vínculo a um recebimento específico e gera saída de estoque.

**Rationale**: o vínculo ao recebimento fornece limite objetivo, produto, compra, data e custo congelado da entrada. Também distingue mercadoria nunca aceita da mercadoria que entrou e posteriormente saiu.

**Alternatives considered**:

- Escolher automaticamente um recebimento por FIFO: rejeitado porque oculta a origem do custo e pode atribuir a devolução à entrada errada.
- Vincular somente ao item: rejeitado porque múltiplos recebimentos podem ter datas e elegibilidades diferentes.
- Reverter o recebimento original: rejeitado porque destruiria o fato histórico e alteraria posições passadas.

## 3. Pendência e estado da compra

**Decision**: somente devoluções anteriores ao recebimento afetam `QuantidadePendente`. Devoluções posteriores não reabrem trânsito. Cancelar uma devolução anterior restaura pendência na data da compensação. Estado logístico atual continua derivado da pendência, recebimentos e perdas; situação de devolução/reembolso é exposta separadamente.

**Rationale**: mercadoria devolvida com reembolso não representa reposição esperada. Preservar o enum existente reduz quebra de contrato e mantém o fato de que uma compra foi recebida antes de ser devolvida.

**Alternatives considered**:

- Criar estados `Devolvida` e `Reembolsada` em `CompraStatus`: rejeitado porque mistura três dimensões independentes.
- Reabrir trânsito após toda devolução: rejeitado porque inventaria uma substituição não acordada.

## 4. Correções append-only e temporalidade

**Decision**: devoluções e reembolsos originais são imutáveis. Cada um aceita no máximo uma compensação/cancelamento com data e motivo. A compensação produz efeito inverso em sua própria data; consultas anteriores continuam mostrando a posição que era conhecida até a correção.

**Rationale**: preserva auditoria, permite caixa e estoque históricos e atende à Constituição sem hard delete. Uma correção posterior não reescreve silenciosamente o passado.

**Alternatives considered**:

- Campo booleano `Cancelado`: rejeitado isoladamente porque não registra data, motivo nem efeito temporal.
- Editar ou excluir o registro: rejeitado por perda de histórico.
- Permitir cadeia ilimitada de cancelamentos: rejeitado por complexidade; após compensação, uma nova operação correta deve ser registrada.

## 5. Movimentação de estoque sem alterar tabela produtiva

**Decision**: manter `TipoMovimentacao.Saida` para devolução e `Entrada` para sua compensação. A nova devolução/compensação armazena `EstoqueMovimentacaoId` único. Consultas de histórico fazem left join pelas novas relações para exibir `DevolucaoCompra` ou `CompensacaoDevolucaoCompra`. Nenhuma coluna é adicionada a `estoque_movimentacoes`.

**Rationale**: saldo atual já interpreta toda saída como negativa e toda entrada como positiva. A FK na tabela nova oferece origem explícita sem DDL ou backfill na maior tabela histórica.

**Alternatives considered**:

- Adicionar novo valor a `TipoMovimentacao`: rejeitado porque todos os agregadores atuais tratam apenas `Saida` como negativa e exigiria risco maior de regressão.
- Adicionar coluna `Origem` à movimentação e preencher legado: rejeitado por tocar tabela produtiva central e exigir semântica retroativa.
- Não criar movimentação: rejeitado por violar estoque por histórico.

## 6. Custo médio da devolução

**Decision**: movimentos de devolução posterior usam exatamente `CompraItemRecebimento.ValorUnitario`; a saída subtrai quantidade e valor da base de aquisições e a compensação soma os mesmos valores. O cálculo temporal passa a agregar entradas existentes, devoluções e compensações até a data de referência. Vendas e cancelamentos de venda continuam fora da formação do custo.

```text
QuantidadeBase = InventarioInicial + Recebimentos + CompensacoesDevolucao - DevolucoesPosRecebimento
ValorBase = ValorInventario + ValorRecebimentos + ValorCompensacoes - ValorDevolucoes
CustoMedio = ValorBase / QuantidadeBase, quando QuantidadeBase > 0
```

**Rationale**: reverter o mesmo snapshot que entrou evita drift. O rateio comercial da F026 não foi usado na entrada de estoque atual e, portanto, não pode substituir esse snapshot sem recalcular histórico.

**Alternatives considered**:

- Usar custo médio vigente no dia da devolução: rejeitado porque não neutraliza a entrada original.
- Usar valor comercial rateado da F026: rejeitado para custo de estoque porque difere do `ValorUnitario` congelado no recebimento.
- Ignorar devolução no custo: rejeitado porque manteria capital devolvido na base de aquisição.

## 7. Valor comercial bruto de perda e devolução

**Decision**: para indicadores de ocorrência, calcular a parcela pela política F026: total rateado do item multiplicado pela quantidade afetada sobre quantidade comprada, com arredondamento monetário oficial. Custo de estoque e valor comercial são métricas separadas.

**Rationale**: o dashboard deve reconhecer descontos/acréscimos dos itens e gerais, enquanto o custo médio precisa neutralizar o snapshot real usado na entrada.

**Alternatives considered**:

- Usar apenas `CustoUnitario`: rejeitado porque ignora ajustes comerciais.
- Alterar retroativamente `ValorUnitario` dos recebimentos: rejeitado por modificar custo e lucro históricos fora do escopo.

## 8. Reembolsos, limite e situação

**Decision**: persistir créditos positivos e cancelamentos separados. O limite é o total oficial positivo da compra menos reembolsos líquidos vigentes. `SemReembolso`, `Parcial` e `Integral` são situações derivadas da soma líquida, não campos editáveis.

**Rationale**: estado derivado não diverge do dinheiro registrado. Cancelamento libera novamente o limite, mas a referência externa original permanece reservada para auditoria.

**Alternatives considered**:

- Persistir situação: rejeitado por duplicar derivação.
- Permitir valor acima da compra: rejeitado pelo escopo; indenização adicional exige regra contábil própria.
- Reduzir o total original: rejeitado por apagar a operação comercial bruta.

## 9. Alocação de reembolso

**Decision**: reembolso pode ter zero ou mais alocações monetárias para itens e, opcionalmente, para uma perda ou devolução específica. Soma das alocações não pode exceder o crédito; saldo não alocado continua válido no caixa, mas não reduz prejuízo líquido de ocorrência.

**Rationale**: permite compensação sem devolução e também reconciliação precisa de perdas/devoluções. Uma tabela de alocação suporta um crédito envolvendo vários itens.

**Alternatives considered**:

- Exigir alocação integral: rejeitado porque marketplaces podem conceder crédito genérico.
- Permitir só um item no reembolso: rejeitado porque um crédito pode cobrir vários produtos.
- Ratear automaticamente: rejeitado porque inventaria intenção financeira e poderia associar recuperação à ocorrência errada.

## 10. Idempotência e concorrência

**Decision**: toda confirmação recebe um novo `OperacaoId` GUID criado uma vez no cliente e protegido por índice único na tabela correspondente ao seu tipo de comando. Replay do mesmo tipo e identificador devolve o evento existente; tipos de comando diferentes não compartilham identidade operacional. Registro roda na transação serializável já disponível e revalida limite, pendência, recebimento elegível e saldo. Referência externa não vazia é única por compra.

**Rationale**: índice único por tipo resolve repetição da mesma confirmação após timeout sem exigir uma sexta tabela global; serialização protege duas operações distintas concorrendo pelo mesmo limite/saldo. O cliente deve gerar novo GUID para cada confirmação.

**Alternatives considered**:

- Confiar apenas no botão desabilitado: rejeitado porque não protege retries de rede ou múltiplas sessões.
- Usar somente referência externa: rejeitado porque ela é opcional e pode não existir em devoluções.
- Lock em memória: rejeitado porque não protege múltiplas instâncias.

## 11. Atomicidade entre devolução e reembolso

**Decision**: devolução com seu movimento obrigatório é uma transação; reembolso é outra transação. A interface pode oferecer ações próximas, mas não um comando único que acople fatos de datas independentes.

**Rationale**: o fornecedor normalmente credita depois. Uma transação distribuída manteria registros abertos ou datas artificiais e impediria reembolso sem devolução.

**Alternatives considered**:

- Endpoint único de devolução + reembolso: rejeitado por acoplar eventos independentes.
- Criar reembolso pendente junto da devolução: rejeitado porque dinheiro ainda não recebido não deve entrar no caixa.

## 12. Fórmulas financeiras

**Decision**:

```text
ReembolsosLiquidosPeriodo = CreditosPorData - CancelamentosPorData
EntradasCaixaPeriodo = PagamentosClientes + ReembolsosLiquidosPeriodo
SaidasPeriodo = ComprasBrutas + Despesas
SaldoOperacional = EntradasCaixaPeriodo - SaidasPeriodo
CaixaFinal = CaixaInicial + AjusteImplantacao + EntradasCaixaPeriodo - SaidasPeriodo
```

`ValoresRecebidos` continua exclusivo de clientes; novos campos expõem reembolsos e entradas totais. Caixa inicial acumula créditos/cancelamentos anteriores ao filtro. Valores realista e potencial mudam somente pelo caixa final.

**Rationale**: mantém competência bruta da compra e torna recuperação visível sem dupla contagem.

**Alternatives considered**:

- Subtrair reembolso de `TotalCompras`: rejeitado por perder valor bruto e deslocar crédito para a data da compra.
- Somar a `ValoresRecebidos`: rejeitado por misturar cliente com fornecedor.

## 13. Indicadores de recuperação

**Decision**: no detalhe, prejuízo líquido não recuperado usa ocorrências vigentes e alocações vigentes. No dashboard operacional, selecionar perdas/devoluções pela data da ocorrência e somar recuperações alocadas a elas até a data de referência, mesmo que o crédito seja posterior dentro da referência. Reembolsos de caixa continuam filtrados pela data do crédito.

```text
BrutoAfetado = PerdasRateadas + DevolucoesRateadas
RecuperadoAssociado = AlocacoesVigentesAteReferencia
PrejuizoLiquidoNaoRecuperado = max(0, BrutoAfetado - RecuperadoAssociado)
```

**Rationale**: evita saldo negativo causado por crédito de ocorrência antiga e separa análise de coorte operacional do fluxo de caixa.

**Alternatives considered**:

- Bruto e reembolso ambos pela data do período: rejeitado porque mistura coortes e pode produzir “prejuízo” negativo.
- Usar todo reembolso da compra como recuperação: rejeitado porque crédito sem alocação pode ter outra finalidade.

## 14. Contratos e compatibilidade

**Decision**: adicionar rotas aninhadas em compras para devoluções, compensações, reembolsos e cancelamentos; estender lista/detalhe, dashboard e histórico de estoque por campos aditivos. Campos existentes mantêm nome e semântica.

**Rationale**: segue o `ComprasController` atual e permite rollout de backend antes do frontend sem quebrar consumidores conhecidos.

**Alternatives considered**:

- Novo módulo raiz de devoluções: rejeitado porque todas as operações exigem contexto de compra/item.
- Alterar respostas existentes removendo campos: rejeitado por incompatibilidade produtiva.

## 15. Schema expand-only, feature flag e rollback

**Decision**: criar cinco tabelas novas e nenhum campo em tabelas existentes. Aplicar migration com `DevolucoesReembolsosComprasEnabled=false`; validar baseline e habilitar depois. Rollback desliga o flag e mantém schema/dados; `Down` é proibido após primeiro uso.

**Rationale**: o backend antigo ignora tabelas adicionais. Isso reduz lock, elimina backfill e permite recuo sem perda de eventos F027.

**Alternatives considered**:

- Adicionar flags/colunas em compra, item e movimento: rejeitado por tocar estruturas produtivas e persistir estado derivado.
- Deploy direto habilitado: rejeitado por impedir smoke test seguro.
- Restaurar backup em rollback: rejeitado porque apagaria operações posteriores.

## 16. Estratégia de validação

**Decision**: não criar projeto automatizado novo. Usar builds existentes, validação manual determinística, concorrência controlada, SQL de baseline/hashes, script idempotente revisado, ensaio de migration e medição de consultas. Registrar evidências no quickstart e runbook futuro.

**Rationale**: respeita a decisão atual do produto, mas eleva o gate proporcionalmente ao risco produtivo.

**Alternatives considered**:

- Implementar sem ensaio: rejeitado pelo risco de dados.
- Criar nova suíte de testes agora: rejeitado por falta de autorização explícita, devendo ser proposto separadamente.
