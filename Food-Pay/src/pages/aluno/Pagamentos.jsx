/**
 * Histórico de transações financeiras do aluno — GET /TransacoesFinanceiras/minhas.
 * Exibe tipo, valor, descrição e data de cada movimentação.
 */
import { useEffect, useState } from "react";
import { api } from "../../api/client";

function Pagamentos() {
  const [transacoes, setTransacoes] = useState([]);

  useEffect(() => {
    carregarTransacoes();
  }, []);

  async function carregarTransacoes() {
    try {
      const data = await api.get("/TransacoesFinanceiras/minhas");
      setTransacoes(data);
    } catch (error) {
      console.error("Erro ao carregar pagamentos:", error);
    }
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1 style={tituloStyle}>Pagamentos</h1>

      {transacoes.length === 0 ? (
        <p>Nenhum pagamento encontrado.</p>
      ) : (
        transacoes.map((transacao) => (
          <div key={transacao.id} style={cardStyle}>
            <h2>Transação #{transacao.id}</h2>

            <p>
              <strong>Tipo:</strong> {transacao.tipo}
            </p>

            <p>
              <strong>Valor:</strong> R$ {Number(transacao.valor).toFixed(2)}
            </p>

            <p>
              <strong>Descrição:</strong> {transacao.descricao}
            </p>

            <p>
              <strong>Data:</strong>{" "}
              {new Date(transacao.dataTransacao).toLocaleString("pt-BR")}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

const tituloStyle = {
  fontSize: "42px",
  fontWeight: "700",
  marginBottom: "24px",
};

const cardStyle = {
  background: "#fff",
  borderRadius: "18px",
  padding: "24px",
  marginBottom: "18px",
};

export default Pagamentos;
