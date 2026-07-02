# Research and Decisions: Refinamento do Fluxo de Nova Compra

**Feature**: [Refinamento do Fluxo de Nova Compra](spec.md)

## 1. Limite da mudança

### Decision

Implementar a feature exclusivamente na organização do estado e da interface da Nova Compra. O hook de criação, o service, o payload e o backend permanecem inalterados.

### Rationale

O contrato atual já recebe uma coleção completa de itens e suporta todos os campos exigidos. Criar compra persiste a operação em trânsito sem gerar movimentação; a movimentação de entrada continua isolada no recebimento físico. Não existe limitação contratual que justifique ampliar o backend para o novo carrinho.

### Alternatives considered

- Criar endpoints para adicionar ou editar itens temporários: rejeitado porque o carrinho existe somente antes do registro e não precisa de persistência intermediária.
- Alterar os DTOs para representar estados do compositor: rejeitado porque estados de edição são exclusivos da interface.

## 2. Componentes específicos de Compra

### Decision

Usar o padrão conceitual de compositor e resumo da Venda, mas criar `PurchaseItemComposer` e `PurchaseSummary` específicos para Compra.

### Rationale

Compra trabalha com custo unitário, unidade principal e mercadoria em trânsito. Venda trabalha com preço, estoque disponível, apresentações e pagamento. Compartilhar diretamente os componentes criaria condicionais de domínio e aumentaria o risco de regressão nos dois fluxos.

### Alternatives considered

- Generalizar um componente de carrinho para Compra e Venda: rejeitado por antecipar abstração sem necessidade e misturar semânticas diferentes.
- Reutilizar `SaleItemComposer` por configuração: rejeitado pelo acoplamento a saldo, preço e apresentação comercial.

## 3. Estado do compositor e itens confirmados

### Decision

Manter `PurchaseDraft.items` como fonte dos itens confirmados e adicionar um `composerItem` independente. O draft inicial passa a ter `items: []`; o compositor recebe um item vazio próprio.

### Rationale

Essa separação impede que campos incompletos façam parte do payload, mantém exatamente um formulário visível e permite validar o item antes de confirmá-lo.

### Alternatives considered

- Continuar adicionando itens vazios ao array: rejeitado porque reproduz a poluição atual e mistura item parcial com item confirmado.
- Manter um array paralelo de formulários: rejeitado por duplicar estado sem benefício operacional.

## 4. Edição com preservação de ordem

### Decision

Ao editar, manter o item original no carrinho, copiar seus dados para o compositor e registrar `editingItemId`. Confirmar a edição substitui o item pelo mesmo identificador na mesma posição; cancelar apenas descarta a cópia. Enquanto houver edição ativa, outras ações de editar/remover ficam indisponíveis.

### Rationale

Não remover o item antecipadamente evita backup, reinserção e reordenação acidental. Também garante restauração integral por construção, pois o original só é alterado após validação e confirmação.

### Alternatives considered

- Remover o item do carrinho e reinseri-lo depois: rejeitado porque exige backup e índice original e abre espaço para perda ou mudança de ordem.
- Editar em linha dentro do resumo: rejeitado porque volta a multiplicar formulários e prejudica a experiência móvel.

## 5. Duplicidade durante inclusão e edição

### Decision

Validar produto duplicado contra os itens confirmados. Em nova inclusão, qualquer correspondência bloqueia a ação; em edição, o item com o mesmo identificador é ignorado, mas qualquer outro item com o produto escolhido bloqueia a atualização.

### Rationale

Preserva a regra atual do domínio e permite manter o próprio produto durante uma edição legítima, sem abrir exceção para dois itens do mesmo produto.

### Alternatives considered

- Mesclar quantidades automaticamente: rejeitado porque pode esconder diferenças de custo e ajustes.
- Permitir duplicidade apenas no frontend: rejeitado porque conflita com a entidade de Compra e seria recusado pelo backend.

## 6. Conteúdo não confirmado

### Decision

Criar uma verificação pura de conteúdo significativo no compositor. O compositor é vazio somente quando produto, quantidade, custo, desconto e acréscimo estão todos em branco. Se houver qualquer conteúdo ou uma edição ativa, o registro final é bloqueado e a interface orienta o usuário a incluir, atualizar, cancelar ou limpar.

### Rationale

Um item parcial não pode ser enviado, mas também não deve desaparecer silenciosamente quando já existem itens válidos no carrinho. A ação explícita protege o trabalho e torna a fronteira do carrinho compreensível.

### Alternatives considered

- Ignorar o compositor no submit: rejeitado por risco de perda silenciosa.
- Inserir automaticamente o item no submit: rejeitado porque contornaria a validação e a confirmação intencional.

## 7. Prévia financeira

### Decision

Exibir no resumo a prévia por item `quantidade × custo unitário − desconto + acréscimo`, somar os itens e aplicar os ajustes gerais apenas para revisão visual. Os rótulos devem indicar que são valores preenchidos, sem apresentar a prévia como novo total oficial.

### Rationale

A fórmula corresponde aos campos que o usuário está compondo e permite conferir o carrinho. Entretanto, há uma inconsistência preexistente entre totais retornados em consultas de Compra; corrigi-la não é condição para esta UX e exigiria uma decisão de domínio separada.

### Alternatives considered

- Omitir todos os valores agregados: rejeitado porque reduz a capacidade de revisão antes do registro.
- Corrigir o total oficial nesta feature: rejeitado por ampliar o escopo e misturar UX com mudança de regra comercial.

## 8. Responsividade e identidade visual

### Decision

Empilhar compositor e resumo em smartphone e usar duas colunas em desktop, seguindo o padrão atual de Venda e os tokens/componentes existentes. O resumo deve manter nomes e ações legíveis sem exigir rolagem horizontal da página.

### Rationale

O fluxo sequencial favorece Mobile First, enquanto a disposição lado a lado acelera revisão em telas maiores. Reutilizar o Design System mantém Dark Theme, foco, estados disabled e hierarquia visual.

### Alternatives considered

- Tabela larga para o carrinho: rejeitada porque os campos e ações perdem legibilidade no smartphone.
- Modal para cada item: rejeitado por aumentar interações e esconder o contexto da compra.

## 9. Estratégia de validação

### Decision

Usar validação estática, build e roteiro manual de ponta a ponta, incluindo regressão de compra em trânsito, recebimento parcial, perda, estoque, custo médio e fluxo de Venda. Não adicionar framework ou projeto de testes nesta feature.

### Rationale

O repositório não possui infraestrutura automatizada dedicada a esse fluxo e a decisão vigente proíbe introduzi-la nesta sequência. O risco principal está na transição de estado e na preservação do contrato, cobertos pelo roteiro detalhado.

### Alternatives considered

- Introduzir nova suíte automatizada: rejeitada por contrariar a decisão de escopo vigente.
- Validar apenas visualmente: rejeitada porque não cobre payload e regressões logísticas.

