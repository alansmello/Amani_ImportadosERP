# Quickstart: Implantacao Inicial

## Prerequisites

- Backend do Amani ERP em execucao com os endpoints de implantacao disponiveis.
- Frontend configurado com `NEXT_PUBLIC_API_BASE_URL` apontando para a API quando
  necessario.
- Pelo menos um produto cadastrado para testar inventario inicial.
- Pelo menos um cliente ativo cadastrado para testar contas a receber iniciais.

## Run

```powershell
cd frontend
npm run lint
npm run typecheck
npm run build
npm run dev
```

Acesse o frontend no endereco exibido pelo Next.js e abra:

```text
/configuracoes
/configuracoes/implantacao
```

## Scenario 1: Access Implantation From Configuracoes

1. Abrir `/configuracoes`.
2. Acionar a entrada de Implantacao Inicial.
3. Confirmar que a tela exibe etapas de inventario inicial, saldo inicial de
   caixa e contas a receber iniciais.
4. Confirmar que o progresso geral mostra etapas pendentes.

Expected:

- A rota de implantacao abre sem erro.
- Nenhum dado mockado e exibido.
- A experiencia funciona em smartphone, tablet e desktop.

## Scenario 2: Initial Inventory Success

1. Abrir a etapa de inventario inicial.
2. Selecionar um produto existente.
3. Informar quantidade maior que zero.
4. Informar valor unitario positivo ou deixar vazio quando permitido.
5. Revisar o resumo.
6. Confirmar o envio.

Expected:

- A fonte oficial registra movimentacoes de inventario inicial.
- A tela mostra feedback de sucesso com quantidade de itens e referencia das
  movimentacoes quando disponivel.
- A etapa fica concluida e bloqueada para novo envio na sessao/tela atual.

## Scenario 3: Initial Inventory Validation

1. Tentar enviar inventario sem itens.
2. Tentar enviar item sem produto.
3. Tentar enviar quantidade zero ou negativa.
4. Tentar repetir o mesmo produto no lote.

Expected:

- O envio nao acontece quando a validacao local detectar o erro.
- Mensagens orientam a correcao.
- Dados validos ja preenchidos permanecem na tela.

## Scenario 4: Initial Cash Balance

1. Abrir a etapa de saldo inicial de caixa.
2. Informar valor, data, origem e descricao opcional.
3. Revisar o resumo.
4. Confirmar o envio.

Expected:

- A fonte oficial registra o evento financeiro de saldo inicial.
- A etapa mostra sucesso e fica bloqueada para novo envio na sessao/tela atual.
- Em rejeicao da fonte oficial, a mensagem e exibida e a etapa segue corrigivel.

## Scenario 5: Initial Receivables Success

1. Abrir a etapa de contas a receber iniciais.
2. Adicionar ate 10 contas vinculadas a clientes ativos.
3. Informar valor maior que zero, vencimento e descricao opcional.
4. Revisar o resumo.
5. Confirmar o envio.

Expected:

- Todas as contas validas sao enviadas para a fonte oficial.
- A etapa so fica concluida visualmente se todos os envios retornarem sucesso.
- A etapa concluida fica bloqueada para novo envio na sessao/tela atual.

## Scenario 6: Initial Receivables Failure Is Not Partial Success

1. Montar um lote com uma conta valida e uma conta invalida.
2. Tentar confirmar.

Expected:

- Se a validacao local detectar o erro, nenhum envio e iniciado.
- Se a fonte oficial rejeitar qualquer item, a etapa nao fica concluida na interface.
- A UI nao apresenta itens individuais como concluidos.
- Como a fonte oficial registra uma conta por chamada, registros ja aceitos antes
  de uma falha seguem responsabilidade do backend; a interface apenas nao marca a
  etapa como concluida.
- O preenchimento permanece disponivel para correcao.

## Scenario 7: Supporting Data Failure

1. Simular indisponibilidade da API de produtos ou clientes.
2. Abrir a implantacao.

Expected:

- A etapa afetada mostra estado de erro.
- O usuario consegue tentar carregar novamente.
- Etapas que nao dependem daquela lista continuam compreensiveis.

## Scenario 8: Regression Guardrails

Validar em smartphone (~390px), tablet e desktop:

- Sem sobreposicao de formularios, botoes, dialogos ou mensagens.
- Dark Only preservado.
- Nenhuma importacao de planilha aparece.
- Nenhuma reabertura ou edicao em massa aparece.
- Nenhum calculo de custo medio, saldo, lucro, ranking, metrica ou dashboard e
  feito ou exibido pela interface.
