# Feature Specification: Apresentações Comerciais e Conversão Fracionada de Estoque

**Feature Branch**: `024-apresentacoes-fracionadas`

**Created**: 2026-06-30

**Status**: Draft — planejada/em análise, sem autorização para implementação

**Input**: User description: "Permitir vender produtos em apresentações comerciais menores que sua unidade principal de estoque, representando a conversão por fração exata, sem migrar ou alterar o histórico existente em produção."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Vender por apresentação comercial (Priority: P1)

Como operador de vendas, quero escolher uma apresentação ativa do produto e informar quantas unidades dessa apresentação estou vendendo, para comercializar caixa, ampola ou dose sem criar produtos separados.

**Why this priority**: Este é o valor principal da feature e resolve diretamente a venda fracionada mantendo um único cadastro de produto.

**Independent Test**: Configurar um produto cuja unidade principal seja caixa, com apresentações Caixa (1/1), Ampola (1/4) e Dose (1/24), e concluir vendas independentes em cada apresentação.

**Acceptance Scenarios**:

1. **Given** um produto com saldo de 2 caixas e apresentação Ampola ativa para venda com fração 1/4, **When** o operador vende 2 ampolas, **Then** a venda registra 2 ampolas e o estoque registra uma saída final de 0,50 caixa, derivada exatamente de 2 × 1/4.
2. **Given** um produto com apresentação Dose ativa para venda com fração 1/24, **When** o operador vende 1 dose, **Then** a venda registra 1 dose, preserva a relação exata 1/24 e fornece à movimentação a quantidade convertida final correspondente.
3. **Given** um produto com apresentação Caixa ativa para venda com fração 1/1, **When** o operador vende 1 caixa, **Then** a saída de estoque é de exatamente 1 unidade principal.
4. **Given** um produto que possui apresentações configuradas, **When** o operador monta uma venda, **Then** ele visualiza apenas apresentações ativas e permitidas para venda e deve escolher uma delas.

---

### User Story 2 - Preservar produtos e históricos legados (Priority: P1)

Como responsável pela operação, quero que produtos, vendas e movimentações anteriores continuem válidos e inalterados, para implantar a feature sem comprometer saldo, custo médio, lucro, auditoria ou relatórios de produção.

**Why this priority**: A proteção dos dados produtivos é uma condição de adoção, com o mesmo nível de prioridade da venda fracionada.

**Independent Test**: Aplicar a atualização sobre uma cópia representativa do banco de produção e comparar, antes e depois, produtos, movimentações, saldos, custos médios, vendas e indicadores históricos.

**Acceptance Scenarios**:

1. **Given** um produto existente sem apresentações configuradas, **When** a atualização é aplicada e o produto é comprado ou vendido, **Then** o fluxo e a quantidade movimentada permanecem equivalentes ao comportamento anterior.
2. **Given** movimentações e vendas criadas antes da atualização, **When** a atualização é aplicada, **Then** nenhum registro histórico é reescrito, convertido, excluído ou recalculado.
3. **Given** um produto legado com estoque lançado em caixas, **When** são adicionadas apresentações comerciais, **Then** o saldo anterior continua expresso na unidade principal e somente novas vendas que usem apresentação geram saídas convertidas.
4. **Given** uma implantação sem apresentações cadastradas, **When** os fluxos existentes são executados, **Then** não há mudança automática de comportamento em nenhum produto.

---

### User Story 3 - Validar saldo, custo e lucro pela quantidade convertida (Priority: P1)

Como gestor, quero que a disponibilidade, o custo e o lucro usem a quantidade efetivamente consumida da unidade principal, para que uma venda fracionada não distorça o estoque nem o resultado financeiro.

**Why this priority**: Uma venda concluída com saldo, custo ou lucro incorreto compromete a confiabilidade operacional e financeira do ERP.

**Independent Test**: Preparar estoque e custo médio conhecidos, vender apresentações com fatores diferentes e conferir saldo, custo proporcional e lucro de cada venda.

**Acceptance Scenarios**:

1. **Given** saldo de 0,20 caixa, **When** o operador tenta vender 1 ampola com fator 0,25, **Then** a venda é bloqueada por saldo insuficiente antes da confirmação.
2. **Given** custo médio de R$ 120,00 por caixa, **When** é vendida 1 ampola com fator 0,25, **Then** o custo atribuído à venda é R$ 30,00 antes dos ajustes monetários aplicáveis ao item.
3. **Given** uma venda de 2 ampolas com fator 0,25, **When** o lucro é calculado, **Then** o custo considerado é o custo médio de 0,50 unidade principal.
4. **Given** mais de um item do mesmo produto na mesma operação, **When** a venda é validada, **Then** a disponibilidade é verificada pela soma das quantidades convertidas desse produto.

---

### User Story 4 - Manter a apresentação histórica da venda (Priority: P2)

Como usuário que consulta vendas, quero ver a apresentação, a quantidade informada e o fator efetivamente usados na data da operação, para compreender e auditar a venda mesmo que a configuração do produto mude depois.

**Why this priority**: A rastreabilidade protege relatórios, atendimento e auditoria contra alterações futuras do cadastro.

**Independent Test**: Realizar uma venda por ampola, depois renomear, alterar ou desativar a apresentação, e conferir que a venda continua exibindo os dados originais e usando o fator original em cálculos ou reversões.

**Acceptance Scenarios**:

1. **Given** uma venda confirmada com 2 ampolas e fração 1/4, **When** a conversão da apresentação é alterada para novas vendas, **Then** a venda antiga continua registrando numerador 1, denominador 4, fator calculado 0,25 e quantidade convertida 0,50.
2. **Given** uma apresentação usada em venda anterior, **When** ela é desativada ou renomeada, **Then** o histórico preserva a identificação e o nome apresentados no momento da venda.
3. **Given** uma venda fracionada cancelada pelo fluxo já existente, **When** o estoque é revertido, **Then** a compensação usa exatamente a quantidade convertida registrada na venda original.

---

### User Story 5 - Administrar apresentações do produto (Priority: P2)

Como administrador de cadastros, quero criar, editar, ativar e desativar apresentações comerciais abaixo de um produto, para controlar as formas em que ele pode ser vendido sem alterar sua unidade principal de estoque.

**Why this priority**: A operação depende de uma configuração segura e compreensível antes de liberar a venda fracionada.

**Independent Test**: Cadastrar apresentações válidas e inválidas, alterar uma apresentação já utilizada e confirmar as regras de disponibilidade e preservação histórica.

**Acceptance Scenarios**:

1. **Given** um produto existente, **When** o administrador cadastra uma apresentação com nome, numerador e denominador positivos, fator resultante menor ou igual a 1, permissão de venda e estado ativo, **Then** ela fica disponível para novas vendas desse produto.
2. **Given** uma apresentação com numerador ou denominador zero/negativo, ou com numerador maior que o denominador nesta versão, **When** o administrador tenta salvá-la, **Then** a configuração é rejeitada com orientação clara.
3. **Given** uma apresentação já usada em vendas, **When** o administrador a desativa, **Then** ela deixa de aparecer em novas vendas sem afetar os registros anteriores.
4. **Given** uma apresentação com preço próprio, **When** ela é escolhida, **Then** esse preço é sugerido para a venda e permanece sujeito às regras comerciais já existentes.

---

### User Story 6 - Preservar compras, recebimentos, perdas e visão gerencial (Priority: P3)

Como gestor, quero que compras continuem entrando na unidade principal e que consultas operacionais e gerenciais entendam saldos fracionados, para evitar regressões em mercadorias em trânsito, recebimentos parciais, perdas, vendas, estoque e dashboard.

**Why this priority**: Estes fluxos não são o foco de venda, mas precisam permanecer coerentes após a mudança da granularidade do estoque.

**Independent Test**: Executar uma compra com recebimentos parciais e perda na unidade principal, realizar vendas fracionadas e conferir estoque, listagem de vendas, relatórios e dashboard.

**Acceptance Scenarios**:

1. **Given** uma compra de 3 caixas, **When** 2 caixas são recebidas e 1 é registrada como perda, **Then** compra, trânsito, recebimento e perda mantêm suas quantidades na unidade principal e somente o recebimento gera entrada de estoque.
2. **Given** entradas inteiras e saídas fracionadas do mesmo produto, **When** o saldo é consultado, **Then** ele é exibido corretamente na unidade principal, inclusive com parte decimal.
3. **Given** vendas legadas e vendas com apresentação, **When** listagens, relatórios e dashboard são consultados, **Then** totais monetários, custo, lucro e quantidades permanecem coerentes e os dados históricos não sofrem regressão.
4. **Given** uma tela de venda em smartphone, tablet ou desktop, **When** o operador escolhe a apresentação e revisa o item, **Then** nome, quantidade informada e efeito estimado no estoque permanecem legíveis e operáveis sem perda de funcionalidade.

### Edge Cases

- Um fator periódico, como 1/24, não pode depender de uma aproximação decimal como fonte de verdade; 24 vendas separadas de uma dose também devem corresponder operacionalmente a exatamente 1 caixa.
- Frações equivalentes, como 2/8 e 1/4, devem produzir o mesmo consumo e podem ser normalizadas para uma forma canônica sem alterar seu valor.
- A soma de várias linhas ou vendas concorrentes deve ser validada sobre o saldo convertido mais recente, sem permitir saldo negativo por concorrência.
- Uma quantidade convertida muito pequena, mas positiva, não pode ser tratada como zero.
- Apresentação inativa, excluída logicamente, pertencente a outro produto ou não permitida para venda deve ser rejeitada na confirmação.
- Alteração do fator ou preço durante a montagem da venda deve exigir que a confirmação use uma configuração válida e apresentada ao usuário, sem troca silenciosa.
- Desconto e acréscimo alteram o valor comercial, mas não alteram a quantidade convertida nem o custo médio unitário da unidade principal.
- Produtos sem custo médio calculável devem manter o tratamento conservador já definido pelo projeto, sem inventar custo a partir da apresentação.
- Cancelamento de venda legada continua usando sua quantidade histórica; cancelamento de venda fracionada usa a fração e a conversão preservadas no snapshot, anulando exatamente a saída original.
- Saldos decimais devem ser formatados sem esconder quantidade relevante nem exibir ruído decimal desnecessário.
- Falha durante a gravação não pode persistir venda, snapshot ou movimentação de estoque de forma parcial.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir associar zero ou mais apresentações comerciais a um produto sem mudar sua unidade principal de estoque.
- **FR-002**: Cada apresentação MUST possuir identidade própria, produto associado, nome, fator de estoque representado por numerador e denominador, permissões de compra e venda, estado ativo e datas de criação e atualização compatíveis com a auditoria cadastral; a permissão de compra MUST permanecer desabilitada nesta versão.
- **FR-003**: Uma apresentação MAY possuir preço de venda próprio; na ausência dele, o sistema MUST aplicar a regra de preço padrão vigente do produto.
- **FR-004**: O numerador e o denominador da apresentação MUST ser inteiros maiores que zero; nesta versão, o numerador MUST ser menor ou igual ao denominador, de modo que o fator resultante seja maior que zero e menor ou igual a 1.
- **FR-005**: O sistema MUST rejeitar apresentações de venda inválidas, inativas, pertencentes a outro produto ou sem permissão de venda.
- **FR-006**: Nenhum produto existente MUST receber, ativar ou selecionar automaticamente uma apresentação após a atualização.
- **FR-007**: Produtos sem apresentações configuradas MUST continuar comprando, vendendo e movimentando estoque com comportamento equivalente ao anterior.
- **FR-008**: Para produto com apresentações configuradas, a venda MUST permitir e exigir a escolha de uma apresentação ativa e permitida para venda.
- **FR-009**: A quantidade comercial informada MUST representar unidades inteiras positivas da apresentação escolhida nesta versão.
- **FR-010**: A conversão MUST ser calculada deterministicamente pela fórmula `QuantidadeInformada × FatorNumerador ÷ FatorDenominador`.
- **FR-011**: A fração exata MUST ser a fonte autoritativa para validação, agregação, cancelamento e conciliação; valores decimais calculados MUST ser tratados como projeções da fração, não como substitutos da relação exata.
- **FR-012**: Relações periódicas MUST manter equivalência operacional inclusive entre operações separadas; no exemplo aprovado, 4 ampolas de 1/4 e 24 doses de 1/24 MUST corresponder cada qual a exatamente 1 caixa para validação, saldo e conciliação.
- **FR-013**: A validação de estoque MUST usar a soma convertida de todos os itens do mesmo produto e MUST impedir confirmação quando o saldo for insuficiente.
- **FR-014**: A validação definitiva MUST ocorrer no momento da confirmação e considerar concorrência, impedindo saldo negativo.
- **FR-015**: Cada item de venda com apresentação MUST preservar a apresentação utilizada, seu nome histórico, a quantidade informada, o numerador aplicado, o denominador aplicado, o fator decimal calculado, a quantidade convertida final e o valor unitário comercial informado.
- **FR-016**: Alterações futuras de nome, fator, preço, permissão ou estado da apresentação MUST NOT alterar vendas, custos, lucros, relatórios ou reversões já registrados.
- **FR-017**: A movimentação de saída de uma venda com apresentação MUST receber e registrar a quantidade convertida final na unidade principal de estoque e manter rastreabilidade suficiente para recompor exatamente sua razão de origem.
- **FR-018**: O estoque MUST continuar sendo calculado exclusivamente por movimentações, sem criação de saldo fixo em produto, apresentação ou item operacional.
- **FR-019**: O custo atribuído ao item vendido MUST ser o custo médio da unidade principal multiplicado pela quantidade exata derivada do snapshot, com arredondamento apenas no resultado monetário segundo as regras vigentes.
- **FR-020**: O lucro da venda MUST usar o valor comercial líquido do item menos seu custo médio proporcional, preservando descontos, acréscimos e demais regras vigentes.
- **FR-021**: Cancelamentos ou reversões de vendas fracionadas MUST compensar exatamente a razão e a quantidade convertida originalmente registradas, sem consultar o fator atual da apresentação e sem deixar resíduo no saldo.
- **FR-022**: Compras, mercadorias em trânsito, recebimentos parciais e perdas MUST continuar usando a unidade principal do produto nesta versão.
- **FR-023**: Somente recebimentos físicos confirmados MUST gerar entrada de estoque; perdas, extravios e avarias MUST continuar sem gerar entrada.
- **FR-024**: A atualização de produção MUST preserve exatamente os valores dos registros históricos e MUST NOT converter, recalcular, sobrescrever ou excluir movimentações, vendas, compras, recebimentos ou perdas anteriores.
- **FR-025**: A evolução dos dados MUST aceitar registros legados sem apresentação ou snapshot e tratá-los segundo o comportamento histórico.
- **FR-026**: Consultas de saldo e movimentações MUST calcular o saldo a partir das relações exatas disponíveis e exibir sua projeção decimal na unidade principal com formatação compreensível, sem esconder resíduo operacional real nem criar resíduo artificial.
- **FR-027**: Detalhes e listagens de vendas MUST distinguir a quantidade comercial informada da quantidade convertida quando a venda usar apresentação, mantendo vendas legadas legíveis.
- **FR-028**: Dashboard e relatórios MUST calcular custo, lucro, faturamento, rankings e valorização sem regressão diante de saídas fracionadas e dados legados misturados; métricas de quantidade de produto MUST usar equivalente na unidade principal, enquanto valores comerciais permanecem baseados na venda informada.
- **FR-029**: A experiência de cadastro e venda MUST funcionar em smartphone, tablet e desktop e seguir os padrões visuais e operacionais oficiais do ERP.
- **FR-030**: A confirmação da venda, o snapshot do item e a movimentação de estoque MUST ser atômica: ou todos são registrados, ou nenhum é persistido.
- **FR-031**: Antes de qualquer implementação, MUST ser produzido um relatório técnico baseado no código e no esquema atuais, cobrindo impactos no domínio, dados, atualização de produção, compras, vendas, estoque, custo médio, lucro, dashboard, riscos e estratégia de rollback ou mitigação.
- **FR-032**: O relatório técnico MUST identificar explicitamente os arquivos e contratos afetados e analisar mercadorias em trânsito, recebimentos parciais e perdas antes de autorizar mudanças nesses fluxos.
- **FR-033**: Antes da implementação, o roadmap oficial, o documento oficial de progresso existente e a documentação desta feature MUST registrar o problema, a decisão, escopo incluído, exclusões, riscos, critérios de aceite e status planejada/em análise.
- **FR-034**: A feature MUST permanecer sem autorização de implementação até aprovação explícita posterior ao relatório técnico e ao plano do Spec Kit.
- **FR-035**: A soma, comparação e compensação de quantidades com denominadores distintos MUST usar operações exatas e determinísticas, reduzindo frações equivalentes quando necessário e arredondando apenas para apresentação ou resultado monetário.
- **FR-036**: Registros legados sem numerador e denominador MUST ser interpretados exatamente como quantidades inteiras sobre denominador 1, sem atualização retroativa de suas linhas.
- **FR-037**: A entrada compensatória de cancelamento MUST restaurar estoque sem usar o preço de venda como custo e MUST NOT ser tratada como novo recebimento físico na formação do custo médio.

### Key Entities *(include if feature involves data)*

- **Produto**: Cadastro cuja unidade atual permanece como unidade principal de estoque; pode ter zero ou mais apresentações comerciais.
- **Apresentação Comercial do Produto**: Forma vendável de um produto, identificada por nome, numerador, denominador, permissões, preço opcional e estado ativo; sua configuração vale para novas operações.
- **Item de Venda**: Linha comercial que preserva a quantidade e o valor informados, além do snapshot do nome, numerador, denominador, fator decimal calculado e quantidade convertida final usados no estoque e no custo.
- **Movimentação de Estoque**: Registro histórico de entrada, saída ou inventário na unidade principal; recebe a quantidade convertida final e conserva informação exata suficiente para agregação e reversão sem resíduos, permanecendo a fonte exclusiva do saldo.
- **Item de Compra**: Linha adquirida na unidade principal, mantendo quantidades comprada, recebida, perdida e pendente conforme o fluxo atual.
- **Recebimento de Compra**: Confirmação física, inclusive parcial, na unidade principal que gera entrada de estoque com custo rastreável.
- **Perda de Compra**: Quantidade perdida, extraviada ou avariada na unidade principal, sem entrada de estoque.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em validação, 100% dos produtos legados sem apresentações repetem os resultados anteriores de compra, venda, saldo, custo médio e lucro.
- **SC-002**: Para o exemplo aprovado, vendas de 1 caixa, 1 ampola e 1 dose usam respectivamente 1/1, 1/4 e 1/24; 4 vendas separadas de uma ampola ou 24 vendas separadas de uma dose totalizam operacionalmente exatamente 1 caixa, sem resíduo que altere disponibilidade ou conciliação.
- **SC-003**: 100% das tentativas de venda cuja quantidade convertida exceda o saldo disponível são bloqueadas antes da confirmação, inclusive quando o produto aparece em mais de uma linha.
- **SC-004**: Em todos os cenários de teste, o custo do item fracionado corresponde ao custo médio proporcional à quantidade convertida, e o lucro recompõe exatamente valor líquido menos custo proporcional dentro das regras monetárias vigentes.
- **SC-005**: Comparações antes/depois em uma cópia representativa de produção mostram zero registros históricos alterados e nenhuma diferença de saldo, custo médio ou indicadores causada apenas pela atualização.
- **SC-006**: 100% das vendas com apresentação continuam exibindo a apresentação, quantidade, fator e conversão originais após edição ou desativação da configuração.
- **SC-007**: Compra, recebimento parcial e perda na unidade principal concluem seus roteiros existentes sem mudança de resultado em 100% dos cenários de regressão definidos.
- **SC-008**: Dashboard, listagem de vendas, estoque e relatórios conciliam dados legados e fracionados sem divergência nos cenários de aceitação e sem falha de carregamento.
- **SC-009**: Um operador consegue incluir um item escolhendo produto, apresentação e quantidade sem adicionar mais de uma interação obrigatória além da seleção da apresentação.
- **SC-010**: O fluxo de venda e as consultas afetadas são concluídos sem rolagem horizontal da página e sem perda de ação essencial nas larguras de smartphone, tablet e desktop adotadas pelo projeto.
- **SC-011**: A atualização é aplicada em ensaio sobre cópia de produção e revertida ou mitigada pelo procedimento documentado, sem perda de dados e antes de autorização do rollout real.
- **SC-012**: Relatório técnico, roadmap, progresso e artefatos do Spec Kit estão revisados e aprovados antes de qualquer alteração de código da feature.
- **SC-013**: Para cada cenário fracionado validado, vender e cancelar a mesma quantidade restaura exatamente o saldo anterior, inclusive após 24 operações unitárias de dose.

## Assumptions

- A unidade atual de cada produto é a unidade principal e imutável para fins desta feature; não será criado um cadastro separado de unidade de estoque.
- Apresentações são opt-in por produto. A ausência de configuração é o mecanismo de retrocompatibilidade para produtos legados.
- Nesta versão, a quantidade informada pelo usuário é inteira na apresentação escolhida; somente a quantidade convertida de estoque é fracionada.
- A primeira versão permite apresentações iguais ou menores que a unidade principal. Pacotes com fator maior que 1 ficam fora do escopo.
- Compras e seus eventos de recebimento e perda não permitem seleção de apresentação nesta versão; permanecem na unidade principal.
- O preço próprio da apresentação é opcional e funciona como sugestão comercial, preservando a capacidade atual de informar o preço permitido na venda.
- Numerador e denominador, reduzidos quando conveniente, são a fonte de verdade da conversão. O fator decimal e a quantidade decimal convertida são projeções persistidas para contrato, auditoria e compatibilidade, nunca a base exclusiva da aritmética de estoque.
- Valores monetários seguem as regras de arredondamento já vigentes; arredondamento de custo ou lucro ocorre somente após aplicar a quantidade exata ao custo médio.
- Configurações já utilizadas não são removidas fisicamente; podem ser desativadas, e o histórico mantém seu próprio snapshot.
- O fluxo de cancelamento existente permanece e deve ser adaptado apenas para compensar a quantidade histórica correta.
- A implementação futura seguirá a constituição vigente do projeto, os contratos explícitos e a separação de responsabilidades já adotada, sem antecipar funcionalidades fora do escopo.

## Dependencies

- Conclusão e aprovação do relatório técnico de impacto exigido nesta especificação.
- Validação, no planejamento, da representação dual entre razão exata e projeção decimal, incluindo limites numéricos, redução por máximo divisor comum e estratégia de atualização segura baseada no esquema real de produção.
- Inventário dos consumidores de quantidade, custo e lucro em vendas, estoque, compras, dashboard e relatórios.
- Cópia representativa e anonimizada do banco de produção para ensaio de atualização, conciliação e rollback/mitigação.
- Aprovação explícita do responsável após as fases `specify → clarify (se necessário) → plan → tasks`.

## Out of Scope

- Controle de caixa lacrada versus caixa aberta.
- Rastreio físico de embalagem aberta ou de doses remanescentes dentro de uma embalagem específica.
- Conversão automática do estoque antigo de caixa para dose ou qualquer outra apresentação.
- Criação de produtos separados para caixa, ampola e dose.
- Alteração, reconstrução ou recálculo de movimentações antigas.
- Compra, recebimento ou perda por apresentação comercial nesta versão.
- Apresentações maiores que a unidade principal de estoque.
- Quantidade fracionada informada dentro de uma apresentação comercial.
- Devolução de venda, novos tipos de movimentação ou redesenho geral de relatórios fora das adequações necessárias para não regredir.

## Governance and Production Safety

- A feature preserva estoque exclusivamente por movimentações e mantém compras em trânsito fora do saldo disponível até o recebimento físico.
- A atualização de dados deve ser compatível com registros legados e não pode exigir preenchimento retroativo de apresentação.
- A razão exata é a fonte autoritativa das novas operações fracionadas; a projeção decimal existe para compatibilidade, exibição e auditoria e não pode introduzir divergência operacional.
- O rollout deve possuir verificação prévia, conciliação pós-atualização e procedimento documentado de rollback ou mitigação que não apague operações realizadas.
- Qualquer constatação no planejamento de que a mudança exige reescrita histórica, conversão destrutiva ou interrupção incompatível com produção bloqueia a implementação até nova decisão explícita.
