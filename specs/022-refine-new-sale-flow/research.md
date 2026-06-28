# Research and Decisions: Refinamento do Fluxo de Nova Venda

**Feature**: [Refinamento do Fluxo de Nova Venda](spec.md)

Este documento registra as decisões de design e soluções técnicas para os cadastros auxiliares e o compositor único de venda.

---

## 1. Cadastro Rápido de Cliente em Modal

### Decisão
Reutilizar o componente de campos de formulário existente `CustomerFormFields` dentro de um modal baseado no Radix-based `<Dialog>` de `@/components/ui/dialog`. Usar a mutation `useCreateCustomer` para enviar o cadastro para o backend e, no retorno de sucesso, selecionar o cliente no rascunho de venda automaticamente.

### Raciocínio
- Reutiliza a lógica e o estilo visual existentes do formulário de clientes, preservando a validação central de Nome (obrigatório) e E-mail/Telefone (opcionais).
- A mutation `useCreateCustomer` já lida com a invalidação das queries de clientes ativos, garantindo que o seletor principal de clientes em Nova Venda seja atualizado.
- O estado local da venda (`draft`) é mantido sem desmontar ou redefinir, evitando a perda de dados.

### Alternativas Consideradas
- **Redirecionar mantendo estado via SessionStorage**: Complexidade para guardar o estado do rascunho da venda (itens, descontos) e recuperá-lo no retorno. Foi rejeitada pois a abordagem do modal direto é mais rápida e fluida para o usuário (melhor experiência operacional).
- **Usar um modal customizado sem Radix**: Aumenta o risco de bugs de acessibilidade e quebras de estilo em breakpoints de smartphones. Rejeitado para aderir à Stack Oficial.

---

## 2. Compositor Único vs. Múltiplos Editores de Item

### Decisão
Substituir o array de editores mutáveis mapeados diretamente do `draft.items` por um estado local de composição isolado `currentItem` (`SaleItemDraft`). Os campos de Produto, Quantidade, Preço Unitário, Desconto e Acréscimo serão ligados ao `currentItem`. Ao acionar "Incluir item", valida-se o item individualmente. Em caso de sucesso, o item é adicionado ao `draft.items` e o compositor é redefinido ao estado inicial.

### Raciocínio
- Reduz a poluição visual eliminando múltiplos formulários/cards abertos na tela simultaneamente.
- Separa o estado de "edição em andamento" do estado de "dados confirmados", facilitando a validação isolada de cada item e evitando que itens incompletos ou em branco sejam enviados.
- Facilita o controle de Mobile First ao organizar a entrada de dados de maneira sequencial.

### Alternativas Consideradas
- **Manter múltiplos editores com limite de colapso/cards acordeão**: Ainda exige rolar a tela se houver muitos itens e não resolve a consolidação indesejada de itens parciais. Rejeitado.

---

## 3. Bloqueio de Produto Duplicado no Frontend

### Decisão
Antes de inserir o `currentItem` em `draft.items`, realizar uma busca local pelo `produtoId` no array de itens confirmados. Caso exista, desabilitar ou exibir erro na validação do compositor e orientar o operador a editar o item já incluído no resumo.

### Raciocínio
- Evita a consolidação automática silenciosa que prejudica a conferência de descontos ou acréscimos aplicados individualmente em lotes ou itens específicos.
- Direciona o fluxo para que o operador faça edições conscientes.

### Alternativas Consideradas
- **Consolidação automática com soma de quantidade**: O comportamento legado. Foi explicitamente rejeitado na decisão de negócio 3 pois descartava ou misturava preços e descontos diferenciados.

---

## 4. Edição de Item a partir do Resumo

### Decisão
Adicionar um botão "Editar" ao lado de cada item no resumo (`SaleSummary`). Ao clicar, o item correspondente é removido do array de itens confirmados `draft.items`, e seus dados são carregados no estado do compositor `currentItem`, voltando a ser editados. Caso o usuário cancele, o item é reinserido no resumo.

### Raciocínio
- Mantém o compositor único como única via de edição de dados, simplificando a lógica de estado do formulário e evitando duplicar campos de input.
- É muito intuitivo e econômico em termos de espaço de tela.

### Alternativas Consideradas
- **Edição em linha no próprio resumo**: Exige duplicar inputs de quantidade, preço e descontos dentro da listagem de resumo, quebrando o layout Mobile First e adicionando poluição visual. Rejeitada.
