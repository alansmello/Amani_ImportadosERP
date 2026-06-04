# Amani ERP - Especificação Oficial

## Visão Geral

O Amani ERP é um sistema de gestão comercial e operacional desenvolvido para a Amani Importados.

O objetivo é controlar todo o ciclo operacional da empresa, desde a compra de produtos até a venda ao cliente final, mantendo rastreabilidade completa de estoque, custos e lucratividade.

O sistema foi projetado utilizando Clean Architecture e DDD Lite, permitindo crescimento futuro para um ERP completo ou SaaS.

---

# Objetivos

* Gerenciar compras de fornecedores
* Controlar estoque através de movimentações
* Gerenciar vendas para clientes
* Calcular custo médio dos produtos
* Calcular lucro das vendas
* Controlar despesas operacionais
* Disponibilizar dashboards gerenciais
* Servir como base para futuras integrações com marketplaces

---

# Arquitetura

## Backend

* .NET 8
* ASP.NET Core
* Entity Framework Core
* PostgreSQL

## Frontend

* React
* Next.js

## Padrões Arquiteturais

* Clean Architecture
* DDD Lite
* Repository Pattern
* DTO Pattern
* Fluent API

---

# Estrutura da Solução

* Amani.Api
* Amani.Application
* Amani.Domain
* Amani.Infra.Data
* Amani.Infra.IoC

---

# Módulo 1 - Cadastros

## Clientes

Responsabilidades:

* Cadastro de clientes
* Consulta de clientes
* Atualização de clientes
* Inativação de clientes

Entidade:

* Cliente

---

## Fornecedores

Responsabilidades:

* Cadastro de fornecedores
* Consulta de fornecedores
* Atualização de fornecedores

Entidade:

* Fornecedor

---

## Categorias

Responsabilidades:

* Organização dos produtos

Entidade:

* Categoria

---

## Produtos

Responsabilidades:

* Cadastro de produtos
* Associação com categoria
* Associação com fornecedor
* Definição de preço de venda

Entidade:

* Produto

---

# Módulo 2 - Compras

Responsabilidades:

* Registro de compras
* Entrada de produtos no estoque
* Histórico de compras
* Consulta por período
* Consulta por fornecedor

Entidades:

## Compra

Campos principais:

* Id
* FornecedorId
* DataCompra
* Desconto
* Acrescimo

## CompraItem

Campos principais:

* CompraId
* ProdutoId
* Quantidade
* CustoUnitario

Regras:

* Quantidade deve ser maior que zero
* CustoUnitario não pode ser negativo
* Toda compra gera movimentação de entrada no estoque

---

# Módulo 3 - Estoque

## Conceito Principal

O sistema NÃO possui campo fixo de estoque.

O saldo de estoque é calculado através das movimentações registradas.

Saldo:

Entradas - Saídas

---

## EstoqueMovimentacao

Campos principais:

* Id
* ProdutoId
* Quantidade
* TipoMovimentacao
* ValorUnitario
* DataMovimentacao

Tipos:

* Entrada
* Saída

---

## Regras

* Toda compra gera entrada
* Toda venda gera saída
* Nenhuma alteração manual de saldo
* Todo histórico deve ser preservado

---

# Módulo 4 - Vendas

Responsabilidades:

* Registro de vendas
* Saída automática do estoque
* Validação de estoque disponível
* Cálculo de lucro

Entidades:

## Venda

Campos principais:

* Id
* ClienteId
* DataVenda
* Desconto
* Acrescimo

## VendaItem

Campos principais:

* VendaId
* ProdutoId
* Quantidade
* PrecoUnitario
* Desconto
* Acrescimo

Regras:

* Não permitir venda sem estoque
* Quantidade deve ser maior que zero
* Preço deve ser válido
* Toda venda gera saída de estoque

---

# Módulo 5 - Custos e Lucro

## Cálculo de Custo Médio

Fórmula:

Custo Médio = Σ(Valor × Quantidade) ÷ Σ Quantidade

Objetivo:

* Determinar custo atual do produto
* Base para cálculo de lucro

---

## Cálculo de Lucro

Fórmula:

Lucro = (PreçoVenda - CustoMédio) × Quantidade

Objetivo:

* Medir rentabilidade por venda
* Alimentar dashboards financeiros

---

# Módulo 6 - Financeiro

## Despesas

Responsabilidades:

* Registro de gastos operacionais
* Controle de despesas por categoria
* Relatórios financeiros

Exemplos:

* Frete
* Taxas
* Embalagens
* Marketing
* Combustível

Entidade:

* Despesa

Campos principais:

* Id
* Descricao
* Valor
* CategoriaDespesaId
* DataDespesa

---

## CategoriaDespesa

Campos principais:

* Id
* Nome
* Descricao

---

# Módulo 7 - Dashboard

Responsabilidades:

* Indicadores financeiros
* Indicadores operacionais

Métricas:

* Receita por período
* Lucro por período
* Compras por período
* Despesas por período
* Produtos mais vendidos
* Produtos com baixo estoque
* Produtos mais lucrativos

---

# Endpoints Esperados

## Compras

* POST /api/compras
* GET /api/compras/{id}
* GET /api/compras

## Vendas

* POST /api/vendas
* GET /api/vendas/{id}
* GET /api/vendas

## Produtos

* POST /api/produtos
* GET /api/produtos
* GET /api/produtos/{id}

## Clientes

* POST /api/clientes
* GET /api/clientes
* GET /api/clientes/{id}

## Fornecedores

* POST /api/fornecedores
* GET /api/fornecedores
* GET /api/fornecedores/{id}

## Despesas

* POST /api/despesas
* GET /api/despesas
* GET /api/despesas/{id}

## Dashboard

* GET /api/dashboard

---

# Diretrizes Obrigatórias

* Não utilizar AutoMapper
* Utilizar DTOs para entrada e saída
* Controllers sem regras de negócio
* Regras concentradas na camada Application e Domain
* Utilizar Fluent API para mapeamentos EF
* Utilizar Repository Pattern
* Preservar histórico operacional
* Evitar acoplamento entre módulos

---

# Evoluções Futuras

* Contas a Receber
* Fluxo de Caixa
* Contas a Pagar
* Autenticação e Autorização
* Multiusuário
* Integração Mercado Livre
* Integração Shopee
* Integração TikTok Shop
* Emissão de NF-e
* Aplicativo Mobile
* Plataforma SaaS

---

# Status Atual

Implementado:

* Compras
* Vendas
* Estoque por movimentação
* Cálculo de custo médio
* Cálculo de lucro
* Validação de estoque

Próximos focos:

* Dashboard
* Financeiro
* Frontend React/Next.js
* Integrações futuras
