/**
 * Menus e rotas de navegação — definidos no front (não vêm da API).
 * Separar por perfil mantém cada área do sistema independente.
 */

/** Menu lateral completo do funcionário (desktop e gaveta mobile) */
export const menuFuncionario = [
  { label: "Painel", path: "/funcionario", icon: "layout-dashboard" },
  { label: "Pedidos", path: "/funcionario/pedidos", icon: "clipboard-list" },
  { label: "Pagamentos", path: "/funcionario/pagamentos", icon: "credit-card" },
  { label: "Cardápio", path: "/funcionario/cardapio", icon: "book-open" },
  { label: "Relatórios", path: "/funcionario/relatorios", icon: "bar-chart-3" },
  { label: "Configurações", path: "/funcionario/configuracoes", icon: "settings" },
];

export const menuAluno = [
  { label: "Início", path: "/aluno", icon: "home" },
  { label: "Pedidos", path: "/aluno/pedidos", icon: "clipboard-list" },
  { label: "Pagamentos", path: "/aluno/pagamentos", icon: "credit-card" },
  { label: "Cardápio", path: "/aluno/cardapio", icon: "book-open" },
  { label: "Histórico", path: "/aluno/historico", icon: "history" },
  { label: "Perfil", path: "/aluno/perfil", icon: "user" },
];

export const menuResponsavel = [
  { label: "Painel", path: "/responsavel", icon: "layout-dashboard" },
  { label: "Meus dependentes", path: "/responsavel/dependentes", icon: "users" },
  { label: "Limite de gastos", path: "/responsavel/limite", icon: "shield" },
  { label: "Gastos e extrato", path: "/responsavel/gastos", icon: "receipt" },
  { label: "Histórico", path: "/responsavel/historico", icon: "history" },
  { label: "Notificações", path: "/responsavel/notificacoes", icon: "bell" },
  { label: "Configurações", path: "/responsavel/configuracoes", icon: "settings" },
];

/** Para onde ir logo após login bem-sucedido */
export const homePorPerfil = {
  aluno: "/aluno",
  funcionario: "/funcionario",
  responsavel: "/responsavel",
};

/**
 * Itens fixos na barra inferior do celular (atalhos rápidos).
 * end: true = só marca ativo na URL exata (ex.: /aluno, não /aluno/pedidos).
 */
export const bottomNavAluno = [
  { label: "Início", path: "/aluno", icon: "home", end: true },
  { label: "Pedidos", path: "/aluno/pedidos", icon: "clipboard-list" },
  { label: "Pagamentos", path: "/aluno/pagamentos", icon: "credit-card" },
  { label: "Perfil", path: "/aluno/perfil", icon: "user" },
];

export const bottomNavFuncionario = [
  { label: "Início", path: "/funcionario", icon: "layout-dashboard", end: true },
  { label: "Pedidos", path: "/funcionario/pedidos", icon: "clipboard-list" },
  { label: "Cardápio", path: "/funcionario/cardapio", icon: "book-open" },
  { label: "Mais", path: "/funcionario/configuracoes", icon: "settings" },
];

export const bottomNavResponsavel = [
  { label: "Início", path: "/responsavel", icon: "layout-dashboard", end: true },
  { label: "Dependentes", path: "/responsavel/dependentes", icon: "users" },
  { label: "Gastos", path: "/responsavel/gastos", icon: "receipt" },
  { label: "Mais", path: "/responsavel/configuracoes", icon: "settings" },
];
