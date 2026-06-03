import { useEffect, useState } from "react";
import {
  listarNotificacoes,
  marcarNotificacaoComoLida,
} from "../../utils/notificacoes";

function NotificacoesFuncionario() {
  const [notificacoes, setNotificacoes] = useState([]);

  useEffect(() => {
    setNotificacoes(listarNotificacoes("funcionario"));
  }, []);

  function marcarComoLida(id) {
    const atualizadas = marcarNotificacaoComoLida("funcionario", id);
    setNotificacoes(atualizadas);
  }

  return (
    <div style={pageStyle}>
      <h1 style={tituloStyle}>Notificações</h1>

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
                : "6px solid #2563eb",
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

const pageStyle = { padding: "30px" };
const tituloStyle = { fontSize: "42px", fontWeight: "700", marginBottom: "24px" };
const cardStyle = { background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "16px" };
const mensagemStyle = { fontSize: "18px", marginBottom: "8px" };
const dataStyle = { color: "#64748b", fontSize: "14px", marginBottom: "12px" };
const buttonStyle = {
  border: "none",
  borderRadius: "10px",
  padding: "10px 14px",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
};

export default NotificacoesFuncionario;