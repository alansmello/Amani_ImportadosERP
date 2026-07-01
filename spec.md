# Amani ERP - Especificacao Oficial

## Visao Geral

O Amani ERP e um sistema de gestao comercial e operacional desenvolvido para a
Amani Importados.

O objetivo e controlar o ciclo operacional da empresa, desde a compra de
produtos ate a venda ao cliente final, mantendo rastreabilidade de estoque,
custos e lucratividade.

O sistema usa Clean Architecture e DDD Lite, permitindo crescimento futuro para
um ERP completo ou SaaS.

---

## Objetivos

* Gerenciar cadastros base de clientes, fornecedores, categorias e produtos
* Gerenciar compras de fornecedores
* Controlar estoque por movimentacoes
* Gerenciar vendas para clientes
* Calcular custo medio dos produtos
* Calcular lucro das vendas
* Controlar despesas operacionais e contas a receber
* Disponibilizar dashboards gerenciais
* Servir como base para futuras integracoes com marketplaces

---

## Arquitetura

### Backend

* .NET 8
* ASP.NET Core
* Entity Framework Core
* PostgreSQL

### Frontend

* React
* Next.js

### Padroes Arquiteturais

* Clean Architecture
* DDD Lite
* Repository Pattern
* DTO Pattern
* Fluent API

---

## Estrutura da Solucao

* Amani.ImportadosERP.Api
* Amani.ImportadosERP.Application
* Amani.ImportadosERP.Domain
* Amani.ImportadosERP.Infra.Data
* Amani.ImportadosERP.Infra.IoC

---

## Modulo 1 - Cadastros Base

Status: concluido na Feature 001 - Cadastros Base.

### Clientes

Responsabilidades:

* Cadastro de clientes
* Consulta de clientes
* Atualizacao de clientes
* Inativacao de clientes sem excluir historico

Entidade:

* Cliente

### Fornecedores

Responsabilidades:

* Cadastro de fornecedores
* Consulta de fornecedores
* Atualizacao de fornecedores

Entidade:

* Fornecedor

### Categorias

Responsabilidades:

* Cadastro de categorias
* Consulta de categorias
* Atualizacao de categorias
* Organizacao dos produtos

Entidade:

* Categoria

### Produtos

Responsabilidades:

* Cadastro de produtos
* Consulta de produtos
* Atualizacao de produtos
* Associacao com categoria
* Associacao opcional com fornecedor
* Definicao de preco de venda

Entidade:

* Produto

Observacao pendente:

* Decidir em feature futura se novas vendas devem rejeitar clientes inativos.

---

## Modulo 2 - Compras

Responsabilidades:

* Registro de compras
* Entrada de produtos no estoque
* Historico de compras
* Consulta por periodo
* Consulta por fornecedor

Entidades:

* Compra
* CompraItem

Regras:

* Quantidade deve ser maior que zero
* Custo unitario nao pode ser negativo
* Toda compra gera movimentacao de entrada no estoque

---

## Modulo 3 - Estoque

O sistema nao possui campo fixo de estoque em produto.

O saldo de estoque e calculado por movimentacoes:

```text
Entradas - Saidas
```

Entidade:

* EstoqueMovimentacao

Regras:

* Toda compra gera entrada
* Toda venda gera saida
* Nenhuma alteracao manual de saldo
* Todo historico deve ser preservado

---

## Modulo 4 - Vendas

Responsabilidades:

* Registro de vendas
* Saida automatica do estoque
* Validacao de estoque disponivel
* Calculo de lucro

Entidades:

* Venda
* VendaItem

Regras:

* Nao permitir venda sem estoque
* Quantidade deve ser maior que zero
* Preco deve ser valido
* Toda venda gera saida de estoque

---

## Modulo 5 - Custos e Lucro

Calculo de custo medio:

```text
Custo medio = soma(valor x quantidade) / soma(quantidade)
```

Calculo de lucro:

```text
Lucro = (preco de venda - custo medio) x quantidade
```

---

## Modulo 6 - Financeiro

Responsabilidades:

* Registro de despesas operacionais
* Controle de despesas por categoria
* Controle de contas a receber
* Registro de pagamentos recebidos
* Relatorios financeiros

Entidades:

* Despesa
* CategoriaDespesa
* ContaReceber
* PagamentoRecebido

---

## Modulo 7 - Dashboard

Responsabilidades:

* Indicadores financeiros
* Indicadores operacionais

Metricas:

* Receita por periodo
* Lucro por periodo
* Compras por periodo
* Despesas por periodo
* Produtos mais vendidos
* Produtos com baixo estoque
* Produtos mais lucrativos

---

## Endpoints Disponiveis

### Clientes

* POST /api/clientes
* GET /api/clientes
* GET /api/clientes/{id}
* PUT /api/clientes/{id}
* POST /api/clientes/{id}/inativar

### Fornecedores

* POST /api/fornecedores
* GET /api/fornecedores
* GET /api/fornecedores/{id}
* PUT /api/fornecedores/{id}

### Categorias

* POST /api/categorias
* GET /api/categorias
* GET /api/categorias/{id}
* PUT /api/categorias/{id}

### Produtos

* POST /api/produtos
* GET /api/produtos
* GET /api/produtos/{id}
* PUT /api/produtos/{id}

### Compras

* POST /api/Compra
* GET /api/Compra
* GET /api/Compra/{id}

### Vendas

* POST /api/Vendas
* GET /api/Vendas
* GET /api/Vendas/{id}
* GET /api/Vendas/dashboard
* POST /api/Vendas/{id}/cancelar

### Despesas

* POST /api/Despesas
* GET /api/Despesas

### Contas a Receber

* POST /api/contas-receber
* GET /api/contas-receber
* GET /api/contas-receber/por-cliente
* GET /api/contas-receber/cliente/{clienteId}
* PUT /api/contas-receber/{id}
* DELETE /api/contas-receber/{id}
* POST /api/contas-receber/{id}/pagamentos

### Dashboard

* GET /api/dashboard-financeiro

---

## Diretrizes Obrigatorias

* Nao utilizar AutoMapper
* Utilizar DTOs para entrada e saida
* Controllers sem regras de negocio
* Regras concentradas na camada Application e Domain
* Utilizar Fluent API para mapeamentos EF
* Utilizar Repository Pattern
* Preservar historico operacional
* Evitar acoplamento entre modulos

---

## Status Atual

Implementado:

* Cadastros base de clientes, fornecedores, categorias e produtos
* Compras
* Vendas
* Estoque por movimentacao
* Calculo de custo medio
* Calculo de lucro
* Validacao de estoque
* Despesas
* Contas a receber e pagamentos recebidos
* Dashboard operacional e dashboard financeiro

Feature planejada/em análise:

* 024-apresentacoes-fracionadas — Apresentações Comerciais e Conversão Fracionada de Estoque
* Conversão autoritativa por numerador/denominador; decimal apenas como projeção
* Sem migração ou recálculo do histórico existente
* Implementação autorizada sem novo projeto de testes; rollout depende de builds e validação manual completa

Feature concluida mais recente:

* 001-cadastros-base

Proxima prioridade:

* Revisar e aprovar a documentação da Feature 024 antes de qualquer implementação

Observacao:

* A Feature 024 deve garantir que 4 ampolas de 1/4 e 24 doses de 1/24 correspondam exatamente a 1 caixa, inclusive em operações separadas.
* O rollback após a primeira venda fracionada é lógico: desabilitar a feature e manter leitura compatível; não executar reversão destrutiva de schema ou histórico.

---

## Evolucoes Futuras

* Fluxo de caixa
* Contas a pagar
* Autenticacao e autorizacao
* Multiusuario
* Integracao Mercado Livre
* Integracao Shopee
* Integracao TikTok Shop
* Emissao de NF-e
* Aplicativo mobile
* Plataforma SaaS
