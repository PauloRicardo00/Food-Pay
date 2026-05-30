import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import "./responsavel.css";

function DashboardResponsavel() {
  const [dependentes, setDependentes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const dadosDependentes = await api.get("/ResponsavelAluno");
      const dadosPedidos = await api.get("/Pedidos");
      const dadosNotificacoes = await api.get("/Notificacoes/minhas");

      const idsDependentes = dadosDependentes.map((item) => item.alunoId);

      const pedidosDosDependentes = dadosPedidos.filter((pedido) =>
        idsDependentes.includes(pedido.alunoId)
      );

      setDependentes(dadosDependentes);
      setPedidos(pedidosDosDependentes);
      setNotificacoes(dadosNotificacoes);
    } catch (error) {
      console.error("Erro ao carregar painel do responsável:", error);
    } finally {
      setLoading(false);
    }
  }

  const saldoTotal = dependentes.reduce(
    (total, item) => total + Number(item.aluno?.saldo || 0),
    0
  );

  const limiteTotal = dependentes.reduce(
    (total, item) => total + Number(item.aluno?.limiteDiario || 0),
    0
  );

  const totalGasto = pedidos.reduce(
    (total, pedido) => total + Number(pedido.valorTotal || 0),
    0
  );

  const notificacoesNaoLidas = notificacoes.filter((n) => !n.lida).length;

  if (loading) {
    return (
      <div style={pageStyle}>
        <h1>Painel</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={tituloStyle}>Painel do Responsável</h1>

      <div style={cardsResumoStyle}>
        <ResumoCard titulo="Dependentes" valor={dependentes.length} />
        <ResumoCard titulo="Saldo total" valor={`R$ ${saldoTotal.toFixed(2)}`} />
        <ResumoCard titulo="Limite total" valor={`R$ ${limiteTotal.toFixed(2)}`} />
        <ResumoCard titulo="Total gasto" valor={`R$ ${totalGasto.toFixed(2)}`} />
        <ResumoCard titulo="Notificações" valor={notificacoesNaoLidas} />
      </div>

      <div style={gridStyle}>
        <section style={cardStyle}>
          <div style={sectionHeaderStyle}>
            <h2>Dependentes</h2>
            <Link to="/responsavel/dependentes" style={linkStyle}>
              Ver todos
            </Link>
          </div>

          {dependentes.length === 0 ? (
            <p>Nenhum dependente encontrado.</p>
          ) : (
            dependentes.map((item) => (
              <div key={item.alunoId} style={linhaStyle}>
                <div>
                  <strong>{item.aluno?.nome}</strong>
                  <p>{item.aluno?.email}</p>
                </div>

                <strong>R$ {Number(item.aluno?.saldo || 0).toFixed(2)}</strong>
              </div>
            ))
          )}
        </section>

        <section style={cardStyle}>
          <div style={sectionHeaderStyle}>
            <h2>Últimos pedidos</h2>
            <Link to="/responsavel/historico" style={linkStyle}>
              Ver histórico
            </Link>
          </div>

          {pedidos.length === 0 ? (
            <p>Nenhum pedido encontrado.</p>
          ) : (
            pedidos.slice(0, 5).map((pedido) => (
              <div key={pedido.id} style={linhaStyle}>
                <div>
                  <strong>Pedido #{pedido.id}</strong>
                  <p>{pedido.alunoNome || "Aluno"} • {pedido.status}</p>
                </div>

                <strong>R$ {Number(pedido.valorTotal).toFixed(2)}</strong>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

function ResumoCard({ titulo, valor }) {
  return (
    <div style={resumoCardStyle}>
      <p style={resumoLabelStyle}>{titulo}</p>
      <h2>{valor}</h2>
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
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "18px",
};

const cardStyle = {
  background: "#fff",
  borderRadius: "18px",
  padding: "24px",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
};

const linkStyle = {
  color: "#2563eb",
  textDecoration: "none",
  fontWeight: "600",
};

const linhaStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 0",
  borderBottom: "1px solid #e5e7eb",
};

export default DashboardResponsavel;