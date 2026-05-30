import { useEffect, useState } from "react";
import { api } from "../../api/client";
import "./funcionario.css";

function DashboardFuncionario() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const data = await api.get("/pedidos");
        setPedidos(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  if (loading) {
    return <p>Carregando dashboard...</p>;
  }

  const pedidosPendentes = pedidos.filter(
    (p) => p.status === "Pendente"
  ).length;

  const pedidosEmPreparo = pedidos.filter(
    (p) => p.status === "Em preparo"
  ).length;

  const pedidosEntregues = pedidos.filter(
    (p) => p.status === "Entregue"
  ).length;

  const faturamento = pedidos.reduce(
    (soma, pedido) => soma + Number(pedido.valorTotal),
    0
  );

  return (
    <div style={{ padding: "30px" }}>
      <h1 style={{ marginBottom: "25px" }}>
        Dashboard Funcionário
      </h1>

      <div style={gridStyle}>
        <div style={cardStyle}>
          <h3>Total de pedidos</h3>
          <strong style={valueStyle}>
            {pedidos.length}
          </strong>
        </div>

        <div style={cardStyle}>
          <h3>Faturamento</h3>
          <strong style={valueStyle}>
            R$ {faturamento.toFixed(2)}
          </strong>
        </div>

        <div style={cardStyle}>
          <h3>Pendentes</h3>
          <strong style={valueStyle}>
            {pedidosPendentes}
          </strong>
        </div>

        <div style={cardStyle}>
          <h3>Em preparo</h3>
          <strong style={valueStyle}>
            {pedidosEmPreparo}
          </strong>
        </div>

        <div style={cardStyle}>
          <h3>Entregues</h3>
          <strong style={valueStyle}>
            {pedidosEntregues}
          </strong>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2>Últimos pedidos</h2>

        {pedidos.slice(0, 5).map((pedido) => (
          <div key={pedido.id} style={pedidoCard}>
            <div>
              <strong>Pedido #{pedido.id}</strong>
              <p>{pedido.alunoNome}</p>
              <p>{pedido.status}</p>
            </div>

            <strong>
              R$ {Number(pedido.valorTotal).toFixed(2)}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
};

const cardStyle = {
  background: "#fff",
  padding: "22px",
  borderRadius: "14px",
};

const valueStyle = {
  fontSize: "28px",
};

const sectionStyle = {
  marginTop: "30px",
  background: "#fff",
  padding: "22px",
  borderRadius: "14px",
};

const pedidoCard = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 0",
  borderBottom: "1px solid #eee",
};

export default DashboardFuncionario;