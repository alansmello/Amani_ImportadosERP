# Compras iniciais em trânsito

Uma compra com `ImplantacaoInicial = true` representa mercadoria comprada e paga antes do recomeço, ainda pendente de recebimento. A marca é definida na criação e não muda o status logístico.

No `POST /api/compras`, o campo opcional `implantacaoInicial` assume `false`. As compras existentes também recebem `false` pela migration `20261115172706_AddCompraImplantacaoInicial`. Somente compras já pagas antes da implantação devem usar `true`.

As compras iniciais:

- permanecem nas listas, filtros e valores patrimoniais de mercadorias em trânsito;
- entram no estoque e no cálculo de custo quando recebidas, pelos eventos normais;
- ficam fora de `TotalCompras`, saídas de caixa, saldo operacional, compras anteriores que formam o caixa inicial e gráfico de compras por período;
- continuam permitindo reembolsos e cancelamentos de reembolsos. Esses eventos reais de caixa não são excluídos pela marca inicial;
- exibem sua origem na lista e no detalhe da compra.

Não há compensação fictícia de caixa, custo zerado ou alteração artificial de data para ocultar a compra.

## Preparação da base de recomeço

Confirmar com o operador que todos os lotes já foram pagos e distinguir repetições acidentais de lotes efetivamente diferentes. Preservar lotes e custos distintos em compras separadas quando necessário, pois uma compra não aceita dois itens do mesmo produto.

Definir a data de referência da implantação quando as datas históricas não estiverem disponíveis. Registrar o custo de cada lote no item de compra, preservando os custos dos produtos e os inventários já registrados. Completar os novos cadastros com os preços confirmados pelo operador.

Gerar um backup completo antes da carga. Guardar o backup, o manifesto dos lotes e a conferência dos dados em armazenamento restrito, fora do repositório. Ensaiar a migration e a carga em uma cópia isolada antes de aplicá-las na base de recomeço.

## Validação

Sem novo projeto ou framework de testes. Foram usados build da API, lint, typecheck e build do frontend e verificações HTTP numa cópia isolada. As verificações cobriram todos os lotes importados, trânsito ao custo, caixa corrente e de períodos futuros, gráfico de compras, recebimento, criação pela API e comportamento financeiro de compras comuns. Os testes com recebimento e compras adicionais ficaram exclusivamente na cópia de testes.

Na conferência posterior à carga real, comparar quantidades, fornecedores e custos de cada lote com o manifesto aprovado, e confirmar a preservação do estoque disponível, dos recebíveis e das vendas anteriores. A carga de trânsito não deve gerar recebimentos, vendas ou saídas de caixa.

## Publicação e troca de ambiente

A exclusão financeira depende desta versão da API. A API antiga ignora o novo campo e contabiliza as compras como saídas. Não conectar a aplicação antiga à base nova.

Publicar a API atualizada em ambiente conectado à base nova, já migrada, validar o acesso do usuário e depois realizar a troca do frontend. Não publicar esta versão contra o banco antigo sem antes planejar a compatibilidade do schema: o modelo agora consulta a coluna adicional.

Para desfazer a operação, conservar a marca e usar o backup anterior à carga. Remover a coluna ou reverter somente o código reintroduz as compras iniciais nas saídas financeiras; isso não é um rollback funcional seguro.
