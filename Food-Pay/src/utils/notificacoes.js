/**
 * Gerenciamento de notificações locais (localStorage).
 *
 * A fonte principal das notificações de aluno e responsável é a API.
 * Este utilitário fica apenas para notificações locais do funcionário
 * geradas pelo polling de pedidos no navegador em uso.
 *
 * Importante: a chave é vinculada ao usuário logado para evitar que
 * notificações de um funcionário apareçam para outro no mesmo navegador.
 */

function normalizarIdentificador(usuario) {
  const identificador = usuario?.id ?? usuario?.email ?? "anonimo";
  return String(identificador)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.@-]/gi, "_");
}

export function chaveNotificacoes(perfil, usuario) {
  return `foodpay_notificacoes_${perfil}_${normalizarIdentificador(usuario)}`;
}

function ler(perfil, usuario) {
  try {
    return JSON.parse(localStorage.getItem(chaveNotificacoes(perfil, usuario))) || [];
  } catch {
    return [];
  }
}

function salvar(perfil, usuario, notificacoes) {
  localStorage.setItem(chaveNotificacoes(perfil, usuario), JSON.stringify(notificacoes));
}

/** Insere uma nova notificação não lida no início da lista do usuário/perfil */
export function criarNotificacao(perfil, mensagem, usuario = null, extra = {}) {
  const nova = {
    id: extra.id ?? Date.now(),
    mensagem,
    lida: false,
    local: true,
    dataEnvio: extra.dataEnvio ?? new Date().toISOString(),
    ...extra,
  };

  const atuais = ler(perfil, usuario);
  const jaExiste = atuais.some((n) => String(n.id) === String(nova.id));
  if (jaExiste) return atuais;

  const atualizadas = [nova, ...atuais];
  salvar(perfil, usuario, atualizadas);
  return atualizadas;
}

/** Retorna todas as notificações locais do usuário/perfil */
export function obterNotificacoes(perfil, usuario = null) {
  return ler(perfil, usuario);
}

/** Alias semântico de obterNotificacoes — preferido nos componentes de listagem */
export function listarNotificacoes(perfil, usuario = null) {
  return ler(perfil, usuario);
}

/** Retorna a quantidade de notificações locais ainda não lidas */
export function contarNaoLidas(perfil, usuario = null) {
  return ler(perfil, usuario).filter((n) => !n.lida).length;
}

/** Marca uma notificação local específica como lida */
export function marcarNotificacaoComoLida(perfil, id, usuario = null) {
  const atualizadas = ler(perfil, usuario).map((n) =>
    String(n.id) === String(id) ? { ...n, lida: true } : n,
  );
  salvar(perfil, usuario, atualizadas);
  return atualizadas;
}

/** Marca todas as notificações locais do usuário/perfil como lidas */
export function marcarTodasNotificacoesComoLidas(perfil, usuario = null) {
  const atualizadas = ler(perfil, usuario).map((n) => ({ ...n, lida: true }));
  salvar(perfil, usuario, atualizadas);
  return atualizadas;
}
