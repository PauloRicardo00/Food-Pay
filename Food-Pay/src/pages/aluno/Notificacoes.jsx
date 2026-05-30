import { useEffect, useState } from "react";
import { api } from "../../api/client";
import {
  listarNotificacoes,
  marcarNotificacaoComoLida,
} from "../../utils/notificacoes";

function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  async function carregarNotificacoes() {
    try {
      const notificacoesBanco = await api.get("/Notificacoes/minhas");
      const notificacoesLocais = listarNotificacoes("aluno");

      const todas = [...notificacoesLocais, ...notificacoesBanco].sort(
        (a, b) => new Date(b.dataEnvio) - new Date(a.dataEnvio)
      );

      setNotificacoes(todas);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);

      const notificacoesLocais = listarNotificacoes("aluno");
      setNotificacoes(notificacoesLocais);
    } finally {
      setLoading(false);
    }
  }

  async function marcarComoLida(notificacao) {
    try {
      if (notificacao.local) {
        const atualizadas = marcarNotificacaoComoLida("aluno", notificacao.id);
        setNotificacoes(atualizadas);
        return;
      }

      await api.put(`/Notificacoes/${notificacao.id}/ler`);
      carregarNotificacoes();
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  }

  if (loading) {
    return (
      <div style={pageStyle}>
        <h1>Notificações</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={tituloStyle}>Notificações</h1>

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
                onClick={() => marcarComoLida(notificacao)}
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

const pageStyle = {
  padding: "30px",
};

const tituloStyle = {
  fontSize: "42px",
  fontWeight: "700",
  marginBottom: "24px",
};

const cardStyle = {
  background: "#fff",
  borderRadius: "16px",
  padding: "20px",
  marginBottom: "16px",
};

const mensagemStyle = {
  fontSize: "18px",
  marginBottom: "8px",
};

const dataStyle = {
  color: "#64748b",
  fontSize: "14px",
  marginBottom: "12px",
};

const buttonStyle = {
  border: "none",
  borderRadius: "10px",
  padding: "10px 14px",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
};

export default Notificacoes;