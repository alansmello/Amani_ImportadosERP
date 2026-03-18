# Contribuindo para Amani Importados ERP

Obrigado por considerar contribuir! Este documento fornece diretrizes e instruções para contribuir com o projeto.

## 📋 Código de Conduta

Seja respeitoso e inclusivo. Rejeitar comportamentos discriminatórios ou abusivos.

## 🐛 Relatando Bugs

Ao relatar um bug, inclua:

- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs. atual
- Versão do .NET e SO
- Screenshots/logs se aplicável

### Exemplo

```
Título: Login falha com espaços no email

Descrição:
Ao tentar fazer login com um email contendo espaços, a aplicação retorna erro 500.

Passos:
1. Acesse a página de login
2. Digite "usuario @example.com" (com espaço)
3. Digite a senha
4. Clique em "Entrar"

Esperado: Validação e mensagem de erro clara
Atual: Erro 500 Internal Server Error
```

## ✨ Sugestões de Melhorias

Sugestões são bem-vindas! Descreva:

- O problema que resolve
- Solução proposta
- Alternativas consideradas
- Contexto adicional

## 🔧 Configuração do Desenvolvimento

### 1. Ambiente Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/Amani_ImportadosERP.git
cd Amani_ImportadosERP

# Restaure as dependências
dotnet restore

# Configure o banco de dados
dotnet ef database update -p src/Amani.ImportadosERP.Infra.Data -s src/Amani.ImportadosERP.Api
```

### 2. Branches

- `main` — Produção
- `develop` — Desenvolvimento
- `feature/*` — Novas funcionalidades
- `bugfix/*` — Correções de bugs
- `refactor/*` — Refatorações

## 📝 Padrões de Código

### Nomenclatura

- **Classes**: PascalCase (ex: `VendaService`)
- **Métodos**: PascalCase (ex: `CreateAsync`)
- **Variáveis**: camelCase (ex: `totalVendas`)
- **Constantes**: UPPER_SNAKE_CASE

### Formato

```csharp
// ✅ Bom
public sealed class VendaService
{
    private readonly IVendaRepository _vendaRepository;

    public VendaService(IVendaRepository vendaRepository)
    {
        _vendaRepository = vendaRepository;
    }

    public async Task<Guid> CreateAsync(CriarVendaDto dto)
    {
        // implementação
    }
}

// ❌ Evitar
public class VendaService {
    public IVendaRepository Repository;
    
    public VendaService() { }
    
    public Guid Create(CriarVendaDto dto) { }
}
```

### Padrões de Projeto

- **Repositories** — Abstração de dados
- **Services** — Lógica de aplicação
- **DTOs** — Transfer objects para API
- **Queries/Commands** — CQRS com MediatR
- **Mappers** — Mapeamento manual ou AutoMapper

## ✅ Checklist de Pull Request

Antes de submeter um PR, verifique:

- [ ] Código segue os padrões do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Build passa localmente
- [ ] Não há quebra de dependências
- [ ] Commits são semânticos e bem descritos
- [ ] Documentação foi atualizada (se necessário)

## 🧪 Testes

```bash
# Rodar todos os testes
dotnet test

# Rodar com cobertura
dotnet test /p:CollectCoverage=true

# Teste específico
dotnet test --filter "MethodName=TestMethod"
```

### Estrutura de Teste

```csharp
// Arrange
var venda = new Venda(clienteId, dataVenda);

// Act
venda.AdicionarItem(produtoId, quantidade, preco);

// Assert
Assert.Equal(1, venda.Items.Count);
```

## 📚 Commits Semânticos

Use o formato:

```
tipo(escopo): descrição

feat(venda): adiciona filtro por cliente no dashboard
fix(estoque): corrige cálculo de saldo negativo
docs(readme): adiciona instruções de instalação
refactor(compra): simplifica lógica de desconto
test(venda): adiciona testes para calcular lucro
```

Tipos:
- `feat` — Nova funcionalidade
- `fix` — Correção de bug
- `docs` — Documentação
- `refactor` — Refatoração sem mudança de funcionalidade
- `test` — Adição ou atualização de testes
- `ci` — Mudanças em CI/CD

## 🔄 Processo de Review

1. PR é criado contra `develop`
2. Testes automatizados rodam
3. Revisão de código é realizada
4. Mudanças solicitadas são implementadas
5. PR é aprovado e mergeado

## 📖 Documentação

- README.md — Overview do projeto
- CONTRIBUTING.md — Guia de contribuição (este arquivo)
- Código comentado — Para lógica complexa
- Commits bem descritos — Para histórico

## 🚀 Releasing

Versioning segue [Semantic Versioning](https://semver.org/):

- `MAJOR.MINOR.PATCH` (ex: 1.2.3)
- MAJOR — Breaking changes
- MINOR — Novas funcionalidades
- PATCH — Bug fixes

## ❓ Perguntas?

- Abra uma [Discussion](https://github.com/seu-usuario/Amani_ImportadosERP/discussions)
- Verifique a [Wiki](https://github.com/seu-usuario/Amani_ImportadosERP/wiki)
- Procure issues abertas ou fechadas

---

**Obrigado por contribuir! 🎉**
