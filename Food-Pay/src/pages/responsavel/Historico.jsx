/**
 * Histórico de pedidos dos dependentes do responsável.
 * Consome GET /Pedidos (backend já filtra pelos dependentes do responsável).
 */
import { useEffect, useMemo, useState } from "react";
import { Inbox, Clock, User } from "lucide-react";
import { api } from "../../api/client";

const PAGE_SIZE = 10;

const STATUS_THEME = {
  "Pendente": { bg: "#fff7ed", fg: "#9a3412", border: "#fed7aa", dot: "#f59e0b" },
  "Em preparo": { bg: "#eff6ff", fg: "#1d4ed8", border: "#bfdbfe", dot: "#2563eb" },
  "Entregue": { bg: "#ecfdf5", fg: "#047857", border: "#a7f3d0", dot: "#16a34a" },
  "Recusado": { bg: "#fef2f2", fg: "#b91c1c", border: "#fecaca", dot: "#dc2626" },
};

function HistoricoResponsavel() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filtroDependente, setFiltroDependente] = useState("Todos");

  useEffect(() => { carregarHistorico(); }, []);

  async function carregarHistorico() {
    try {
      const dadosPedidos = await api.get("/Pedidos");
      setPedidos(Array.isArray(dadosPedidos) ? dadosPedidos : []);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  }

  const pedidosOrdenados = useMemo(
    () => [...pedidos].sort((a, b) => new Date(b.dataPedido) - new Date(a.dataPedido)),
    [pedidos]
  );

  const dependentes = useMemo(() => {
    const nomes = new Set(pedidosOrdenados.map((p) => p.alunoNome).filter(Boolean));
    return ["Todos", ...Array.from(nomes)];
  }, [pedidosOrdenados]);

  const pedidosFiltrados = useMemo(
    () => (filtroDependente === "Todos"
      ? pedidosOrdenados
      : pedidosOrdenados.filter((p) => p.alunoNome === filtroDependente)),
    [pedidosOrdenados, filtroDependente]
  );

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [filtroDependente]);

  const pedidosVisiveis = pedidosFiltrados.slice(0, visibleCount);
  const temMais = visibleCount < pedidosFiltrados.length;

  if (loading) {
    return (
      <div style={pageStyle}>
        <h1 style={tituloStyle}>Histórico</h1>
        <div style={emptyStyle}>Carregando...</div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={tituloStyle}>Histórico dos dependentes</h1>
        <p style={subStyle}>Veja todos os pedidos feitos pelos seus dependentes.</p>
      </div>

      {dependentes.length > 1 && (
        <div style={toolbarStyle}>
          <div style={filtersStyle}>
            {dependentes.map((nome) => {
              const active = filtroDependente === nome;
              return (
                <button
                  key={nome}
                  type="button"
                  style={{ ...filterButtonStyle, ...(active ? filterButtonActiveStyle : {}) }}
                  onClick={() => setFiltroDependente(nome)}
                >
                  {nome}
                </button>
              );
            })}
          </div>
          <span style={contadorStyle}>{pedidosVisiveis.length} de {pedidosFiltrados.length}</span>
        </div>
      )}

      {pedidosFiltrados.length === 0 ? (
        <div style={emptyStyle}>
          <Inbox size={36} color="#94a3b8" />
          <h3 style={{ margin: "12px 0 4px" }}>Nenhum pedido encontrado</h3>
          <p style={{ color: "#64748b", margin: 0 }}>Quando os dependentes pedirem algo, aparecerá aqui.</p>
        </div>
      ) : (
        <>
          {pedidosVisiveis.map((pedido) => {
            const theme = STATUS_THEME[pedido.status] || STATUS_THEME["Pendente"];
            return (
              <div key={pedido.id} style={{ ...cardStyle, borderLeft: `4px solid ${theme.dot}` }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={cardHeaderStyle}>
                    <div style={dependenteBoxStyle}>
                      <div style={avatarStyle}><User size={16} /></div>
                      <div>
                        <span style={dependenteLabelStyle}>Dependente</span>
                        <span style={dependenteNomeStyle}>{pedido.alunoNome || "Aluno"}</span>
                      </div>
                    </div>
                    <span style={{
                      ...statusPillStyle,
                      background: theme.bg, color: theme.fg, border: `1px solid ${theme.border}`,
                    }}>
                      <span style={{ ...dotStyle, background: theme.dot }} />
                      {pedido.status}
                    </span>
                  </div>

                  <div style={metaRowStyle}>
                    <span style={metaItemStyle}>Pedido #{pedido.id}</span>
                    <span style={metaItemStyle}><Clock size={12} /> {new Date(pedido.dataPedido).toLocaleString("pt-BR")}</span>
                  </div>

                  {pedido.itens?.length > 0 && (
                    <p style={itensTextoStyle}>
                      {pedido.itens.map((i) => `${i.produtoNome} ×${i.quantidade}`).join(" · ")}
                    </p>
                  )}
                </div>

                <div style={rightStyle}>
                  <span style={totalLabelStyle}>Total</span>
                  <strong style={totalStyle}>R$ {Number(pedido.valorTotal).toFixed(2)}</strong>
                </div>
              </div>
            );
          })}

          {temMais ? (
            <button
              type="button"
              style={mostrarMaisStyle}
              onClick={() => setVisibleCount((atual) => atual + PAGE_SIZE)}
            >
              Mostrar mais 10 registros
            </button>
          ) : pedidosFiltrados.length > PAGE_SIZE ? (
            <p style={fimListaStyle}>Fim do histórico.</p>
          ) : null}
        </>
      )}
    </div>
  );
}

const pageStyle = { padding: "30px", maxWidth: 1080, margin: "0 auto" };
const tituloStyle = { fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 800, margin: 0, color: "#0f172a" };
const subStyle = { color: "#64748b", margin: "6px 0 0" };

const toolbarStyle = {
  background: "#fff", borderRadius: 16, padding: "12px 14px", marginBottom: 16,
  display: "flex", justifyContent: "space-between", gap: 12,
  alignItems: "center", flexWrap: "wrap", border: "1px solid #eef2f7",
};
const filtersStyle = { display: "flex", gap: 8, flexWrap: "wrap" };
const filterButtonStyle = {
  border: "1px solid #e2e8f0", background: "#fff", color: "#475569",
  borderRadius: 999, padding: "7px 14px", fontWeight: 700, cursor: "pointer", fontSize: 13,
};
const filterButtonActiveStyle = {
  background: "#7f1d1d", color: "#fff", borderColor: "#7f1d1d",
  boxShadow: "0 2px 6px rgba(127,29,29,0.25)",
};
const contadorStyle = { color: "#64748b", fontWeight: 700, fontSize: 13 };

const emptyStyle = {
  background: "#fff", padding: "40px 24px", borderRadius: 18,
  border: "1px solid #eef2f7", textAlign: "center",
};

const cardStyle = {
  background: "#fff", borderRadius: 14, padding: "16px 20px",
  marginBottom: 12, display: "flex", justifyContent: "space-between",
  alignItems: "center", gap: 18, border: "1px solid #eef2f7",
  boxShadow: "0 1px 2px rgba(15,23,42,0.04)", flexWrap: "wrap",
};
const cardHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 };

const dependenteBoxStyle = { display: "flex", alignItems: "center", gap: 10 };
const avatarStyle = {
  width: 36, height: 36, borderRadius: "50%",
  background: "#fef2f2", color: "#7f1d1d",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const dependenteLabelStyle = { display: "block", fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 700 };
const dependenteNomeStyle = { display: "block", fontSize: 16, color: "#0f172a", fontWeight: 800 };

const metaRowStyle = { display: "flex", gap: 14, color: "#64748b", fontSize: 13, flexWrap: "wrap" };
const metaItemStyle = { display: "inline-flex", alignItems: "center", gap: 4 };

const itensTextoStyle = { margin: "8px 0 0", color: "#475569", fontSize: 13 };

const statusPillStyle = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700,
};
const dotStyle = { width: 6, height: 6, borderRadius: "50%" };

const rightStyle = { textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 };
const totalLabelStyle = { color: "#94a3b8", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" };
const totalStyle = { fontSize: 20, color: "#0f172a", fontWeight: 800 };

const mostrarMaisStyle = {
  width: "100%", padding: "14px 18px", border: "1px solid #7f1d1d",
  borderRadius: 12, background: "#fff", color: "#7f1d1d",
  fontWeight: 800, cursor: "pointer", marginTop: 10,
};
const fimListaStyle = { textAlign: "center", color: "#94a3b8", fontSize: 13, margin: "16px 0 4px" };

export default HistoricoResponsavel;
