# Quickstart Validation Guide: Refinamento do Fluxo de Nova Venda

**Feature**: [Refinamento do Fluxo de Nova Venda](spec.md)

Este guia orienta a validação manual de ponta a ponta da feature 022 no ambiente local de desenvolvimento.

---

## 1. Pré-requisitos

1. **Backend Rodando**: Certifique-se de que a API do backend está ativa no endereço local padrão (ex.: `http://localhost:5000` ou conforme `.env`).
2. **Frontend Rodando**: Inicialize o Next.js no terminal:
   ```bash
   cd frontend
   npm run dev
   ```
3. **Dados de Teste**: Deve haver produtos ativos cadastrados com saldo em estoque disponível para venda.

---

## 2. Cenários de Validação Manual

### Cenário 1: Cadastro Rápido de Cliente
1. Acesse a rota `/vendas/nova` no navegador.
2. Insira alguns itens no resumo da venda e preencha a data.
3. No campo "Cliente", clique no link "Cadastrar cliente".
4. Verifique se o modal se abre por cima do formulário de vendas.
5. Deixe o campo "Nome" em branco e clique em "Salvar".
   - *Resultado esperado:* O modal deve permanecer aberto e exibir o erro de validação *"Informe o nome do cliente."*
6. Preencha o nome como `"Cliente Teste Rápido F022"`, e-mail como `"teste@f022.com"`, telefone como `"11999999999"` e clique em "Salvar".
   - *Resultado esperado:* O modal fecha, o cliente `"Cliente Teste Rápido F022"` aparece selecionado no campo de cliente da venda, e os itens no resumo/outros campos continuam intactos.

### Cenário 2: Compositor Único e Limpeza de Item
1. Na tela de Nova Venda, localize o painel do compositor de item.
2. Selecione um produto.
   - *Resultado esperado:* O campo "Preço Unitário" é preenchido automaticamente com o preço cadastrado do produto.
3. Insira quantidade `"3"`, desconto `"2,00"`, acréscimo `"1,00"` e clique em "Incluir item".
   - *Resultado esperado:* O item é adicionado ao resumo (exibindo o subtotal calculado) e todos os campos do compositor voltam ao seu estado vazio ou zerado padrão.

### Cenário 3: Bloqueio de Produto Duplicado
1. No compositor, selecione o mesmo produto que já foi incluído no cenário anterior.
2. Digite quantidade `"1"` e tente clicar em "Incluir item".
   - *Resultado esperado:* O sistema bloqueia a inserção, exibe um alerta de validação informando que o produto já está na venda e orienta o usuário a editá-lo no resumo.

### Cenário 4: Edição e Remoção de Itens no Resumo
1. No resumo de itens, clique no botão "Editar" (ícone de lápis ou botão correspondente) na linha do produto adicionado.
   - *Resultado esperado:* O item é removido do resumo de totais e os campos de Produto, Quantidade, Preço, Desconto e Acréscimo são carregados no compositor com os valores que estavam no resumo.
2. Altere a quantidade para `"5"` e clique em "Incluir item".
   - *Resultado esperado:* O item atualizado volta a aparecer no resumo e o compositor é limpo.
3. Clique no botão "Remover" (ícone de lixeira) na linha do item do resumo.
   - *Resultado esperado:* O item é removido e os totais da venda são recalculados imediatamente no resumo.

### Cenário 5: Finalização da Venda e Roteamento
1. Monte uma venda completa com o cliente rápido criado e pelo menos 1 item com estoque disponível.
2. Clique no botão "Registrar venda".
   - *Resultado esperado:* O modal de pagamento pós-venda (F015/F020) é exibido normalmente.
3. Selecione a forma de pagamento (ex.: `"Dinheiro"`) e confirme.
   - *Resultado esperado:* A venda é processada com sucesso no backend. A tela de Nova Venda é redefinida ao estado inicial (campos em branco, compositor limpo e resumo vazio) e uma mensagem de sucesso é apresentada.

---

## 3. Verificação de Integridade do Código
Antes de submeter, execute as verificações estáticas de tipo e formatação no frontend:
```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```
Todas devem ser executadas com sucesso sem erros.
