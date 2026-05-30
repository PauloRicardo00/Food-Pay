# Integração com o backend — Food Pay

Este front-end já está preparado para conectar a uma API. **Não atualiza tudo sozinho**: o que já tem tela e serviço prontos passa a usar a API ao ligar o `.env`; as rotas com texto placeholder precisam de tela nova feita por quem integrar.

## Ligar a API real

No arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3000/api
VITE_USE_MOCK=false
```

Reinicie o servidor (`npm run dev`).

| `VITE_USE_MOCK` | Comportamento |
|-----------------|---------------|
| `true` (padrão) | Dados fictícios em `src/mocks/data.js` |
| `false`         | Chamadas HTTP via `src/api/client.js` |

## O que já atualiza “automaticamente”

Estas partes **já têm** página + hook + serviço. Com `VITE_USE_MOCK=false` e o backend respondendo nos formatos esperados (ou ajustando `src/api/mappers.js`), os dados mudam sem refazer o layout:

| Área | Serviço | Endpoint (ver `src/api/endpoints.js`) |
|------|---------|----------------------------------------|
| Login / cadastro / sessão | `authService.js` | `/auth/*` |
| Início do aluno | `alunoService.js` → `getDashboard()` | `GET /aluno/dashboard` |
| Painel funcionário | `funcionarioService.js` | `GET /funcionario/dashboard` |
| Painel responsável | `responsavelService.js` | `GET /responsavel/dashboard` |

Fluxo: **página** → **hook** (`useAlunoDashboard`, etc.) → **service** → se mock, retorna JSON local; senão, `api.get/post` → **mapper** normaliza o JSON → a tela re-renderiza.

## O que NÃO some sozinho (telas placeholder)

Rotas como Pedidos, Pagamentos, Histórico, Perfil usam `PlaceholderPage` em `src/routes/AppRoutes.jsx`. A mensagem *"Esta seção está na navegação..."* **só desaparece** quando alguém:

1. Criar a página real (ex.: `src/pages/aluno/Pedidos.jsx`);
2. Implementar funções no service (ex.: `getPedidos()` em `alunoService.js`);
3. Trocar em `AppRoutes.jsx`:

   ```jsx
   // Antes
   <Route path="pedidos" element={<PlaceholderPage titulo="Pedidos" />} />

   // Depois
   <Route path="pedidos" element={<PedidosAluno />} />
   ```

## Onde o integrador trabalha

| Arquivo | Função |
|---------|--------|
| `src/api/endpoints.js` | Caminhos da API |
| `src/api/client.js` | HTTP, token JWT no header |
| `src/api/mappers.js` | Adaptar JSON do backend ao formato das telas |
| `src/services/*.js` | `if (env.useMock)` + chamada real |
| `src/mocks/data.js` | Dados de desenvolvimento |
| `.env` | URL e mock on/off |

## Contrato sugerido

Os mappers documentam o formato que as telas esperam. Se o backend devolver campos diferentes, altere o mapper — **não** é obrigatório mudar cada componente visual.

Exemplo: `mapDashboardAluno` em `mappers.js` deve produzir `cardapio`, `saldoFormatado`, `ultimosPedidos`, etc.

## Resumo

- **Sim**, painéis principais e login podem passar a dados reais só configurando `.env` e implementando a API compatível.
- **Não**, placeholders não viram telas completas sozinhos — é preciso criar cada página e rota.
- **Sim**, a arquitetura (client → service → hook → UI) já está pronta para isso.
