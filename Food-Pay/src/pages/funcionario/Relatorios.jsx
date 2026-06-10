/**
 * Relatórios de pedidos com exportação para PDF.
 * Filtra por status e período; usa jsPDF + jsPDF-AutoTable para
 * gerar o documento sem dependência de servidor.
 */
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, Filter } from "lucide-react";
import { api } from "../../api/client";

const STATUS = { PENDENTE: "Pendente", PREPARO: "Em preparo", ENTREGUE: "Entregue" };

function RelatoriosFuncionario() {
  const [pedidos, setPedidos] = useState([]);
  const [periodo, setPeriodo] = useState("7d"); // 7d | 30d | hoje | tudo
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const data = await api.get("/pedidos");
        setPedidos(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const filtrados = useMemo(() => {
    if (periodo === "tudo") return pedidos;
    const agora = new Date();
    const limite = new Date(agora);
    if (periodo === "hoje") limite.setHours(0, 0, 0, 0);
    else if (periodo === "7d") limite.setDate(agora.getDate() - 7);
    else if (periodo === "30d") limite.setDate(agora.getDate() - 30);
    return pedidos.filter((p) => new Date(p.dataPedido) >= limite);
  }, [pedidos, periodo]);

  const m = useMemo(() => {
    const total = filtrados.length;
    const totalVendido = filtrados.reduce((s, p) => s + Number(p.valorTotal || 0), 0);
    const pendentes = filtrados.filter((p) => p.status === STATUS.PENDENTE).length;
    const preparo = filtrados.filter((p) => p.status === STATUS.PREPARO).length;
    const entregues = filtrados.filter((p) => p.status === STATUS.ENTREGUE).length;
    const ticket = total > 0 ? totalVendido / total : 0;
    const taxaEntrega = total > 0 ? Math.round((entregues / total) * 100) : 0;

    // Por dia (últimos 7)
    const dias = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const proximo = new Date(d);
      proximo.setDate(proximo.getDate() + 1);
      const total = filtrados
        .filter((p) => {
          const dp = new Date(p.dataPedido);
          return dp >= d && dp < proximo;
        })
        .reduce((s, p) => s + Number(p.valorTotal || 0), 0);
      dias.push({
        label: d.toLocaleDateString("pt-BR", { weekday: "short" }),
        data: d.toLocaleDateString("pt-BR"),
        total,
      });
    }
    const maxDia = Math.max(1, ...dias.map((d) => d.total));

    // Top produtos
    const cont = new Map();
    const rec = new Map();
    filtrados.forEach((p) => {
      (p.itens || []).forEach((i) => {
        const k = i.produtoNome || "Produto";
        cont.set(k, (cont.get(k) || 0) + (i.quantidade || 1));
        rec.set(
          k,
          (rec.get(k) || 0) + (i.quantidade || 1) * Number(i.preco || p.valorTotal || 0)
        );
      });
    });
    const topProdutos = Array.from(cont.entries())
      .map(([nome, qtd]) => ({ nome, qtd, receita: rec.get(nome) || 0 }))
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 5);

    // Top alunos
    const alunos = new Map();
    filtrados.forEach((p) => {
      const k = p.alunoNome || "Aluno";
      const cur = alunos.get(k) || { pedidos: 0, valor: 0 };
      cur.pedidos += 1;
      cur.valor += Number(p.valorTotal || 0);
      alunos.set(k, cur);
    });
    const topAlunos = Array.from(alunos.entries())
      .map(([nome, v]) => ({ nome, ...v }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);

    return {
      total,
      totalVendido,
      pendentes,
      preparo,
      entregues,
      ticket,
      taxaEntrega,
      dias,
      maxDia,
      topProdutos,
      topAlunos,
    };
  }, [filtrados]);

  function exportarPDF() {
    setExportando(true);
    const toastId = toast.loading("Gerando PDF...");
    try {
      const doc = new jsPDF();
    const dataAtual = new Date().toLocaleString("pt-BR");

    doc.setFontSize(18);
    doc.text("Relatório Food Pay", 14, 20);
    doc.setFontSize(11);
    doc.text(`Gerado em: ${dataAtual} • Período: ${periodo}`, 14, 28);

    autoTable(doc, {
      startY: 36,
      head: [["Indicador", "Valor"]],
      body: [
        ["Total vendido", `R$ ${m.totalVendido.toFixed(2)}`],
        ["Ticket médio", `R$ ${m.ticket.toFixed(2)}`],
        ["Total de pedidos", m.total],
        ["Pendentes", m.pendentes],
        ["Em preparo", m.preparo],
        ["Entregues", m.entregues],
        ["Taxa de entrega", `${m.taxaEntrega}%`],
      ],
    });

    if (m.topProdutos.length) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Top produtos", "Qtd", "Receita"]],
        body: m.topProdutos.map((p) => [p.nome, p.qtd, `R$ ${p.receita.toFixed(2)}`]),
      });
    }

    if (m.topAlunos.length) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Top alunos", "Pedidos", "Total gasto"]],
        body: m.topAlunos.map((a) => [a.nome, a.pedidos, `R$ ${a.valor.toFixed(2)}`]),
      });
    }

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Pedido", "Aluno", "Status", "Valor", "Data"]],
      body: filtrados.map((p) => [
        `#${p.id}`,
        p.alunoNome || "Aluno",
        p.status,
        `R$ ${Number(p.valorTotal).toFixed(2)}`,
        new Date(p.dataPedido).toLocaleString("pt-BR"),
      ]),
    });

      doc.save(`relatorio-food-pay-${periodo}.pdf`);
      toast.success("PDF exportado com sucesso!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar o PDF.", { id: toastId });
    } finally {
      setExportando(false);
    }
  }

  if (loading) return <p style={{ padding: 30 }}>Carregando relatórios...</p>;

  return (
    <div style={{ padding: 30, maxWidth: 1200, margin: "0 auto" }}>
      <header style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 800 }}>
            Relatórios
          </h1>
          <p style={{ margin: "6px 0 0", color: "#64748b" }}>
            Insights da operação e exportação para PDF
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={filterStyle}>
            <Filter size={16} />
            {[
              ["hoje", "Hoje"],
              ["7d", "7 dias"],
              ["30d", "30 dias"],
              ["tudo", "Tudo"],
            ].map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setPeriodo(k)}
                style={{
                  ...chipStyle,
                  ...(periodo === k ? chipActiveStyle : {}),
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <button style={pdfButtonStyle} onClick={exportarPDF} disabled={exportando}>
            <Download size={16} style={{ marginRight: 6, verticalAlign: -3 }} />
            {exportando ? "Gerando PDF..." : "Exportar PDF"}
          </button>
        </div>
      </header>

      <div style={gridStyle}>
        <Card titulo="Total vendido" valor={`R$ ${m.totalVendido.toFixed(2)}`} cor="#16a34a" />
        <Card titulo="Pedidos" valor={m.total} cor="#b91c1c" />
        <Card titulo="Ticket médio" valor={`R$ ${m.ticket.toFixed(2)}`} cor="#2563eb" />
        <Card titulo="Taxa de entrega" valor={`${m.taxaEntrega}%`} cor="#7c3aed" />
        <Card titulo="Pendentes" valor={m.pendentes} cor="#d97706" />
        <Card titulo="Em preparo" valor={m.preparo} cor="#2563eb" />
        <Card titulo="Entregues" valor={m.entregues} cor="#16a34a" />
      </div>

      {/* Vendas últimos 7 dias */}
      <section style={chartCard}>
        <h2 style={chartTitle}>Vendas — últimos 7 dias</h2>
        <div style={{ display: "flex", alignItems: "end", gap: 14, height: 200 }}>
          {m.dias.map((d) => (
            <div
              key={d.data}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}
              title={`${d.data}: R$ ${d.total.toFixed(2)}`}
            >
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                R$ {d.total.toFixed(0)}
              </div>
              <div
                style={{
                  width: "70%",
                  height: `${(d.total / m.maxDia) * 100}%`,
                  background: "linear-gradient(180deg,#b91c1c,#ef4444)",
                  borderRadius: "8px 8px 4px 4px",
                  minHeight: d.total > 0 ? 6 : 0,
                }}
              />
              <span style={{ marginTop: 6, color: "#475569", fontSize: 12, fontWeight: 600 }}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16, marginTop: 16 }}>
        {/* Top produtos */}
        <section style={chartCard}>
          <h2 style={chartTitle}>Top 5 produtos</h2>
          {m.topProdutos.length === 0 ? (
            <p style={{ color: "#64748b" }}>Sem vendas no período.</p>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Produto</th><th>Qtd</th><th>Receita</th>
                </tr>
              </thead>
              <tbody>
                {m.topProdutos.map((p) => (
                  <tr key={p.nome}>
                    <td>{p.nome}</td>
                    <td>{p.qtd}</td>
                    <td>R$ {p.receita.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Top alunos */}
        <section style={chartCard}>
          <h2 style={chartTitle}>Top 5 alunos</h2>
          {m.topAlunos.length === 0 ? (
            <p style={{ color: "#64748b" }}>Sem dados no período.</p>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Aluno</th><th>Pedidos</th><th>Total</th>
                </tr>
              </thead>
              <tbody>
                {m.topAlunos.map((a) => (
                  <tr key={a.nome}>
                    <td>{a.nome}</td>
                    <td>{a.pedidos}</td>
                    <td>R$ {a.valor.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

function Card({ titulo, valor, cor }) {
  return (
    <div style={{ ...cardStyle, borderTop: `4px solid ${cor}` }}>
      <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>{titulo}</p>
      <strong style={{ fontSize: 22 }}>{valor}</strong>
    </div>
  );
}

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 16,
  flexWrap: "wrap",
  marginBottom: 22,
};
const pdfButtonStyle = {
  padding: "12px 18px",
  border: "none",
  borderRadius: 10,
  background: "#b91c1c",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
};
const filterStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 10px",
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
};
const chipStyle = {
  padding: "6px 12px",
  border: 0,
  background: "transparent",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
  color: "#475569",
};
const chipActiveStyle = { background: "#b91c1c", color: "#fff" };
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 14,
  marginBottom: 18,
};
const cardStyle = {
  background: "#fff",
  padding: 20,
  borderRadius: 14,
  display: "flex",
  flexDirection: "column",
  gap: 4,
  border: "1px solid #eef2f7",
  boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
};
const chartCard = {
  background: "#fff",
  padding: 22,
  borderRadius: 16,
  border: "1px solid #eef2f7",
  boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
};
const chartTitle = { margin: "0 0 16px", fontSize: 16, fontWeight: 700 };
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

export default RelatoriosFuncionario;
