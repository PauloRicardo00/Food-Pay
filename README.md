<div align="center">

# 🍽️ FoodPay

**Sistema de Gestão Financeira de Alimentação Escolar**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![.NET](https://img.shields.io/badge/.NET-8-512BD4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![SQL Server](https://img.shields.io/badge/SQL_Server-2022-CC2927?style=flat-square&logo=microsoftsqlserver)](https://www.microsoft.com/sql-server)
[![Stripe](https://img.shields.io/badge/Stripe-API-635BFF?style=flat-squares&logo=stripe)](https://stripe.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

*Projeto Integrador — CST em Análise e Desenvolvimento de Sistemas*
*SENAI Ribeirão Preto · 2026/1*

[Funcionalidades](#-funcionalidades) · [Tecnologias](#-tecnologias) · [Instalação](#-instalação) · [Estrutura](#-estrutura-do-projeto) · [Equipe](#-equipe)

</div>

---

## 📌 Sobre o Projeto

O **FoodPay** é uma plataforma web desenvolvida para modernizar e digitalizar a gestão de pedidos e pagamentos em cantinas escolares. O sistema substitui processos manuais suscetíveis a erros e filas por um fluxo digital integrado, oferecendo experiências distintas para cada perfil de usuário.

### O Problema

Cantinas escolares enfrentam gargalos críticos nos horários de intervalo: funcionários sobrecarregados gerenciando pedidos e pagamentos simultaneamente, longos tempos de espera e ausência de controle financeiro para os responsáveis pelos alunos.

### A Solução

Uma plataforma fullstack com três painéis independentes — **Aluno**, **Funcionário** e **Responsável** — cada um com funcionalidades específicas, autenticação por JWT e integração com Stripe para processamento de pagamentos.

---

## ✨ Funcionalidades

### 👨‍🎓 Aluno
- Acesso ao cardápio digital com categorias e imagens dos produtos
- Carrinho de compras e realização de pedidos online
- Controle de saldo e histórico de consumo
- Acompanhamento do status dos pedidos em tempo real
- Recebimento de notificações sobre pedidos e gastos
- Pagamento via saldo pré-carregado (controlado por limite diário)

### 👩‍🍳 Funcionário
- Painel de pedidos em tempo real com atualização de status
- Gerenciamento do cardápio: cadastro, edição e disponibilidade de produtos
- Controle de categorias
- Relatórios de consumo e pagamentos
- Gestão de usuários cadastrados

### 👨‍👩‍👧 Responsável
- Monitoramento do consumo dos dependentes
- Definição de limite diário de gastos por aluno
- Recarga de saldo via Stripe (PIX / Cartão)
- Histórico detalhado de transações
- Notificações de pedidos e alertas de saldo

---

## 🛠 Tecnologias

### Frontend
| Tecnologia | Versão | Função |
|---|---|---|
| React | 18 | Biblioteca de interface |
| Vite | 5 | Build tool e dev server |
| React Router DOM | 6 | Roteamento SPA |
| CSS Modules / CSS custom | — | Estilização |

### Backend
| Tecnologia | Versão | Função |
|---|---|---|
| ASP.NET Core | .NET 8 | Framework da API REST |
| Entity Framework Core | 8 | ORM / acesso ao banco |
| SQL Server | 2022 | Banco de dados relacional |
| JWT Bearer | — | Autenticação stateless |
| Stripe .NET SDK | — | Processamento de pagamentos |
| Swagger / OpenAPI | — | Documentação da API |

---

## 📋 Pré-requisitos

Certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) **≥ 18**
- [.NET SDK](https://dotnet.microsoft.com/download) **8.0**
- [SQL Server](https://www.microsoft.com/sql-server) **2019+** (ou SQL Server Express)
- [Git](https://git-scm.com/)
- Conta na [Stripe](https://stripe.com/) (para pagamentos — modo teste gratuito)

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/foodpay.git
cd foodpay
```

### 2. Banco de Dados

Execute o script de criação do banco no SQL Server Management Studio ou via `sqlcmd`:

```bash
sqlcmd -S localhost -i database/schema.sql
```

> O script cria o banco `FoodPay` e todas as tabelas necessárias.

### 3. Backend — FoodPay.API

```bash
cd FoodPay.API/FoodPay.API
```

Configure o arquivo `appsettings.json` com suas credenciais:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=FoodPay;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "SUA_CHAVE_SECRETA_MINIMO_32_CARACTERES",
    "Issuer": "FoodPay.API",
    "Audience": "FoodPay.Client"
  },
  "Stripe": {
    "SecretKey": "sk_test_SUA_CHAVE_STRIPE",
    "WebhookSecret": "whsec_SEU_WEBHOOK_SECRET"
  }
}
```

Execute as migrations e inicie a API:

```bash
dotnet ef database update
dotnet run
```

A API estará disponível em: `https://localhost:7135`
Swagger UI: `https://localhost:7135/swagger`

### 4. Frontend — Food-Pay

```bash
cd Food-Pay
```

Copie e configure o arquivo de variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o `.env`:

```env
VITE_API_URL=https://localhost:7135/api
VITE_USE_MOCK=false
```

Instale as dependências e inicie o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

A aplicação estará disponível em: `http://localhost:5173`

---

## 🗄 Estrutura do Banco de Dados

```
FoodPay
├── Alunos              — Cadastro e saldo dos alunos
├── Responsaveis        — Responsáveis financeiros
├── ResponsavelAluno    — Vínculo entre responsáveis e alunos
├── Funcionarios        — Equipe da cantina
├── Categorias          — Categorias do cardápio
├── Produtos            — Itens do cardápio
├── Pedidos             — Pedidos realizados
├── ItensPedido         — Itens de cada pedido
├── Pagamentos          — Registros de pagamento (Stripe)
└── Notificacoes        — Notificações do sistema
```

> Script completo disponível em [`database/schema.sql`](database/schema.sql)

---

## 📁 Estrutura do Projeto

```
foodpay/
│
├── database/
│   └── schema.sql                  # Script de criação do banco
│
├── FoodPay.API/
│   └── FoodPay.API/
│       ├── Controllers/            # Endpoints da API REST
│       │   ├── AuthController.cs
│       │   ├── AlunosController.cs
│       │   ├── FuncionariosController.cs
│       │   ├── ResponsaveisController.cs
│       │   ├── ProdutosController.cs
│       │   ├── CategoriasController.cs
│       │   ├── PedidosController.cs
│       │   ├── PagamentosController.cs
│       │   ├── NotificacoesController.cs
│       │   ├── StripeController.cs
│       │   └── TransacoesFinanceirasController.cs
│       ├── Models/                 # Entidades do domínio
│       ├── DTOs/                   # Objetos de transferência
│       ├── Data/                   # AppDbContext (EF Core)
│       ├── Migrations/             # Histórico de migrations
│       ├── Program.cs              # Configuração da aplicação
│       └── appsettings.json        # Configurações (não commitado)
│
├── Food-Pay/
│   └── src/
│       ├── api/                    # Cliente HTTP e endpoints
│       ├── components/             # Componentes reutilizáveis
│       │   ├── auth/
│       │   ├── layout/
│       │   ├── ui/
│       │   └── ...
│       ├── config/                 # Configurações e navegação
│       ├── context/                # Contextos React (Auth)
│       ├── hooks/                  # Custom hooks
│       ├── pages/                  # Páginas por perfil
│       │   ├── aluno/
│       │   ├── funcionario/
│       │   ├── responsavel/
│       │   └── auth/
│       ├── routes/                 # Roteamento e proteção
│       ├── services/               # Serviços de API
│       ├── styles/                 # Estilos globais
│       └── utils/                  # Utilitários
│
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## 🔌 Endpoints da API

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/api/auth/login` | Autenticação de usuário | ❌ |
| `POST` | `/api/alunos` | Cadastro de aluno | ❌ |
| `GET` | `/api/alunos/{id}` | Dados do aluno | ✅ |
| `GET` | `/api/produtos` | Listar cardápio | ✅ |
| `GET` | `/api/categorias` | Listar categorias | ✅ |
| `POST` | `/api/pedidos` | Criar pedido | ✅ |
| `GET` | `/api/pedidos` | Listar pedidos | ✅ |
| `PUT` | `/api/pedidos/{id}/status` | Atualizar status | ✅ |
| `POST` | `/api/stripe/checkout` | Criar sessão de pagamento | ✅ |
| `POST` | `/api/stripe/webhook` | Webhook Stripe | ❌ |
| `GET` | `/api/notificacoes` | Listar notificações | ✅ |
| `GET` | `/api/pagamentos` | Histórico de pagamentos | ✅ |

> Documentação completa disponível no Swagger: `https://localhost:7135/swagger`

---

## 🔐 Variáveis de Ambiente

### Backend (`appsettings.json`)

| Variável | Descrição |
|---|---|
| `ConnectionStrings:DefaultConnection` | String de conexão SQL Server |
| `Jwt:Key` | Chave secreta JWT (mín. 32 caracteres) |
| `Jwt:Issuer` | Emissor do token |
| `Jwt:Audience` | Audiência do token |
| `Stripe:SecretKey` | Chave secreta Stripe (`sk_test_...`) |
| `Stripe:WebhookSecret` | Secret do webhook Stripe (`whsec_...`) |

### Frontend (`.env`)

| Variável | Descrição | Padrão |
|---|---|---|
| `VITE_API_URL` | URL base da API | `https://localhost:7135/api` |
| `VITE_USE_MOCK` | Usar dados mock (dev) | `false` |

---

## 👥 Equipe

| Nome | GitHub |
|---|---|
| Lavynia Vitória Silva Oliveira | [@lavynia](https://github.com/) |
| Paulo Ricardo Souza Lima | [@pauloricardo](https://github.com/) |
| Samuel Sousa Santos | [@samuel](https://github.com/) |
| Yann Freire Soares de Araujo | [@yann](https://github.com/) |

**Orientador:** Prof. MSc. Gustavo Martins Nunes Avellar

---

## 📜 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

<div align="center">
  <sub>Desenvolvido com ❤️ pela equipe FoodPay · SENAI Ribeirão Preto · 2026</sub>
</div>
