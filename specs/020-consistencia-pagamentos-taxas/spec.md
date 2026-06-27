# Feature Specification: Consistência de Pagamentos e Taxas de Operadora

**Feature Branch**: `020-consistencia-pagamentos-taxas`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "Iniciar a Feature 020 seguindo as decisões aprovadas em docs/roadmap/RoadMap_AmaniERP.md: unificar o pagamento de contas a receber, permitir somente liquidação integral de cartão de crédito e manter taxa configurável apenas para cartão de débito."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Receber cartão de crédito com regra única (Priority: P1)

Como responsável financeiro, quero registrar o recebimento integral de uma venda no cartão de crédito usando o mesmo fluxo em qualquer ponto do sistema, para que o saldo da conta e a despesa da operadora sejam sempre consistentes.

**Why this priority**: O comportamento divergente já está disponível aos usuários e pode deixar saldo residual ou registrar dados financeiros incorretos. Corrigi-lo é o objetivo principal da feature.

**Independent Test**: Pode ser validado usando uma única conta pendente de venda no cartão de crédito, acessando-a primeiro pela lista geral e depois pelo detalhe do cliente. Os dois acessos devem apresentar as mesmas informações, exigir o mesmo dado e produzir o mesmo resultado financeiro.

**Acceptance Scenarios**:

1. **Given** uma conta pendente originada de venda no cartão de crédito, **When** o usuário inicia o pagamento pela lista geral de Contas a Receber, **Then** o sistema mostra o valor bruto integral, solicita somente o valor líquido recebido e apresenta a diferença como despesa de operadora antes da confirmação.
2. **Given** a mesma situação financeira, **When** o usuário inicia o pagamento por `Clientes → Ver contas → Pagamento`, **Then** encontra exatamente os mesmos campos, orientações e regras do acesso pela lista geral.
3. **Given** uma conta de crédito com saldo bruto de R$ 100,00, **When** o usuário confirma valor líquido de R$ 96,50, **Then** a conta é integralmente liquidada e uma despesa de operadora de R$ 3,50 é registrada.
4. **Given** uma conta de crédito pendente, **When** o usuário informa valor líquido vazio, igual a zero, negativo ou superior ao valor bruto, **Then** o pagamento é recusado e nenhuma alteração financeira é registrada.
5. **Given** uma conta de crédito pendente, **When** uma tentativa representa liquidação de apenas parte do saldo bruto, **Then** o sistema recusa a operação e informa que cartão de crédito exige liquidação integral.
6. **Given** um pagamento de crédito confirmado com sucesso, **When** o usuário retorna à lista, ao detalhe do cliente ou às despesas de operadora, **Then** os dados atualizados ficam disponíveis sem exigir recarregamento manual da página.

---

### User Story 2 - Configurar somente a taxa aplicável (Priority: P2)

Como administrador do ERP, quero editar somente a taxa padrão do cartão de débito, para não cadastrar percentuais que o sistema não utiliza e evitar interpretação incorreta da regra financeira.

**Why this priority**: A configuração atual sugere que taxas de todas as formas são aplicadas automaticamente, embora isso não aconteça. A correção elimina uma inconsistência de negócio e reduz risco operacional futuro.

**Independent Test**: Pode ser validado acessando a configuração de taxas e verificando que somente Débito aceita alteração, enquanto Dinheiro, PIX, Crédito e Fiado permanecem com taxa zero ou com explicação não editável.

**Acceptance Scenarios**:

1. **Given** a tela de taxas de operadora, **When** o usuário consulta as formas de pagamento, **Then** somente Cartão de Débito permite editar uma taxa padrão.
2. **Given** Cartão de Crédito na tela de configuração, **When** o usuário consulta sua regra, **Then** o sistema informa que a despesa é apurada no recebimento pelo bruto e pelo líquido, sem oferecer taxa configurável.
3. **Given** Dinheiro, PIX ou Fiado, **When** o usuário consulta a configuração, **Then** cada forma é tratada como taxa zero e não permite edição.
4. **Given** a edição da taxa de Débito, **When** o usuário informa percentual maior ou igual a zero e menor que 100, **Then** a configuração é aceita e passa a ser a referência para novas vendas no Débito.
5. **Given** a edição da taxa de Débito, **When** o usuário informa percentual negativo, igual ou superior a 100 ou valor inválido, **Then** a configuração é recusada e o valor anterior é preservado.
6. **Given** uma tentativa de cadastrar taxa diferente de zero para forma que não seja Débito, **When** a operação é enviada por qualquer canal do sistema, **Then** ela é recusada pela regra central do ERP.

---

### User Story 3 - Preservar pagamentos sem operadora e Débito (Priority: P3)

Como operador financeiro, quero que os fluxos já corretos de pagamento simples e de cartão de débito continuem funcionando, para que a correção de Crédito não gere regressões nas demais formas.

**Why this priority**: A feature altera regras compartilhadas de pagamento e configuração; os comportamentos existentes precisam permanecer confiáveis.

**Independent Test**: Pode ser validado com uma venda para cada forma de pagamento e uma conta manual, conferindo status, saldo e presença ou ausência de despesa de operadora.

**Acceptance Scenarios**:

1. **Given** uma venda em Dinheiro ou PIX, **When** a venda é confirmada, **Then** ela permanece recebida integralmente sem despesa de operadora.
2. **Given** uma venda no Cartão de Débito com taxa válida, **When** a venda é confirmada, **Then** o pagamento líquido e a despesa de operadora continuam sendo registrados automaticamente e a conta fica liquidada.
3. **Given** uma venda Fiado, **When** um pagamento posterior é registrado, **Then** o usuário informa valor e, quando aplicável, desconto, sem campos de taxa de operadora.
4. **Given** uma conta criada manualmente sem venda vinculada, **When** o pagamento é registrado, **Then** o fluxo permanece simples e não permite gerar despesa de operadora.

---

### User Story 4 - Consolidar total de taxas filtradas (Priority: P3)

Como responsável financeiro, quero visualizar na consulta de despesas de operadora o total de taxas correspondente exatamente ao filtro aplicado, para fechar conferências sem somas manuais.

**Why this priority**: A tela já lista as despesas, mas a conferência ainda depende de cálculo manual. Expor o consolidado reduz erro operacional e acelera a análise diária.

**Independent Test**: Pode ser validado aplicando filtros de período e forma (Débito, Crédito e ambos), comparando o total exibido com a soma das linhas retornadas para o mesmo filtro.

**Acceptance Scenarios**:

1. **Given** a tela de despesas de operadora com qualquer filtro ativo, **When** os resultados são carregados, **Then** o sistema exibe o total de taxas correspondente ao mesmo conjunto de despesas mostrado na listagem.
2. **Given** o filtro de forma definido como ambas as formas, **When** existem despesas de Débito e Crédito no período, **Then** o total exibido contempla a soma das duas formas sem divergência com as linhas apresentadas.
3. **Given** o filtro de forma definido como apenas Débito ou apenas Crédito, **When** os resultados são carregados, **Then** o total exibido considera somente a forma selecionada.
4. **Given** mudança de período ou forma, **When** a consulta é atualizada, **Then** o total é recalculado e apresentado com o mesmo recorte aplicado à lista.
5. **Given** que não há despesas para o filtro atual, **When** a tela apresenta estado vazio, **Then** o total de taxas exibido é zero.

### Edge Cases

- Valor líquido de Crédito exatamente igual ao bruto resulta em despesa de operadora zero e liquidação integral.
- Valor líquido com diferença de centavos em relação ao bruto deve gerar despesa com precisão monetária, sem saldo residual por arredondamento.
- Uma conta de venda sem forma de pagamento identificável não pode ser presumida como Crédito; deve seguir o pagamento simples sem taxa de operadora.
- Configurações antigas de Dinheiro, PIX, Crédito ou Fiado com percentual diferente de zero devem ser normalizadas para zero e não podem voltar a ser editáveis.
- Falha durante o registro conjunto do pagamento e da despesa não pode deixar apenas um dos dois registros concluído.
- Duplo acionamento da confirmação enquanto a primeira operação está em processamento não deve gerar dois pagamentos.
- Uma conta de Crédito já liquidada não pode aceitar novo pagamento.
- O cálculo da despesa não pode resultar em valor negativo.
- O total consolidado de taxas não pode divergir da soma das linhas exibidas para o mesmo filtro.
- A alteração de filtro durante carregamento não pode manter total de um recorte anterior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST identificar e disponibilizar a forma de pagamento da venda em todos os pontos que permitem registrar pagamento de uma conta a receber vinculada a venda.
- **FR-002**: O sistema MUST aplicar a mesma experiência e a mesma regra de pagamento para uma conta, independentemente de ela ser acessada pela lista geral ou pelo detalhe do cliente.
- **FR-003**: Para Cartão de Crédito, o sistema MUST exibir o saldo bruto integral e solicitar somente o valor líquido efetivamente recebido.
- **FR-004**: Para Cartão de Crédito, o sistema MUST apresentar antes da confirmação a despesa de operadora correspondente à diferença entre saldo bruto integral e valor líquido informado.
- **FR-005**: O sistema MUST aceitar pagamento de Cartão de Crédito somente quando a operação liquidar integralmente o saldo bruto pendente.
- **FR-006**: O sistema MUST rejeitar pagamento parcial de Cartão de Crédito sem alterar pagamento, saldo ou despesa.
- **FR-007**: O sistema MUST rejeitar valor líquido de Crédito vazio, não numérico, igual a zero, negativo ou superior ao saldo bruto.
- **FR-008**: O sistema MUST registrar desconto igual a zero no recebimento de Cartão de Crédito.
- **FR-009**: O sistema MUST registrar a despesa de operadora de Crédito como a diferença não negativa entre o bruto integral liquidado e o líquido recebido.
- **FR-010**: O sistema MUST derivar o percentual efetivo da despesa de Crédito a partir dos valores bruto e líquido, sem depender de percentual informado pelo usuário.
- **FR-011**: O sistema MUST concluir pagamento e despesa de operadora como uma única operação financeira, sem permitir conclusão parcial em caso de erro.
- **FR-012**: Após pagamento bem-sucedido, o sistema MUST refletir o novo saldo, status, histórico e despesa nos pontos de consulta relacionados sem recarregamento manual da página.
- **FR-013**: Somente Cartão de Débito MUST possuir taxa padrão configurável.
- **FR-014**: A taxa de Débito MUST aceitar valores maiores ou iguais a zero e menores que 100.
- **FR-015**: O sistema MUST rejeitar taxa de Débito negativa, igual ou superior a 100 ou em formato inválido, preservando a configuração anterior.
- **FR-016**: Dinheiro, PIX, Cartão de Crédito e Fiado MUST possuir taxa configurada igual a zero e MUST NOT permitir edição dessa taxa.
- **FR-017**: O sistema MUST recusar por sua regra central qualquer tentativa de definir taxa diferente de zero para forma que não seja Cartão de Débito.
- **FR-018**: A configuração de Cartão de Crédito MUST explicar que sua despesa é apurada no recebimento pelo valor bruto e pelo valor líquido.
- **FR-019**: Configurações existentes de formas não editáveis com taxa diferente de zero MUST ser normalizadas para zero sem alterar vendas, pagamentos ou despesas históricas.
- **FR-020**: Vendas em Cartão de Débito MUST continuar usando a taxa padrão vigente ou a taxa específica aceita para a transação, registrando pagamento líquido e despesa de operadora automaticamente.
- **FR-021**: Vendas em Dinheiro e PIX MUST continuar sendo liquidadas pelo valor integral sem despesa de operadora.
- **FR-022**: Contas Fiado e contas manuais MUST continuar aceitando pagamento simples sem campos de taxa de operadora.
- **FR-023**: Uma conta sem forma de pagamento identificável MUST NOT ser tratada como Crédito nem gerar despesa de operadora automaticamente.
- **FR-024**: O sistema MUST impedir novo pagamento em conta já integralmente liquidada.
- **FR-025**: O sistema MUST impedir confirmações simultâneas do mesmo pagamento na interação do usuário.
- **FR-026**: Mensagens de validação e resultado MUST explicar em linguagem operacional o valor inválido, a exigência de liquidação integral ou a restrição de taxa aplicável.
- **FR-027**: Os fluxos alterados MUST permanecer utilizáveis em smartphone, tablet e desktop, mantendo legibilidade do bruto, líquido, despesa e ação de confirmação.
- **FR-028**: A consulta de despesas de operadora MUST disponibilizar um resumo consolidado de taxas calculado no backend para o mesmo filtro aplicado à listagem.
- **FR-029**: O resumo consolidado MUST refletir exatamente o período e a forma selecionados pelo usuário, sem incluir registros fora do recorte exibido.
- **FR-030**: Quando o filtro contemplar Débito e Crédito, o resultado MUST considerar ambas as formas no total consolidado.
- **FR-031**: Quando o filtro contemplar apenas uma forma, o resultado MUST considerar somente a forma selecionada no total consolidado.
- **FR-032**: Em ausência de despesas no filtro atual, o resumo consolidado MUST retornar total igual a zero.

### Key Entities

- **Conta a Receber**: obrigação financeira associada ou não a uma venda; possui valor bruto, saldo pendente, origem, situação e histórico de pagamentos.
- **Venda**: origem comercial da conta e fonte da forma de pagamento quando a conta está vinculada a uma venda.
- **Pagamento Recebido**: registro do valor líquido recebido, do bruto liquidado, do desconto aplicável e da data do recebimento.
- **Despesa de Operadora**: custo financeiro vinculado à venda, formado pela diferença entre valor bruto liquidado e valor líquido recebido e acompanhado do percentual efetivo.
- **Configuração de Forma de Pagamento**: regra padrão por forma; após esta feature, somente Débito admite percentual diferente de zero e edição.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos cenários de Cartão de Crédito, os acessos pela lista geral e pelo detalhe do cliente apresentam os mesmos dados solicitados e produzem o mesmo resultado financeiro.
- **SC-002**: Em 100% dos pagamentos de Crédito aceitos, a conta termina sem saldo pendente e a despesa registrada corresponde exatamente à diferença entre bruto liquidado e líquido recebido.
- **SC-003**: Nenhuma tentativa de pagamento parcial de Crédito altera saldo, histórico ou despesas.
- **SC-004**: Um usuário consegue registrar o recebimento integral de Crédito em até 60 segundos, utilizando um único campo financeiro editável e uma confirmação.
- **SC-005**: Em 100% das formas de pagamento sem taxa configurável, o percentual persistido após a normalização é zero e nenhuma edição diferente de zero é aceita.
- **SC-006**: A taxa de Débito válida pode ser consultada e atualizada em até 30 segundos, com confirmação clara do resultado.
- **SC-007**: Os cenários de regressão de Dinheiro, PIX, Débito, Crédito, Fiado e conta manual produzem o status, saldo e despesa esperados sem inconsistência.
- **SC-008**: Todos os cenários críticos definidos nesta especificação podem ser concluídos em smartphone, tablet e desktop sem ocultar valores ou ações obrigatórias.
- **SC-009**: Em 100% dos filtros aplicados na tela de despesas de operadora, o total consolidado exibido corresponde exatamente à soma das despesas retornadas para o mesmo recorte.
- **SC-010**: O usuário consegue identificar o total de taxas do recorte filtrado sem cálculo manual adicional em até 10 segundos após o carregamento dos dados.

## Assumptions

- Usuários que acessam pagamentos e configurações já estão autenticados e possuem o acesso atualmente concedido pelo ERP; esta feature não cria novos perfis ou permissões.
- O valor bruto usado na liquidação de Crédito é o saldo bruto integral ainda pendente no momento da confirmação.
- Recebimento de Crédito representa o depósito líquido consolidado da operadora para aquela conta, sem parcelamento ou pagamento parcial.
- Desconto em pagamento de Crédito não é permitido; descontos continuam disponíveis apenas nos fluxos simples já compatíveis com essa regra.
- A taxa efetiva de Crédito é informativa e histórica, derivada dos valores realizados; não é uma configuração prévia.
- Valores monetários seguem precisão de centavos e percentuais preservam precisão suficiente para representar a razão efetiva sem alterar o valor monetário da despesa.
- A normalização de taxas antigas muda somente configurações futuras; registros financeiros históricos permanecem imutáveis.
- A validação desta feature seguirá os comandos de qualidade existentes e roteiros manuais, sem introduzir infraestrutura nova de testes automatizados, conforme decisão registrada no roadmap.
- A experiência deve preservar Mobile First, Dark Theme, linguagem operacional e o backend como fonte da consistência financeira.
- O consolidado de taxas da tela de despesas de operadora é uma visão de leitura baseada exclusivamente nos registros já persistidos, sem reprocessar ou alterar histórico financeiro.

