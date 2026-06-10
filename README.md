<div align="center">

<img src="https://img.shields.io/badge/Food--Pay-Sistema%20Financeiro%20Escolar-blue?style=for-the-badge" alt="Food-Pay"/>

# 🍽️ Food-Pay

**Sistema de Gestão Financeira de Alimentação Escolar**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![.NET](https://img.shields.io/badge/.NET%208-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)](https://www.microsoft.com/sql-server)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)

</div>

---

## 📋 Sobre o Projeto

O **Food-Pay** é um sistema completo de gestão financeira voltado para a alimentação escolar. A plataforma permite o controle de pagamentos, gestão de alunos e acompanhamento financeiro da merenda escolar de forma simples e segura.

---

## 🚀 Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 18 + Vite |
| **Backend** | .NET 8 / C# |
| **Banco de Dados** | SQL Server |
| **Autenticação** | JWT (JSON Web Tokens) |
| **Pagamentos** | Stripe |

---

## 📁 Estrutura do Projeto

```
Food-Pay/
├── Food-Pay/          # Frontend — React + Vite
│   ├── src/
│   ├── public/
│   └── package.json
│
├── FoodPay_API/       # Backend — .NET 8 / C#
│   ├── Controllers/
│   ├── Models/
│   └── FoodPay_API.csproj
│
└── database/          # Banco de Dados — Scripts SQL
    └── database.sql
```

---

## ⚙️ Como Rodar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [SQL Server](https://www.microsoft.com/sql-server)

---

### 🗄️ Banco de Dados

1. Abra o **SQL Server Management Studio (SSMS)**
2. Execute o script localizado em `database/database.sql`
3. O banco de dados será criado automaticamente

---

### 🖥️ Backend (.NET 8)

```bash
# Entre na pasta do backend
cd FoodPay_API

# Restaure as dependências
dotnet restore

# Configure a connection string no appsettings.json

# Rode a aplicação
dotnet run
```

> A API estará disponível em `https://localhost:7000`

---

### 🌐 Frontend (React + Vite)

```bash
# Entre na pasta do frontend
cd Food-Pay

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Rode o projeto
npm run dev
```

> O frontend estará disponível em `http://localhost:5173`

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na pasta do frontend com base no `.env.example`:

```env
VITE_API_URL=https://localhost:7000
VITE_STRIPE_PUBLIC_KEY=sua_chave_publica_stripe
```

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

Desenvolvido por **Paulo Ricardo**

</div>
