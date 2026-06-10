/**
 * Mapa centralizado de endpoints da API.
 *
 * Alterar um caminho aqui reflete em todo o sistema sem precisar
 * buscar referências espalhadas nos services e pages.
 */
export const endpoints = {
  auth: {
    login:                "/Auth/login",
    register:             "/Auth/register",
    me:                   "/Auth/me",
    logout:               "/Auth/logout",
    solicitarResetSenha:  "/Auth/solicitar-reset-senha",
    confirmarResetSenha:  "/Auth/confirmar-reset-senha",
  },

  funcionario: {
    dashboard:  "/funcionario/dashboard",
    pedidos:    "/funcionario/pedidos",
    pagamentos: "/funcionario/pagamentos",
    cardapio:   "/funcionario/cardapio",
    relatorios: "/funcionario/relatorios",
  },

  aluno: {
    dashboard: "/aluno/dashboard",
    cardapio:  "/aluno/cardapio",
    pedidos:   "/aluno/pedidos",
    pagamentos:"/aluno/pagamentos",
    historico: "/aluno/historico",
    perfil:    "/aluno/perfil",
  },

  responsavel: {
    dashboard:    "/responsavel/dashboard",
    dependentes:  "/responsavel/dependentes",
    limite:       "/responsavel/limite",
    gastos:       "/responsavel/gastos",
    historico:    "/responsavel/historico",
    notificacoes: "/responsavel/notificacoes",
  },
};
