import { useEffect, useState } from "react";
import { api } from "../../api/client";

function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const dadosUsuario = await api.get("/Auth/me");
      const dadosPedidos = await api.get("/Pedidos/meus");

      setUsuario(dadosUsuario);
      setPedidos(dadosPedidos);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    }
  }

  if (!usuario) {
    return (
      <div style={pageStyle}>
        <h1>Perfil</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  const totalGasto = pedidos.reduce(
    (total, pedido) => total + Number(pedido.valorTotal || 0),
    0
  );

  return (
    <div style={pageStyle}>
      <h1 style={tituloStyle}>Meu Perfil</h1>

      <div style={headerCardStyle}>
        <div style={avatarStyle}>{usuario.nome?.charAt(0).toUpperCase()}</div>

        <div>
          <h2>{usuario.nome}</h2>
          <p style={emailStyle}>{usuario.email}</p>
          <span style={badgeStyle}>Aluno</span>
        </div>
      </div>

      <div style={gridStyle}>
        <InfoCard titulo="Saldo atual" valor={`R$ ${Number(usuario.saldo).toFixed(2)}`} />
        <InfoCard titulo="Limite diário" valor={`R$ ${Number(usuario.limiteDiario).toFixed(2)}`} />
        <InfoCard titulo="Total de pedidos" valor={pedidos.length} />
        <InfoCard titulo="Total gasto" valor={`R$ ${totalGasto.toFixed(2)}`} />
      </div>
    </div>
  );
}

function InfoCard({ titulo, valor }) {
  return (
    <div style={cardStyle}>
      <p style={labelStyle}>{titulo}</p>
      <strong style={valueStyle}>{valor}</strong>
    </div>
  );
}

const pageStyle = { padding: "30px" };

const tituloStyle = {
  fontSize: "42px",
  fontWeight: "700",
  marginBottom: "24px",
};

const headerCardStyle = {
  background: "#fff",
  borderRadius: "18px",
  padding: "24px",
  display: "flex",
  alignItems: "center",
  gap: "20px",
  marginBottom: "24px",
};

const avatarStyle = {
  width: "70px",
  height: "70px",
  borderRadius: "50%",
  background: "#0b2c66",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "32px",
  fontWeight: "700",
};

const emailStyle = {
  color: "#64748b",
  marginBottom: "8px",
};

const badgeStyle = {
  background: "#dbeafe",
  color: "#1d4ed8",
  padding: "6px 12px",
  borderRadius: "999px",
  fontWeight: "600",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
};

const cardStyle = {
  background: "#fff",
  borderRadius: "18px",
  padding: "24px",
};

const labelStyle = {
  color: "#64748b",
  marginBottom: "8px",
};

const valueStyle = {
  fontSize: "26px",
};

export default Perfil;