# Feature Specification: Devoluções e Reembolsos de Compras

**Feature Branch**: `027-devolucoes-reembolsos-compras`

**Created**: 2026-08-16

**Status**: Draft

**Input**: User description: "Registrar devoluções ou recusas antes e depois do recebimento e reembolsos parciais ou totais de compras, preservando estoque, custo médio, financeiro, histórico e dados já existentes em produção."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar reembolso de compra (Priority: P1)

Como operador ou gestor da Amani, quero registrar o valor efetivamente reembolsado por um fornecedor ou marketplace para que o dinheiro recuperado retorne ao financeiro na data real do crédito, sem alterar o valor comercial original da compra nem ser confundido com recebimento de cliente.

**Why this priority**: Este é o resultado financeiro central da feature e resolve a lacuna atual em que toda perda permanece como prejuízo integral mesmo quando existe recuperação de dinheiro.

**Independent Test**: Registrar um reembolso parcial em uma compra existente e verificar que o total original é preservado, o total reembolsado e o custo financeiro líquido são exibidos separadamente e o caixa passa a considerar o crédito somente a partir da data do reembolso.

**Acceptance Scenarios**:

1. **Given** uma compra sem reembolsos, **When** o usuário registra e confirma um reembolso parcial válido, **Then** o sistema preserva o total original, apresenta o total reembolsado e calcula o custo financeiro líquido da compra.
2. **Given** uma compra com um reembolso parcial, **When** outro reembolso válido é confirmado, **Then** o sistema acumula os valores e preserva os dois eventos no histórico.
3. **Given** uma compra reembolsada integralmente, **When** o usuário consulta seu detalhe ou a lista, **Then** identifica claramente que o reembolso é integral sem substituir o estado logístico da compra.
4. **Given** um reembolso em data posterior à compra, **When** o usuário consulta uma posição anterior e outra posterior ao crédito, **Then** somente a posição posterior considera o dinheiro recuperado.
5. **Given** uma compensação parcial concedida sem devolução física, **When** o reembolso é registrado, **Then** o financeiro é atualizado sem alterar estoque, recebimentos, perdas, devoluções ou pendências.
6. **Given** uma tentativa com valor zero, negativo, duplicado ou que exceda o limite reembolsável, **When** o usuário confirma, **Then** a operação é rejeitada com orientação clara e sem registro parcial.

---

### User Story 2 - Devolver ou recusar item antes do recebimento (Priority: P1)

Como operador de compras, quero registrar a devolução ou recusa de um item ainda pendente para encerrar corretamente a quantidade que não será recebida, sem criar estoque e sem presumir que o fornecedor já devolveu o dinheiro.

**Why this priority**: Produtos falsificados, incorretos ou avariados podem ser identificados antes da confirmação no ERP; esse encerramento físico precisa ser separado do reembolso financeiro.

**Independent Test**: Em uma compra totalmente pendente, devolver parte de um item, verificar a redução exata da pendência, a ausência de movimentação de estoque e a manutenção do reembolso como situação independente.

**Acceptance Scenarios**:

1. **Given** um item com quantidade pendente, **When** o usuário confirma uma devolução ou recusa parcial, **Then** a quantidade devolvida deixa de estar pendente e nenhuma entrada ou saída de estoque é criada.
2. **Given** um item integralmente pendente, **When** toda a quantidade é recusada, **Then** o item é encerrado logisticamente sem ser apresentado como recebido ou disponível em estoque.
3. **Given** uma devolução sem crédito recebido, **When** o detalhe é consultado, **Then** o sistema mostra separadamente a devolução registrada e o reembolso ainda inexistente.
4. **Given** uma devolução com reembolso posterior, **When** os dois eventos são consultados, **Then** ambos permanecem independentes, relacionados à mesma compra e ordenados por suas datas efetivas.
5. **Given** quantidade inválida ou superior à pendência, **When** a devolução é confirmada, **Then** o sistema rejeita a operação sem modificar pendência, histórico ou estoque.

---

### User Story 3 - Devolver item depois do recebimento (Priority: P1)

Como operador de compras e estoque, quero devolver um produto que já foi recebido quando um erro, falsificação, avaria ou item incorreto for identificado posteriormente para que o saldo físico e o custo da mercadoria disponível permaneçam confiáveis sem apagar o recebimento original.

**Why this priority**: A conferência pode falhar ou o problema pode surgir apenas depois; sem esse fluxo, o ERP mantém como disponível uma mercadoria que saiu fisicamente para o fornecedor.

**Independent Test**: Receber um item, devolver parte da quantidade disponível e verificar que o recebimento original permanece no histórico, a devolução gera uma saída identificada como devolução de compra, o saldo diminui e a base de custo aplicável a partir da devolução é conciliada.

**Acceptance Scenarios**:

1. **Given** um item anteriormente recebido e ainda disponível, **When** o usuário confirma sua devolução, **Then** o recebimento original é preservado e uma saída rastreável com origem de devolução de compra reduz o estoque.
2. **Given** múltiplos recebimentos do mesmo item, **When** uma devolução é registrada, **Then** ela permanece vinculada à compra e ao item e identifica o recebimento de referência quando essa associação for necessária para determinar quantidade e custo.
3. **Given** parte da quantidade recebida já vendida ou indisponível, **When** o usuário tenta devolver além do saldo físico, **Then** o sistema limita a operação ao que pode ser devolvido e explica o impedimento antes da confirmação.
4. **Given** devoluções anteriores do mesmo item, **When** uma nova devolução é solicitada, **Then** a soma devolvida não ultrapassa a quantidade recebida ainda elegível para devolução.
5. **Given** uma devolução posterior ao recebimento, **When** custo e posição de estoque são consultados antes e depois da data do evento, **Then** o passado permanece inalterado e somente as posições a partir da devolução refletem a saída e a reversão de custo correspondente.
6. **Given** uma devolução com reembolso, **When** ambos são registrados em datas diferentes, **Then** estoque e financeiro respeitam as datas de seus próprios eventos.
7. **Given** uma mercadoria recebida e depois devolvida, **When** o detalhe ou a lista de compras é consultado, **Then** o recebimento histórico continua visível e a devolução vigente aparece separadamente no item e na situação logística da compra.

---

### User Story 4 - Auditar recuperação e prejuízo líquido (Priority: P2)

Como gestor da Amani, quero consultar a composição bruta das perdas e devoluções, os valores recuperados e o prejuízo líquido para compreender o impacto real das ocorrências sem misturar fluxo físico e financeiro.

**Why this priority**: Depois de operar devoluções e reembolsos, a gestão precisa reconciliar o que foi comprado, o que retornou ao fornecedor e quanto dinheiro foi efetivamente recuperado.

**Independent Test**: Preparar compras com perda sem reembolso, devolução com reembolso parcial, devolução com reembolso total e compensação sem devolução; conferir histórico, indicadores operacionais e caixa em cada caso.

**Acceptance Scenarios**:

1. **Given** perdas e devoluções no período, **When** o gestor consulta os indicadores, **Then** vê separadamente valor bruto afetado, reembolsos recebidos e prejuízo líquido não recuperado.
2. **Given** pagamentos de clientes e reembolsos de compras no mesmo período, **When** o financeiro é consultado, **Then** as duas origens permanecem separadas e ambas participam corretamente da posição de caixa.
3. **Given** compras com descontos e acréscimos por item e gerais, **When** o valor de uma perda ou devolução é apresentado, **Then** ele usa a mesma política financeira oficial da compra e recompõe os totais sem divergência de centavos.
4. **Given** uma consulta histórica, **When** existem devoluções ou reembolsos posteriores à data de referência, **Then** esses eventos posteriores não alteram a posição consultada.
5. **Given** uma compra sem devolução ou reembolso, **When** qualquer tela ou indicador é consultado, **Then** seu comportamento anterior permanece inalterado.

---

### User Story 5 - Corrigir eventos sem apagar histórico (Priority: P2)

Como operador responsável, quero corrigir uma devolução ou um reembolso lançado incorretamente por meio de cancelamento ou compensação rastreável para preservar a auditoria e restaurar estoque, custo e financeiro de maneira consistente.

**Why this priority**: O sistema está em produção e erros humanos são possíveis; impedir exclusão destrutiva protege tanto a operação quanto a confiança nos dados históricos.

**Independent Test**: Registrar e depois cancelar uma devolução e um reembolso, verificando que os eventos originais continuam visíveis, os efeitos são compensados uma única vez e uma segunda tentativa não duplica a correção.

**Acceptance Scenarios**:

1. **Given** um reembolso lançado incorretamente, **When** o usuário confirma seu cancelamento com motivo, **Then** o registro original é preservado, deixa de compor os valores vigentes e a compensação aparece no histórico.
2. **Given** uma devolução posterior ao recebimento lançada incorretamente, **When** ela é cancelada e a reposição física é confirmada, **Then** estoque e custo são restaurados por evento compensatório rastreável sem apagar a saída original.
3. **Given** uma devolução anterior ao recebimento lançada incorretamente, **When** ela é cancelada, **Then** a quantidade volta à pendência sem ser apresentada como estoque recebido.
4. **Given** um evento já cancelado, **When** nova tentativa de cancelamento é enviada, **Then** o sistema não duplica efeitos físicos ou financeiros.
5. **Given** uma devolução posterior ao recebimento compensada, **When** o detalhe ou a lista de compras é consultado, **Then** a compra indica que houve devolução compensada, preserva a devolução original no histórico e deixa claro o efeito logístico vigente após a compensação.

---

### User Story 6 - Operar com segurança em produção (Priority: P3)

Como responsável pelo produto, quero que a evolução seja implantada sem perda ou reinterpretação destrutiva dos dados existentes para manter compras, estoque, custo e financeiro em funcionamento durante e depois da entrega.

**Why this priority**: A aplicação já está em produção e a preservação dos registros atuais é condição obrigatória para liberar a funcionalidade.

**Independent Test**: Aplicar a evolução em uma cópia representativa dos dados produtivos, executar cenários anteriores e novos e comprovar que nenhum registro histórico foi apagado ou alterado e que os saldos conciliam antes e depois da implantação.

**Acceptance Scenarios**:

1. **Given** uma cópia representativa dos dados atuais, **When** a evolução é ensaiada, **Then** compras, itens, recebimentos, perdas, vendas, movimentações, pagamentos e eventos financeiros existentes mantêm quantidade, conteúdo e significado.
2. **Given** registros históricos sem os novos conceitos, **When** a versão nova os consulta, **Then** eles continuam válidos e exibem ausência legítima de devolução ou reembolso.
3. **Given** que novos eventos já foram registrados, **When** é necessário recuar a versão da aplicação, **Then** o procedimento preserva esses dados e não depende de apagá-los.
4. **Given** a conclusão da implantação, **When** a validação pós-entrega é executada, **Then** saldo de estoque, custo médio, trânsito, caixa e contagens históricas conciliam com a posição esperada.

### Edge Cases

- Reembolso parcial ou total sem devolução física.
- Devolução sem reembolso confirmado e reembolso recebido dias ou meses depois.
- Reembolso ocorrido em período diferente da compra ou da devolução.
- Vários reembolsos parciais cuja soma alcança exatamente o total oficial.
- Tentativa de ultrapassar o total reembolsável por arredondamento, concorrência ou repetição da mesma confirmação.
- Referência externa repetida para a mesma compra e fornecedor.
- Compra com desconto e acréscimo nos itens e também ajustes gerais.
- Devolução anterior ao recebimento em item parcialmente recebido, parcialmente perdido e ainda pendente.
- Devolução posterior ao recebimento quando parte da quantidade já foi vendida, devolvida ou não está mais disponível.
- Produto com várias entradas de custos diferentes e devolução associada a um recebimento específico.
- Devolução parcial em duas ou mais datas para o mesmo item.
- Compra integralmente recebida e integralmente devolvida depois do recebimento, exigindo status logístico visível como devolvida sem apagar o recebimento histórico.
- Devolução posterior compensada, exigindo indicação visual de compensação sem remover o evento original.
- Tentativa de devolver quantidade maior que a recebida ou maior que o saldo disponível.
- Devolução com motivo `Outro` sem justificativa.
- Falha no meio do registro conjunto de devolução e efeito de estoque.
- Duplo clique, repetição da requisição ou duas operações concorrentes sobre o mesmo saldo.
- Cancelamento repetido ou tentativa de cancelar evento que já possui compensação posterior incompatível.
- Consulta histórica anterior à devolução ou ao reembolso.
- Compra cancelada, inexistente ou sem item elegível.
- Valor oficial da compra ou rateio indisponível por inconsistência histórica.
- Produto legado sem qualquer devolução ou reembolso.
- Evolução aplicada sobre dados produtivos sem alterar linhas históricas existentes.
- Compensação de devolução com reembolso já registrado: nesta entrega, logística e financeiro continuam comandos independentes; permanece como débito técnico oferecer no mesmo fluxo a decisão de cancelar/estornar o reembolso relacionado para evitar conciliação manual esquecida.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST tratar devolução logística e reembolso financeiro como eventos distintos, mesmo quando originados pela mesma ocorrência.
- **FR-002**: O sistema MUST permitir registrar múltiplos reembolsos para uma compra.
- **FR-003**: Cada reembolso MUST possuir compra de origem, valor positivo, data efetiva, referência externa opcional e observação opcional; após seu registro, a situação acumulada da compra MUST ser derivada como sem reembolso, parcial ou integral, sem persistir classificação editável no evento individual.
- **FR-004**: O sistema MUST permitir relacionar um reembolso a itens ou ocorrências da compra sem exigir devolução física para todo reembolso.
- **FR-005**: O sistema MUST preservar o total oficial original da compra e apresentar separadamente total reembolsado e custo financeiro líquido.
- **FR-006**: A soma dos reembolsos vigentes MUST NOT ultrapassar o total oficial da compra.
- **FR-007**: Reembolsos acima do total oficial, incluindo indenizações adicionais, MUST permanecer fora do escopo desta entrega.
- **FR-008**: O reembolso MUST afetar a posição financeira a partir de sua data efetiva e MUST compor o caixa inicial de períodos posteriores.
- **FR-009**: O sistema MUST manter pagamentos de clientes e reembolsos de compras identificados separadamente.
- **FR-010**: As saídas estimadas MUST preservar os valores brutos de compras e despesas; reembolsos MUST ser apresentados separadamente e adicionados à recomposição do caixa e do saldo operacional.
- **FR-011**: Registrar, cancelar ou compensar reembolso MUST NOT alterar estoque, recebimentos, perdas, devoluções físicas ou pendências por si só.
- **FR-012**: O sistema MUST rejeitar reembolso zero, negativo, duplicado ou acima do saldo reembolsável.
- **FR-013**: Uma referência externa repetida para a mesma compra MUST ser tratada como possível duplicidade e impedir nova confirmação até correção ou diferenciação explícita.
- **FR-014**: O sistema MUST permitir registrar devolução ou recusa de quantidade ainda pendente.
- **FR-015**: A devolução anterior ao recebimento MUST reduzir a pendência sem gerar entrada ou saída de estoque.
- **FR-016**: A quantidade devolvida antes do recebimento MUST ser positiva e MUST NOT exceder a pendência vigente do item.
- **FR-017**: O sistema MUST permitir registrar devolução de quantidade anteriormente recebida.
- **FR-018**: A devolução posterior ao recebimento MUST preservar o recebimento original e gerar uma saída física identificada como devolução de compra.
- **FR-019**: A saída por devolução de compra MUST permanecer distinguível de venda, perda, cancelamento de venda ou ajuste sem origem.
- **FR-020**: A devolução posterior ao recebimento MUST permanecer vinculada à compra e ao item e MUST identificar o recebimento de referência quando necessário para determinar elegibilidade e custo.
- **FR-021**: A quantidade acumulada devolvida depois do recebimento MUST NOT exceder a quantidade recebida ainda elegível do item.
- **FR-022**: Uma devolução posterior ao recebimento MUST NOT deixar o saldo físico do produto negativo.
- **FR-023**: O sistema MUST revalidar pendência, quantidade recebida elegível e saldo físico no momento da confirmação para proteger operações concorrentes.
- **FR-024**: Uma devolução com reembolso MUST encerrar a quantidade correspondente e MUST NOT reabrir mercadoria em trânsito automaticamente.
- **FR-025**: Reposição ou substituição de produto MUST exigir evento operacional explícito e MUST NOT ser inferida a partir da devolução ou do reembolso.
- **FR-026**: O detalhe da compra MUST distinguir quantidade comprada, recebida histórica, devolvida antes do recebimento vigente, devolvida depois do recebimento vigente, devolvida compensada, perdida e pendente, sem reduzir visualmente a quantidade recebida histórica por causa de uma devolução posterior.
- **FR-027**: O estado logístico da compra e sua situação de devolução/reembolso MUST ser apresentados separadamente, sem reescrever estados históricos de forma incompatível.
- **FR-027A**: A lista e o detalhe da compra MUST apresentar tag/status logístico derivado das devoluções vigentes e compensadas, incluindo ao menos: sem devolução, parcialmente devolvida, devolvida, parcialmente compensada e devolução compensada, mantendo a situação financeira de reembolso em tag separada.
- **FR-028**: O sistema MUST aceitar ao menos os motivos Produto falsificado, Avaria, Produto incorreto, Desistência ou recusa e Outro; o motivo Outro MUST exigir justificativa.
- **FR-029**: Devolução e reembolso MUST exigir revisão e confirmação explícita antes do registro.
- **FR-030**: A devolução posterior ao recebimento MUST retirar da base de custo vigente a quantidade e o valor correspondentes à entrada original, sem aceitar custo livre informado pela interface.
- **FR-031**: A devolução MUST NOT modificar retroativamente o custo atribuído a vendas históricas concluídas antes de sua data efetiva.
- **FR-032**: Posições de estoque e custo anteriores à data da devolução MUST permanecer inalteradas; posições posteriores MUST considerar a devolução.
- **FR-033**: O valor bruto de perdas e devoluções MUST respeitar o total e o rateio financeiro oficial da compra.
- **FR-034**: O sistema MUST apresentar separadamente valor bruto perdido ou devolvido, valor recuperado por reembolso e prejuízo líquido não recuperado.
- **FR-035**: O histórico da compra MUST reunir recebimentos, perdas, devoluções, reembolsos e compensações em ordem cronológica, preservando data efetiva e data de registro.
- **FR-036**: O sistema MUST permitir cancelar uma devolução ou reembolso incorreto somente por registro compensatório auditável, com motivo obrigatório.
- **FR-037**: Cancelar uma devolução posterior ao recebimento MUST restaurar estoque e base de custo somente quando a reposição física for confirmada.
- **FR-038**: Cancelar uma devolução anterior ao recebimento MUST restaurar a pendência correspondente sem criar estoque.
- **FR-039**: Eventos cancelados e suas compensações MUST permanecer visíveis e MUST NOT produzir efeito vigente duplicado.
- **FR-040**: Devolução, efeito de estoque e demais efeitos obrigatórios de uma mesma confirmação MUST ser concluídos integralmente ou não produzir qualquer alteração.
- **FR-041**: A repetição da mesma confirmação MUST NOT criar devolução, saída, reembolso ou compensação duplicada.
- **FR-042**: Após cada operação, compras, trânsito, pendências, estoque, custo, financeiro e indicadores afetados MUST apresentar uma posição consistente.
- **FR-043**: Cálculos e validações oficiais MUST vir da fonte oficial do sistema; a interface MUST NOT reconstruir estoque, custo, caixa, prejuízo líquido ou limite reembolsável.
- **FR-044**: Os fluxos MUST apresentar estados de carregamento, revisão, confirmação, sucesso e erro, preservando os dados preenchidos quando a operação for rejeitada.
- **FR-045**: A lista e o detalhe de compras MUST indicar reembolso parcial ou integral sem ocultar o estado logístico da compra.
- **FR-046**: Os fluxos e históricos MUST funcionar em smartphone, tablet e desktop e manter a identidade visual oficial.
- **FR-047**: Consultas gerenciais MUST continuar utilizáveis com o volume produtivo e MUST evitar dependência da leitura integral dos históricos.
- **FR-048**: Todos os registros existentes de compras, itens, recebimentos, perdas, vendas, movimentações, pagamentos e eventos financeiros MUST ser preservados sem alteração destrutiva de conteúdo ou significado.
- **FR-049**: Registros históricos sem devolução ou reembolso MUST continuar válidos e manter o comportamento anterior.
- **FR-050**: A evolução dos dados MUST ser aditiva e compatível com a versão existente; qualquer transformação de histórico MUST exigir justificativa, ensaio e aprovação explícita separados.
- **FR-051**: Antes da liberação em produção, a evolução MUST ser ensaiada com cópia representativa, proteção de recuperação validada e roteiro documentado de implantação, verificação e recuo seguro.
- **FR-052**: Depois que novos eventos forem registrados, o recuo operacional MUST preservar esses dados e MUST NOT depender de exclusão destrutiva.
- **FR-053**: A validação pós-liberação MUST conciliar saldo de estoque, custo, compras em trânsito, caixa e contagens históricas.
- **FR-054**: Especificação, esclarecimento, planejamento, geração de tarefas, análise e remediação documental MUST NOT autorizar implementação. A implementação e a geração da migration MUST depender de solicitação explícita posterior para executar a fase de implementação; aplicar a migration sobre dados produtivos, habilitar a feature ou liberar em produção MUST depender de uma segunda aprovação explícita, concedida somente após backup, ensaio em cópia representativa e conciliação documentada.
- **FR-055 (débito técnico pós-homologação)**: Ao compensar uma devolução que possua reembolso relacionado ou alocado, o sistema SHOULD oferecer uma decisão explícita para cancelar/estornar o reembolso correspondente ou manter o crédito financeiro justificado, garantindo que a compensação logística reflita corretamente no financeiro quando aplicável.

### Scope Boundaries

Ficam fora desta feature:

- Reembolsos ou indenizações acima do total oficial da compra.
- Reposição automática de produto ou criação automática de nova compra.
- Integração automática com Shopee, AliExpress ou outros fornecedores e marketplaces.
- Contas a pagar completas, conciliação bancária ou vínculo automático com extrato.
- Upload e armazenamento de comprovantes ou anexos.
- Exclusão física ou reescrita de compras, recebimentos, perdas, devoluções, reembolsos ou movimentações.
- Alteração retroativa do custo já atribuído a vendas concluídas antes da devolução.
- Nova infraestrutura de testes automatizados sem autorização explícita; builds e roteiro manual continuam obrigatórios.

### Key Entities *(include if feature involves data)*

- **Compra**: Operação comercial original cujo total oficial permanece imutável e que agrega as situações logísticas e financeiras derivadas.
- **Item de compra**: Produto e quantidade adquiridos, com quantidades recebidas, perdidas, devolvidas antes ou depois do recebimento e ainda pendentes.
- **Devolução de compra**: Evento logístico que representa quantidade recusada enquanto pendente ou quantidade devolvida depois do recebimento, com motivo, data, observação, estado vigente e vínculos de origem.
- **Reembolso de compra**: Crédito financeiro recebido do fornecedor ou marketplace, com valor, data efetiva, referência externa e eventual relação com itens ou ocorrências; parcial ou integral é a situação acumulada derivada da compra, não uma classificação persistida no evento individual.
- **Compensação**: Registro auditável que neutraliza uma devolução ou reembolso incorreto sem apagar o evento original.
- **Efeito de estoque da devolução**: Saída física associada exclusivamente à devolução posterior ao recebimento e distinguível das demais origens de saída.
- **Resumo financeiro da compra**: Composição derivada de total original, total reembolsado vigente e custo financeiro líquido.
- **Resumo de recuperação**: Composição derivada de valor bruto afetado, valor recuperado e prejuízo líquido não recuperado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos cenários de referência, o total original da compra permanece inalterado e total reembolsado mais custo financeiro líquido recompõem exatamente esse total.
- **SC-002**: Em 100% das devoluções anteriores ao recebimento, a pendência diminui pela quantidade confirmada e o saldo de estoque permanece inalterado.
- **SC-003**: Em 100% das devoluções posteriores ao recebimento aceitas, o recebimento original permanece auditável, o saldo físico diminui exatamente pela quantidade devolvida, a origem não é apresentada como venda e a lista/detalhe da compra indicam a devolução logística vigente.
- **SC-004**: Nenhuma devolução aceita deixa saldo físico negativo ou permite quantidade acumulada superior à recebida elegível.
- **SC-005**: Em 100% das consultas históricas de referência, eventos posteriores à data consultada não alteram estoque, custo, trânsito ou caixa do passado.
- **SC-006**: Em 100% dos cenários financeiros de referência, reembolsos afetam o caixa por sua data efetiva, permanecem separados de pagamentos de clientes e não alteram as saídas brutas.
- **SC-007**: Em 100% dos cenários com ajustes comerciais, valores brutos, recuperados e líquidos conciliam com a política oficial da compra sem diferença de centavos.
- **SC-008**: Repetir ou concorrer a mesma confirmação em pelo menos 10 tentativas controladas produz no máximo um efeito físico e um efeito financeiro válidos.
- **SC-009**: Um usuário consegue registrar uma devolução ou um reembolso válido em até 2 minutos após abrir o detalhe da compra, incluindo revisão e confirmação.
- **SC-010**: Em validação orientada, usuários identificam em até 30 segundos total original, total reembolsado, custo líquido, situação logística e histórico da compra.
- **SC-011**: Os fluxos completos são concluídos em smartphone, tablet e desktop sem rolagem horizontal da página, sobreposição ou perda de ações principais.
- **SC-012**: A evolução ensaiada sobre cópia representativa preserva 100% das linhas e valores históricos existentes e conclui a conciliação de estoque, custo, trânsito e caixa sem divergência não explicada.
- **SC-013**: Ao menos 9 de 10 carregamentos repetidos de detalhe, histórico e indicadores afetados concluem em até 2 segundos com massa representativa do volume produtivo.
- **SC-014**: Zero operação com falha controlada deixa devolução sem seu efeito obrigatório, efeito de estoque sem devolução ou crédito financeiro duplicado.

## Assumptions

- Os usuários-alvo são os responsáveis autenticados que já operam compras, recebimentos, estoque e financeiro.
- O total máximo reembolsável nesta entrega é o total oficial da compra; indenizações adicionais exigirão feature futura.
- Um reembolso pode existir sem devolução física e uma devolução pode permanecer sem reembolso.
- Reembolso integral significa que a soma dos reembolsos vigentes alcançou o total oficial da compra; qualquer valor inferior é parcial.
- Referência externa é opcional, mas, quando informada, deve auxiliar a prevenção de duplicidade dentro da mesma compra.
- Uma devolução com reembolso encerra a quantidade e não cria automaticamente expectativa de reposição.
- Devolução posterior ao recebimento pressupõe retorno físico ao fornecedor; cancelá-la somente restaura estoque quando o produto retorna fisicamente à posse da Amani.
- O valor e o custo associados à devolução são derivados dos dados oficiais da compra e do recebimento, nunca de entrada monetária livre na interface.
- A F026 implementada na linha principal é a base oficial de total e rateio, embora sua documentação de roadmap ainda precise ser conciliada com o estado real.
- O sistema permanece em produção durante a evolução. A implementação somente começa após pedido explícito posterior à análise; backup, ensaio da migration já gerada em cópia representativa, recuperação validada, conciliação e recuo lógico são gates obrigatórios separados antes de aplicar schema, habilitar a feature ou liberar em produção.
- A feature preserva estoque por movimentações, backend como fonte oficial, consultas gerenciais escaláveis, Mobile First, Dark Theme, Design System e histórico compensatório definidos pela Constituição do projeto.
- A validação obrigatória usará os comandos de qualidade existentes e um roteiro manual completo; infraestrutura automatizada nova depende de autorização específica.
