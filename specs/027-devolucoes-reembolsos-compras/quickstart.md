# Quickstart de validação — F027 Devoluções e Reembolsos de Compras

Este roteiro valida a feature antes da ativação em produção. Ele não substitui backup, ensaio da migration nem aprovação operacional.

## 1. Pré-condições e gate de produção

- Trabalhar em cópia isolada e anonimizada da base de produção.
- Confirmar backup restaurável e registrar responsável, horário e checksum.
- Manter `DevolucoesReembolsosComprasEnabled=false` durante migration e verificações iniciais.
- Capturar o baseline SQL definido em `artifacts/f027-production-baseline.sql` antes da migration.
- Confirmar que a migration é exclusivamente expansiva: cria cinco tabelas, índices e FKs; não altera nem remove tabelas, colunas ou dados atuais; não contém `UPDATE`, `DELETE`, `TRUNCATE` ou backfill.
- Medir duração e bloqueios da migration em volume semelhante ao de produção.

## 2. Validação estática e builds

Executar a partir da raiz do repositório:

```powershell
dotnet restore
dotnet build --no-restore
npm --prefix frontend ci
npm --prefix frontend run build
```

Critérios:

- Backend e frontend compilam sem erro.
- A migration gerada corresponde ao modelo revisado e cria exatamente as cinco tabelas novas descritas em `data-model.md`.
- Não há alteração destrutiva no banco existente.

## 3. Baseline e regressão antes da ativação

Com a flag desabilitada:

1. Executar `artifacts/f027-production-baseline.sql` e guardar o resultado.
2. Aplicar a migration na cópia isolada.
3. Arquivar o SQL gerado em `artifacts/f027-migration-generated.sql` e executar `artifacts/f027-post-migration-check.sql` depois da migration.
4. Repetir o baseline e comparar compras, itens, recebimentos, perdas, estoque e totais financeiros legados.
5. Abrir os fluxos atuais de compra, recebimento, perda, estoque, dashboard e financeiro.

Esperado:

- Contagens e somatórios legados permanecem idênticos.
- Nenhuma compra existente ganha devolução ou reembolso.
- Consultas novas retornam lista vazia, valores zero e `SemReembolso`.
- Comandos novos retornam `409 FEATURE_DESABILITADA`.
- Fluxos existentes continuam operacionais.

## 4. Reembolso parcial e temporalidade

Preparar compra oficial de R$ 300,00, sem reembolso.

1. Registrar crédito de R$ 80,00 em D1.
2. Consultar a compra em D1 e em referência anterior a D1 quando a tela oferecer corte temporal.
3. Conferir dashboard financeiro abrangendo D1.

Esperado:

- Situação `Parcial`, reembolsado líquido R$ 80,00, saldo reembolsável e custo financeiro líquido R$ 220,00.
- Referência anterior a D1 não inclui o crédito.
- No período de D1, reembolsos de compras aumentam R$ 80,00 e entradas de caixa também; valores recebidos de clientes não mudam.
- Nenhuma movimentação de estoque é criada.

## 5. Reembolsos múltiplos, teto e idempotência

1. Registrar mais dois créditos válidos até totalizar R$ 300,00.
2. Tentar registrar R$ 0,01 adicional.
3. Repetir um request com o mesmo `operacaoId` e mesmo corpo.
4. Repetir o identificador com corpo diferente.
5. Enviar duas operações concorrentes que, juntas, ultrapassariam o saldo.
6. Repetir uma `referenciaExterna` na mesma compra.

Esperado:

- A compra chega a `Integral`, saldo e custo financeiro líquido R$ 0,00.
- Excesso retorna `409 LIMITE_REEMBOLSO_EXCEDIDO`.
- Replay idêntico devolve o mesmo registro sem duplicar valor.
- Reuso divergente retorna `409 OPERACAO_ID_REUTILIZADA`.
- Sob concorrência, no máximo uma operação que respeite o teto confirma; não há ultrapassagem.
- Referência repetida retorna `409 REFERENCIA_EXTERNA_DUPLICADA`.

## 6. Cancelamento de reembolso

1. Cancelar um crédito em D2.
2. Conferir compra e dashboards antes e depois de D2.
3. Tentar cancelar novamente.

Esperado:

- Antes de D2, o histórico não muda.
- A partir de D2, o reembolso líquido diminui e a situação é recalculada.
- No período de D2, o cancelamento reduz reembolsos e entradas de caixa.
- Segundo cancelamento retorna `409 REGISTRO_JA_COMPENSADO`.
- Registro original permanece auditável.

## 7. Devolução antes do recebimento

Preparar item comprado com quantidade 10, recebido 2, perdido 1 e sem outras devoluções.

1. Registrar devolução anterior de quantidade 3.
2. Conferir pendência e status logístico.
3. Tentar devolver quantidade superior ao saldo.
4. Compensar a devolução em data posterior.

Esperado:

- Pendência passa de 7 para 4; nenhuma movimentação de estoque é criada.
- O status logístico deriva da nova pendência sem misturar situação de reembolso.
- Excesso retorna `409 QUANTIDADE_DEVOLUCAO_EXCEDIDA`.
- A compensação volta a incluir a quantidade na pendência a partir de sua data, sem apagar o evento.

## 8. Devolução depois do recebimento

Preparar recebimento específico com quantidade 5, snapshot `ValorUnitario=52,70` e estoque disponível.

1. Registrar devolução posterior de quantidade 2 referenciando esse recebimento.
2. Consultar item, estoque, histórico de movimentações e compra.
3. Conferir pendência logística.

Esperado:

- Uma única saída de estoque de quantidade 2 é criada atomicamente.
- Origem exibida: `DevolucaoCompra`, com navegação para compra, item, recebimento e devolução.
- Reversão de custo: R$ 105,40, baseada no snapshot do recebimento.
- A quantidade pendente não reabre; quantidade devolvida após recebimento aparece separadamente.
- Não surge crédito financeiro automático.

## 9. Estoque insuficiente e atomicidade

1. Reduzir o estoque disponível por uma venda legítima.
2. Tentar devolver após recebimento uma quantidade maior que o saldo atual.

Esperado:

- Retorno `409 ESTOQUE_INSUFICIENTE`.
- Não ficam devolução parcial, movimentação órfã ou alteração de saldo.

## 10. Custo com recebimentos em valores diferentes

Preparar o mesmo item com dois recebimentos: 2 unidades a R$ 40,00 e 3 a R$ 60,00.

1. Devolver 1 unidade do primeiro recebimento.
2. Conferir custo médio e histórico em datas anterior e posterior à devolução.
3. Devolver 1 unidade do segundo recebimento e repetir.

Esperado:

- Cada saída reverte exatamente R$ 40,00 e R$ 60,00, respectivamente.
- O cálculo não usa o custo médio atual como substituto do snapshot.
- Cortes históricos anteriores às devoluções permanecem inalterados.
- Movimentações de venda e cancelamento de venda continuam excluídas da base de aquisição conforme regra existente.

## 11. Compensação da devolução após recebimento

1. Confirmar presença física da mercadoria retornada.
2. Compensar a devolução posterior.
3. Tentar compensar novamente.

Esperado:

- Uma única entrada de estoque é criada atomicamente.
- Origem exibida: `CompensacaoDevolucaoCompra`.
- Quantidade e custo são restaurados pelo mesmo snapshot do recebimento.
- O evento original continua visível e a segunda compensação falha com conflito.

## 12. Alocação e prejuízo líquido

Preparar uma perda de R$ 50,00 e uma devolução comercial bruta de R$ 120,00 dentro do recorte operacional.

1. Registrar reembolso de R$ 100,00, alocando R$ 30,00 à perda, R$ 60,00 à devolução e deixando R$ 10,00 não alocados.
2. Conferir indicadores operacionais.
3. Cancelar o reembolso após o fechamento do primeiro período e conferir cortes antes/depois.

Esperado:

- O caixa reconhece os R$ 100,00 na data do crédito.
- Recuperação associada é R$ 90,00 e prejuízo líquido não recuperado é R$ 80,00: `max(0, 170 − 90)`.
- Os R$ 10,00 não alocados não reduzem ocorrência específica.
- Após cancelamento, as alocações deixam de ser efetivas a partir da data do cancelamento.

## 13. Fórmulas financeiras

Para um período controlado, preparar:

- recebimentos de clientes: R$ 1.000,00;
- reembolsos: R$ 100,00;
- cancelamentos de reembolso: R$ 20,00;
- compras brutas: R$ 400,00;
- despesas: R$ 200,00.

Esperado:

- Reembolsos líquidos: R$ 80,00.
- Entradas de caixa: R$ 1.080,00.
- Saídas: R$ 600,00.
- Saldo operacional: R$ 480,00.
- O saldo final preserva a fórmula atual de saldo inicial e ajustes, acrescentando apenas os reembolsos líquidos às entradas.

## 14. Regressão funcional completa

Executar pelo menos:

- criação e edição permitida de compra;
- recebimento parcial e total;
- lançamento de perda;
- venda, cancelamento de venda e ajuste de inventário;
- consultas de estoque atual e histórico;
- dashboards com e sem filtros temporais;
- financeiro em períodos sem qualquer dado da F027.

Esperado: comportamento anterior preservado, inclusive significados dos status logísticos e do campo de recebimentos de clientes.

## 15. Interface e responsividade

Validar nos breakpoints já adotados pelo projeto: 360 px, 768 px e 1440 px:

- ação de registrar devolução antes/depois do recebimento;
- escolha obrigatória do recebimento na devolução posterior;
- confirmação explícita da presença física ao compensar;
- lançamento, alocação e cancelamento de reembolso;
- histórico auditável e distinção visual entre logística, estoque e financeiro;
- mensagens de validação e conflitos concorrentes.

Esperado: nenhuma ação crítica fica invisível, truncada ou ambígua; estados de carregamento e erro impedem duplo envio acidental.

Também executar validação orientada cronometrada com ao menos dois usuários representativos autenticados:

- medir o tempo entre abrir o detalhe e concluir uma devolução válida;
- medir o tempo entre abrir o detalhe e concluir um reembolso válido;
- medir o tempo para localizar total original, total reembolsado, custo líquido, situação logística e histórico;
- registrar tempos individuais, dispositivo, resolução e observações em `artifacts/f027-validation-evidence.md`.

Esperado: cada operação é concluída em até 2 minutos e as cinco informações são identificadas em até 30 segundos por participante.

## 16. Desempenho

Com volume semelhante ao de produção:

1. Medir dez vezes a abertura da lista e do detalhe de compras com resumos F027.
2. Medir dez vezes dashboards financeiros e operacionais nos recortes usuais.
3. Medir consultas de histórico de estoque com as novas origens.

Esperado: pelo menos 9 de 10 execuções de cada fluxo concluem em até 2 segundos, sem consultas N+1 perceptíveis.

## 17. Implantação e rollback lógico

Ordem recomendada:

1. Backup e baseline aprovados.
2. Migration expansiva aplicada com a flag desligada.
3. Verificações SQL e smoke test dos fluxos legados.
4. Backend compatível implantado.
5. Frontend compatível implantado, ainda sem liberar comandos.
6. Flag habilitada para usuários controlados e métricas monitoradas.
7. Liberação gradual após aprovação.

Se houver incidente:

- desligar imediatamente a flag;
- manter as cinco tabelas e os eventos já gravados;
- não executar `Down` depois que existir dado F027;
- preservar leitura e auditoria enquanto a correção é preparada;
- restaurar backup apenas em desastre confirmado e mediante procedimento operacional aprovado.

## 18. Registro de evidências

Anexar à entrega:

| Evidência | Resultado esperado |
|---|---|
| Diff e SQL da migration | Somente expansão, cinco tabelas novas, sem DML |
| Backup e ensaio de restauração | Identificação, checksum, duração e responsável |
| Baseline antes/depois | Sem divergência em dados e totais legados |
| Builds | Backend e frontend aprovados |
| Cenários 4 a 14 | Resultado, capturas e IDs usados |
| Desempenho | 9/10 abaixo de 2 s por fluxo crítico |
| Aprovação de ativação | Responsáveis técnico e de negócio |
