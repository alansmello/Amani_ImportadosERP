# Investigação: devoluções de compras contabilizadas em trânsito

Data: 2026-09-20.
Revisão local analisada: 9c0bcb3de3d7d4268d8fe0b061c8c45174a811f8.
Escopo: rastreamento e especificação em discussão; nenhuma correção de aplicação ou migration.
Método: inspeção estática do caminho efetivamente chamado e análise posterior do JSON da auditoria executada pelo usuário em produção. Os exemplos sintéticos continuam sendo deduções, não testes executados contra a aplicação.

## Conclusão técnica

Há omissão de devoluções anteriores ao recebimento no cálculo do Dashboard. Há também divergências entre status persistido, status calculado no detalhe e tags de devolução. A gravação da devolução não modifica o status da compra; isso, isoladamente, não prova corrupção do histórico e não explica sozinho o Dashboard, que não exige status EmTransito para contar uma compra.

O diagnóstico não sustenta uma correção limitada a trocar um status. Também não sustenta excluir uma compra inteira do trânsito simplesmente porque possui uma devolução: a pendência é por quantidade de cada item.

## Representação e persistência

| Conceito | Representação real |
| --- | --- |
| Compra | Compra; tabela compras. Status é enum convertido para string; DataCompra, Desconto e Acrescimo são persistidos. |
| Item adquirido | CompraItem; tabela compra_items. Quantidade, CustoUnitario, Desconto, Acrescimo e vínculos de compra/produto. |
| Recebimento | CompraItemRecebimento; tabela compra_item_recebimentos. Quantidade e DataRecebimento; ligado à entrada de estoque. |
| Perda pendente | CompraItemPerda; tabela compra_item_perdas. Quantidade e DataPerda reduzem pendência. |
| Devolução | CompraItemDevolucao; tabela compra_item_devolucoes. Momento, Quantidade, DataDevolucao, Motivo, OperacaoId e vínculos. |
| Compensação de devolução | CompraItemDevolucaoCompensacao; tabela compra_item_devolucao_compensacoes. DataCompensacao, motivo, operação e vínculo único com devolução. |
| Estoque | EstoqueMovimentacao; entrada no recebimento, saída na devolução posterior e entrada na compensação posterior. |
| Reembolso | CompraReembolso e cancelamento/alocações; dimensão financeira independente, não define pendência logística. |
| EmTransito | Valor de CompraStatus, persistido. A condição usada para calcular trânsito no Dashboard é outra: pendência positiva na data. |
| Devolvida | Código derivado de SituacaoLogisticaDevolucao nos DTOs; não é membro de CompraStatus nem coluna de status da devolução. |
| Pendência | Propriedade/cálculo; não é um saldo persistido independente. Existem versões diferentes desse cálculo. |

Fontes:
- src/Amani.ImportadosERP.Domain/Entities/Compra.cs:15,35,110,166.
- src/Amani.ImportadosERP.Domain/Entities/CompraItem.cs:29-31,76.
- src/Amani.ImportadosERP.Domain/Entities/CompraItemDevolucao.cs.
- src/Amani.ImportadosERP.Domain/Entities/CompraItemDevolucaoCompensacao.cs.
- src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/CompraMapping.cs:11-21.
- src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/CompraItemDevolucaoMapping.cs:11-39.
- src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/CompraItemDevolucaoCompensacaoMapping.cs:11-26.

OperacaoId tem índice único; cada devolução admite no máximo uma compensação. Os eventos são inseridos pelos fluxos, preservando os originais. Devolução anterior exige recebimento e movimento de estoque nulos; posterior exige ambos.

## Caminho completo

1. POST /api/compras → ComprasController.Create → CompraService.CreateAsync:50 → new Compra, que começa EmTransito → AdicionarItem → CompraRepository.AdicionarAsync:22 → SaveChangesAsync. Não há uma operação separada obrigatória de “entrar em trânsito”.
2. POST /api/compras/{compraId}/itens/{itemId}/recebimentos → CompraService.RegistrarRecebimentoItemAsync:82 → Compra.RegistrarRecebimentoItem → recebimento e entrada de estoque. O agregado recalcula Status por recebimentos/perdas.
3. POST /api/compras/{compraId}/itens/{itemId}/devolucoes → CompraService.RegistrarDevolucaoAsync:270. Não há command MediatR intermediário nesse caminho: o controller chama o serviço.
4. Antes do recebimento: serviço consulta devoluções anteriores vigentes e valida quantidade disponível. Insere a devolução, sem movimento de estoque e sem recalcular/gravar novo Status da compra.
5. Depois do recebimento: serviço exige recebimento pertencente ao item, quantidade elegível e estoque disponível; grava saída com o valor unitário do recebimento e a devolução ligada à saída. Preserva o recebimento original.
6. UnitOfWork.ExecuteInTransactionAsync:19-31 fecha a operação em transação Serializable, com SaveChangesAsync e CommitAsync.
7. POST /api/compras/{compraId}/devolucoes/{devolucaoId}/compensacoes → CompraService.CompensarDevolucaoAsync:391. Insere compensação. Após recebimento exige presença física e insere entrada; antes do recebimento a neutralização restaura a pendência por leitura dos eventos.
8. GET /api/compras → ObterListaComprasQueryHandler:30 → compra.Status persistido, mais tags derivadas.
9. GET /api/compras/{id} → CompraService.ObterPorIdAsync:66 → CompraMapper.ToResponse:21 → recalcula status e pendência considerando devoluções anteriores vigentes.
10. GET /api/dashboard-gerencial/operacional → ObterDashboardOperacionalQueryHandler → DashboardOperacionalRepository.
11. GET /api/dashboard-gerencial/financeiro → ObterDashboardFinanceiroGerencialQueryHandler → reutiliza o mesmo resumo de trânsito; incorpora os valores também no patrimônio.
12. Frontend dashboard-home busca as duas seções; dashboard-patrimonial-grid mostra os valores retornados. use-purchases invalida as queries de Dashboard após devolução e compensação.

Rotas de recebimentos/perdas usam respectivamente RegistrarRecebimentoItemAsync e RegistrarPerdaItemAsync. Consultas de trânsito usam ObterComprasEmTransitoQueryHandler e ObterProdutosPendentesRecebimentoQueryHandler, não os métodos legados de mesmo tema existentes em CompraService.

## Fórmulas e divergências

Considere, por item e na data t:
- Q: quantidade comprada.
- R(t): quantidade recebida até t, preservando recebimentos depois devolvidos.
- P(t): perdas registradas até t.
- DA(t): devoluções AntesDoRecebimento com DataDevolucao <= t e sem compensação efetiva até t.

A regra já documentada na F027 implica pendência = Q - R(t) - P(t) - DA(t). Compensar devolução anterior neutraliza DA a partir da data de compensação. Devolução posterior não é descontada novamente: essas unidades já saíram da pendência pelo recebimento.

| Consumidor | Comportamento atual |
| --- | --- |
| CompraItem.QuantidadePendente | Q - R - P; ignora devoluções. |
| CompraItem.CalcularQuantidadePendente(DA) | max(0, Q - R - P - DA). O clamp pode ocultar quantidade negativa inválida. |
| DashboardOperacionalRepository:44-143 | Q - R(t) - P(t), tanto na seleção quanto no valor projetado; ignora DA. |
| Compras em aberto/produtos pendentes do Dashboard | Helper em DashboardOperacionalRepository:280-288 também omite DA. |
| DashboardAlertaRepository:277-313 | Considera DA com data efetiva e compensação; pode discordar dos cards. |
| CompraRepository:74-103 | Seleção de compras pendentes considera devoluções anteriores vigentes. Também exclui status Recebida/Finalizada/Cancelada em 230-236. |
| ObterComprasEmTransitoQueryHandler | Quantidades dos itens consideram DA; ValorPendenteCusto usa FromEntity, que ignora DA. Parcialmente devolvida pode ter quantidade correta e valor incorreto. |
| Lista de compras | ObterListaComprasQueryHandler:68 retorna status persistido. |
| Detalhe de compra | CompraMapper:44-46 recalcula status pela pendência com DA. |

O Dashboard filtra compra não cancelada e DataCompra <= referência, não Status == EmTransito. Mudar somente o status não resolveria a fórmula.

O valor ao custo usa o rateio financeiro oficial: valor líquido de cada item com ajustes gerais rateados, multiplicado por pendente/comprado, com arredondamento. O valor de venda usa pendente × preço de venda do produto. Não confundir com custo médio do estoque, total bruto da compra ou reembolso.

A data de referência é o fim do período selecionado (DashboardFiltroService:79-80); por padrão, fim do mês corrente. Uma consulta anterior à devolução deve continuar apresentando a pendência daquele momento.

## Identificação “Devolvida” e limites da observação

CompraMapper.CalcularSituacaoLogisticaDevolucao:113 recebe apenas devoluções POSTERIORES vigentes, posteriores compensadas e quantidade recebida histórica.

- Devolvida / “Recebida e devolvida”: quantidade posterior vigente >= recebida histórica, com base recebida positiva.
- ParcialmenteDevolvida: existe devolução posterior vigente abaixo dessa referência.
- ParcialmenteCompensada: há devoluções posteriores vigentes e compensadas.
- DevolucaoCompensada: apenas posteriores compensadas.
- SemDevolucao: nenhum desses casos, inclusive quando só existem devoluções anteriores.

PossuiDevolucao, por sua vez, inclui devoluções anteriores. Logo pode existir badge “Sem devolução” apesar de histórico de recusa. A coluna “Devolvida” dos itens soma anteriores e posteriores (purchase-detail.tsx:307-308), enquanto a tag usa a regra posterior acima.

A tag “Recebida e devolvida” pode aparecer para toda a parcela recebida mesmo havendo outras unidades ainda pendentes. Não significa necessariamente que toda a quantidade comprada foi devolvida.

O par exato “Em trânsito + Devolvida”, informado pelo usuário, ainda precisa ser associado a uma compra real e à versão publicada. O código local não permite concluir que toda coexistência dessas identificações seja erro; devoluções parciais e compras com vários itens podem manter pendência legítima.

## Exemplos deduzidos do código, não execução

Compra única de 10 unidades a R$ 100 cada, sem ajustes comerciais:

| Eventos | Pendência esperada | Dashboard atual | Observação |
| --- | ---: | ---: | --- |
| Nenhum | 10 / R$ 1.000 | 10 / R$ 1.000 | Controle |
| Recusa de 4 antes de receber | 6 / R$ 600 | 10 / R$ 1.000 | API de trânsito pode retornar 6 unidades e R$ 1.000 |
| Recusa das 10 antes de receber | 0 / R$ 0 | 10 / R$ 1.000 | Lista mantém EmTransito; detalhe calcula Recebida; tag SemDevolucao |
| Recebe 4 e devolve essas 4 depois | 6 / R$ 600 | 6 / R$ 600 | As outras 6 continuam pendentes; não descontar as 4 duas vezes |
| Recebe 4 e recusa as outras 6 | 0 / R$ 0 | 6 / R$ 600 | Erro restrito à parcela anterior ao recebimento |
| Recusa 10 e depois compensa a recusa | 10 / R$ 1.000 após compensar | 10 / R$ 1.000 | Resultado atual coincide após compensação; histórico intermediário continua errado |

## Gravação e risco de inconsistência real

RegistrarDevolucaoAsync valida a devolução anterior contra pendência já líquida das devoluções anteriores vigentes. Não foi identificado nesse caminho um apagamento de recebimentos ou uma entrada indevida de estoque para a recusa.

Entretanto, RegistrarRecebimentoItemAsync:96 e RegistrarPerdaItemAsync:140 chamam validações baseadas na pendência legada, sem DA. Assim, uma requisição direta pode aceitar recebimento/perda de quantidade já encerrada por recusa. A UI mostrar a quantidade correta não garante a integridade do endpoint.

Isso é um risco adicional confirmado na validação do código, mas a existência de registros que o materializem precisa de auditoria. Separar:
1. Eventos válidos, somados incorretamente no Dashboard.
2. Status persistido divergente de uma projeção atual.
3. Inconsistência quantitativa real: Q - R - P - DA < 0, devoluções posteriores acima do recebido, vínculos incompatíveis ou datas inválidas.

Não equiparar automaticamente os casos 1 e 2 ao caso 3.

## Produção e preservação

A evidência F027 contém fases antigas pendentes e registro posterior de ativação em produção. Não interpretar os primeiros “Pending” isoladamente como ausência da feature. Baselines da implantação não demonstram o estado atual dos dados nem a versão hoje publicada.

Não há justificativa, nesta investigação, para atualizar em massa compras, marcar tudo como recebido, excluir eventos, reescrever totais ou reaplicar migrations. Consultas corretas podem recompor posições a partir de eventos válidos já existentes, sem reescrevê-los. Registros quantitativamente inválidos, se encontrados, exigem análise individual e decisão posterior de tratamento auditável.

Auditoria deve usar leitura consistente, SELECTs com eventos agregados separadamente para evitar multiplicação por joins, referência temporal explícita e limite de execução. Deve medir quantidade/valor contados indevidamente, separar divergência de apresentação de violação de saldo e registrar IDs sem expor credenciais.

## Resultado da auditoria produtiva fornecida pelo usuário

Ambiente confirmado pelo usuário como produção. Fonte: old-poetry-04313922_production_neondb_2026-09-20_11-55-08.json, exportado em Downloads. Captura mostrada no screenshot: 2026-09-20 14:55:09.09816+00; banco neondb, transaction_read_only=on. O agente analisou o export, sem conexão direta ao banco.

| Medida | Resultado |
| --- | ---: |
| Referência | NULL: todos os eventos cadastrados |
| Itens candidatos e itens com diferença no Dashboard | 12 |
| Compras distintas desses itens | 10 |
| Unidades de diferença de pendência | 61 |
| Itens com pendência líquida bruta negativa | 0 |
| Pendência líquida dos 12 itens | 0 |

A amostra contém os 12 candidatos completos, abaixo do limite de 100. Todos têm recebida=0, perdida=0, devolvida_depois_vigente=0, quantidade comprada igual à devolvida_antes_vigente e status persistido EmTransito. São 61 unidades integralmente recusadas antes do recebimento. A fórmula legada ainda as conta como pendentes; a fórmula líquida resulta em zero.

| CompraId | Itens afetados | Unidades afetadas |
| --- | ---: | ---: |
| 0bbb41fe-ba25-4651-a1ab-7d2239f9f302 | 1 | 5 |
| 102debe4-63db-4e91-9a43-9b7f715cb36c | 1 | 1 |
| 29c0d446-6d53-4ead-a178-a5944655171e | 2 | 5 |
| 4c19b743-2657-427d-81ab-aa09e4944b8f | 1 | 4 |
| 6ccde498-f6f3-4a9b-babc-d9a4efbd0d7d | 1 | 9 |
| 7f154f72-8fe3-4822-a1b4-e5a7b501d7a4 | 2 | 17 |
| 859b60b6-7310-454b-98df-a3e60d99277f | 1 | 5 |
| 8ddccbb3-628b-4ef3-bcb3-267cfbac8987 | 1 | 5 |
| 9c1348a0-010a-4869-871a-e7e34e02a202 | 1 | 5 |
| 9e0fc438-74a9-4805-8045-67b80135db82 | 1 | 5 |

Conclusão: existe impacto real nos dados produtivos para a omissão de devoluções anteriores identificada no código. Não houve saldo líquido negativo no critério auditado. Não há evidência que justifique reescrever esses eventos: as devoluções necessárias à recomposição da pendência já estão registradas.

Limites: o export não contém valores monetários, datas individuais nem itens sem diferença dessas compras. Portanto não demonstra o valor em reais, o total do card para um período específico, que as 10 compras estejam integralmente encerradas, nem integridade irrestrita dos vínculos e de todo o histórico. A ausência de saldo negativo nesta auditoria não elimina o risco de validação identificado nos endpoints.

## Regras já sustentadas pela especificação existente

specs/027-devolucoes-reembolsos-compras/spec.md:
- FR-014/015: recusa anterior reduz pendência sem estoque.
- FR-018: devolução posterior preserva recebimento e gera saída.
- FR-024/025: devolução não cria reposição automática.
- FR-026/027/027A: distinguir quantidades e situações logística/financeira.
- FR-038: compensação anterior restaura pendência.
- FR-042: leituras afetadas devem ser consistentes.
- SC-005: eventos posteriores não alteram posições anteriores à data efetiva.

Não é necessário rediscutir essas regras para explicar a omissão atual. Eventual mudança delas deve ser explícita.

## Decisões confirmadas e escopo funcional

O usuário aprovou:
1. Compra totalmente recusada antes de qualquer recebimento: identificação “Devolvida antes do recebimento”, pendência zero.
2. Compra parcialmente devolvida com unidades ainda pendentes: identificação “Parcialmente devolvida”; somente as unidades restantes compõem trânsito.
3. Compra sem pendência vigente não deve aparecer no filtro “Em trânsito”.
4. Quantidades devolvidas anteriores vigentes não devem compor os cards “Mercadorias em trânsito ao custo” e “Mercadorias em trânsito a venda”.

A aprovação é de regras e especificação. Não autoriza implementação, alteração produtiva ou atualização em massa do status persistido.

## Complemento: filtro da tela de compras

Confirmado em frontend/src/app/compras/page.tsx:44-89:
- Sem filtros, a página usa /api/compras/em-transito e restringe a compras dos últimos 30 dias.
- Com qualquer filtro, muda para /api/compras.
- O filtro de status é aplicado no navegador por igualdade: purchase.status === filters.status (linha 73).
- frontend/src/services/purchases.ts:26-47 envia datas e fornecedor à API, mas não status.
- ObterListaComprasQueryHandler:68 retorna compra.Status persistido, sem recalcular a pendência.

Isso explica por que compras encerradas por devolução podem reaparecer ao aplicar “Em trânsito”: os dois caminhos têm critérios diferentes. O caminho sem filtro já exclui compras sem pendência líquida no repositório, enquanto o caminho filtrado aceita o status antigo. O nome EmTransito no banco não prova trânsito vigente.

A consulta produtiva confirma o padrão que causa esse comportamento, mas não contém todos os itens de cada compra. A exclusão de uma compra inteira deve depender de não haver nenhum item com pendência vigente; não basta encontrar um item totalmente devolvido.

## Complemento: os dois cards financeiros

DashboardOperacionalRepository.ObterMercadoriasEmTransitoAsync:44-143 omite devoluções anteriores na seleção e na projeção da quantidade pendente:
- Ao custo: quantidade pendente incorreta alimenta o rateio oficial da compra (linhas 100-119).
- Ao preço de venda: quantidade pendente incorreta multiplica o preço de venda do produto (linhas 121-125).
- ObterDashboardFinanceiroGerencialQueryHandler:108-111 entrega esses dois valores.
- frontend/src/components/dashboard/dashboard-patrimonial-grid.tsx:115-129 os mostra diretamente.
- Patrimônio realista e potencial também usam os valores em trânsito (handler financeiro:75-83).

Portanto ambos os cards estão sujeitos à mesma inclusão indevida. O filtro da tela de compras não alimenta esses cards: são caminhos distintos com inconsistência de regra. Corrigir apenas o filtro não corrigiria os valores. Os 61 itens unitários devolvidos identificados na auditoria têm contribuição logística correta igual a zero; o excedente monetário exato e a correspondência a um período específico ainda dependem de valores e datas não presentes no export.

## Especificação de comportamento e aceitação

Pendência vigente por item, na referência t:
Q - recebimentos até t - perdas até t - devoluções anteriores vigentes em t.
Compensação anterior restaura a pendência a partir de sua data; devolução posterior não é descontada duas vezes. Saldo bruto negativo deve ser investigado, não ocultado como prova de integridade.

Critérios para a futura correção:

1. Compra de 10 unidades, nenhuma recebida/perdida, devolução anterior vigente de 10: pendência zero; identificação aprovada; ausente do filtro EmTransito; contribuição zero nos dois cards após a data de devolução.
2. Compra de 10, devolução anterior vigente de 4: pendência 6; identificação parcial; apenas 6 unidades valorizadas nos dois cards. O valor ao custo preserva rateio e ajustes oficiais.
3. Compra com item A totalmente devolvido e item B pendente: A não contribui; B permanece contado. A compra não é tratada como integralmente devolvida.
4. Compra de 10, recebe 4 e devolve essas 4 depois: 6 ainda pendentes; a devolução das recebidas não reduz a pendência das outras 6. Identificação de devolução parcial no resumo.
5. Consulta anterior à devolução mantém a posição daquele momento; consulta posterior desconta a devolução; compensação posterior restaura a pendência somente a partir da sua data.
6. Filtro ativo, leitura sem filtro, detalhe, API de trânsito, alertas e Dashboard não podem discordar sobre a quantidade pendente para os mesmos itens e referência. Preservar os demais filtros de data/fornecedor e não confundir a janela de 30 dias da lista com a posição patrimonial.
7. Reembolso, sua ausência ou cancelamento não determinam entrada/saída do trânsito.
8. Não alterar total comercial, recebimentos históricos ou eventos de devolução para recompor a leitura. Reavaliar os 12 itens/61 unidades como evidência de regressão, sem presumir que as 10 compras não tenham outros itens.
9. Validar recebimentos/perdas subsequentes contra pendência líquida de recusas, como risco adicional identificado; a auditoria atual não encontrou saldo líquido negativo.
10. Valores derivados de patrimônio devem refletir os dois cards corrigidos. Ausência de preço/base válida mantém a sinalização de valor indisponível; não inventar valores.

Pendências de validação: medir excedente em reais, conciliar datas com o período exibido e executar os cenários em ambiente isolado na futura implementação. Nenhuma dessas pendências autoriza alterar o histórico produtivo.

## Artefatos e verificação desta investigação

- compras-devolucoes-transito-auditoria.sql: auditoria inicial por item, em transação REPEATABLE READ READ ONLY, com timeouts e ROLLBACK. Executada pelo usuário em produção; resultado exportado analisado nesta investigação.
- NULL na referência do SQL considera todos os eventos cadastrados; preencher a referência UTC exata para comparar com um período do Dashboard.
- O SQL informa diferenças gerais e diferenças excluindo compras canceladas. Não reconcilia dinheiro, não verifica todos os vínculos/datas nem o limite por recebimento; essas verificações complementares dependem dos resultados iniciais.
- CONTEXT.md registra somente o vocabulário já estabelecido; nomenclatura para devolução total anterior e parcial com pendência foi aprovada pelo usuário.
- Nenhum endpoint de escrita foi chamado; nenhum registro produtivo foi alterado; nenhum código da aplicação ou migration foi modificado.
- Revisão estática do SQL contra os mapeamentos e verificação de whitespace realizadas. Não houve reprodução executável nem teste de integração; o defeito de fórmula está demonstrado por inspeção do código.
