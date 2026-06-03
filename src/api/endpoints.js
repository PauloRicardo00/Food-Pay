/**
 * Mapa de caminhos da API REST.
 * O integrador do backend implementa estes endpoints (ou ajusta os paths aqui).
 * Prefixo completo = VITE_API_URL + path (ex.: http://localhost:3000/api/aluno/dashboard)
 */
export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
    logout: "/auth/logout",
  },
  funcionario: {
    dashboard: "/funcionario/dashboard",
    pedidos: "/funcionario/pedidos",
    pagamentos: "/funcionario/pagamentos",
    cardapio: "/funcionario/cardapio",
    relatorios: "/funcionario/relatorios",
  },
  aluno: {
    dashboard: "/aluno/dashboard",
    cardapio: "/aluno/cardapio",
    pedidos: "/aluno/pedidos",
    pagamentos: "/aluno/pagamentos",
    historico: "/aluno/historico",
    perfil: "/aluno/perfil",
  },
  responsavel: {
    dashboard: "/responsavel/dashboard",
    dependentes: "/responsavel/dependentes",
    limite: "/responsavel/limite",
    gastos: "/responsavel/gastos",
    historico: "/responsavel/historico",
    notificacoes: "/responsavel/notificacoes",
  },
};
