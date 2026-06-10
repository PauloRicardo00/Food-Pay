/**
 * Dashboard do funcionário — painel principal da cantina.
 * Exibe KPIs do dia (pedidos, faturamento, em andamento) e a lista
 * de pedidos recentes com possibilidade de atualização de status.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ChefHat,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  TrendingUp,
} from "lucide-react";
import { api } from "../../api/client";
import "./funcionario.css";

const STATUS = {
  PENDENTE: "Pendente",
  PREPARO: "Em preparo",
  ENTREGUE: "Entregue",
};

function DashboardFuncionario() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const data = await api.get("/pedidos");
        setPedidos(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const stats = useMemo(() => {
    const hoje = new Date().toDateString();
    const pendentes = pedidos.filter((p) => p.status === STATUS.PENDENTE);
    const preparo = pedidos.filter((p) => p.status === STATUS.PREPARO);
    const entregues = pedidos.filter((p) => p.status === STATUS.ENTREGUE);
    const pedidosHoje = pedidos.filter(
      (p) => new Date(p.dataPedido).toDateString() === hoje
    );
    const faturamento = pedidos.reduce(
      (s, p) => s + Number(p.valorTotal || 0),
      0
    );
    const faturamentoHoje = pedidosHoje.reduce(
      (s, p) => s + Number(p.valorTotal || 0),
      0
    );
    const ticketMedio =
      pedidos.length > 0 ? faturamento / pedidos.length : 0;
    const taxaEntrega =
      pedidos.length > 0
        ? Math.round((entregues.length / pedidos.length) * 100)
        : 0;

    // Vendas por hora (últimas 24h)
    const porHora = Array.from({ length: 24 }, (_, h) => ({ h, total: 0 }));
    pedidos.forEach((p) => {
      const d = new Date(p.dataPedido);
      const h = d.getHours();
      porHora[h].total += Number(p.valorTotal || 0);
    });
    const maxHora = Math.max(1, ...porHora.map((x) => x.total));

    // Top produtos
    const contagem = new Map();
    pedidos.forEach((p) => {
      (p.itens || []).forEach((i) => {
        const k = i.produtoNome || "Produto";
        contagem.set(k, (contagem.get(k) || 0) + (i.quantidade || 1));
      });
    });
    const topProdutos = Array.from(contagem.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      total: pedidos.length,
      pendentes: pendentes.length,
      preparo: preparo.length,
      entregues: entregues.length,
      faturamento,
      faturamentoHoje,
      pedidosHoje: pedidosHoje.length,
      ticketMedio,
      taxaEntrega,
      porHora,
      maxHora,
      topProdutos,
    };
  }, [pedidos]);

  if (loading) {
    return <p style={{ padding: 30 }}>Carregando dashboard...</p>;
  }

  // Donut do status (puro CSS via conic-gradient)
  const total = Math.max(1, stats.total);
  const pPend = (stats.pendentes / total) * 100;
  const pPrep = (stats.preparo / total) * 100;
  const pEntr = (stats.entregues / total) * 100;
  const donutBg = `conic-gradient(
    #d97706 0% ${pPend}%,
    #2563eb ${pPend}% ${pPend + pPrep}%,
    #16a34a ${pPend + pPrep}% ${pPend + pPrep + pEntr}%,
    #e5e7eb ${pPend + pPrep + pEntr}% 100%
  )`;

  return (
    <div style={{ padding: "30px", maxWidth: 1280, margin: "0 auto" }}>
      <header style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: "clamp(1.6rem,2.6vw,2.2rem)", fontWeight: 800 }}>
            Dashboard
          </h1>
          <p style={{ margin: "6px 0 0", color: "#64748b" }}>
            Visão geral da operação em tempo real
          </p>
        </div>
      </header>

      {/* KPIs */}
      <div style={kpiGrid}>
        <KPI icon={<Package />} label="Pedidos hoje" value={stats.pedidosHoje} cor="#b91c1c" />
        <KPI
          icon={<DollarSign />}
          label="Faturamento hoje"
          value={`R$ ${stats.faturamentoHoje.toFixed(2)}`}
          cor="#16a34a"
        />
        <KPI
          icon={<TrendingUp />}
          label="Ticket médio"
          value={`R$ ${stats.ticketMedio.toFixed(2)}`}
          cor="#2563eb"
        />
        <KPI
          icon={<Activity />}
          label="Taxa de entrega"
          value={`${stats.taxaEntrega}%`}
          cor="#7c3aed"
        />
      </div>

      {/* Status atuais */}
      <div style={statusGrid}>
        <StatusCard icon={<Clock />} label="Pendentes" value={stats.pendentes} cor="#d97706" />
        <StatusCard icon={<ChefHat />} label="Em preparo" value={stats.preparo} cor="#2563eb" />
        <StatusCard icon={<CheckCircle2 />} label="Entregues" value={stats.entregues} cor="#16a34a" />
      </div>

      <div className="funcionario-charts-grid">
        {/* Donut */}
        <section className="funcionario-chart-card">
          <h2 style={chartTitle}>Distribuição por status</h2>
          <div style={donutWrap}>
            <div style={{ ...donutStyle, background: donutBg }}>
              <div style={donutHole}>
                <strong style={{ fontSize: 26 }}>{stats.total}</strong>
                <span style={{ color: "#64748b", fontSize: 12 }}>pedidos</span>
              </div>
            </div>
            <ul style={legendStyle}>
              <li><span style={{ ...dot, background: "#d97706" }} /> Pendentes <strong>{stats.pendentes}</strong></li>
              <li><span style={{ ...dot, background: "#2563eb" }} /> Em preparo <strong>{stats.preparo}</strong></li>
              <li><span style={{ ...dot, background: "#16a34a" }} /> Entregues <strong>{stats.entregues}</strong></li>
            </ul>
          </div>
        </section>

        {/* Vendas por hora */}
        <section className="funcionario-chart-card">
          <h2 style={chartTitle}>Vendas por hora</h2>
          <div className="funcionario-bar-chart" style={barChartStyle}>
            {stats.porHora.map((b) => (
              <div key={b.h} style={barColStyle} title={`${b.h}h • R$ ${b.total.toFixed(2)}`}>
                <div
                  style={{
                    height: `${(b.total / stats.maxHora) * 100}%`,
                    background:
                      "linear-gradient(180deg, #b91c1c, #ef4444)",
                    borderRadius: "6px 6px 2px 2px",
                    minHeight: b.total > 0 ? 4 : 0,
                  }}
                />
                {b.h % 3 === 0 && (
                  <span style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
                    {b.h}h
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Top produtos */}
        <section className="funcionario-chart-card funcionario-chart-card--full">

          <h2 style={chartTitle}>Produtos mais pedidos</h2>
          {stats.topProdutos.length === 0 ? (
            <p style={{ color: "#64748b" }}>Sem dados ainda.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {stats.topProdutos.map(([nome, qtd], i) => {
                const max = stats.topProdutos[0][1] || 1;
                return (
                  <div key={nome} style={topRowStyle}>
                    <span style={topRankStyle}>{i + 1}</span>
                    <span style={{ fontWeight: 600, minWidth: 140 }}>{nome}</span>
                    <div style={topBarBg}>
                      <div
                        style={{
                          width: `${(qtd / max) * 100}%`,
                          height: "100%",
                          background: "linear-gradient(90deg,#b91c1c,#ef4444)",
                          borderRadius: 999,
                        }}
                      />
                    </div>
                    <strong>{qtd}</strong>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Últimos pedidos */}
      <div style={{ ...chartCard, marginTop: 18 }}>
        <h2 style={chartTitle}>Últimos pedidos</h2>
        {pedidos.length === 0 ? (
          <p style={{ color: "#64748b" }}>Nenhum pedido encontrado.</p>
        ) : (
          pedidos.slice(0, 5).map((pedido) => (
            <div key={pedido.id} style={pedidoCard}>
              <div>
                <strong>Pedido #{pedido.id}</strong>
                <p style={{ margin: "2px 0", color: "#475569" }}>{pedido.alunoNome}</p>
                <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
                  {pedido.status}
                </p>
              </div>
              <strong>R$ {Number(pedido.valorTotal).toFixed(2)}</strong>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function KPI({ icon, label, value, cor }) {
  return (
    <div style={kpiCardStyle}>
      <div style={{ ...kpiIconStyle, background: `${cor}1a`, color: cor }}>{icon}</div>
      <div>
        <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>{label}</p>
        <strong style={{ fontSize: 22 }}>{value}</strong>
      </div>
    </div>
  );
}

function StatusCard({ icon, label, value, cor }) {
  return (
    <div style={{ ...kpiCardStyle, borderLeft: `4px solid ${cor}` }}>
      <div style={{ ...kpiIconStyle, background: `${cor}1a`, color: cor }}>{icon}</div>
      <div>
        <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>{label}</p>
        <strong style={{ fontSize: 24 }}>{value}</strong>
      </div>
    </div>
  );
}

const headerStyle = { marginBottom: 22 };
const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
  marginBottom: 16,
};
const statusGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
  marginBottom: 22,
};
const kpiCardStyle = {
  background: "#fff",
  borderRadius: 16,
  padding: 18,
  display: "flex",
  alignItems: "center",
  gap: 14,
  boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
  border: "1px solid #eef2f7",
};
const kpiIconStyle = {
  width: 46, height: 46,
  borderRadius: 12,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
};
const chartsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 16,
};
const chartCard = {
  background: "#fff",
  borderRadius: 16,
  padding: 22,
  border: "1px solid #eef2f7",
  boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
};
const chartTitle = { margin: "0 0 16px", fontSize: 16, fontWeight: 700 };
const donutWrap = {
  display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
};
const donutStyle = {
  width: 160, height: 160, borderRadius: "50%",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const donutHole = {
  width: 100, height: 100, borderRadius: "50%",
  background: "#fff",
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
};
const legendStyle = {
  listStyle: "none", padding: 0, margin: 0,
  display: "flex", flexDirection: "column", gap: 10, fontSize: 14,
};
const dot = {
  display: "inline-block", width: 10, height: 10, borderRadius: 999, marginRight: 8,
};
const barChartStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(24, 1fr)",
  alignItems: "end",
  gap: 4,
  height: 180,
  padding: "8px 4px 0",
};
const barColStyle = {
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end",
  height: "100%",
};
const topRowStyle = {
  display: "grid",
  gridTemplateColumns: "26px 1fr 2fr 40px",
  alignItems: "center",
  gap: 12,
};
const topRankStyle = {
  width: 26, height: 26, borderRadius: "50%",
  background: "#fee2e2", color: "#b91c1c",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  fontWeight: 800, fontSize: 13,
};
const topBarBg = {
  height: 10, background: "#f1f5f9", borderRadius: 999, overflow: "hidden",
};
const pedidoCard = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "14px 0", borderBottom: "1px solid #eef2f7",
};

export default DashboardFuncionario;
