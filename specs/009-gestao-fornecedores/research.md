# Research: Gestao de Fornecedores no Frontend

## Decision: Reusar o padrao da Feature 006 de Produtos

**Rationale**: A especificacao define risco tecnico muito baixo e pede replica do
modulo Produtos. O projeto ja possui rotas, componentes, hooks, services, estados
e navegacao para Produtos, incluindo lista responsiva, busca local, detalhe,
cadastro, edicao e invalidacao React Query. Reusar esse padrao reduz variacao
operacional e atende a Constituicao em simplicidade, experiencia operacional e
identidade visual.

**Alternatives considered**:

- Criar um layout novo para fornecedores: rejeitado por aumentar variacao entre
  modulos cadastrais equivalentes.
- Criar componentes genericos de CRUD agora: rejeitado porque a abstracao ainda nao
  resolve complexidade real e poderia dificultar ajustes especificos.

## Decision: Manter contrato de fornecedor minimalista

**Rationale**: Backend e frontend existentes expõem fornecedor com `id` e `nome`.
A clarificacao formal definiu que somente `nome` e editavel e `id` e somente
leitura. Isso evita campos inventados, dados nao persistidos ou alteracao de
escopo backend.

**Alternatives considered**:

- Adicionar contato, documento ou dados comerciais no frontend: rejeitado porque o
  contrato oficial atual nao oferece esses campos.
- Exibir placeholders frontend-only: rejeitado porque criaria expectativa falsa e
  violaria a regra de nao inventar dados.

## Decision: Usar React Query para lista, detalhe, criacao e edicao

**Rationale**: Produtos ja usa React Query para cache, loading, erro e invalidacao.
Fornecedores ja possui `useSuppliers` para listagem; estender o mesmo arquivo com
`useSupplier`, `useCreateSupplier` e `useUpdateSupplier` mantem consistencia.

**Alternatives considered**:

- Chamar `fetch` diretamente nas paginas: rejeitado por duplicar tratamento de
  estado e fugir do padrao local.
- Manter apenas listagem e fazer submit sem invalidacao: rejeitado porque lista e
  detalhe poderiam ficar desatualizados apos cadastro/edicao.

## Decision: Busca local por nome sobre a lista carregada

**Rationale**: A especificacao assume que a API pode nao oferecer paginacao ou
busca oficial. A busca local por nome atende ao escopo atual, e a lista de
fornecedores e cadastro operacional simples. O frontend nao persiste nem altera
dados durante a busca.

**Alternatives considered**:

- Criar query string para busca server-side: rejeitado porque o backend atual nao
  define esse contrato.
- Buscar por campos de contato: rejeitado porque esses campos nao existem no
  contrato atual.

## Decision: Validacao frontend basica, backend como fonte oficial

**Rationale**: O frontend deve impedir envio claramente invalido quando `nome` esta
vazio, preservar preenchimento e apresentar rejeicoes retornadas pela API. Regras
definitivas, mensagens de dominio e persistencia permanecem no backend.

**Alternatives considered**:

- Replicar regras de dominio completas no frontend: rejeitado pela Constituicao
  porque o backend e fonte das regras.
- Enviar sempre sem validacao local: rejeitado por piorar experiencia operacional
  em um fluxo simples e frequente.

## Decision: Validar responsividade por cenarios manuais orientados

**Rationale**: A solucao atual define `lint`, `typecheck` e `build`, mas nao possui
suite automatizada de interface para esta feature. O `quickstart.md` deve cobrir
execucao manual em smartphone, tablet e desktop, verificando estados e ausencia de
sobreposicao.

**Alternatives considered**:

- Introduzir Playwright agora: rejeitado por adicionar dependencia e escopo nao
  solicitados.
- Validar apenas desktop: rejeitado pela Constituicao Mobile First.
