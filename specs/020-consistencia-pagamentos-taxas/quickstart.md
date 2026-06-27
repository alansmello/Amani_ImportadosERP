# Quickstart: Validação da F020

## Objetivo

Validar manualmente a consistência entre os dois acessos ao pagamento, a liquidação integral de Crédito, a restrição de taxa ao Débito, o total consolidado de taxas em despesas de operadora e a ausência de regressão nas demais formas.

Referências:

- [Especificação](./spec.md)
- [Modelo de dados](./data-model.md)
- [Contrato de Contas a Receber](./contracts/contas-receber.md)
- [Contrato de Configurações](./contracts/configuracoes-formas-pagamento.md)
- [Contrato de Despesas de Operadora](./contracts/despesas-operadora.md)

## Pré-requisitos

- PostgreSQL de desenvolvimento disponível e configuração de conexão válida.
- Migration da F015 já aplicada antes da migration de normalização da F020.
- Usuário autenticado no ERP.
- Produtos com estoque suficiente e um Cliente ativo para criar vendas de validação.
- Nenhuma infraestrutura nova de testes automatizados é necessária ou autorizada para esta feature.

## Verificações estáticas

Na raiz do repositório:

```powershell
dotnet build Amani_ImportadosERP.sln
```

Em `frontend/`:

```powershell
npm run lint
npm run typecheck
npm run build
```

Resultado esperado: todos os comandos finalizam sem erro.

## Preparação dos dados

1. Aplicar as migrations pendentes no banco de desenvolvimento.
2. Confirmar em Configurações que Débito mantém sua taxa e Dinheiro, PIX, Crédito e Fiado aparecem com zero.
3. Criar vendas pequenas para Dinheiro, PIX, Débito, Crédito e Fiado.
4. Criar uma conta manual para um Cliente.
5. Para Crédito, usar valor bruto de fácil conferência, por exemplo R$ 100,00.

## Cenário 1 — Mesma experiência pelos dois acessos

Iniciar um cronômetro ao abrir o primeiro modal.

1. Abrir `/financeiro/contas-receber` e localizar a venda em Crédito.
2. Abrir Pagamento e registrar quais campos e valores são exibidos; cancelar.
3. Abrir a visão por Cliente, acessar `Ver contas` para o mesmo Cliente e abrir Pagamento na mesma conta.
4. Comparar título, orientação, bruto, campo líquido, prévia da despesa e ações.

Resultado esperado: os dois caminhos exibem o mesmo fluxo; não aparecem desconto, bruto editável ou percentual manual para Crédito; o usuário consegue concluir o recebimento em até 60 segundos quando efetivamente confirmar a operação.

## Cenário 2 — Liquidação integral de Crédito com taxa

1. Em uma conta de Crédito com saldo R$ 100,00, informar líquido R$ 96,50.
2. Confirmar que a prévia mostra despesa R$ 3,50.
3. Confirmar o pagamento.
4. Consultar lista geral, detalhe do Cliente, histórico e despesas de operadora.

Cronometrar o intervalo entre a confirmação bem-sucedida e a exibição dos dados atualizados nas consultas relacionadas.

Resultado esperado:

- conta sem saldo pendente e status Pago;
- pagamento com líquido R$ 96,50 e bruto liquidado R$ 100,00;
- uma despesa de R$ 3,50 vinculada à Venda;
- percentual efetivo derivado de 3,5%;
- dados atualizados sem refresh manual em até 2 segundos no ambiente local.

## Cenário 3 — Crédito sem taxa

1. Em outra conta de Crédito, informar líquido igual ao saldo bruto.
2. Confirmar.

Resultado esperado: conta integralmente paga e nenhuma despesa de operadora criada.

## Cenário 4 — Rejeições de Crédito

Executar separadamente:

- líquido vazio;
- líquido zero;
- líquido negativo;
- líquido maior que o bruto;
- bruto liquidado diferente do saldo usando o contrato diretamente;
- desconto diferente de zero usando o contrato diretamente;
- novo pagamento em conta já paga.

Resultado esperado: cada tentativa é recusada com mensagem operacional e não altera saldo, histórico ou despesas.

## Cenário 4.1 — Conta sem forma de pagamento identificável

1. Usar uma conta manual ou preparar, apenas no banco de desenvolvimento controlado, uma conta cuja Venda vinculada não possa fornecer forma de pagamento.
2. Abrir Pagamento pelos acessos disponíveis.
3. Registrar um pagamento simples com valor e, quando aplicável, desconto.

Resultado esperado: a conta não é presumida como Crédito, não mostra campos de operadora e não gera `DespesaOperadora`.

## Cenário 5 — Configuração exclusiva de Débito

Iniciar um cronômetro antes de editar a taxa válida de Débito.

1. Abrir `/configuracoes` na aba de taxas.
2. Confirmar que apenas Débito possui input e ação de salvar.
3. Atualizar Débito para 2,50% e recarregar a consulta.
4. Tentar valores `-1`, `100` e valor inválido.
5. Tentar atualizar Dinheiro, PIX, Crédito e Fiado usando o contrato diretamente.

Resultado esperado:

- 2,50% é persistido para Débito;
- a consulta e atualização válida são concluídas em até 30 segundos;
- valores inválidos preservam 2,50%;
- demais formas recusam atualização e permanecem zero;
- Crédito informa que a taxa é apurada no recebimento.

## Verificação da migration de normalização

1. Confirmar que `Up` altera somente `PercentualTaxa` das formas diferentes de Débito para zero.
2. Confirmar que nenhuma tabela, coluna, índice ou relacionamento é criado, removido ou alterado.
3. Confirmar que `AmaniDbContextModelSnapshot.cs` permanece semanticamente inalterado.
4. Inspecionar `Down` e confirmar que ele não restaura percentuais desconhecidos nem reescreve histórico financeiro.

Resultado esperado: normalização somente de dados, sem mudança de schema e sem fabricação de valores anteriores.

## Cenário 6 — Regressão das demais formas

| Forma/origem | Ação | Resultado esperado |
| --- | --- | --- |
| Dinheiro | Confirmar Venda | Conta criada e paga pelo bruto; sem despesa |
| PIX | Confirmar Venda | Conta criada e paga pelo bruto; sem despesa |
| Débito com taxa | Confirmar Venda | Conta paga pelo bruto, líquido recebido e despesa automática coerentes |
| Fiado | Registrar pagamento simples | Valor/desconto reduzem saldo; sem despesa de operadora |
| Conta manual | Registrar pagamento simples | Valor/desconto reduzem saldo; sem despesa de operadora |

## Cenário 7 — Responsividade e proteção contra repetição

Repetir os cenários principais em larguras de smartphone, tablet e desktop. Durante uma confirmação, tentar acionar o botão novamente.

Resultado esperado: valores e ações permanecem legíveis, o modal cabe na viewport com rolagem quando necessária e a ação fica bloqueada enquanto o pagamento está em processamento.

## Cenário 8 — Total consolidado de taxas por filtro

1. Abrir `/financeiro/despesas-operadora` sem filtro de forma e aplicar um período com despesas de Débito e Crédito.
2. Registrar o total consolidado exibido.
3. Somar manualmente os valores de despesa listados para confirmar equivalência.
4. Repetir aplicando filtro apenas `CartaoDebito`.
5. Repetir aplicando filtro apenas `CartaoCredito`.
6. Aplicar um período sem despesas.

Resultado esperado:

- a tela exibe o resumo com o rótulo `Total de taxas`;
- o total consolidado corresponde à soma das linhas exibidas no mesmo recorte;
- no filtro sem forma, o total contempla Débito e Crédito;
- nos filtros por forma, o total contempla somente a forma selecionada;
- quando não houver itens, o total exibido é zero.

## Evidências a registrar

- Saída dos quatro comandos de qualidade.
- Capturas dos dois acessos ao modal de Crédito.
- Valores antes/depois da conta e da despesa.
- Resultado das tentativas inválidas.
- Resultado visual nos três breakpoints.

## Evidências de execução

### Baseline anterior à implementação — 26/06/2026

- `dotnet build Amani_ImportadosERP.sln`: concluído com 0 erros e 32 avisos preexistentes. Entre os avisos estão indisponibilidade do feed privado apenas para auditoria de vulnerabilidades (`NU1900`) e construtores protegidos em tipos selados (`CS0628`).
- `npm run lint`: concluído sem erros.
- `npm run typecheck`: concluído sem erros.
- `npm run build`: concluído sem erros; 26 páginas estáticas geradas e rotas dinâmicas compiladas.

### Execução durante implementação da US2/US3 — 26/06/2026

- `dotnet build Amani_ImportadosERP.sln`: falhou por dependência externa de autenticação no feed privado (`NU1301` / `401 Unauthorized` em `https://pkgs.dev.azure.com/mongeral/_packaging/Nuget-Mongeral/nuget/v3/index.json`), sem evidência de erro de compilação de código local.
- `dotnet build src/Amani.ImportadosERP.Api/Amani.ImportadosERP.Api.csproj --no-restore`: mesma falha de feed privado (`NU1301` / `401 Unauthorized`).
- `npm run lint` (frontend): concluído sem erros.
- `npm run typecheck` (frontend): concluído sem erros.
- `npm run build` (frontend): concluído sem erros; build de produção gerado com sucesso.

### Revisão de conformidade e impacto — 26/06/2026

- Migration `NormalizeNonDebitPaymentFees`: somente `UPDATE` de dados em `configuracoes_formas_pagamento`, sem criação/remoção de tabela, coluna, índice ou relacionamento.
- Contratos mantidos conforme `contracts/contas-receber.md` e `contracts/configuracoes-formas-pagamento.md`: edição de taxa limitada a Débito, Crédito com taxa apurada no recebimento.
- Preservação de histórico: sem reescrita de `Venda.PercentualTaxaAplicado` nem de `DespesaOperadora` histórica; `Down` da migration não inventa percentuais antigos.
- Gate constitucional: sem alteração em fluxo de estoque, compras, recebimentos físicos ou custo médio; mudanças concentradas em regras financeiras de venda/recebimento e UI correspondente.
