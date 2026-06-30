# Quickstart: Validação da Revisão do Dashboard Gerencial

## Prerequisites

- .NET SDK 8
- Node.js compatível com Next.js 15 e npm
- Instância local do PostgreSQL e configuração normal da API
- Branch `023-revisao-dashboard-gerencial`

Use [data-model.md](data-model.md) para fórmulas/invariantes e [dashboard-gerencial.openapi.yaml](contracts/dashboard-gerencial.openapi.yaml) para o contrato HTTP esperado.

Esta feature não cria projeto, framework, dependência ou infraestrutura de testes unitários ou de integração. A validação abaixo é composta por build, análise estática, revisão de migration e roteiro manual.

## 1. Backend build

Na raiz do repositório:

```powershell
dotnet restore Amani_ImportadosERP.sln
dotnet build Amani_ImportadosERP.sln --configuration Release --no-restore
```

Expected: todos os projetos de produção compilam sem erros ou warnings novos atribuíveis à F023.

## 2. Migration and query review

Gerar o script idempotente da migration da F023 sem aplicá-lo em produção:

```powershell
New-Item -ItemType Directory -Force -Path artifacts | Out-Null
dotnet ef migrations script --idempotent --project src/Amani.ImportadosERP.Infra.Data --startup-project src/Amani.ImportadosERP.Api --output artifacts/f023-dashboard-indexes.sql
```

Expected:

- somente criação/remoção de índices da F023;
- nenhuma alteração ou exclusão de dados;
- nenhuma coluna fixa de saldo de estoque;
- rollback remove apenas os índices adicionados;
- consultas financeiras e patrimoniais agregam no PostgreSQL sem materializar históricos completos.

Revisar os planos de execução das consultas principais em base local representativa e manter somente índices efetivamente utilizados.

## 3. Frontend static validation

```powershell
Set-Location frontend
npm ci
npm run lint
npm run typecheck
npm run build
Set-Location ..
```

Expected: nenhuma violação de lint/tipos e build de produção concluído.

## 4. Run locally

Em terminais separados:

```powershell
dotnet run --project src/Amani.ImportadosERP.Api
```

```powershell
Set-Location frontend
npm run dev
```

Autenticar com usuário autorizado e abrir a home `/`.

## 5. Manual financial scenarios

### 5.1 Faturamento versus entradas

1. Registrar no mesmo período uma venda Dinheiro/PIX e uma venda Crédito/Fiado ainda não recebida.
2. Consultar o Dashboard.
3. Confirmar que Faturamento inclui ambas e Entradas inclui apenas pagamentos efetivamente registrados.
4. Registrar posteriormente o pagamento da venda a prazo e confirmar que ele aparece pela data do pagamento.

### 5.2 Saídas estimadas

1. Registrar compra não cancelada e despesa no período.
2. Confirmar `Saídas = compras + despesas`.
3. Confirmar o rótulo “Compras e despesas registradas no período (estimativa)”.
4. Confirmar que despesa de operadora não é adicionada novamente.

### 5.3 Caixa e implantação

1. Consultar período anterior ao saldo inicial: caixa inicial e ajuste devem ser zero.
2. Consultar período que contém a data do saldo: caixa inicial deve ser zero; ajuste deve receber o saldo; caixa final deve incluí-lo.
3. Consultar período posterior: o saldo deve compor caixa inicial e ajuste deve ser zero.
4. Conferir `CaixaFinal = CaixaInicial + Ajuste + Entradas - Saídas`.

### 5.4 Recebíveis

1. Preparar uma conta vencida, uma a vencer e pagamentos parciais com/sem desconto.
2. Confirmar que a liquidação usa valor bruto liquidado.
3. Confirmar `Abertas = Vencidas + A Vencer`.
4. Trocar somente o início do filtro, preservando a data de referência, e confirmar que o snapshot não muda.

### 5.5 Estoque valorizado

1. Registrar inventário inicial e recebimento de compra com custo.
2. Confirmar aumento do valor ao custo e ao preço de venda.
3. Registrar venda e confirmar redução pelo saldo de movimentações.
4. Registrar compra ainda em trânsito e confirmar que ela não altera o estoque valorizado.
5. Preparar produto com saldo positivo, preço de venda e sem custo médio; confirmar que entra no potencial de venda, fica fora do lucro potencial e aparece na quantidade/valor sem custo.

## 6. Compatibility and partial failure

1. Validar que todos os campos antigos continuam presentes e com a mesma semântica.
2. Simular resposta sem um campo novo e confirmar “Indisponível” no card, nunca `R$ 0,00`.
3. Forçar falha isolada nas fontes financeiro, operacional, rankings, alertas e gráficos, uma por vez.
4. Confirmar que as demais seções continuam visíveis e que a tentativa de recarga afeta apenas a seção com erro.
5. Trocar rapidamente o filtro e confirmar que resposta stale não é renderizada.

## 7. Manual performance validation

Em base local representativa, com volume próximo da meta de até 100 mil registros por histórico:

1. Abrir as ferramentas de rede do navegador.
2. Aplicar filtros de mês, ano e intervalo personalizado.
3. Repetir cada consulta pelo menos 20 vezes, descartando a primeira medição de aquecimento.
4. Registrar duração, ambiente, versão do PostgreSQL e volume por tabela.
5. Ordenar as durações e confirmar que pelo menos 95% ficam em até 3 segundos por seção.

Se o volume local for menor, registrar a limitação e complementar a revisão com planos de execução das consultas agregadas; não criar infraestrutura automatizada para suprir essa lacuna nesta feature.

## 8. UX and responsive validation

Validar pelo menos:

- smartphone: 390 x 844;
- tablet: 768 x 1024;
- desktop: 1440 x 900.

Expected:

- sem rolagem horizontal da página;
- filtro acessível e operável;
- leitura em até 30 segundos de faturamento, entradas, saídas, caixa final, recebíveis, estoque e valor da operação;
- alertas exibidos apenas como resumo por total, severidade e tipo;
- rankings de maior/menor estoque ausentes da home;
- mensagens vazias: “Sem dados no período” ou “Não há movimentações suficientes para gerar este gráfico.”;
- Dark Theme e estados `loading`, `error`, `empty`, `incomplete` consistentes com o Design System.

## Exit Criteria

- Backend e frontend compilam com sucesso.
- Lint e verificação de tipos passam.
- Migration foi revisada e é somente aditiva.
- Todos os cenários financeiros e patrimoniais conferem com o contrato na validação manual.
- Desempenho e ambiente de medição foram registrados.
- Roteiro manual passou nos três viewports.
- Nenhum campo existente foi removido ou teve semântica alterada.
