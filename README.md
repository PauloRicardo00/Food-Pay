<div align="center">

![Food-Pay](https://img.shields.io/badge/Food--Pay-Sistema%20Financeiro%20Escolar-blue?style=for-the-badge)

# 🍽️ Food-Pay

**Sistema de Gestão Financeira de Alimentação Escolar**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![.NET](https://img.shields.io/badge/.NET%209-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL%20Server-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)

</div>

---

## 📋 Sobre o Projeto

O **Food-Pay** é um sistema completo de gestão financeira para a alimentação escolar. A plataforma conecta **alunos**, **responsáveis** e **funcionários da cantina**: o cardápio, os pedidos, os pagamentos e o acompanhamento de gastos ficam em um só lugar, de forma simples e segura.

O projeto é dividido em três partes: um **frontend** em React, uma **API REST** em .NET com autenticação JWT e pagamentos via Stripe, e um **banco de dados** SQL Server.

---

## ✨ Funcionalidades

O sistema tem três perfis de usuário, além da área de acesso.

| Perfil | Telas |
| ------ | ----- |
| **Acesso** | Cadastro, login, escolha de perfil, recuperação e redefinição de senha |
| **Aluno** | Dashboard, cardápio, carrinho, pedidos, pagamentos, histórico, notificações, perfil |
| **Responsável** | Dashboard, dependentes, gastos, histórico, limite (com pagamento via Stripe), notificações, perfil, configurações |
| **Funcionário** | Dashboard, cardápio, pedidos, pagamentos, relatórios, notificações, perfil, configurações |

Também estão no projeto:

- Autenticação e rotas protegidas por perfil, com JWT
- Pagamentos com **Stripe** (Checkout e webhook)
- Envio de e-mails por SMTP (Brevo)
- Upload de imagens de produtos
- Geração de PDF no frontend (jsPDF)

---

## 🖼️ Screenshots

<!--
Depois de subir as imagens para a pasta docs/screenshots, remova as marcas
de comentário abaixo e ajuste os nomes dos arquivos.

<p align="center">
  <img src="docs/screenshots/login.png" alt="Login" width="45%">
  <img src="docs/screenshots/dashboard-responsavel.png" alt="Dashboard do responsável" width="45%">
</p>
<p align="center">
  <img src="docs/screenshots/cardapio-aluno.png" alt="Cardápio do aluno" width="45%">
  <img src="docs/screenshots/pagamento.png" alt="Pagamento" width="45%">
</p>
-->

*Em breve.*

---

## 🚀 Tecnologias

| Camada | Tecnologia |
| ------ | ---------- |
| **Frontend** | React 19, Vite, React Router 7, Lucide React, React Hot Toast, jsPDF + jsPDF-AutoTable |
| **Qualidade** | ESLint, Prettier |
| **Backend** | .NET 9 / C# (ASP.NET Core Web API) |
| **Banco de Dados** | SQL Server |
| **Autenticação** | JWT (JSON Web Tokens) |
| **Pagamentos** | Stripe |
| **E-mail** | SMTP (Brevo) |

---

## 📁 Estrutura do Projeto

```
Food-Pay/
├── Food-Pay/                  # Frontend — React + Vite
│   ├── public/
│   └── src/
│       ├── api/  assets/  components/  config/  context/  hooks/
│       ├── layouts/  pages/  routes/  services/  styles/  utils/
│       └── App.jsx · main.jsx
│
├── FoodPay_API/               # Backend — .NET 9 / C#
│   └── FoodPay.API/
│       ├── Controllers/  DTOs/  Data/  Models/  Services/
│       ├── wwwroot/uploads/produtos/
│       └── Program.cs · appsettings.json
│
├── database/                  # Banco de Dados — Script SQL
│   └── database.sql
│
├── LICENSE
└── README.md
```

As telas do frontend ficam em `src/pages`, separadas por perfil: `auth`, `aluno`, `responsavel` e `funcionario`.

---

## ⚙️ Como Rodar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) v20.19 ou superior (LTS)
- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [SQL Server](https://www.microsoft.com/sql-server) e o SQL Server Management Studio (SSMS)
- Uma conta no [Stripe](https://stripe.com/) em modo de teste (para os pagamentos)

Clone o repositório:

```bash
git clone https://github.com/PauloRicardo00/Food-Pay.git
cd Food-Pay
```

---

### 🗄️ 1. Banco de Dados

1. Abra o **SQL Server Management Studio (SSMS)**
2. Execute o script `database/database.sql`
3. O banco `FoodPay` será criado

---

### 🖥️ 2. Backend (.NET 9)

A API fica em `FoodPay_API/FoodPay.API`.

```bash
cd FoodPay_API/FoodPay.API

# Restaure as dependências
dotnet restore

# Rode a aplicação
dotnet run
```

Antes de rodar, configure a conexão com o banco e as chaves (veja a seção abaixo). A porta em que a API sobe aparece no terminal e fica definida em `Properties/launchSettings.json`.

#### Configuração do backend

As configurações ficam em `appsettings.json`. **As chaves secretas ficam em branco no repositório e não devem ser commitadas.**

| Chave | Para que serve |
| ----- | -------------- |
| `ConnectionStrings:DefaultConnection` | Conexão com o SQL Server. O nome da instância (`.\MSSQLSERVER02`) é da máquina de quem desenvolveu: troque pelo da sua (por exemplo `localhost` ou `.\SQLEXPRESS`) |
| `Jwt:Key` | Chave de assinatura dos tokens. Use uma string longa e aleatória |
| `Jwt:Issuer` / `Jwt:Audience` | Já preenchidos (`FoodPayAPI` / `FoodPayAPIUsers`) |
| `Stripe:SecretKey` | Chave secreta do Stripe (`sk_test_...`) |
| `Stripe:WebhookSecret` | Segredo do webhook do Stripe (`whsec_...`) |
| `Stripe:SuccessUrl` / `Stripe:CancelUrl` | Para onde o Stripe redireciona depois do pagamento (já apontam para o frontend em `localhost:5173`) |
| `Smtp:Host` / `Smtp:Port` | Servidor de e-mail (padrão: Brevo, porta 587) |
| `Smtp:User` / `Smtp:Pass` / `Smtp:From` | Credenciais e remetente do e-mail |

Para guardar as chaves sem colocá-las em arquivo versionado, use o **user-secrets** do .NET (dentro de `FoodPay_API/FoodPay.API`):

```bash
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "sua-chave-longa-e-aleatoria"
dotnet user-secrets set "Stripe:SecretKey" "sk_test_..."
dotnet user-secrets set "Stripe:WebhookSecret" "whsec_..."
dotnet user-secrets set "Smtp:User" "seu-usuario"
dotnet user-secrets set "Smtp:Pass" "sua-senha"
dotnet user-secrets set "Smtp:From" "remetente@exemplo.com"
```

**Testando pagamentos:** use o Stripe em modo de teste. O cartão de teste é `4242 4242 4242 4242`, com qualquer data futura e qualquer CVC. Para receber o webhook localmente, use a [Stripe CLI](https://docs.stripe.com/stripe-cli) (`stripe listen --forward-to <URL do endpoint de webhook da API>`) e coloque o segredo que ela mostrar em `Stripe:WebhookSecret`.

---

### 🌐 3. Frontend (React + Vite)

```bash
# Entre na pasta do frontend (dentro do repositório)
cd Food-Pay

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env      # no Windows: copy .env.example .env

# Rode o projeto
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

#### Variáveis de ambiente

Edite o `.env` criado a partir do `.env.example`:

```env
VITE_API_URL=https://localhost:7000
VITE_STRIPE_PUBLIC_KEY=sua_chave_publica_stripe
```

`VITE_API_URL` deve apontar para o endereço em que a API subiu (confira a porta no terminal ao rodar o backend). `VITE_STRIPE_PUBLIC_KEY` é a chave **pública** do Stripe (`pk_test_...`).

#### Scripts disponíveis

| Comando | O que faz |
| ------- | --------- |
| `npm run dev` | Sobe o servidor de desenvolvimento |
| `npm run build` | Gera a versão de produção |
| `npm run preview` | Visualiza a build de produção |
| `npm run lint` | Roda o ESLint |

---

## 🔐 Segurança

- Nunca commite chaves reais (Stripe, JWT, SMTP) nem o arquivo `.env`
- O `.gitignore` já ignora `node_modules`, `bin`, `obj`, `.vs` e `.env`
- Use sempre chaves de **teste** do Stripe em desenvolvimento

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Equipe

Desenvolvido por **[Paulo Ricardo](https://github.com/PauloRicardo00)**, **[Samuel Sousa](https://github.com/samuel-log)**, **Yann Freire** e **Lavynia Vitoria**.
