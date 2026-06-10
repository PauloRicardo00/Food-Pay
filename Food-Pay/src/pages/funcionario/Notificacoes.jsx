/**
 * Notificações do funcionário.
 *
 * Como o banco atual ainda não possui notificações persistidas para funcionário,
 * esta tela exibe as notificações locais geradas pelo polling de pedidos.
 * A chave do localStorage é vinculada ao funcionário logado para não misturar
 * notificações entre usuários no mesmo navegador.
 */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  listarNotificacoes,
  marcarNotificacaoComoLida,
  marcarTodasNotificacoesComoLidas,
} from "../../utils/notificacoes";

function NotificacoesFuncionario() {
  const { user } = useAuth();
  const [notificacoes, setNotificacoes] = useState([]);
  const [marcando, setMarcando] = useState(false);

  function carregarNotificacoes() {
    const locais = listarNotificacoes("funcionario", user).sort(
      (a, b) => new Date(b.dataEnvio) - new Date(a.dataEnvio),
    );
    setNotificacoes(locais);
  }

  useEffect(() => {
    carregarNotificacoes();
    const intervalo = setInterval(carregarNotificacoes, 3000);
    return () => clearInterval(intervalo);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.email]);

  function marcarComoLida(id) {
    const atualizadas = marcarNotificacaoComoLida("funcionario", id, user);
    setNotificacoes(
      [...atualizadas].sort((a, b) => new Date(b.dataEnvio) - new Date(a.dataEnvio)),
    );
  }

  function marcarTodasComoLidas() {
    const naoLidas = notificacoes.filter((n) => !n.lida);
    if (naoLidas.length === 0) return;
    setMarcando(true);
    try {
      const atualizadas = marcarTodasNotificacoesComoLidas("funcionario", user);
      setNotificacoes(
        [...atualizadas].sort((a, b) => new Date(b.dataEnvio) - new Date(a.dataEnvio)),
      );
      toast.success(`${naoLidas.length} notificação(ões) marcada(s) como lida(s).`);
    } finally {
      setMarcando(false);
    }
  }

  const totalNaoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <div style={pageStyle}>
      <h1 style={tituloStyle}>
        Notificações{" "}
        {totalNaoLidas > 0 && (
          <span style={badgeStyle}>{totalNaoLidas} nova(s)</span>
        )}
      </h1>

      <p style={helperStyle}>
        As notificações de funcionário são geradas a partir dos pedidos pendentes
        detectados pelo sistema. Alunos e responsáveis usam notificações persistidas no servidor.
      </p>

      {notificacoes.length > 0 && (
        <div className="notif-actions">
          <button
            type="button"
            className="notif-mark-all"
            onClick={marcarTodasComoLidas}
            disabled={marcando || totalNaoLidas === 0}
          >
            <CheckCheck size={16} />
            {totalNaoLidas === 0
              ? "Todas já foram lidas"
              : `Marcar todas como lidas (${totalNaoLidas})`}
          </button>
        </div>
      )}

      {notificacoes.length === 0 ? (
        <p>Nenhuma notificação encontrada.</p>
      ) : (
        notificacoes.map((notificacao) => (
          <div
            key={notificacao.id}
            style={{
              ...cardStyle,
              borderLeft: notificacao.lida
                ? "6px solid #94a3b8"
                : "6px solid #b91c1c",
            }}
          >
            <p style={mensagemStyle}>{notificacao.mensagem}</p>

            <p style={dataStyle}>
              {new Date(notificacao.dataEnvio).toLocaleString("pt-BR")}
            </p>

            {!notificacao.lida && (
              <button
                style={buttonStyle}
                onClick={() => marcarComoLida(notificacao.id)}
              >
                Marcar como lida
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

const pageStyle = { padding: "30px", maxWidth: 980, margin: "0 auto" };
const tituloStyle = {
  fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
  fontWeight: "800",
  marginBottom: "12px",
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};
const helperStyle = { color: "#64748b", marginBottom: 24, lineHeight: 1.5 };
const badgeStyle = {
  fontSize: 12,
  fontWeight: 700,
  background: "#fee2e2",
  color: "#b91c1c",
  padding: "4px 10px",
  borderRadius: 999,
};
const cardStyle = {
  background: "#fff",
  borderRadius: "16px",
  padding: "20px",
  marginBottom: "16px",
  boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
};
const mensagemStyle = { fontSize: "16px", marginBottom: "8px" };
const dataStyle = { color: "#64748b", fontSize: "13px", marginBottom: "12px" };
const buttonStyle = {
  border: "none",
  borderRadius: "10px",
  padding: "9px 14px",
  background: "#b91c1c",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "0.88rem",
};

export default NotificacoesFuncionario;
