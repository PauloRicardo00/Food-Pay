/**
 * Lista de pedidos do aluno — GET /pedidos/meus.
 * Mostra inicialmente os 10 mais recentes e carrega mais sob demanda.
 */
import { useEffect, useMemo, useState } from "react";
import { Inbox, Receipt, Clock, Tag } from "lucide-react";
import { api } from "../../api/client";

const PAGE_SIZE = 10;

const STATUS_THEME = {
  "Pendente": { bg: "#fff7ed", fg: "#9a3412", border: "#fed7aa", dot: "#f59e0b" },
  "Em preparo": { bg: "#eff6ff", fg: "#1d4ed8", border: "#bfdbfe", dot: "#2563eb" },
  "Entregue": { bg: "#ecfdf5", fg: "#047857", border: "#a7f3d0", dot: "#16a34a" },
  "Recusado": { bg: "#fef2f2", fg: "#b91c1c", border: "#fecaca", dot: "#dc2626" },
};

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => { carregarPedidos(); }, []);

  async function carregarPedidos() {
    try {
      const data = await api.get("/pedidos/meus");
      setPedidos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
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
        <h1 style={tituloStyle}>Meus pedidos</h1>
        <div style={emptyStyle}>Carregando...</div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={tituloStyle}>Meus pedidos</h1>
        <p style={subStyle}>Acompanhe o status dos seus pedidos.</p>
      </div>

      {pedidosOrdenados.length === 0 ? (
        <div style={emptyStyle}>
          <Inbox size={36} color="#94a3b8" />
          <h3 style={{ margin: "12px 0 4px" }}>Você ainda não fez pedidos</h3>
          <p style={{ color: "#64748b", margin: 0 }}>Quando pedir algo, ele aparecerá aqui.</p>
        </div>
      ) : (
        <>
          <p style={contadorStyle}>
            Mostrando {pedidosVisiveis.length} de {pedidosOrdenados.length} pedidos
          </p>

          {pedidosVisiveis.map((pedido) => {
            const theme = STATUS_THEME[pedido.status] || STATUS_THEME["Pendente"];
            return (
              <div key={pedido.id} style={{ ...cardStyle, borderLeft: `4px solid ${theme.dot}` }}>
                <div style={cardHeaderStyle}>
                  <div>
                    <h2 style={pedidoTitle}>Pedido #{pedido.id}</h2>
                    <div style={metaInlineStyle}>
                      <span style={metaItemStyle}>
                        <Clock size={13} /> {new Date(pedido.dataPedido).toLocaleString("pt-BR")}
                      </span>
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

                <div style={itensWrapStyle}>
                  {pedido.itens?.length > 0 ? (
                    pedido.itens.map((item) => (
                      <div key={item.id} style={itemRowStyle}>
                        <span><Tag size={13} style={{ verticalAlign: "-2px", marginRight: 6, color: "#94a3b8" }} />{item.produtoNome}</span>
                        <span style={qtdStyle}>×{item.quantidade}</span>
                      </div>
                    ))
                  ) : (
                    <p style={{ margin: 0, color: "#64748b" }}>Nenhum item.</p>
                  )}
                </div>

                <div style={footerStyle}>
                  <span style={totalLabelStyle}><Receipt size={14} /> Total</span>
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
              Mostrar mais 10 pedidos
            </button>
          ) : pedidosOrdenados.length > PAGE_SIZE ? (
            <p style={fimListaStyle}>Fim da lista — você viu todos os seus pedidos.</p>
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
  background: "#fff", borderRadius: 16, padding: "20px 22px",
  marginBottom: 14, border: "1px solid #eef2f7",
  boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
};
const cardHeaderStyle = {
  display: "flex", justifyContent: "space-between",
  alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 14,
};
const pedidoTitle = { fontSize: 18, fontWeight: 800, margin: 0, color: "#0f172a" };
const metaInlineStyle = { display: "flex", gap: 14, marginTop: 4, color: "#64748b", fontSize: 13 };
const metaItemStyle = { display: "inline-flex", alignItems: "center", gap: 4 };

const statusPillStyle = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
};
const dotStyle = { width: 6, height: 6, borderRadius: "50%" };

const itensWrapStyle = { background: "#f8fafc", borderRadius: 10, padding: "10px 12px", marginBottom: 12 };
const itemRowStyle = {
  display: "flex", justifyContent: "space-between",
  padding: "4px 0", fontSize: 14, color: "#0f172a",
};
const qtdStyle = { color: "#64748b", fontWeight: 700 };

const footerStyle = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  borderTop: "1px solid #f1f5f9", paddingTop: 10,
};
const totalLabelStyle = { display: "inline-flex", alignItems: "center", gap: 6, color: "#64748b", fontWeight: 600, fontSize: 13 };
const totalStyle = { fontSize: 20, color: "#0f172a", fontWeight: 800 };

const mostrarMaisStyle = {
  width: "100%", padding: "14px 18px", border: "1px solid #7f1d1d",
  borderRadius: 12, background: "#fff", color: "#7f1d1d",
  fontWeight: 800, cursor: "pointer", marginTop: 10,
};
const fimListaStyle = { textAlign: "center", color: "#94a3b8", fontSize: 13, margin: "16px 0 4px" };

export default Pedidos;
