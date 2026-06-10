/**
 * Painel de Gastos e Extrato do responsável.
 * Foco analítico: cards de resumo + últimas compras com paginação visual.
 * Usa GET /ResponsavelAluno (dependentes com aluno.saldo / limiteDiario)
 * e GET /Pedidos (já filtrado pelos dependentes no backend).
 */
import { useEffect, useMemo, useState } from "react";
import {
  Wallet, TrendingUp, ShieldCheck, Clock, Inbox, Calendar,
} from "lucide-react";
import { api } from "../../api/client";

const PAGE_SIZE = 10;

const STATUS_THEME = {
  "Pendente": { bg: "#fff7ed", fg: "#9a3412", border: "#fed7aa", dot: "#f59e0b" },
  "Em preparo": { bg: "#eff6ff", fg: "#1d4ed8", border: "#bfdbfe", dot: "#2563eb" },
  "Entregue": { bg: "#ecfdf5", fg: "#047857", border: "#a7f3d0", dot: "#16a34a" },
  "Recusado": { bg: "#fef2f2", fg: "#b91c1c", border: "#fecaca", dot: "#dc2626" },
};

function brl(v) { return `R$ ${Number(v || 0).toFixed(2)}`; }

function Gastos() {
  const [dependentes, setDependentes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => { carregarDados(); }, []);

  async function carregarDados() {
    try {
      const dadosDependentes = await api.get("/ResponsavelAluno");
      const dadosPedidos = await api.get("/Pedidos");
      setDependentes(Array.isArray(dadosDependentes) ? dadosDependentes : []);
      setPedidos(Array.isArray(dadosPedidos) ? dadosPedidos : []);
    } catch (error) {
      console.error("Erro ao carregar gastos:", error);
    } finally {
      setLoading(false);
    }
  }

  const pedidosOrdenados = useMemo(
    () => [...pedidos].sort((a, b) => new Date(b.dataPedido) - new Date(a.dataPedido)),
    [pedidos]
  );

  const pedidosVisiveis = pedidosOrdenados.slice(0, visibleCount);
  const temMais = visibleCount < pedidosOrdenados.length;

  const resumo = useMemo(() => {
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();

    const gastosValidos = pedidos.filter((p) => p.status !== "Recusado");

    const totalMes = gastosValidos
      .filter((p) => {
        const d = new Date(p.dataPedido);
        return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
      })
      .reduce((t, p) => t + Number(p.valorTotal || 0), 0);

    const saldoTotal = dependentes.reduce(
      (t, d) => t + Number(d.aluno?.saldo || 0), 0
    );
    const limiteTotal = dependentes.reduce(
      (t, d) => t + Number(d.aluno?.limiteDiario || 0), 0
    );

    const ultimaCompra = pedidosOrdenados[0] || null;

    return { totalMes, saldoTotal, limiteTotal, ultimaCompra };
  }, [pedidos, dependentes, pedidosOrdenados]);

  if (loading) {
    return (
      <div style={pageStyle}>
        <h1 style={tituloStyle}>Gastos e extrato</h1>
        <div style={emptyStyle}>Carregando...</div>
      </div>
    );
  }

  const nomeMes = new Date().toLocaleDateString("pt-BR", { month: "long" });

  return (
    <div style={pageStyle}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={tituloStyle}>Gastos e extrato</h1>
        <p style={subStyle}>Resumo financeiro dos seus dependentes.</p>
      </div>

      <div style={cardsResumoStyle}>
        <ResumoCard
          icon={<TrendingUp size={18} />}
          accent="#7f1d1d"
          label={`Gasto em ${nomeMes}`}
          value={brl(resumo.totalMes)}
          hint="Pedidos confirmados no mês atual"
        />
        <ResumoCard
          icon={<Wallet size={18} />}
          accent="#16a34a"
          label="Saldo dos dependentes"
          value={brl(resumo.saldoTotal)}
          hint={`${dependentes.length} dependente${dependentes.length === 1 ? "" : "s"}`}
        />
        <ResumoCard
          icon={<ShieldCheck size={18} />}
          accent="#2563eb"
          label="Limite diário total"
          value={brl(resumo.limiteTotal)}
          hint="Soma do limite de todos"
        />
        <ResumoCard
          icon={<Clock size={18} />}
          accent="#d97706"
          label="Última compra"
          value={resumo.ultimaCompra ? brl(resumo.ultimaCompra.valorTotal) : "—"}
          hint={
            resumo.ultimaCompra
              ? `${resumo.ultimaCompra.alunoNome || "Aluno"} · ${new Date(resumo.ultimaCompra.dataPedido).toLocaleDateString("pt-BR")}`
              : "Sem compras ainda"
          }
        />
      </div>

      <div style={sectionHeaderStyle}>
        <div>
          <h2 style={subtituloStyle}>Últimas compras</h2>
          <p style={subStyle}>Movimentação detalhada dos dependentes.</p>
        </div>
        {pedidosOrdenados.length > 0 && (
          <span style={contadorStyle}>
            {pedidosVisiveis.length} de {pedidosOrdenados.length}
          </span>
        )}
      </div>

      {pedidosOrdenados.length === 0 ? (
        <div style={emptyStyle}>
          <Inbox size={36} color="#94a3b8" />
          <h3 style={{ margin: "12px 0 4px" }}>Nenhuma compra encontrada</h3>
          <p style={{ color: "#64748b", margin: 0 }}>As compras dos dependentes aparecerão aqui.</p>
        </div>
      ) : (
        <>
          {pedidosVisiveis.map((pedido) => {
            const theme = STATUS_THEME[pedido.status] || STATUS_THEME["Pendente"];
            return (
              <div key={pedido.id} style={{ ...cardStyle, borderLeft: `4px solid ${theme.dot}` }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={cardTopStyle}>
                    <strong style={alunoStyle}>{pedido.alunoNome || "Aluno"}</strong>
                    <span style={{
                      ...statusPillStyle,
                      background: theme.bg, color: theme.fg, border: `1px solid ${theme.border}`,
                    }}>
                      <span style={{ ...dotStyle, background: theme.dot }} />
                      {pedido.status}
                    </span>
                  </div>
                  <div style={metaRowStyle}>
                    <span>Pedido #{pedido.id}</span>
                    <span><Calendar size={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />
                      {new Date(pedido.dataPedido).toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>

                <strong style={valorStyle}>{brl(pedido.valorTotal)}</strong>
              </div>
            );
          })}

          {temMais ? (
            <button
              type="button"
              style={mostrarMaisStyle}
              onClick={() => setVisibleCount((atual) => atual + PAGE_SIZE)}
            >
              Mostrar mais 10 compras
            </button>
          ) : pedidosOrdenados.length > PAGE_SIZE ? (
            <p style={fimListaStyle}>Fim do extrato.</p>
          ) : null}
        </>
      )}
    </div>
  );
}

function ResumoCard({ icon, label, value, hint, accent }) {
  return (
    <div style={resumoCardStyle}>
      <div style={{ ...resumoIconStyle, background: `${accent}15`, color: accent }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={resumoLabelStyle}>{label}</p>
        <h2 style={resumoValueStyle}>{value}</h2>
        {hint && <p style={resumoHintStyle}>{hint}</p>}
      </div>
    </div>
  );
}

const pageStyle = { padding: "30px", maxWidth: 1100, margin: "0 auto" };
const tituloStyle = { fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 800, margin: 0, color: "#0f172a" };
const subStyle = { color: "#64748b", margin: "6px 0 0", fontSize: 14 };

const cardsResumoStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
  marginBottom: 30,
};
const resumoCardStyle = {
  background: "#fff", borderRadius: 16, padding: "18px 20px",
  border: "1px solid #eef2f7", boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
  display: "flex", gap: 14, alignItems: "flex-start",
};
const resumoIconStyle = {
  width: 40, height: 40, borderRadius: 12,
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};
const resumoLabelStyle = {
  color: "#64748b", margin: 0, fontSize: 12, fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "0.04em",
};
const resumoValueStyle = {
  margin: "4px 0 0", fontSize: 24, fontWeight: 800, color: "#0f172a",
  lineHeight: 1.1, wordBreak: "break-word",
};
const resumoHintStyle = { margin: "6px 0 0", color: "#94a3b8", fontSize: 12 };

const sectionHeaderStyle = {
  display: "flex", justifyContent: "space-between",
  alignItems: "flex-end", gap: 12, marginBottom: 14, flexWrap: "wrap",
};
const subtituloStyle = { fontSize: 22, margin: 0, fontWeight: 800, color: "#0f172a" };
const contadorStyle = { color: "#64748b", fontWeight: 700, fontSize: 13 };

const emptyStyle = {
  background: "#fff", padding: "40px 24px", borderRadius: 18,
  border: "1px solid #eef2f7", textAlign: "center",
};

const cardStyle = {
  background: "#fff", borderRadius: 14, padding: "14px 18px",
  marginBottom: 10, display: "flex", justifyContent: "space-between",
  alignItems: "center", gap: 16, border: "1px solid #eef2f7", flexWrap: "wrap",
};
const cardTopStyle = { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 };
const alunoStyle = { color: "#0f172a", fontSize: 15 };
const metaRowStyle = { display: "flex", gap: 14, color: "#64748b", fontSize: 13, flexWrap: "wrap" };

const statusPillStyle = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
};
const dotStyle = { width: 6, height: 6, borderRadius: "50%" };

const valorStyle = { fontSize: 20, color: "#0f172a", fontWeight: 800 };

const mostrarMaisStyle = {
  width: "100%", padding: "14px 18px", border: "1px solid #7f1d1d",
  borderRadius: 12, background: "#fff", color: "#7f1d1d",
  fontWeight: 800, cursor: "pointer", marginTop: 10,
};
const fimListaStyle = { textAlign: "center", color: "#94a3b8", fontSize: 13, margin: "16px 0 4px" };

export default Gastos;
