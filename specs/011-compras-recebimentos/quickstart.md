# Quickstart: Compras e Recebimentos

## Prerequisites

- Backend do Amani ERP em execucao com os endpoints de compras disponiveis.
- Frontend configurado com `NEXT_PUBLIC_API_BASE_URL` apontando para a API quando
  necessario.
- Pelo menos um fornecedor cadastrado.
- Pelo menos dois produtos cadastrados para validar item unico e duplicidade.
- Feature 010 ou compras anteriores podem existir para dados operacionais, mas a
  F011 deve funcionar criando uma compra nova do zero.

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
/compras
/compras/nova
```

## Scenario 1: Default Purchase List

1. Abrir `/compras`.
2. Confirmar que a tela deixou de ser placeholder.
3. Confirmar que o recorte padrao prioriza compras em transito ou pendentes dos
   ultimos 30 dias.
4. Confirmar que existe acesso para nova compra e para produtos pendentes.

Expected:

- A tela carrega sem dados mockados.
- Estados de loading, vazio e erro aparecem quando aplicavel.
- A tela nao apresenta criacao de compra como entrada de estoque.

## Scenario 2: Purchase Filters

1. Abrir `/compras`.
2. Aplicar filtro por fornecedor.
3. Aplicar filtro por periodo.
4. Limpar filtros.

Expected:

- A lista reflete os filtros aplicados.
- Limpar filtros volta a um estado compreensivel.
- Falhas de carregamento exibem mensagem e tentativa de recarregar.

## Scenario 3: Create Purchase Success

1. Abrir `/compras/nova`.
2. Selecionar fornecedor real.
3. Informar data da compra.
4. Adicionar ate 10 itens com produtos distintos.
5. Informar quantidade, custo unitario, ajustes por item quando necessario e
   ajustes gerais quando necessario.
6. Confirmar criacao da compra.

Expected:

- A compra e criada com sucesso.
- A interface direciona para o detalhe ou exibe acesso claro ao detalhe.
- A compra aparece como mercadoria em transito.
- Nenhum saldo de estoque e apresentado como alterado pela criacao.

## Scenario 4: Create Purchase Validation

1. Tentar criar compra sem fornecedor.
2. Tentar criar compra sem itens.
3. Tentar criar item sem produto.
4. Tentar criar item com quantidade zero ou negativa.
5. Tentar repetir o mesmo produto em dois itens.
6. Tentar informar desconto/acrescimo negativo.

Expected:

- O envio nao acontece quando a validacao local detectar o erro.
- Mensagens orientam correcao.
- Dados validos ja preenchidos permanecem na tela.

## Scenario 5: Purchase Detail

1. Abrir detalhe de uma compra criada.
2. Confirmar exibicao de fornecedor, data, status, itens, valores principais,
   recebidos, perdidos e pendentes.
3. Confirmar exibicao de historico de recebimentos e perdas quando existir.

Expected:

- O detalhe permite entender o estado operacional da compra.
- Itens pendentes oferecem acoes de recebimento e perda.
- Itens sem pendencia nao permitem nova baixa operacional.

## Scenario 6: Register Partial Receipt

1. Abrir detalhe de compra com item pendente.
2. Acionar recebimento do item.
3. Informar quantidade menor ou igual a pendencia.
4. Revisar o resumo.
5. Confirmar o recebimento.

Expected:

- A fonte oficial registra o recebimento.
- O detalhe, pendencias e historico sao atualizados.
- A UI deixa claro que recebimento confirmado e a acao que gera entrada
  rastreavel de estoque.

## Scenario 7: Receipt Failure

1. Abrir recebimento de item pendente.
2. Informar quantidade maior que a pendencia ou invalida.
3. Confirmar.

Expected:

- A operacao nao aparece como concluida.
- A mensagem oficial ou fallback compreensivel e exibida.
- O preenchimento permanece disponivel para correcao.

## Scenario 8: Register Loss

1. Abrir detalhe de compra com item pendente.
2. Acionar perda do item.
3. Informar quantidade menor ou igual a pendencia.
4. Selecionar um motivo entre Perda, Extravio ou Avaria.
5. Revisar o resumo.
6. Confirmar a perda.

Expected:

- A fonte oficial registra a perda.
- O detalhe, pendencias e historico sao atualizados.
- A UI deixa claro que perda nao gera entrada de estoque.

## Scenario 9: Loss Validation

1. Tentar registrar perda sem motivo.
2. Tentar registrar perda com quantidade invalida.
3. Tentar registrar perda acima da pendencia.

Expected:

- A operacao nao aparece como concluida.
- Motivos aceitos ficam restritos a Perda, Extravio e Avaria.
- A mensagem oficial ou fallback compreensivel e exibida.

## Scenario 10: Supporting Data Failure

1. Simular indisponibilidade da API de fornecedores.
2. Simular indisponibilidade da API de produtos.
3. Abrir `/compras/nova`.

Expected:

- A tela mostra estado de erro para os dados afetados.
- O usuario consegue tentar recarregar.
- Nenhum dado mockado substitui a fonte oficial.

## Scenario 11: Regression Guardrails

Validar em smartphone (~390px), tablet e desktop:

- Sem sobreposicao de formularios, botoes, tabelas, cards, dialogos ou mensagens.
- Dark Only preservado.
- Nenhum cancelamento ou edicao de compra aparece.
- Nenhuma importacao em massa aparece.
- Nenhum ajuste manual de estoque aparece.
- Nenhum calculo de estoque, custo medio, lucro, ranking, metrica ou dashboard e
  feito ou exibido pela interface.

## Scenario 12: Existing Modules

1. Abrir `/fornecedores`.
2. Abrir `/produtos`.

Expected:

- As paginas continuam carregando pelos hooks existentes.
- Alteracoes de query keys, rotas ou navegacao de compras nao quebram modulos
  ja entregues.

## Completion Evidence

Validacao registrada em 2026-06-16 para fechamento da F011:

- `npm run typecheck` executado em `frontend/` com sucesso.
- `npm run lint` executado em `frontend/` com sucesso.
- `npm run build` executado em `frontend/` com sucesso, incluindo as rotas
  `/compras`, `/compras/nova`, `/compras/[id]`, `/fornecedores` e `/produtos`.
- Revisao estrutural dos fluxos mobile/tablet/desktop aplicada em lista,
  filtros, pendencias, formulario, detalhe, historico e dialogos de recebimento
  e perda.
- Varredura de escopo confirmou ausencia de acoes de cancelamento, edicao de
  compra, importacao, transferencia, ajuste manual de estoque e calculos
  criticos no frontend de compras; os unicos achados foram falsos positivos do
  nome interno `PurchaseItemEditor`.
