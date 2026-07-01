# Data Model: Apresentações Comerciais e Quantidade Racional

## QuantidadeRacional (value object)

| Campo | Tipo lógico | Regra |
| --- | --- | --- |
| Numerador | inteiro longo | positivo; operações verificadas contra overflow |
| Denominador | inteiro longo | maior que zero |

Comportamentos: reduzir por MDC, multiplicar por quantidade inteira, somar/subtrair com denominadores distintos, comparar por multiplicação cruzada segura e projetar para decimal com escala/arredondamento explícitos. Zero é permitido apenas como resultado agregado, representado por `0/1`, nunca como fator de apresentação.

## ProdutoApresentacao

| Campo | Obrigatório | Regra |
| --- | --- | --- |
| Id | sim | identificador |
| ProdutoId | sim | produto existente; exclusão restrita |
| Nome | sim | texto normalizado, único por produto |
| FatorNumerador | sim | inteiro positivo |
| FatorDenominador | sim | inteiro positivo |
| PermiteCompra | sim | `false` nesta versão |
| PermiteVenda | sim | controla disponibilidade na venda |
| PrecoVenda | não | monetário não negativo; preço sugerido da apresentação |
| Ativo | sim | desativação lógica; sem exclusão após uso |
| CreatedAt / UpdatedAt | sim | padrão de auditoria existente |

Invariantes: numerador ≤ denominador; fração persistida em forma reduzida; `PermiteCompra=true` é rejeitado enquanto compra por apresentação estiver fora do escopo.

## VendaItem (extensão)

Campos existentes preservados: ProdutoId, Quantidade (quantidade comercial informada), PrecoUnitario, Desconto, Acrescimo, VendaId.

| Novo campo | Obrigatório para legado | Obrigatório para nova venda com apresentação |
| --- | --- | --- |
| ProdutoApresentacaoId | não | sim |
| ApresentacaoNomeSnapshot | não | sim |
| FatorNumeradorAplicado | não | sim |
| FatorDenominadorAplicado | não | sim |
| FatorConversaoAplicado | não | sim, projeção decimal |
| QuantidadeConvertidaEstoque | não | sim, projeção decimal final |

O custo exato é derivado de `Quantidade × FatorNumeradorAplicado / FatorDenominadorAplicado`; não é necessário persistir valor unitário convertido de estoque.

## EstoqueMovimentacao (extensão)

| Campo | Evolução |
| --- | --- |
| Quantidade | passa de inteiro para decimal; contém a projeção final na unidade principal |
| QuantidadeExataNumerador | novo, nullable; razão normalizada da quantidade total movimentada |
| QuantidadeExataDenominador | novo, nullable; maior que zero quando numerador existe |
| VendaItemId | novo, nullable; rastreia a linha de venda/reversão |

Semântica legada: quando os campos exatos forem nulos, `Quantidade` deve ser inteira e equivale a `Quantidade/1`. Novas saídas fracionadas e suas reversões sempre preenchem o par exato.

## Contratos de leitura

- Saldos e quantidades de movimentação tornam-se decimais na resposta.
- Respostas de venda adicionam apresentação e snapshot como campos opcionais.
- Produtos adicionam coleção opcional de apresentações; clientes antigos podem ignorá-la.
- Ranking de produto usa quantidade equivalente na unidade principal; contagem de vendas/clientes permanece inteira.

## Relationships

- Produto 1:N ProdutoApresentacao.
- ProdutoApresentacao 1:N VendaItem, com FK nullable para compatibilidade e deleção restrita.
- VendaItem 1:N EstoqueMovimentacao para saída e eventual compensação, por FK nullable.

## State transitions

- Apresentação: ativa → inativa; reativação permitida após validação. Uso histórico impede exclusão física.
- Venda: rascunho em memória → confirmada com snapshot e saída atômica → cancelada com entrada exata compensatória.
- Configuração alterada afeta apenas novas vendas; snapshots permanecem imutáveis.

## Database constraints and indexes

- Checks: numeradores > 0; denominadores > 0; numerador ≤ denominador; par exato da movimentação ambos nulos ou ambos preenchidos.
- Unique: ProdutoId + nome normalizado da apresentação.
- Índices: ProdutoApresentacao(ProdutoId, Ativo, PermiteVenda); VendaItem(ProdutoApresentacaoId); EstoqueMovimentacao(VendaItemId). O índice atual por ProdutoId/Data/Tipo permanece base das agregações.
