# Research: Consistência de Pagamentos e Taxas de Operadora

## Decision: Propagar a forma de pagamento no detalhe por cliente

**Decision**: O detalhe de contas por cliente passa a projetar a forma de pagamento da Venda vinculada, usando o mesmo valor canônico já exposto na lista geral. Contas sem Venda ou sem forma identificável retornam valor nulo.

**Rationale**: A ausência desse contexto é a causa direta do ramo legado. Disponibilizar o dado no contrato elimina inferência no frontend e permite que todos os acessos usem o mesmo modal.

**Alternatives considered**:

- Buscar a Venda separadamente pelo frontend: rejeitado por duplicar consultas e coordenação de estado.
- Inferir Crédito pela origem ou vencimento: rejeitado porque esses dados não identificam a forma com segurança.
- Criar um segundo modal para o detalhe por cliente: rejeitado por perpetuar duplicidade.

## Decision: Liquidação integral de Crédito é validada no backend

**Decision**: Para uma conta vinculada a Venda em `CartaoCredito`, `ValorBrutoLiquidado` deve ser informado e ser exatamente igual ao saldo bruto restante; `Desconto` deve ser zero; `Valor` representa o líquido recebido e deve estar no intervalo `0 < Valor <= saldo`.

**Rationale**: O backend precisa distinguir uma liquidação integral com taxa de uma tentativa de pagamento parcial. Confiar apenas no valor líquido não permite essa distinção.

**Alternatives considered**:

- Backend assumir sempre todo o saldo, ignorando o bruto recebido: rejeitado porque qualquer valor líquido baixo seria aceito como taxa sem declarar a intenção de liquidar integralmente.
- Permitir parcial e gerar uma despesa por parcela: rejeitado por decisão explícita de escopo.
- Usar desconto para fechar a diferença: rejeitado porque desconto comercial e custo de operadora são eventos diferentes.

## Decision: Percentual efetivo de Crédito é sempre derivado

**Decision**: O contrato suportado de pagamento deixa de aceitar percentual manual de operadora. Para Crédito, o percentual é derivado de `(bruto - líquido) / bruto * 100`, com a precisão financeira já usada por `DespesaOperadora`. O campo deixa de ser enviado pelo frontend e deixa de participar do comando de pagamento.

**Rationale**: O valor monetário realizado é a fonte confiável. Aceitar percentual manual permite metadado incompatível com a despesa efetivamente registrada.

**Alternatives considered**:

- Manter override manual como precedência: rejeitado por permitir divergência entre percentual e valores.
- Usar a antiga taxa configurada de Crédito: rejeitado porque a regra aprovada apura a taxa no recebimento.
- Manter o campo no contrato como ignorado: rejeitado por comunicar uma capacidade que não existe.

## Decision: Somente Débito aceita atualização de configuração

**Decision**: A entidade de configuração preserva uma linha por forma, mas somente `CartaoDebito` aceita percentual no intervalo `0 <= taxa < 100`. As demais formas permanecem em zero e qualquer tentativa de atualização é recusada.

**Rationale**: Manter as cinco linhas preserva o contrato de leitura e simplifica a tela informativa, enquanto a invariável no backend impede configuração sem efeito.

**Alternatives considered**:

- Remover as quatro configurações do banco e da resposta: rejeitado por ampliar a mudança estrutural e exigir tratamento de ausência em consumidores existentes.
- Permitir salvar zero em qualquer forma: rejeitado porque ainda caracterizaria edição de uma configuração não aplicável.
- Validar somente no frontend: rejeitado porque outros consumidores poderiam gravar valores inválidos.

## Decision: Normalizar dados legados com migration de dados

**Decision**: Criar migration sem mudança de schema que zera `PercentualTaxa` onde `FormaPagamento <> CartaoDebito`. A reversão não deve inventar percentuais históricos; o `Down` não restaura valores desconhecidos.

**Rationale**: Já existe seed de 3,49% para Crédito e ambientes migrados precisam convergir para a nova regra. Alterar apenas o seed antigo não corrige bancos existentes.

**Alternatives considered**:

- Editar a migration F015: rejeitado porque migrations aplicadas são histórico imutável.
- Normalizar apenas na leitura: rejeitado porque o banco continuaria contendo regra inválida.
- Normalizar no startup: rejeitado por introduzir escrita implícita a cada inicialização.

## Decision: Preservar a transação de pagamento e despesa

**Decision**: Pagamento e eventual `DespesaOperadora` continuam registrados dentro do `IUnitOfWork`. Todas as validações de saldo, forma e valores ocorrem antes da transação; falha de persistência reverte o conjunto.

**Rationale**: Um recebimento de Crédito sem a despesa correspondente, ou vice-versa, viola a consistência financeira e a preservação de histórico.

**Alternatives considered**:

- Salvar pagamento e despesa em operações independentes: rejeitado pelo risco de estado parcial.
- Compensar posteriormente em caso de falha: rejeitado por complexidade desnecessária para uma operação local.

## Decision: Atualizar os caches financeiros relacionados após sucesso

**Decision**: A mutation de pagamento invalida a lista geral, agrupamento por cliente, detalhes por cliente e despesas de operadora por meio dos prefixos de consulta existentes.

**Rationale**: O requisito exige dados atualizados sem recarregamento manual. A infraestrutura atual já oferece invalidação por prefixo, sem necessidade de estado paralelo.

**Alternatives considered**:

- Atualizar manualmente cada objeto em cache: rejeitado por aumentar risco de inconsistência.
- Recarregar a página inteira: rejeitado por piorar a experiência operacional.

## Decision: Reutilizar componentes e validação manual existente

**Decision**: O único modal de pagamento e o formulário de taxas existentes serão refinados. Não será adicionada dependência de UI nem infraestrutura de testes automatizados; a validação usará build, lint, typecheck e o roteiro manual da feature.

**Rationale**: A solução existente já possui modal, formulários, estados e cache suficientes. O roadmap proibiu nova infraestrutura automatizada para F020–F022.

**Alternatives considered**:

- Criar modal específico para Crédito: rejeitado por duplicar comportamento.
- Adicionar biblioteca de formulários: rejeitado porque o formulário é pequeno e a dependência não remove complexidade real.
- Introduzir suíte de testes nesta feature: rejeitado por decisão explícita do responsável.

