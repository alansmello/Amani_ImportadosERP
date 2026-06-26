# Quickstart: Configurações e Categorias (Refinamento, Frontend)

**Branch**: `019-configuracoes-categorias-frontend` | **Date**: 2026-06-25

Guia de validação manual end-to-end para F019. Cada cenário é independente e testável isoladamente.

---

## Pré-requisitos

1. Backend rodando: `dotnet run --project src/Amani.ImportadosERP.Api`
2. Frontend rodando: `npm run dev` em `frontend/`
3. Banco de dados com migrations aplicadas (incluindo `AddDespesasCategorias`)
4. Verificar que os dois novos endpoints estão disponíveis antes de testar:
   - `DELETE http://localhost:5000/api/categorias/{id}` → deve retornar 204 ou 404
   - `POST http://localhost:5000/api/categorias-despesa/{id}/reativar` → deve retornar 204 ou 404
5. Verificar build sem erros: `npm run typecheck && npm run lint && npm run build` em `frontend/`

---

## Cenário 1 — Página de Configurações com 4 abas

**Objetivo**: confirmar que o placeholder foi substituído por layout de abas.

**Passos**:
1. Acessar `http://localhost:3000/configuracoes`
2. Verificar que a página exibe 4 abas: "Categorias de Produto", "Categorias de Despesa",
   "Taxas de Operadora", "Implantação"
3. Clicar em cada aba e confirmar que o conteúdo correspondente é exibido sem recarregar a página
4. Confirmar que a aba ativa tem indicação visual de seleção (borda, cor ou underline)
5. Redimensionar o navegador para largura de smartphone (< 640px): as abas devem permanecer
   acessíveis (scroll horizontal ou compactadas) sem sobreposição

**Resultado esperado**: 4 abas funcionais, sem navegação para sub-rotas ao trocar de aba.

---

## Cenário 2 — CRUD de Categorias de Produto

**Objetivo**: validar criação, edição e remoção de categorias de produto inline.

**Passos — Criar**:
1. Acessar a aba "Categorias de Produto"
2. No formulário inline, digitar um nome (ex.: "Bolsas Importadas") e confirmar
3. Verificar que a nova categoria aparece na lista imediatamente
4. Tentar criar uma categoria com nome vazio: deve exibir erro de validação do backend

**Passos — Editar**:
1. Na lista, clicar em "Editar" para a categoria criada
2. Alterar o nome e salvar
3. Verificar que o nome atualizado aparece na lista

**Passos — Remover sem vínculos**:
1. Na lista, clicar em "Remover" para a categoria criada (sem produtos vinculados)
2. Confirmar na caixa de diálogo (se houver) ou verificar remoção direta
3. Confirmar que a categoria desaparece da lista

**Passos — Remover com vínculos**:
1. Criar uma categoria nova
2. Vincular pelo menos um produto a ela (via `/produtos/novo`)
3. Tentar remover a categoria em Configurações
4. Verificar que o erro do backend é exibido ("categoria em uso" ou equivalente)
5. Confirmar que a categoria permanece na lista

**Resultado esperado**: CRUD funcional; erros do backend exibidos; sem validação no cliente.

---

## Cenário 3 — Toggle de Status de Categorias de Despesa

**Objetivo**: validar inativação e reativação de categorias de despesa.

**Passos — Criar e inativar**:
1. Acessar a aba "Categorias de Despesa"
2. Criar nova categoria (ex.: "Transporte Temporário")
3. Confirmar que aparece na lista com badge "Ativa"
4. Clicar no botão de inativar (toggle) e confirmar
5. Verificar que o badge muda para "Inativa" imediatamente

**Passos — Reativar**:
1. Com a categoria inativa visível na lista, clicar no botão de reativar
2. Confirmar a ação
3. Verificar que o badge muda para "Ativa"

**Passos — Visibilidade no formulário de despesa**:
1. Acessar `/financeiro/despesas/nova`
2. Verificar que a categoria inativa NÃO aparece no seletor de categoria
3. Reativar a categoria e confirmar que volta a aparecer no formulário de nova despesa

**Resultado esperado**: toggle funcional em ambas as direções; categorias inativas excluídas do
formulário de despesa.

---

## Cenário 4 — Edição de Taxas de Operadora

**Objetivo**: validar que CartaoDebito e CartaoCredito são editáveis e que a taxa inválida retorna erro.

**Passos — Editar CartaoDebito**:
1. Acessar a aba "Taxas de Operadora"
2. Confirmar que CartaoDebito e CartaoCredito estão visíveis (pelo menos)
3. Alterar a taxa de CartaoDebito (ex.: de 1.5 para 1.8) e salvar
4. Verificar mensagem de confirmação e que o novo valor aparece atualizado

**Passos — Taxa inválida**:
1. Tentar salvar taxa com valor negativo (ex.: -1)
2. Verificar que o backend retorna erro e o frontend exibe a mensagem

**Passos — Verificação na venda**:
1. Registrar nova venda com forma de pagamento CartaoDebito
2. Verificar que a despesa de operadora registrada reflete a taxa atualizada (1.8%)

**Resultado esperado**: todos os métodos com taxa editável visíveis; validação de range no backend;
taxa refletida nas vendas subsequentes.

---

## Cenário 5 — Cards de Implantação

**Objetivo**: validar que os 3 cards de implantação levam às telas corretas.

**Passos**:
1. Acessar a aba "Implantação" em Configurações
2. Confirmar que três cards estão visíveis com ícone, título e descrição curta:
   - "Inventário Inicial"
   - "Saldo Inicial de Caixa"
   - "Contas a Receber Iniciais"
3. Clicar em cada card e confirmar que navega para a tela de implantação correta (F010)
4. Confirmar que não há formulário embutido na aba — o formulário está na tela F010 de destino

**Resultado esperado**: 3 cards de navegação; clique redireciona para F010; sem formulário inline.

---

## Cenário 6 — Responsividade

**Objetivo**: validar que a página de Configurações funciona em mobile.

**Passos**:
1. Abrir DevTools > modo responsivo, selecionar iPhone SE (375px)
2. Acessar `/configuracoes`
3. Verificar que as abas são acessíveis (sem scroll horizontal forçado)
4. Criar uma categoria de produto: formulário deve ser utilizável sem zoom
5. Verificar que botões de ação (Editar, Remover, Toggle) têm área de toque adequada (min 44px)

**Resultado esperado**: tela utilizável em smartphone; sem scroll horizontal; botões acessíveis.

---

## Build Checks

Executar antes de considerar a feature concluída:

```bash
# Backend
dotnet build Amani_ImportadosERP.sln

# Frontend
cd frontend
npm run typecheck
npm run lint
npm run build
```

Todos os comandos devem completar sem erros ou warnings de tipo.
