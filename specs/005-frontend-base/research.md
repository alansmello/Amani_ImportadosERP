# Research: Configuracao Inicial do Frontend Amani ERP

## Decision: Projeto frontend separado em `frontend/`

**Rationale**: O repositorio ja usa `src/` para a solucao backend .NET em Clean Architecture. Um diretorio `frontend/` na raiz separa toolchain, dependencias, build e estrutura de UI sem misturar responsabilidades.

**Alternatives considered**:

- Criar frontend dentro de `src/`: rejeitado porque conflita semanticamente com os projetos backend existentes.
- Criar monorepo com `apps/web`: rejeitado nesta fase por adicionar convencao extra sem necessidade real.

## Decision: Next.js App Router para rotas e layouts

**Rationale**: App Router encaixa bem com layout global, rotas por modulo e evolucao para paginas operacionais. Ele tambem facilita separar a area operacional do shell, do provider global e dos placeholders.

**Alternatives considered**:

- React puro com Vite: mais simples, mas exigiria decisoes adicionais de roteamento e estrutura.
- Pages Router: funcional, mas menos alinhado ao padrao atual de layouts aninhados do Next.js.

## Decision: TypeScript obrigatorio

**Rationale**: A base frontend vai carregar contratos internos de navegacao, estados de dados, servicos e componentes. TypeScript reduz erros de integracao conforme o ERP crescer em modulos.

**Alternatives considered**:

- JavaScript: rejeitado porque aumenta ambiguidade e risco de regressao em um ERP em expansao.

## Decision: Tailwind CSS com tokens Amani

**Rationale**: Tailwind favorece Mobile First e permite transformar a paleta aprovada em tokens reutilizaveis. O plano exige evitar cores soltas e manter consistencia entre telas futuras.

**Alternatives considered**:

- CSS Modules isolados: bom isolamento, mas tende a repetir decisoes de spacing/cor.
- Biblioteca visual pronta com tema fechado: rejeitada porque a identidade Amani precisa ser controlada.

## Decision: Shadcn/UI como base de componentes

**Rationale**: Shadcn/UI entrega componentes acessiveis e editaveis, mantendo controle visual no repositorio. Isso combina com Dark Only, visual premium e necessidade de padronizar componentes sem depender de uma camada opaca.

**Alternatives considered**:

- Criar todos os componentes do zero: rejeitado por custo alto e risco de acessibilidade inconsistente.
- Usar biblioteca fechada de componentes: rejeitado por limitar identidade visual e customizacao.

## Decision: TanStack Query desde a fundacao

**Rationale**: Mesmo sem dados reais nesta feature, a base precisa padronizar loading, erro, cache e estados vazios. Configurar o provider e convencoes agora evita padroes divergentes nas proximas features.

**Alternatives considered**:

- Usar `fetch` diretamente em componentes: rejeitado porque espalha estado de rede e dificulta padronizacao.
- Criar camada propria de cache: rejeitado por complexidade desnecessaria.

## Decision: Lucide React para iconografia

**Rationale**: Lucide oferece icones consistentes e leves para navegacao e acoes. Isso reduz SVG manual e ajuda a bottom navigation mobile a ser legivel.

**Alternatives considered**:

- SVGs manuais: rejeitado por manutencao e inconsistencia.
- Misturar bibliotecas de icones: rejeitado por inconsistencias visuais.

## Decision: Breakpoints smartphone, tablet e desktop

**Rationale**: A Constituicao exige Mobile First e validacao em smartphone, tablet e desktop. Os limites planejados (`<768px`, `768px-1023px`, `>=1024px`) seguem padroes web comuns e deixam claro quando a sidebar desktop entra.

**Alternatives considered**:

- Apenas mobile/desktop: rejeitado porque tablet e requisito explicito.
- Muitos breakpoints customizados: rejeitado por sofisticacao desnecessaria nesta base.

## Decision: Bottom navigation mobile com cinco destinos

**Rationale**: Smartphone e experiencia principal. Dashboard, Vendas, Estoque e Compras sao destinos de alta frequencia operacional; "Mais" acomoda Clientes, Produtos, Financeiro e Configuracoes sem sobrecarregar a largura.

**Alternatives considered**:

- Mostrar todos os modulos no rodape: rejeitado por excesso de alvos e texto pequeno.
- Menu hamburguer exclusivo: rejeitado porque reduz acesso rapido aos fluxos operacionais.

## Decision: Dashboard placeholder sem metricas reais

**Rationale**: A feature deve preparar a estrutura visual sem antecipar dashboard real. Placeholders evitam confundir dados ficticios com informacao operacional e preservam backend como fonte das metricas.

**Alternatives considered**:

- Dados mockados numericos: rejeitado porque poderiam ser interpretados como indicadores reais.
- Tela vazia simples: rejeitada porque nao validaria estrutura futura de cards e estados.

## Decision: API client fino com QueryClient

**Rationale**: A camada de servicos deve padronizar base URL, erros HTTP e estados de dados, sem regras de negocio. Futuras features adicionam servicos por modulo consumindo contratos do backend.

**Alternatives considered**:

- Gerador de client API agora: rejeitado porque contratos operacionais completos nao pertencem a esta feature.
- Chamadas diretas nas paginas: rejeitado por baixa manutencao.
