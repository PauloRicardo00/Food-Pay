/**
 * Central de notificações do aluno.
 * Consome o endpoint /Notificacoes/minhas e exibe notificações em
 * ordem decrescente de data. Permite marcar individualmente ou todas
 * como lidas com atualização otimista de estado.
 */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCheck } from "lucide-react";
import { api } from "../../api/client";
import "./aluno.css";

function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marcando, setMarcando] = useState(false);

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  async function carregarNotificacoes() {
  try {
    const notificacoesBanco = await api.get("/Notificacoes/minhas");

    const notificacoesOrdenadas = [...notificacoesBanco].sort(
      (a, b) => new Date(b.dataEnvio) - new Date(a.dataEnvio)
    );

    setNotificacoes(notificacoesOrdenadas);
  } catch (error) {
    console.error("Erro ao carregar notificações:", error);
    toast.error("Não foi possível carregar as notificações.");
    setNotificacoes([]);
  } finally {
    setLoading(false);
    }
  }

  async function marcarComoLida(notificacao) {
    try {
      await api.put(`/Notificacoes/${notificacao.id}/ler`);

      setNotificacoes((prev) =>
        prev.map((n) =>
          n.id === notificacao.id ? { ...n, lida: true } : n
        )
      );
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
      toast.error("Não foi possível marcar a notificação como lida.");
    }
  }

  async function marcarTodasComoLidas() {
    const naoLidas = notificacoes.filter((n) => !n.lida);
    if (naoLidas.length === 0) return;
    setMarcando(true);
    try {
      for (const n of naoLidas) {
        try {
          await marcarComoLida(n);
        } catch (e) {
          console.error(e);
        }
      }
      toast.success(`${naoLidas.length} notificação(ões) marcada(s) como lida(s).`);
    } finally {
      setMarcando(false);
    }
  }

  const totalNaoLidas = notificacoes.filter((n) => !n.lida).length;

  if (loading) {
    return (
      <div style={pageStyle}>
        <h1 style={tituloStyle}>Notificações</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={tituloStyle}>
        Notificações{" "}
        {totalNaoLidas > 0 && (
          <span style={badgeStyle}>{totalNaoLidas} nova(s)</span>
        )}
      </h1>

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
            key={`${notificacao.local ? "local" : "api"}-${notificacao.id}`}
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
              <button style={buttonStyle} onClick={() => marcarComoLida(notificacao)}>
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
  marginBottom: "24px",
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};
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

export default Notificacoes;
