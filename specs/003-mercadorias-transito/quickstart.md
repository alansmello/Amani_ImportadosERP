# Quickstart: Mercadorias em Transito e Recebimento Parcial

## Prerequisites

- PostgreSQL configurado em `src/Amani.ImportadosERP.Api/appsettings.json`.
- Ferramenta EF Core disponivel para migrations.
- Cadastros base existentes: fornecedor e produto.
- Feature 002 aplicada quando houver validacao de inventario inicial.

## Build

```powershell
dotnet build
```

Expected outcome: solucao compila sem erros.

## Apply Migration

Depois da implementacao, criar e aplicar migration da Feature 003:

```powershell
dotnet ef migrations add AddMercadoriasTransitoRecebimentoParcial --project src/Amani.ImportadosERP.Infra.Data --startup-project src/Amani.ImportadosERP.Api
dotnet ef database update --project src/Amani.ImportadosERP.Infra.Data --startup-project src/Amani.ImportadosERP.Api
```

Expected outcome: banco contem status de compra, recebimentos e perdas por item,
recebimentos legados para compras anteriores a Feature 003, e nenhum campo fixo
de estoque.

## Run API

```powershell
dotnet run --project src/Amani.ImportadosERP.Api
```

Use a URL exibida pelo ASP.NET Core para executar os cenarios abaixo.

## Validation Scenarios

### 1. Criar compra sem estoque automatico

1. Consultar saldo fisico do produto.
2. Criar compra via `POST /api/compras`.
3. Consultar saldo fisico novamente.
4. Consultar `GET /api/compras/em-transito`.

Expected outcome:

- Saldo fisico nao muda apos criar compra.
- Compra aparece em mercadorias em transito com quantidade pendente igual a
  quantidade comprada.

### 2. Receber parcialmente item de compra

1. Registrar recebimento menor que a pendencia via
   `POST /api/compras/{compraId}/itens/{itemId}/recebimentos`.
2. Consultar saldo fisico.
3. Consultar compra por ID e historico de recebimentos.

Expected outcome:

- Saldo aumenta apenas pela quantidade recebida.
- Item mostra quantidade recebida e pendente corretas.
- Historico exibe o recebimento.
- Compra continua em transito se ainda houver pendencia.
- Recebimento, movimentacao de estoque e status da compra sao persistidos de
  forma atomica.

### 3. Registrar segundo recebimento do mesmo item

1. Registrar novo recebimento dentro da pendencia restante.
2. Consultar historico de recebimentos.
3. Consultar saldo fisico.

Expected outcome:

- Historico preserva os dois recebimentos.
- Saldo fisico corresponde a soma dos recebimentos.
- Nenhuma entrada foi criada para quantidade ainda pendente.

### 4. Registrar perda, extravio ou avaria

1. Registrar perda via `POST /api/compras/{compraId}/itens/{itemId}/perdas`.
2. Consultar saldo fisico.
3. Consultar historico de perdas.

Expected outcome:

- Saldo fisico nao muda.
- Quantidade perdida reduz pendencia.
- Historico exibe perda com motivo e data.
- Perda, rastreabilidade de prejuizo e status da compra sao persistidos de forma
  atomica.

### 5. Rejeitar quantidade acima da pendencia

1. Tentar receber quantidade maior que a pendente.
2. Tentar registrar perda maior que a pendente.

Expected outcome:

- Ambos os requests sao rejeitados.
- Nenhum evento historico novo e criado.
- Nenhuma movimentacao de estoque e criada.

### 6. Resolver compra e remover do transito

1. Receber ou registrar perdas ate `QuantidadePendente == 0` para todos os
   itens.
2. Consultar `GET /api/compras/em-transito`.

Expected outcome:

- Compra nao aparece mais em mercadorias em transito.
- Compra fica `Recebida` quando 100% foi recebido fisicamente.
- Compra fica `Finalizada` quando toda a quantidade foi resolvida e houve pelo
  menos uma perda, extravio ou avaria.
- Historicos permanecem consultaveis.

### 7. Regressao de venda

1. Criar compra sem receber.
2. Tentar vender quantidade comprada mas nao recebida.
3. Receber quantidade parcial.
4. Tentar vender acima da quantidade fisicamente recebida.
5. Vender quantidade dentro do saldo fisico.

Expected outcome:

- Venda antes do recebimento e rejeitada por estoque insuficiente.
- Venda acima do recebido e rejeitada.
- Venda dentro do saldo fisico e aceita e gera saida de estoque.

### 8. Regressao de inventario inicial e custo medio

1. Registrar inventario inicial com valor unitario.
2. Criar compra sem receber.
3. Consultar custo medio.
4. Receber item de compra com custo unitario.
5. Consultar custo medio novamente.

Expected outcome:

- Inventario inicial continua gerando entrada valida.
- Compra nao recebida nao altera custo medio.
- Recebimento confirmado passa a compor custo medio.
- Produtos com inventario inicial valorizado podem ter lucro/custo medio
  alterado porque o inventario inicial passa a ser entrada real considerada.
- Perda, extravio e avaria nao entram no custo medio.

### 9. Regressao de dashboard financeiro

1. Consultar dashboard financeiro antes e depois de criar compra em transito.
2. Registrar recebimento e perda.
3. Consultar dashboard novamente.

Expected outcome:

- Dashboard financeiro existente nao muda por causa desta feature, salvo
  comportamentos financeiros ja existentes fora do escopo.
- Dashboard financeiro continua considerando compra registrada como impacto
  financeiro imediato, mesmo que estoque fisico dependa de recebimento.

### 10. Regressao de compras legadas

1. Aplicar migration em base com compras existentes do modelo antigo.
2. Consultar compra antiga por ID.
3. Consultar historico de recebimentos da compra antiga.
4. Consultar `GET /api/compras/em-transito`.
5. Consultar saldo fisico do produto.

Expected outcome:

- Compra antiga fica com status `Recebida`.
- Cada item antigo possui recebimento `Legado/Migrado` com quantidade igual a
  quantidade comprada.
- Recebimento legado nao possui movimentacao nova de estoque.
- Quantidade pendente da compra antiga e zero.
- Compra antiga nao aparece em mercadorias em transito.
- Saldo fisico nao e duplicado pela migracao.

## References

- [Data model](./data-model.md)
- [API contracts](./contracts/compras-transito-api.md)
- [Specification](./spec.md)
