export function criarNotificacao(perfil, mensagem) {
  const chave = `foodpay_notificacoes_${perfil}`;

  const notificacoesAtuais =
    JSON.parse(localStorage.getItem(chave)) || [];

  const novaNotificacao = {
    id: Date.now(),
    mensagem,
    lida: false,
    local: true,
    dataEnvio: new Date().toISOString(),
  };

  localStorage.setItem(
    chave,
    JSON.stringify([novaNotificacao, ...notificacoesAtuais])
  );
}

export function obterNotificacoes(perfil) {
  return JSON.parse(
    localStorage.getItem(`foodpay_notificacoes_${perfil}`)
  ) || [];
}

export function contarNaoLidas(perfil) {
  return obterNotificacoes(perfil).filter(
    (n) => !n.lida
  ).length;
}

export function listarNotificacoes(perfil) {
  return JSON.parse(
    localStorage.getItem(`foodpay_notificacoes_${perfil}`)
  ) || [];
}

export function marcarNotificacaoComoLida(perfil, id) {
  const chave = `foodpay_notificacoes_${perfil}`;

  const notificacoes =
    JSON.parse(localStorage.getItem(chave)) || [];

  const atualizadas = notificacoes.map((notificacao) =>
    notificacao.id === id
      ? { ...notificacao, lida: true }
      : notificacao
  );

  localStorage.setItem(chave, JSON.stringify(atualizadas));

  return atualizadas;
}