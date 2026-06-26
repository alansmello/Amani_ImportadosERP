# Research: Configurações e Categorias (Refinamento, Frontend)

**Branch**: `019-configuracoes-categorias-frontend` | **Date**: 2026-06-25

## Sumário de Decisões

---

### D-001: Gaps de backend descobertos na análise de código

**Decisão**: Adicionar dois endpoints mínimos antes do trabalho de frontend:
1. `DELETE /api/categorias/{id}` para remoção de categoria de produto
2. `POST /api/categorias-despesa/{id}/reativar` para reativação de categoria de despesa

**Rationale**: O `CategoriasController` só tem `POST`, `GET`, `PUT` — sem `DELETE`. O `CategoriaService`
e `ICategoriaRepository` não possuem método de remoção. O `CategoriasDespesaController` só tem
`POST /{id}/inativar` — sem `reativar`. A entidade `CategoriaDespesa` no domínio possui apenas
`Inativar()` — sem `Reativar()`.

Esses gaps foram descobertos lendo o código real dos controllers, serviços, repositórios e entidades.
A especificação exige CRUD completo de categorias de produto e toggle ativo/inativo de categorias de
despesa, o que torna esses endpoints obrigatórios.

**Alternativas consideradas**:
- Remoção da feature de exclusão de categorias de produto → rejeitada; o roadmap e a spec exigem CRUD
  funcional, e esconder o botão de delete não é coerente com a promessa da feature.
- Usar `PUT` para alterar `Ativa` em `CategoriaDespesa` → rejeitada; o `AtualizarCategoriaDespesaCommand`
  não aceita o campo `Ativa`, e o padrão existente usa actions específicas (`inativar`) — consistência
  exige um endpoint simétrico `reativar`.

---

### D-002: Sem migration necessária

**Decisão**: F019 não requer nenhuma migration de banco de dados.

**Rationale**: Todas as entidades envolvidas já existem no banco: `Categoria`, `CategoriaDespesa`,
`ConfiguracaoFormaPagamento`. As colunas necessárias (`Ativa` em `CategoriaDespesa`) já existem na
migration `20260623233055_AddDespesasCategorias`. Adicionar `Reativar()` ao domínio e `RemoverAsync`
ao repositório são alterações de comportamento sobre entidades já mapeadas.

**Alternativas consideradas**: Adicionar campo `removida` ou soft-delete em `Categoria` → rejeitada;
complexidade desnecessária para o volume de dados; a remoção direta é suficiente e consistente com o
padrão do restante do sistema (sem soft-delete em categorias).

---

### D-003: Tabs implementadas com useState + Tailwind (sem nova dependência)

**Decisão**: Implementar navegação por abas na página de Configurações com React `useState` e classes
Tailwind, sem instalar `@radix-ui/react-tabs` ou outra biblioteca de componentes de tab.

**Rationale**: Princípio XII da Constituição exige simplicidade antes de sofisticação. Tabs em uma
única página de configurações não precisam de gestão de foco complexa — o padrão de `button`
com role de tab e `aria-selected` é implementável diretamente. `@radix-ui/react-tabs` está disponível
como pacote (Radix já está no projeto via `react-dialog` e `react-slot`), mas adicionar uma nova
dependência para um componente de tab simples não resolve complexidade real.

**Alternativas consideradas**:
- `@radix-ui/react-tabs` → disponível e acessível, mas seria a primeira dependência Radix com interface
  visual de navegação full; adiciona peso para benefício limitado neste contexto de configurações.
- Roteamento de sub-páginas por aba (URL por aba) → rejeitada; a spec clarificou que as abas são
  inline sem sub-rotas; o roteamento adicionaria complexidade de URL sem benefício para o usuário.

---

### D-004: Conteúdo de /configuracoes/formas-pagamento preservado como sub-página

**Decisão**: A sub-rota `/configuracoes/formas-pagamento` é preservada. O conteúdo de taxas de
operadora é disponibilizado também na aba "Taxas de Operadora" em `/configuracoes` (componente
`PaymentFeesForm` reutilizado), sem remover a sub-página existente.

**Rationale**: Remover a sub-página quebraria o link existente no card de Configurações e potencialmente
links diretos guardados por usuários. Reutilizar o componente nas duas superfícies é sem custo adicional.
A sub-página `/configuracoes/formas-pagamento` mantém o botão "Voltar" apontando para `/configuracoes`.

**Alternativas consideradas**:
- Remover a sub-página e redirecionar para `/configuracoes` → rejeitada; quebraria links existentes.

---

### D-005: PaymentFeesForm estendida para mostrar CartaoDebito e CartaoCredito

**Decisão**: O componente `PaymentFeesForm` atual filtra apenas `CartaoDebito`. A spec e os cenários
de aceite exigem que pelo menos `CartaoDebito` e `CartaoCredito` sejam editáveis. O componente será
atualizado para remover o filtro e renderizar todos os métodos retornados pelo backend que tenham
taxa aplicável (todos exceto `Dinheiro`, `PIX` e `Fiado`, que têm taxa zero por padrão).

**Rationale**: O endpoint `GET /api/configuracoes/formas-pagamento` retorna todos os métodos. O
backend já suporta `PUT` para qualquer método. O filtro no frontend era uma simplificação de F015
que não refletia o contrato completo.

**Alternativas consideradas**:
- Criar um segundo componente separado para CartaoCredito → rejeitada; duplicação desnecessária.
- Deixar filtro apenas em CartaoDebito e criar uma seção separada para CartaoCredito → rejeitada;
  mesma duplicação com layout mais complexo.

---

### D-006: ExpenseCategoriesManager reutilizada em Configurações via tab (sem duplicação de componente)

**Decisão**: O componente `ExpenseCategoriesManager` existente em `components/financeiro/` é reutilizado
diretamente na aba de Categorias de Despesa em `/configuracoes`. O componente é atualizado no local
para suportar reativação (toggle), beneficiando tanto a tela de Configurações quanto a tela atual em
`/financeiro/despesas/categorias`.

**Rationale**: Duplicar o componente em `components/configuracoes/` seria violação do Princípio XII
(simplicidade). O componente é genérico o suficiente para funcionar em qualquer contexto. A tela
`/financeiro/despesas/categorias` também se beneficia da reativação.

**Alternativas consideradas**:
- Criar `components/configuracoes/expense-categories-manager.tsx` como cópia → rejeitada; duplicação.

---

### D-007: ProductCategoriesManager criado como novo componente em components/configuracoes/

**Decisão**: Criar `components/configuracoes/product-categories-manager.tsx` seguindo o padrão exato
de `ExpenseCategoriesManager`: formulário inline (criar/editar) + lista com botões de ação (editar,
remover). O formulário só aceita `nome` (sem descrição — categoria de produto é mais simples).

**Rationale**: Sem componente equivalente existente para categorias de produto. O padrão de
`ExpenseCategoriesManager` é well-tested e segue o Design System. Seguir o mesmo padrão garante
consistência visual e comportamental.

**Alternativas consideradas**:
- Modal de criação/edição → rejeitada; o padrão inline (form + lista na mesma tela) está estabelecido
  no projeto e é mais rápido para operação frequente.

---

## Análise de Estado Atual do Código

### Arquivos backend — estado atual

| Arquivo | Estado | Ação em F019 |
|---------|--------|--------------|
| `CategoriasController.cs` | Tem POST, GET, PUT — sem DELETE | +DELETE /{id} |
| `CategoriasDespesaController.cs` | Tem POST, GET, PUT, POST/inativar — sem reativar | +POST /{id}/reativar |
| `CategoriaService.cs` | Tem Create, List, GetById, Update — sem Remove | +RemoverAsync |
| `ICategoriaRepository.cs` | Tem Adicionar, ObterPorId, Listar, Salvar — sem Remover | +RemoverAsync |
| `CategoriaRepository.cs` | Implementa ICategoriaRepository — sem Remove | +RemoverAsync |
| `CategoriaDespesa.cs` (entity) | Tem Inativar() — sem Reativar() | +Reativar() |
| `ICategoriaDespesaRepository.cs` | Verificar — provável adição de ReativarAsync | Verificar + estender |
| `CategoriaDespesaRepository.cs` | Verificar — provável adição de ReativarAsync | Verificar + estender |

### Arquivos frontend — estado atual

| Arquivo | Estado | Ação em F019 |
|---------|--------|--------------|
| `types/category.ts` | Só `{ id, nome }` | +CreateCategoryPayload, UpdateCategoryPayload |
| `services/categories.ts` | Só `list()` | +create(), update(), remove() |
| `hooks/use-categories.ts` | Só `useCategories()` | +useCreateCategory, useUpdateCategory, useRemoveCategory |
| `services/expense-categories.ts` | Tem list, get, create, update, inactivate — sem reactivate | +reactivate() |
| `hooks/use-expense-categories.ts` | Tem todos menos reactivate | +useReactivateExpenseCategory |
| `components/financeiro/expense-categories-manager.tsx` | Só inativar (sem reativar) | +toggle reativar |
| `components/configuracoes/payment-fees-form.tsx` | Filtra só CartaoDebito | Remover filtro; mostrar todos os métodos com taxa |
| `app/configuracoes/page.tsx` | Cards com links para sub-páginas | Converter para 4 abas inline |
| `config/routes.ts` | Tem configuracoes, formas-pagamento, implantacao | Sem alteração necessária |
| `lib/query-client.ts` | Tem `categorias` e `categoriasDespesa` | Verificar se precisa adicionar queryKey para `categorias` (produto) — pode usar `"categorias"` |
