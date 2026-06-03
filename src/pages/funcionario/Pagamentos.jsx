import { useEffect, useState } from "react";
import { api } from "../../api/client";

function PagamentosFuncionario() {
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarTransacoes();
  }, []);

  async function carregarTransacoes() {
    try {
      const data = await api.get("/TransacoesFinanceiras");
      setTransacoes(data.reverse());
    } catch (error) {
      console.error("Erro ao carregar pagamentos:", error);
    } finally {
      setLoading(false);
    }
  }

  const totalRecargas = transacoes
    .filter((t) => t.tipo === "RECARGA")
    .reduce((total, t) => total + Number(t.valor), 0);

  const totalCompras = transacoes
    .filter((t) => t.tipo === "COMPRA")
    .reduce((total, t) => total + Number(t.valor), 0);

  if (loading) {
    return (
      <div style={pageStyle}>
        <h1>Pagamentos</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={tituloStyle}>Pagamentos</h1>

      <div style={cardsResumoStyle}>
        <div style={resumoCardStyle}>
          <p style={resumoLabelStyle}>Total em recargas</p>
          <h2>R$ {totalRecargas.toFixed(2)}</h2>
        </div>

        <div style={resumoCardStyle}>
          <p style={resumoLabelStyle}>Total em compras</p>
          <h2>R$ {totalCompras.toFixed(2)}</h2>
        </div>

        <div style={resumoCardStyle}>
          <p style={resumoLabelStyle}>Transações</p>
          <h2>{transacoes.length}</h2>
        </div>
      </div>

      {transacoes.length === 0 ? (
        <p>Nenhuma transação encontrada.</p>
      ) : (
        transacoes.map((transacao) => (
          <div key={transacao.id} style={cardStyle}>
            <div>
              <h2>Transação #{transacao.id}</h2>

              <p>
                <strong>Tipo:</strong> {transacao.tipo}
              </p>

              <p>
                <strong>Descrição:</strong> {transacao.descricao}
              </p>

              <p>
                <strong>Data:</strong>{" "}
                {new Date(transacao.dataTransacao).toLocaleString("pt-BR")}
              </p>
            </div>

            <strong
              style={{
                ...valorStyle,
                color: transacao.tipo === "RECARGA" ? "#16a34a" : "#0f172a",
              }}
            >
              R$ {Number(transacao.valor).toFixed(2)}
            </strong>
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

const cardsResumoStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  marginBottom: "30px",
};

const resumoCardStyle = {
  background: "#fff",
  borderRadius: "18px",
  padding: "24px",
};

const resumoLabelStyle = {
  color: "#64748b",
  marginBottom: "8px",
};

const cardStyle = {
  background: "#fff",
  borderRadius: "18px",
  padding: "24px",  
  marginBottom: "16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
};

const valorStyle = {
  fontSize: "22px",
};

export default PagamentosFuncionario;