import { useEffect, useState } from "react";
import { api } from "../../api/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function RelatoriosFuncionario() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    async function carregarDados() {
      try {
        const data = await api.get("/pedidos");
        setPedidos(data);
      } catch (error) {
        console.error(error);
      }
    }

    carregarDados();
  }, []);

  const totalVendido = pedidos.reduce(
    (soma, pedido) => soma + Number(pedido.valorTotal),
    0
  );

  const pedidosPendentes = pedidos.filter(
    (pedido) => pedido.status === "Pendente"
  ).length;

  const pedidosEmPreparo = pedidos.filter(
    (pedido) => pedido.status === "Em preparo"
  ).length;

  const pedidosEntregues = pedidos.filter(
    (pedido) => pedido.status === "Entregue"
  ).length;

  const totalPedidos = pedidos.length || 1;

  function exportarPDF() {
    const doc = new jsPDF();

    const dataAtual = new Date().toLocaleString("pt-BR");
    const taxaEntrega =
      pedidos.length > 0
        ? ((pedidosEntregues / pedidos.length) * 100).toFixed(1)
        : "0.0";

    doc.setFontSize(22);
    doc.setTextColor(11, 44, 102);
    doc.text("Food Pay", 14, 16);

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Sistema de Gestão de Alimentação", 14, 22);

    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("Relatório Food Pay", 14, 36);

    doc.setFontSize(11);
    doc.text(`Gerado em: ${dataAtual}`, 14, 44);

    doc.setFontSize(13);
    doc.text("Resumo geral", 14, 56);

    autoTable(doc, {
      startY: 62,
      head: [["Indicador", "Valor"]],
      body: [
        ["Total vendido", `R$ ${totalVendido.toFixed(2)}`],
        ["Total de pedidos", pedidos.length],
        ["Pedidos pendentes", pedidosPendentes],
        ["Pedidos em preparo", pedidosEmPreparo],
        ["Pedidos entregues", pedidosEntregues],
        ["Taxa de entrega", `${taxaEntrega}%`],
      ],
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 12,
    head: [["Pedido", "Aluno", "Status", "Valor", "Data"]],
    body: pedidos.map((pedido) => [
      `#${pedido.id}`,
      pedido.alunoNome || "Aluno",
      pedido.status,
      `R$ ${Number(pedido.valorTotal).toFixed(2)}`,
      new Date(pedido.dataPedido).toLocaleString("pt-BR"),
    ]),
  });

  const pageHeight = doc.internal.pageSize.height;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Food Pay - Sistema de Gestão de Alimentação",
    14,
    pageHeight - 10
  );

  doc.save("relatorio-food-pay.pdf");
}
  return (
    <div style={{ padding: "30px" }}>
      <div style={headerStyle}>
        <h1 style={{ marginBottom: "25px" }}>Relatórios</h1>

        <button style={pdfButtonStyle} onClick={exportarPDF}>
          Exportar PDF
        </button>
      </div>

      <div style={gridStyle}>
        <div style={cardStyle}>
          <h3>Total vendido</h3>
          <strong style={valueStyle}>R$ {totalVendido.toFixed(2)}</strong>
        </div>

        <div style={cardStyle}>
          <h3>Total de pedidos</h3>
          <strong style={valueStyle}>{pedidos.length}</strong>
        </div>

        <div style={cardStyle}>
          <h3>Pendentes</h3>
          <strong style={valueStyle}>{pedidosPendentes}</strong>
        </div>

        <div style={cardStyle}>
          <h3>Em preparo</h3>
          <strong style={valueStyle}>{pedidosEmPreparo}</strong>
        </div>

        <div style={cardStyle}>
          <h3>Entregues</h3>
          <strong style={valueStyle}>{pedidosEntregues}</strong>
        </div>
      </div>

      <div style={chartContainer}>
        <h2>Status dos pedidos</h2>

        <div style={chartCard}>
          <div style={chartRow}>
            <span>Pendentes</span>

            <div style={barBackground}>
              <div
                style={{
                  ...barFill,
                  width: `${(pedidosPendentes / totalPedidos) * 100}%`,
                  background: "#d97706",
                }}
              />
            </div>

            <strong>{pedidosPendentes}</strong>
          </div>

          <div style={chartRow}>
            <span>Em preparo</span>

            <div style={barBackground}>
              <div
                style={{
                  ...barFill,
                  width: `${(pedidosEmPreparo / totalPedidos) * 100}%`,
                  background: "#2563eb",
                }}
              />
            </div>

            <strong>{pedidosEmPreparo}</strong>
          </div>

          <div style={chartRow}>
            <span>Entregues</span>

            <div style={barBackground}>
              <div
                style={{
                  ...barFill,
                  width: `${(pedidosEntregues / totalPedidos) * 100}%`,
                  background: "#16a34a",
                }}
              />
            </div>

            <strong>{pedidosEntregues}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
};

const pdfButtonStyle = {
  padding: "12px 18px",
  border: "none",
  borderRadius: "10px",
  background: "#dc2626",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "600",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  marginBottom: "30px",
};

const cardStyle = {
  background: "#fff",
  padding: "22px",
  borderRadius: "14px",
};

const valueStyle = {
  fontSize: "26px",
};

const chartContainer = {
  marginTop: "20px",
};

const chartCard = {
  background: "#fff",
  padding: "24px",
  borderRadius: "14px",
};

const chartRow = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  marginBottom: "18px",
};

const barBackground = {
  flex: 1,
  height: "22px",
  background: "#e5e7eb",
  borderRadius: "999px",
  overflow: "hidden",
};

const barFill = {
  height: "100%",
  borderRadius: "999px",
};

export default RelatoriosFuncionario;