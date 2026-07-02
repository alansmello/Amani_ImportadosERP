# Quickstart Validation Guide: Refinamento do Fluxo de Nova Compra

**Feature**: [Refinamento do Fluxo de Nova Compra](spec.md)

## 1. Pré-requisitos

- API e banco local disponíveis conforme a configuração do projeto.
- Ao menos um fornecedor ativo.
- Ao menos três produtos ativos; para a regressão logística, conhecer previamente o saldo e o custo médio de um deles.
- Usuário autenticado com acesso ao fluxo de compras.

## 2. Verificações estáticas

Na raiz do repositório:

```powershell
dotnet build Amani_ImportadosERP.sln
```

No diretório `frontend/`:

```powershell
npm run lint
npm run typecheck
npm run build
```

Todos os comandos devem concluir sem erro.

## 3. Execução local

Inicie API e frontend conforme o procedimento habitual do projeto. Acesse `/compras/nova`.

## 4. Cenários funcionais

### Cenário 1 — Compositor único

1. Confirme que existe somente um formulário de item.
2. Preencha fornecedor e data.
3. Inclua três produtos válidos.
4. Confirme que os três aparecem no carrinho e continua existindo somente um formulário.
5. Confirme que fornecedor, data e ajustes gerais não foram apagados.

### Cenário 2 — Validação e duplicidade

1. Tente incluir um item vazio.
2. Tente quantidade zero, fracionada e negativa.
3. Tente custo negativo e ajustes negativos.
4. Inclua um item válido e tente incluir novamente o mesmo produto.

Resultado esperado: cada tentativa inválida é bloqueada com mensagem junto ao campo; a duplicidade orienta editar o item existente.

### Cenário 3 — Edição e ordem

1. Com três itens confirmados, edite o segundo.
2. Altere quantidade, custo, desconto e acréscimo e confirme.
3. Verifique que o segundo item foi substituído sem duplicação e permaneceu na mesma posição.
4. Edite-o novamente, altere os campos e cancele.
5. Verifique que todos os valores anteriores foram preservados.
6. Durante uma edição, tente iniciar outra ou remover item.

Resultado esperado: somente uma edição pode ocorrer; ações incompatíveis permanecem indisponíveis até confirmar ou cancelar.

### Cenário 4 — Remoção e carrinho vazio

1. Remova um item e confira a atualização imediata da prévia.
2. Remova todos os itens.
3. Tente registrar a compra.

Resultado esperado: nenhum item removido participa da prévia ou do registro; carrinho vazio impede o envio.

### Cenário 5 — Conteúdo parcial

1. Mantenha ao menos um item confirmado.
2. Preencha somente quantidade no compositor e tente registrar.
3. Repita com produto ou custo isolado.
4. Limpe explicitamente o compositor e registre novamente.

Resultado esperado: conteúdo parcial nunca é descartado silenciosamente; após a limpeza explícita, o registro pode prosseguir se o draft estiver válido.

### Cenário 6 — Prévia comercial

1. Inclua um item com quantidade 3, custo 100, desconto 10 e acréscimo 5.
2. Verifique líquido consultivo de 295.
3. Inclua outro item e aplique desconto/acréscimo geral.
4. Confira subtotal e total preenchido.

Resultado esperado: os valores seguem [data-model.md](data-model.md) e permanecem rotulados como prévia, sem prometer correção do total oficial preexistente.

### Cenário 7 — Falha de registro

1. Monte uma compra válida.
2. Induza uma falha segura de comunicação ou use uma referência que deixe de estar disponível.
3. Tente registrar.

Resultado esperado: a mensagem de erro aparece e fornecedor, data, ajustes, carrinho e compositor permanecem disponíveis.

## 5. Regressão de domínio

### Compra, trânsito e estoque

1. Anote saldo e custo médio de um produto.
2. Crie uma compra de 3 unidades pelo novo fluxo.
3. Consulte o detalhe da compra e o estoque.

Resultado esperado: compra em trânsito com 3 pendentes; saldo e custo médio não mudam.

### Recebimento parcial e perda

1. Confirme recebimento físico de 2 unidades.
2. Confira compra, estoque e custo médio.
3. Registre perda da 1 unidade restante.

Resultado esperado: somente 2 unidades entram no estoque e formam custo; a perda encerra a pendência sem criar entrada.

### Venda

1. Acesse `/vendas/nova`.
2. Inclua, edite e remova um item no fluxo existente.
3. Conclua uma venda válida conforme os dados disponíveis.

Resultado esperado: compositor, resumo, pagamento e validação oficial da Venda permanecem funcionalmente inalterados.

## 6. Responsividade

Repetir os cenários 1, 3 e 5 em larguras aproximadas de 390 px, 768 px e 1440 px.

Critérios:

- sem rolagem horizontal da página;
- campos, mensagens e ações acessíveis;
- compositor antes do resumo no smartphone;
- disposição em colunas apenas quando houver espaço;
- foco visível, estados disabled e contraste coerentes com o Design System.

## 7. Resultado da validação

Registrar data, ambiente, dados utilizados, comandos executados, resultado por cenário e qualquer divergência. A feature só está pronta quando todos os cenários passarem sem alteração de contrato, migration ou regra de estoque.

### Registro parcial em 2026-07-01

- Ambiente: workspace local `C:\Users\AlandeSouzaMello\Documents\SistemaAmaniImportados\Amani_ImportadosERP`, validação automatizada executada pelo Codex.
- Frontend `lint`: concluído com 1 warning preexistente e não relacionado à F025 em `frontend/src/components/dashboard/dashboard-chart-section.tsx` (`formatDashboardCurrency` sem uso).
- Frontend `typecheck`: concluído com sucesso após ajuste de variante do botão no novo compositor de compra.
- Frontend `build`: concluído com sucesso; rota `/compras/nova` gerada sem erro.
- Backend `dotnet build Amani_ImportadosERP.sln`: concluído com sucesso; nenhum arquivo em `src/` foi alterado pela F025. Permaneceram warnings preexistentes de `NU1900`, `CS0628` e `CS8618`.
- Cenários funcionais 1-7: pendentes de execução manual nesta sessão, pois exigem API, banco local, autenticação e navegação interativa na aplicação em execução.
- Regressões de compra em trânsito, recebimento parcial, perda, estoque, custo médio e venda: pendentes da mesma validação manual ponta a ponta.
- Matriz responsiva 390 px, 768 px e 1440 px: pendente de validação manual visual com aplicação em execução.
