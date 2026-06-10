/**
 * Histórico de pedidos do aluno (GET /pedidos/meus).
 * Foco em consulta histórica; mostra 10 mais recentes inicialmente.
 */
import { useEffect, useMemo, useState } from "react";
import { Inbox, Receipt, Clock } from "lucide-react";
import { api } from "../../api/client";

const PAGE_SIZE = 10;

const STATUS_THEME = {
  "Pendente": { bg: "#fff7ed", fg: "#9a3412", border: "#fed7aa", dot: "#f59e0b" },
  "Em preparo": { bg: "#eff6ff", fg: "#1d4ed8", border: "#bfdbfe", dot: "#2563eb" },
  "Entregue": { bg: "#ecfdf5", fg: "#047857", border: "#a7f3d0", dot: "#16a34a" },
  "Recusado": { bg: "#fef2f2", fg: "#b91c1c", border: "#fecaca", dot: "#dc2626" },
};

function Historico() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => { carregarPedidos(); }, []);

  async function carregarPedidos() {
    try {
      const data = await api.get("/pedidos/meus");
      setPedidos(Array.isArray(data) ? data : []);
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

  const pedidosVisiveis = pedidosOrdenados.slice(0, visibleCount);
  const temMais = visibleCount < pedidosOrdenados.length;

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
        <h1 style={tituloStyle}>Histórico de pedidos</h1>
        <p style={subStyle}>Revise seus pedidos anteriores.</p>
      </div>

      {pedidosOrdenados.length === 0 ? (
        <div style={emptyStyle}>
          <Inbox size={36} color="#94a3b8" />
          <h3 style={{ margin: "12px 0 4px" }}>Nenhum pedido no histórico</h3>
          <p style={{ color: "#64748b", margin: 0 }}>Quando você fizer pedidos, eles aparecerão aqui.</p>
        </div>
      ) : (
        <>
          <p style={contadorStyle}>
            Mostrando {pedidosVisiveis.length} de {pedidosOrdenados.length} registros
          </p>

          {pedidosVisiveis.map((pedido) => {
            const theme = STATUS_THEME[pedido.status] || STATUS_THEME["Pendente"];
            return (
              <div key={pedido.id} style={{ ...cardStyle, borderLeft: `4px solid ${theme.dot}` }}>
                <div style={leftStyle}>
                  <div style={cardHeaderStyle}>
                    <h2 style={pedidoTitle}>Pedido #{pedido.id}</h2>
                    <span style={{
                      ...statusPillStyle,
                      background: theme.bg, color: theme.fg, border: `1px solid ${theme.border}`,
                    }}>
                      <span style={{ ...dotStyle, background: theme.dot }} />
                      {pedido.status}
                    </span>
                  </div>

                  <div style={metaInlineStyle}>
                    <span style={metaItemStyle}><Clock size={13} /> {new Date(pedido.dataPedido).toLocaleString("pt-BR")}</span>
                  </div>

                  {pedido.itens?.length > 0 && (
                    <p style={itensTextoStyle}>
                      {pedido.itens.map((i) => `${i.produtoNome} ×${i.quantidade}`).join(" · ")}
                    </p>
                  )}
                </div>

                <div style={rightStyle}>
                  <span style={totalLabelStyle}><Receipt size={13} /> Total</span>
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
          ) : pedidosOrdenados.length > PAGE_SIZE ? (
            <p style={fimListaStyle}>Fim do histórico.</p>
          ) : null}
        </>
      )}
    </div>
  );
}

const pageStyle = { padding: "30px", maxWidth: 980, margin: "0 auto" };
const tituloStyle = { fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 800, margin: 0, color: "#0f172a" };
const subStyle = { color: "#64748b", margin: "6px 0 0" };
const contadorStyle = { marginBottom: 14, color: "#64748b", fontWeight: 600, fontSize: 13 };

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
const leftStyle = { flex: 1, minWidth: 220 };
const rightStyle = { textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 };

const cardHeaderStyle = { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 4 };
const pedidoTitle = { fontSize: 17, fontWeight: 800, margin: 0, color: "#0f172a" };

const metaInlineStyle = { display: "flex", gap: 14, color: "#64748b", fontSize: 13 };
const metaItemStyle = { display: "inline-flex", alignItems: "center", gap: 4 };

const itensTextoStyle = {
  margin: "8px 0 0", color: "#475569", fontSize: 13,
  overflow: "hidden", textOverflow: "ellipsis",
};

const statusPillStyle = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700,
};
const dotStyle = { width: 6, height: 6, borderRadius: "50%" };

const totalLabelStyle = { display: "inline-flex", alignItems: "center", gap: 4, color: "#94a3b8", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" };
const totalStyle = { fontSize: 20, color: "#0f172a", fontWeight: 800 };

const mostrarMaisStyle = {
  width: "100%", padding: "14px 18px", border: "1px solid #7f1d1d",
  borderRadius: 12, background: "#fff", color: "#7f1d1d",
  fontWeight: 800, cursor: "pointer", marginTop: 10,
};
const fimListaStyle = { textAlign: "center", color: "#94a3b8", fontSize: 13, margin: "16px 0 4px" };

export default Historico;
