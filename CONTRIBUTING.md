# Contribuindo com o FoodPay

Obrigado pelo interesse em contribuir! Este documento descreve o processo para contribuir com o projeto.

## 📋 Fluxo de Trabalho com Git

O projeto utiliza um fluxo baseado em **feature branches**:

```
main           ← produção estável
└── develop    ← integração contínua
    ├── feature/nome-da-funcionalidade
    ├── fix/descricao-do-bug
    └── hotfix/correcao-urgente
```

### Criando uma branch

```bash
# A partir de develop
git checkout develop
git pull origin develop
git checkout -b feature/minha-funcionalidade
```

### Commits

Siga o padrão **Conventional Commits**:

```
tipo(escopo): descrição curta em português

[corpo opcional]
[rodapé opcional]
```

**Tipos:**
| Tipo | Quando usar |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Documentação |
| `style` | Formatação, sem mudança de lógica |
| `refactor` | Refatoração sem feat/fix |
| `test` | Testes |
| `chore` | Build, dependências, configs |

**Exemplos:**
```
feat(pedidos): adicionar validação de saldo antes de confirmar pedido
fix(auth): corrigir expiração do token JWT
docs(readme): atualizar instruções de instalação
```

### Pull Request

1. Faça push da sua branch
2. Abra um Pull Request para `develop`
3. Descreva as mudanças e mencione a issue relacionada (se houver)
4. Aguarde revisão de pelo menos um membro da equipe

## 🐛 Reportando Bugs

Use as **Issues** do GitHub com o label `bug`. Inclua:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs. obtido
- Screenshots (se aplicável)
- Ambiente (OS, browser, versão)

## 💡 Sugerindo Funcionalidades

Abra uma **Issue** com o label `enhancement` descrevendo:
- O problema que a funcionalidade resolve
- Proposta de solução
- Alternativas consideradas

## 🔐 Segurança

**Nunca** commite:
- Chaves de API (Stripe, JWT)
- Strings de conexão com credenciais
- Arquivos `appsettings.json` com dados reais
- Arquivos `.env` com dados reais

Veja o `.gitignore` para a lista completa de arquivos ignorados.

## 🧪 Padrão de Código

### Backend (C#)
- Seguir convenções de nomenclatura do C# (PascalCase para classes/métodos, camelCase para variáveis)
- Controllers finos — lógica de negócio nos Services
- DTOs para entradas e saídas da API
- Validações com Data Annotations

### Frontend (React)
- Componentes funcionais com Hooks
- Um componente por arquivo
- Props tipadas com PropTypes ou JSDoc
- Serviços centralizados em `src/services/`
- Sem lógica de negócio diretamente nos componentes de página
