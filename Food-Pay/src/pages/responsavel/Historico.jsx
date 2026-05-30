import { useEffect, useState } from "react";
import { api } from "../../api/client";

function HistoricoResponsavel() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarHistorico();
  }, []);

  async function carregarHistorico() {
    try {
      const dependentes = await api.get("/ResponsavelAluno");
      const todosPedidos = await api.get("/Pedidos");

      const idsDependentes = dependentes.map((item) => item.alunoId);

      const pedidosDosDependentes = todosPedidos.filter((pedido) =>
        idsDependentes.includes(pedido.alunoId)
      );

      setPedidos(pedidosDosDependentes);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={pageStyle}>
        <h1>Histórico</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={tituloStyle}>Histórico dos dependentes</h1>

      {pedidos.length === 0 ? (
        <p>Nenhum pedido encontrado.</p>
      ) : (
        pedidos.map((pedido) => (
          <div key={pedido.id} style={cardStyle}>
            <div>
              <h2>Pedido #{pedido.id}</h2>

              <p>
                <strong>Aluno:</strong> {pedido.alunoNome || "Aluno"}
              </p>

              <p>
                <strong>Status:</strong> {pedido.status}
              </p>

              <p>
                <strong>Total:</strong> R$ {Number(pedido.valorTotal).toFixed(2)}
              </p>

              <p>
                <strong>Data:</strong>{" "}
                {new Date(pedido.dataPedido).toLocaleString("pt-BR")}
              </p>

              <div style={{ marginTop: "12px" }}>
                <strong>Itens:</strong>

                {pedido.itens?.length > 0 ? (
                  pedido.itens.map((item) => (
                    <div key={item.id}>
                      • {item.produtoNome} x{item.quantidade}
                    </div>
                  ))
                ) : (
                  <p>Nenhum item encontrado.</p>
                )}
              </div>
            </div>

            <span
              style={{
                ...statusStyle,
                background:
                  pedido.status === "Entregue"
                    ? "#16a34a"
                    : pedido.status === "Em preparo"
                    ? "#2563eb"
                    : "#d97706",
              }}
            >
              {pedido.status}
            </span>
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
  borderRadius: "18px",
  padding: "24px",
  marginBottom: "18px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
};

const statusStyle = {
  color: "#fff",
  padding: "8px 14px",
  borderRadius: "999px",
  fontWeight: "600",
  fontSize: "14px",
};

export default HistoricoResponsavel;