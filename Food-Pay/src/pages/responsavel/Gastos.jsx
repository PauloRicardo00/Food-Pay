import { useEffect, useState } from "react";
import { api } from "../../api/client";

function Gastos() {
  const [dependentes, setDependentes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const dadosDependentes = await api.get("/ResponsavelAluno");
      const dadosPedidos = await api.get("/Pedidos");

      const idsDependentes = dadosDependentes.map((item) => item.alunoId);

      const pedidosDosDependentes = dadosPedidos.filter((pedido) =>
        idsDependentes.includes(pedido.alunoId)
      );

      setDependentes(dadosDependentes);
      setPedidos(pedidosDosDependentes);
    } catch (error) {
      console.error("Erro ao carregar gastos:", error);
    } finally {
      setLoading(false);
    }
  }

  const totalGasto = pedidos.reduce(
    (total, pedido) => total + Number(pedido.valorTotal),
    0
  );

  const hoje = new Date().toLocaleDateString("pt-BR");

  const totalHoje = pedidos
    .filter(
      (pedido) =>
        new Date(pedido.dataPedido).toLocaleDateString("pt-BR") === hoje
    )
    .reduce((total, pedido) => total + Number(pedido.valorTotal), 0);

  if (loading) {
    return (
      <div style={pageStyle}>
        <h1>Gastos e extrato</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={tituloStyle}>Gastos e extrato</h1>

      <div style={cardsResumoStyle}>
        <div style={resumoCardStyle}>
          <p style={resumoLabelStyle}>Total gasto</p>
          <h2>R$ {totalGasto.toFixed(2)}</h2>
        </div>

        <div style={resumoCardStyle}>
          <p style={resumoLabelStyle}>Gasto hoje</p>
          <h2>R$ {totalHoje.toFixed(2)}</h2>
        </div>

        <div style={resumoCardStyle}>
          <p style={resumoLabelStyle}>Dependentes</p>
          <h2>{dependentes.length}</h2>
        </div>
      </div>

      <h2 style={subtituloStyle}>Últimas compras</h2>

      {pedidos.length === 0 ? (
        <p>Nenhuma compra encontrada.</p>
      ) : (
        pedidos.map((pedido) => (
          <div key={pedido.id} style={cardStyle}>
            <div>
              <h3>Pedido #{pedido.id}</h3>

              <p>
                <strong>Aluno:</strong> {pedido.alunoNome || "Aluno"}
              </p>

              <p>
                <strong>Status:</strong> {pedido.status}
              </p>

              <p>
                <strong>Data:</strong>{" "}
                {new Date(pedido.dataPedido).toLocaleString("pt-BR")}
              </p>
            </div>

            <strong style={valorStyle}>
              R$ {Number(pedido.valorTotal).toFixed(2)}
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

const subtituloStyle = {
  fontSize: "28px",
  marginBottom: "16px",
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

export default Gastos;