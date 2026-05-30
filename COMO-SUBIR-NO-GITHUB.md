# 🚀 Guia: Como Subir o FoodPay no GitHub

Siga este passo a passo para publicar o projeto de forma profissional.

---

## 1. Crie o repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique em **"New repository"** (botão verde `+`)
3. Configure:
   - **Repository name:** `foodpay`
   - **Description:** `Sistema de Gestão Financeira de Alimentação Escolar — Projeto Integrador SENAI 2026`
   - **Visibility:** `Public` (para portfólio) ou `Private`
   - ❌ **NÃO** marque "Add a README file" (você já tem um)
   - ❌ **NÃO** marque "Add .gitignore" (você já tem um)
4. Clique em **"Create repository"**

---

## 2. Organize a pasta local

A estrutura final da pasta deve ser:

```
foodpay/                         ← pasta raiz do repositório
│
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
│
├── database/
│   └── schema.sql               ← script do banco de dados
│
├── FoodPay.API/                 ← backend C# (.NET 8)
│   └── FoodPay.API/
│       ├── Controllers/
│       ├── Models/
│       ├── DTOs/
│       ├── Data/
│       ├── Migrations/
│       ├── Program.cs
│       ├── FoodPay.API.csproj
│       └── appsettings.template.json   ← template (sem senhas!)
│
├── Food-Pay/                    ← frontend React + Vite
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example             ← template de variáveis
│   └── .gitignore
│
├── .gitignore                   ← raiz do projeto
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

### ⚠️ Antes de continuar — verifique estes arquivos

**REMOVA ou CONFIRME que NÃO estão sendo commitados:**
- `FoodPay.API/FoodPay.API/appsettings.json` (tem sua senha do banco e chave Stripe)
- `FoodPay.API/FoodPay.API/appsettings.Development.json`
- `Food-Pay/.env` (tem a URL da API)
- Pasta `node_modules/`
- Pastas `bin/` e `obj/`
- Pasta `.vs/`

---

## 3. Inicialize o Git e faça o primeiro commit

Abra o terminal na pasta `foodpay/`:

```bash
# Inicializa o repositório Git
git init

# Adiciona todos os arquivos (respeitando o .gitignore)
git add .

# Verifica o que será commitado — IMPORTANTE!
git status

# Se aparecer appsettings.json ou .env na lista, PARE
# e adicione-os ao .gitignore antes de continuar

# Cria o primeiro commit
git commit -m "feat: initial project setup - FoodPay v1.0"

# Define a branch principal como 'main'
git branch -M main

# Conecta ao repositório remoto (substitua pela sua URL)
git remote add origin https://github.com/SEU-USUARIO/foodpay.git

# Faz o push
git push -u origin main
```

---

## 4. Configure o repositório no GitHub

Após o push, acesse o repositório e configure:

### Topics (tags de pesquisa)
Vá em **⚙️ Settings → General → Topics** e adicione:
```
react vite dotnet aspnet csharp sqlserver jwt stripe
escola cantina gestao-financeira projeto-integrador senai
```

### Description
```
Sistema de Gestão Financeira de Alimentação Escolar | React + .NET 8 + SQL Server + Stripe
```

### Website
Se fizer deploy, adicione o link aqui.

---

## 5. Crie a branch develop

Boa prática: manter `main` estável e desenvolver em `develop`.

```bash
git checkout -b develop
git push -u origin develop
```

No GitHub, vá em **Settings → Branches** e defina `develop` como default branch para novos PRs.

---

## 6. Proteja a branch main (opcional mas recomendado)

**Settings → Branches → Add branch protection rule:**
- Branch name pattern: `main`
- ✅ Require a pull request before merging
- ✅ Require at least 1 approval

---

## 7. Verifique o README

Acesse `github.com/SEU-USUARIO/foodpay` e confirme que:
- [ ] O README aparece formatado corretamente
- [ ] Os badges estão visíveis
- [ ] Os links internos funcionam
- [ ] A estrutura de pastas está clara

---

## ✅ Checklist Final

- [ ] Repositório criado no GitHub
- [ ] `appsettings.json` **NÃO** está no repositório
- [ ] `.env` **NÃO** está no repositório
- [ ] `node_modules/` **NÃO** está no repositório
- [ ] `appsettings.template.json` está presente (com valores fictícios)
- [ ] `.env.example` está presente (com valores fictícios)
- [ ] `database/schema.sql` está presente
- [ ] README está formatado corretamente
- [ ] Topics configurados no GitHub
- [ ] Branch `develop` criada

---

> 💡 **Dica:** Compartilhe o link do repositório no seu LinkedIn e portfólio. Um projeto bem documentado no GitHub é um diferencial enorme no mercado!
