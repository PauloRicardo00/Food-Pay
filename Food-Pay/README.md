# 🍽️ Food-Pay

Sistema de pagamento digital para cantinas escolares. Alunos fazem pedidos, responsáveis gerenciam saldo e limites, e funcionários administram o cardápio — tudo em uma plataforma integrada.

---

## 🧩 Visão Geral

O Food-Pay é dividido em dois repositórios:

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 19 + Vite + React Router |
| **Backend** | ASP.NET Core 9 (C#) + Entity Framework Core + SQL Server |

### Perfis de acesso

- **Aluno** — visualiza cardápio, faz pedidos e acompanha histórico
- **Responsável** — gerencia dependentes, define limites e adiciona saldo via Stripe
- **Funcionário** — gerencia cardápio, processa pedidos e acessa relatórios

---

## 🗂️ Estrutura do Frontend

```
src/
├── api/            # Cliente HTTP e endpoints
├── components/     # Componentes reutilizáveis (layout, ui, auth)
├── config/         # Variáveis de ambiente e navegação
├── context/        # AuthContext (autenticação global)
├── hooks/          # Hooks customizados
├── layouts/        # Layouts por perfil
├── pages/
│   ├── aluno/      # Dashboard, Cardápio, Carrinho, Pedidos, Histórico...
│   ├── auth/       # Login, Cadastro, Recuperar/Redefinir Senha
│   ├── funcionario/# Dashboard, Pedidos, Cardápio, Relatórios...
│   └── responsavel/# Dashboard, Dependentes, Gastos, Limite...
├── routes/         # AppRoutes com rotas protegidas
├── services/       # Serviços por entidade
├── styles/         # CSS global e mobile
└── utils/          # Formatação, notificações, áudio
```

---

## 🗂️ Estrutura do Backend

```
FoodPay.API/
├── Controllers/    # Auth, Alunos, Funcionarios, Pedidos, Pagamentos, Stripe...
├── Data/           # AppDbContext (EF Core)
├── DTOs/           # Objetos de transferência de dados
├── Models/         # Aluno, Responsavel, Funcionario, Pedido, Produto...
├── Services/       # EmailService (Brevo/SMTP)
└── Program.cs      # Configuração de serviços, JWT, CORS, Swagger
```

---

## ⚙️ Pré-requisitos

- Node.js 18+
- .NET 9 SDK
- SQL Server
- Conta Stripe (pagamentos)
- Conta Brevo (e-mails)

---

## 🚀 Como rodar localmente

### Frontend

```bash
npm install

cp .env.example .env
# Preencha o .env com a URL da sua API

npm run dev
```

### Backend

```bash
dotnet restore

# Configure o appsettings.json com sua connection string, JWT, Stripe e SMTP

dotnet ef database update

dotnet run
```

A API sobe em `https://localhost:7000` com Swagger em `/swagger`.

---

## 🔑 Variáveis de ambiente

### Frontend (`.env`)

| Variável | Descrição |
|----------|-----------|
| `VITE_API_URL` | URL base da API |

### Backend (`appsettings.json`)

| Chave | Descrição |
|-------|-----------|
| `ConnectionStrings:DefaultConnection` | String de conexão SQL Server |
| `Jwt:Key` | Chave secreta para tokens JWT |
| `Stripe:SecretKey` | Chave secreta da conta Stripe |
| `Stripe:WebhookSecret` | Secret do webhook Stripe |
| `Smtp:*` | Configurações do servidor de e-mail |

> Nunca versione o `appsettings.json` com credenciais reais. Use variáveis de ambiente em produção.

---

## 🛠️ Tecnologias

**Frontend**
- React 19, React Router 7, Vite 8
- Lucide React, React Hot Toast
- jsPDF + jsPDF-AutoTable

**Backend**
- ASP.NET Core 9, Entity Framework Core 9
- SQL Server, JWT Bearer, BCrypt.Net
- Stripe.net, Swagger

---

## 📄 Licença

Projeto acadêmico — SENAI.