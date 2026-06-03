/**
 * Etiqueta colorida de status de pedido/pagamento.
 * statusMap associa texto do backend à classe CSS (verde, laranja, azul).
 */
const statusMap = {
  Entregue: "badge--green",
  "Em preparo": "badge--orange",
  Preparando: "badge--orange",
  Confirmado: "badge--blue",
  Pago: "badge--green",
  Pendente: "badge--orange",
};

function StatusBadge({ status }) {
  const className = statusMap[status] || "badge--blue";
  return <span className={`status-badge ${className}`}>{status}</span>;
}

export default StatusBadge;
