/**
 * Dashboard do responsável — visão consolidada por dependente.
 * Exibe saldo, percentual do limite mensal usado, gastos por categoria
 * e últimas transações. O responsável pode alternar entre dependentes.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  CreditCard,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
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

  const m = useMemo(() => {
    const saldoTotal = dependentes.reduce(
      (t, item) => t + Number(item.aluno?.saldo || 0), 0
    );
    const limiteTotal = dependentes.reduce(
      (t, item) => t + Number(item.aluno?.limiteDiario || 0), 0
    );
    const totalGasto = pedidos.reduce(
      (t, p) => t + Number(p.valorTotal || 0), 0
    );
    const naoLidas = notificacoes.filter((n) => !n.lida).length;

    // Gasto últimos 7 dias por dia
    const dias = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const prox = new Date(d); prox.setDate(prox.getDate() + 1);
      const total = pedidos
        .filter((p) => {
          const dp = new Date(p.dataPedido);
          return dp >= d && dp < prox;
        })
        .reduce((s, p) => s + Number(p.valorTotal || 0), 0);
      dias.push({
        label: d.toLocaleDateString("pt-BR", { weekday: "short" }),
        total,
      });
    }
    const maxDia = Math.max(1, ...dias.map((d) => d.total));
    const gasto7d = dias.reduce((s, d) => s + d.total, 0);

    // Gasto hoje por dependente x limite — alerta
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje); amanha.setDate(amanha.getDate() + 1);
    const alertas = dependentes
      .map((dep) => {
        const limite = Number(dep.aluno?.limiteDiario || 0);
        const gastoHoje = pedidos
          .filter((p) => {
            const dp = new Date(p.dataPedido);
            return p.alunoId === dep.alunoId && dp >= hoje && dp < amanha;
          })
          .reduce((s, p) => s + Number(p.valorTotal || 0), 0);
        const pct = limite > 0 ? (gastoHoje / limite) * 100 : 0;
        return { nome: dep.aluno?.nome, gastoHoje, limite, pct };
      })
      .filter((d) => d.limite > 0 && d.pct >= 70)
      .sort((a, b) => b.pct - a.pct);

    return {
      saldoTotal, limiteTotal, totalGasto, naoLidas,
      dias, maxDia, gasto7d, alertas,
    };
  }, [dependentes, pedidos, notificacoes]);

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
      <header style={{ marginBottom: 22 }}>
        <h1 style={tituloStyle}>Painel do Responsável</h1>
        <p style={{ margin: "6px 0 0", color: "#64748b" }}>
          Acompanhe o saldo e os gastos dos seus dependentes
        </p>
      </header>

      {/* Alertas de limite */}
      {m.alertas.length > 0 && (
        <div style={alertBox}>
          <AlertTriangle size={20} />
          <div>
            <strong>Atenção:</strong>{" "}
            {m.alertas.map((a, i) => (
              <span key={a.nome}>
                {i > 0 && " • "}
                {a.nome} usou {Math.round(a.pct)}% do limite diário
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={kpiGrid}>
        <KPI icon={<Users />} label="Dependentes" valor={dependentes.length} cor="#b91c1c" />
        <KPI icon={<Wallet />} label="Saldo total" valor={`R$ ${m.saldoTotal.toFixed(2)}`} cor="#16a34a" />
        <KPI icon={<CreditCard />} label="Limite total" valor={`R$ ${m.limiteTotal.toFixed(2)}`} cor="#2563eb" />
        <KPI icon={<TrendingUp />} label="Gasto últimos 7 dias" valor={`R$ ${m.gasto7d.toFixed(2)}`} cor="#7c3aed" />
        <KPI icon={<Bell />} label="Notificações" valor={m.naoLidas} cor="#d97706" />
      </div>

      {/* Gráfico de gastos */}
      <section style={chartCard}>
        <h2 style={chartTitle}>Gastos — últimos 7 dias</h2>
        <div style={{ display: "flex", alignItems: "end", gap: 14, height: 180 }}>
          {m.dias.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                R$ {d.total.toFixed(0)}
              </div>
              <div
                style={{
                  width: "70%",
                  height: `${(d.total / m.maxDia) * 100}%`,
                  background: "linear-gradient(180deg,#7c3aed,#a78bfa)",
                  borderRadius: "8px 8px 4px 4px",
                  minHeight: d.total > 0 ? 4 : 0,
                }}
              />
              <span style={{ marginTop: 6, color: "#475569", fontSize: 12, fontWeight: 600 }}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div style={gridStyle}>
        <section style={cardStyle}>
          <div style={sectionHeaderStyle}>
            <h2>Dependentes</h2>
            <Link to="/responsavel/dependentes" style={linkStyle}>Ver todos</Link>
          </div>
          {dependentes.length === 0 ? (
            <p>Nenhum dependente encontrado.</p>
          ) : (
            dependentes.map((item) => {
              const saldo = Number(item.aluno?.saldo || 0);
              const limite = Number(item.aluno?.limiteDiario || 0);
              const pctLimite = limite > 0 ? Math.min(100, (saldo / limite) * 100) : 0;
              return (
                <div key={item.alunoId} style={linhaStyle}>
                  <div style={{ flex: 1 }}>
                    <strong>{item.aluno?.nome}</strong>
                    <p style={{ margin: "2px 0 6px", color: "#64748b", fontSize: 13 }}>
                      {item.aluno?.email}
                    </p>
                    {limite > 0 && (
                      <div style={miniBarBg}>
                        <div
                          style={{
                            width: `${pctLimite}%`,
                            height: "100%",
                            background: saldo < limite * 0.3 ? "#dc2626" : "#16a34a",
                            borderRadius: 999,
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <strong>R$ {saldo.toFixed(2)}</strong>
                </div>
              );
            })
          )}
        </section>

        <section style={cardStyle}>
          <div style={sectionHeaderStyle}>
            <h2>Últimos pedidos</h2>
            <Link to="/responsavel/historico" style={linkStyle}>Ver histórico</Link>
          </div>
          {pedidos.length === 0 ? (
            <p>Nenhum pedido encontrado.</p>
          ) : (
            pedidos.slice(0, 5).map((pedido) => (
              <div key={pedido.id} style={linhaStyle}>
                <div>
                  <strong>Pedido #{pedido.id}</strong>
                  <p style={{ margin: "2px 0", color: "#64748b", fontSize: 13 }}>
                    {pedido.alunoNome || "Aluno"} • {pedido.status}
                  </p>
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

function KPI({ icon, label, valor, cor }) {
  return (
    <div style={kpiCardStyle}>
      <div style={{
        width: 46, height: 46, borderRadius: 12,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: `${cor}1a`, color: cor,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>{label}</p>
        <strong style={{ fontSize: 22 }}>{valor}</strong>
      </div>
    </div>
  );
}

const pageStyle = { padding: 30, maxWidth: 1280, margin: "0 auto" };
const tituloStyle = {
  fontSize: "clamp(1.8rem,3vw,2.4rem)",
  fontWeight: 800,
  margin: 0,
};
const alertBox = {
  display: "flex", alignItems: "center", gap: 12,
  background: "#fef3c7", color: "#92400e",
  border: "1px solid #fde68a",
  padding: "14px 16px", borderRadius: 12,
  marginBottom: 18,
};
const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 14, marginBottom: 18,
};
const kpiCardStyle = {
  background: "#fff",
  borderRadius: 16, padding: 18,
  display: "flex", alignItems: "center", gap: 14,
  border: "1px solid #eef2f7",
  boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
};
const chartCard = {
  background: "#fff", borderRadius: 16, padding: 22,
  border: "1px solid #eef2f7",
  boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
  marginBottom: 18,
};
const chartTitle = { margin: "0 0 16px", fontSize: 16, fontWeight: 700 };
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 18,
};
const cardStyle = {
  background: "#fff", borderRadius: 18, padding: 22,
  border: "1px solid #eef2f7",
  boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
};
const sectionHeaderStyle = {
  display: "flex", justifyContent: "space-between",
  alignItems: "center", marginBottom: 16,
};
const linkStyle = {
  color: "#b91c1c", textDecoration: "none", fontWeight: 600, fontSize: 14,
};
const linhaStyle = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "12px 0", borderBottom: "1px solid #f1f5f9", gap: 12,
};
const miniBarBg = {
  height: 6, background: "#f1f5f9", borderRadius: 999, overflow: "hidden",
};

export default DashboardResponsavel;
