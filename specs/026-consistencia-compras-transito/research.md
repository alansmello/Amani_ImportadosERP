# Research: Consistência de Compras em Trânsito e Limpeza do Dashboard Gerencial

## 1. Estado atual dos cálculos de compra

### Inventário confirmado

| Superfície | Regra atual | Divergência |
| --- | --- | --- |
| Detalhe `GET /api/compras/{id}` | `Compra.Total()` soma `CompraItem.ValorTotal()` | Considera ajustes dos itens, mas ignora desconto e acréscimo gerais |
| Listagem `GET /api/compras` | Soma `Quantidade × CustoUnitario`, depois aplica ajustes gerais | Ignora desconto e acréscimo de cada item |
| Trânsito `GET /api/compras/em-transito` | Retorna quantidades, sem valores | Obriga o frontend a adaptar um contrato sem total |
| Dashboard financeiro | Soma valores líquidos dos itens | Ignora desconto e acréscimo gerais em total de compras, saídas e caixa |
| Dashboard operacional | Usa `ValorTotal do item ÷ Quantidade × QuantidadePendente` | Considera ajustes do item, mas ignora o rateio dos ajustes gerais |
| Gráfico Compras por Período | Soma `Compra.Total()` | Herda a ausência dos ajustes gerais |
| Tela `/compras` sem filtros | Converte trânsito para lista com `totalCompra: 0` | Fabrica ausência como zero |
| Formatação da lista | Trata qualquer valor `<= 0` como “Valor não informado” | Confunde zero legítimo com indisponibilidade |
| Valores da operação | Caixa + recebíveis + estoque disponível | Não inclui mercadorias em trânsito |

### Decision

Corrigir todas as leituras para a fórmula oficial e eliminar a adaptação `totalCompra: 0`. O cálculo permanece derivado dos dados existentes; nenhum total será persistido.

### Rationale

Os valores comerciais necessários já existem em `Compra` e `CompraItem`. Persistir outro total criaria risco de divergência e exigiria migração ou sincronização desnecessária.

### Alternatives considered

- **Persistir total e valor pendente**: rejeitado por duplicar dados derivados e exigir estratégia de atualização histórica.
- **Corrigir somente o frontend**: rejeitado porque manteria quatro regras conflitantes no backend.
- **Usar apenas o endpoint de detalhe para completar cada linha**: rejeitado por criar chamadas N+1 e deslocar composição de contrato para o cliente.

## 2. Regra oficial de total da compra

### Decision

Adotar:

```text
BrutoItem = QuantidadeComprada × CustoUnitario
LiquidoItem = BrutoItem - DescontoItem + AcrescimoItem
TotalCompra = Σ LiquidoItem - DescontoGeral + AcrescimoGeral
```

`Compra.Total()` passará a aplicar a fórmula completa. Listagem, detalhe, dashboard financeiro e gráfico deverão produzir o mesmo resultado.

### Rationale

A regra coincide com a decisão de produto, com o modelo persistido e com o padrão já usado em vendas.

### Alternatives considered

- **Aplicar ajustes gerais antes dos ajustes por item**: matematicamente ambíguo e incompatível com os campos atuais.
- **Ignorar ajustes por item ou gerais em relatórios**: mantém a divergência que originou a feature.

## 3. Rateio proporcional e arredondamento

### Decision

Ratear desconto geral e acréscimo geral separadamente, usando como peso o valor líquido do item antes dos ajustes gerais:

```text
PesoItem = LiquidoItem ÷ Σ LiquidoItem
DescontoGeralItem = DescontoGeral × PesoItem
AcrescimoGeralItem = AcrescimoGeral × PesoItem
TotalRateadoItem = LiquidoItem - DescontoGeralItem + AcrescimoGeralItem
ValorPendenteItem = TotalRateadoItem × (QuantidadePendente ÷ QuantidadeComprada)
```

Cada rateio monetário será arredondado para duas casas com `MidpointRounding.AwayFromZero`. O resíduo de centavos de cada ajuste geral será atribuído deterministicamente ao último item elegível quando ordenado por identificador. O valor pendente de cada item será arredondado para duas casas antes da soma.

Se `Σ LiquidoItem <= 0` e existir ajuste geral diferente de zero, o rateio será considerado indisponível e a causa deverá ser explícita; o sistema não retornará zero artificial.

### Rationale

O peso preserva a participação comercial de cada item, o fechamento reconstrói exatamente os ajustes gerais e a ordem estável torna o resultado repetível.

### Alternatives considered

- **Rateio por quantidade**: distorce compras com produtos de custos muito diferentes.
- **Rateio por valor bruto**: ignora descontos e acréscimos específicos já atribuídos aos itens.
- **Não arredondar até a apresentação**: pode produzir divergência de centavos entre itens exibidos e total oficial.
- **Atribuir resíduo ao item de maior valor**: válido, porém menos simples que uma ordem estável já disponível.

## 4. Quantidade pendente e data de referência

### Decision

A quantidade pendente em uma posição histórica será:

```text
QuantidadeComprada
- Recebimentos com DataRecebimento <= DataReferencia
- Perdas com DataPerda <= DataReferencia
```

Compras canceladas ficam excluídas. O filtro deve acontecer no banco e materializar somente compras com alguma pendência na data consultada.

### Rationale

Preserva a leitura histórica já utilizada pelo dashboard e impede que o status atual de uma compra recebida posteriormente apague o trânsito que existia na data de referência.

### Alternatives considered

- **Usar somente `Compra.Status` atual**: incorreto para posições históricas.
- **Usar somente `CompraItem.QuantidadePendente` atual**: ignora eventos posteriores à data consultada.

## 5. Valorização de trânsito ao custo e à venda

### Decision

- **Ao custo**: soma dos valores pendentes rateados dos itens.
- **Ao preço de venda**: soma de `QuantidadePendente × Produto.PrecoVenda` na data da consulta.
- `PrecoVenda = 0` é um valor legítimo, pois o cadastro exige valor não negativo; não significa dado ausente.
- Relação ausente com `Produto` ou projeção sem preço esperado é inconsistência de dados: o valor ao preço de venda e o valor potencial ficam indisponíveis com motivo explícito.
- Se qualquer compra pendente não permitir rateio válido, o valor oficial de trânsito ao custo e o valor realista ficam indisponíveis. Um subtotal calculável pode ser mantido somente no campo legado, acompanhado por indicador de incompletude e motivo; nunca deve parecer o total oficial.
- Mercadoria em trânsito permanece fora de estoque disponível e custo médio.

### Rationale

O custo representa capital comercial ainda em trânsito; o preço atual representa potencial bruto se os itens fossem recebidos e vendidos pelo preço vigente.

### Alternatives considered

- **Usar custo cadastral do produto**: rejeitado; a compra já possui o custo comercial real.
- **Usar preço de venda congelado na compra**: não existe snapshot e criá-lo ampliaria schema e escopo.
- **Incluir trânsito no estoque valorizado**: viola a regra constitucional de estoque físico.

## 6. Estratégia de consultas e fonte única

### Decision

Criar uma política pura de cálculo financeiro de compra no Domain e usá-la em entidades, mappers e handlers que trabalham com compras materializadas. Consultas gerenciais de grande volume continuarão agregadas no repositório de leitura e deverão espelhar a mesma fórmula documentada. Para trânsito, o repositório filtrará e projetará somente itens pendentes e seus agregados de recebimento/perda antes de aplicar o fechamento monetário por compra.

### Rationale

Uma política pura impede novas variantes nas leituras operacionais. A projeção especializada preserva escalabilidade sem carregar entidades e histórico completos.

### Alternatives considered

- **Carregar todas as compras e calcular em memória**: rejeitado pelo princípio de analytics e escalabilidade.
- **Expressão SQL única invocada por todos os caminhos**: rejeitada porque o domínio não deve depender do provedor de persistência e a tradução de rateio com resíduo aumentaria muito a complexidade.
- **Nova biblioteca de expressões**: rejeitada por não justificar uma dependência adicional.

## 7. Evolução de contratos

### Decision

- Preservar campos existentes.
- Adicionar `totalCompra` e `valorPendenteCusto` à compra em trânsito.
- Adicionar valores anuláveis de trânsito ao custo e à venda, indicadores de completude e motivos de indisponibilidade aos contratos gerenciais.
- Manter `mercadoriasEmTransitoValor` como subtotal legado calculável; quando o valor oficial estiver incompleto, o novo indicador de completude e o motivo impedem que esse subtotal seja interpretado como total.
- Atualizar as fórmulas de valor realista e potencial.
- Tornar valor realista nulo quando o custo de trânsito estiver incompleto e valor potencial nulo quando a valorização à venda estiver incompleta; avisos gerenciais devem carregar a causa.
- Manter endpoints e campos de alertas, embora a home deixe de consultá-los e renderizá-los.

### Rationale

A estratégia corrige consumidores atuais sem remover contratos que podem ser reutilizados quando alertas acionáveis forem especificados.

### Alternatives considered

- **Renomear ou remover campos existentes**: rejeitado por quebra desnecessária.
- **Remover endpoints de alertas**: rejeitado; o escopo aprovado é limpeza da home, não descontinuação da capacidade.

## 8. Limpeza da home

### Decision

Remover da home:

- consulta e renderização do resumo de alertas;
- bloco “Dados financeiros incompletos”;
- bloco “Estoque com lacunas de custo”.

Os avisos permanecerão nos contratos e nas seções de ranking/gráfico que ainda os utilizam. O componente exclusivo de resumo de alertas poderá ser excluído se ficar sem consumidor.

### Rationale

Reduz ruído e uma chamada de rede sem apagar informações ou endpoints que poderão sustentar uma futura experiência acionável.

### Alternatives considered

- **Ocultar por CSS**: rejeitado porque manteria consulta e complexidade sem valor.
- **Criar a tela de alertas agora**: rejeitado por estar explicitamente fora do escopo.

## 9. Persistência, migração e testes

### Decision

Não criar migration, backfill ou nova infraestrutura de testes. Validar com builds e o roteiro manual detalhado. Os totais históricos mudarão apenas quando lidos pela fórmula corrigida; registros persistidos permanecerão intactos.

### Rationale

Todos os campos de origem já existem. A decisão do produto proíbe infraestrutura automatizada nova nesta entrega.

### Alternatives considered

- **Migration de total calculado**: rejeitada por persistir derivação.
- **Projeto de testes novo**: rejeitado por ausência de autorização explícita.
