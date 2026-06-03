# Integração Backend — Food Pay

Guia para o time de backend conectar na API do front-end React.

## Configuração rápida

1. Copie `.env.example` para `.env`
2. Ajuste a URL da API:

```env
VITE_API_URL=http://localhost:3000/api
VITE_USE_MOCK=false
```

3. Reinicie o servidor: `npm run dev`

## Autenticação

O front envia o token JWT no header:

```
Authorization: Bearer <token>
```

O token é salvo em `localStorage` (`foodpay_token`) após o login.

### POST `/auth/login`

**Body:**

```json
{
  "email": "usuario@email.com",
  "senha": "123456",
  "perfil": "aluno"
}
```

`perfil`: `"aluno"` | `"funcionario"` | `"responsavel"`

**Resposta (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "nome": "João Silva",
    "email": "usuario@email.com",
    "perfil": "aluno"
  }
}
```

### POST `/auth/register`

**Body:**

```json
{
  "nome": "João Silva",
  "email": "usuario@email.com",
  "senha": "123456",
  "perfil": "aluno"
}
```

### GET `/auth/me`

Retorna o usuário logado (mesmo formato de `user` no login).

### POST `/auth/logout`

Invalida sessão (opcional; o front também limpa o token local).

---

## Endpoints dos painéis

### GET `/funcionario/dashboard`

```json
{
  "resumoPagamentos": {
    "totalHoje": 356,
    "mensagem": "Recebido apenas online..."
  },
  "pedidosRecentes": [
    {
      "id": 1025,
      "data": "12/04/2025 - 11:30",
      "cliente": "Cauã Carvalho",
      "status": "Entregue",
      "valor": 18
    }
  ],
  "kpis": {
    "pedidosDia": 18,
    "pedidosDiaVariacao": 12,
    "faturamentoDia": 356,
    "faturamentoDiaVariacao": 8,
    "pedidosEmAndamento": 5,
    "pedidosEntregues": 13
  }
}
```

`status` do pedido: `"Entregue"` | `"Em preparo"` | `"Confirmado"` | `"Preparando"`

---

### GET `/aluno/dashboard`

```json
{
  "nomeAluno": "Nome do Aluno",
  "saldo": 120,
  "cardapio": [
    {
      "id": 1,
      "nome": "Coca-Cola",
      "preco": 6,
      "imagem": "https://..."
    }
  ],
  "ultimosPedidos": [
    {
      "id": 1,
      "data": "12/04/2025 • 11:30",
      "item": "Combo Tradicional",
      "valor": 18,
      "status": "Entregue"
    }
  ]
}
```

### POST `/aluno/pedidos` (adicionar item)

```json
{ "produtoId": 1 }
```

---

### GET `/responsavel/dashboard?dependenteId=lucas`

```json
{
  "dependentes": [
    {
      "id": "lucas",
      "nome": "Lucas Oliveira",
      "escola": "Escola Central",
      "avatar": "https://..."
    }
  ],
  "resumo": {
    "saldo": 120,
    "limiteMensal": 300,
    "gastoMes": 180,
    "percentualLimite": 60,
    "diasRestantes": 12,
    "fimCiclo": "30/04"
  },
  "transacoes": [
    {
      "id": 1,
      "item": "Combo Tradicional",
      "local": "Cantina da Escola",
      "valor": 18,
      "data": "12/04 • 11:30",
      "imagem": "https://..."
    }
  ],
  "gastosPorCategoria": [
    { "nome": "Alimentação", "valor": 162, "percentual": 90, "cor": "#16a34a" }
  ],
  "gastoTotalMes": 180
}
```

---

## Onde alterar no front

| O quê | Arquivo |
|-------|---------|
| URLs dos endpoints | `src/api/endpoints.js` |
| Cliente HTTP (headers, erros) | `src/api/client.js` |
| Formato API → tela | `src/api/mappers.js` |
| Regras de negócio / chamadas | `src/services/*.js` |
| Dados fictícios | `src/mocks/data.js` |

## Erros da API

Responda JSON com `message` ou `error`:

```json
{ "message": "Email ou senha inválidos" }
```

O front exibe essa mensagem para o usuário.

## CORS

Libere a origem do Vite em desenvolvimento:

```
http://localhost:5173
```

## Modo mock

Com `VITE_USE_MOCK=true`, nenhuma chamada HTTP é feita — útil para o front trabalhar sem o backend pronto.
