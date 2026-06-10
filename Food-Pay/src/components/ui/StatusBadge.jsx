/**
 * Badge colorida de status de pedido ou pagamento.
 * O mapeamento status → classe CSS segue a paleta definida em app.css.
 * Status desconhecidos recebem a cor neutra (azul).
 */
const statusMap = {
  Entregue:    "badge--green",
  "Em preparo": "badge--orange",
  Preparando:  "badge--orange",
  Confirmado:  "badge--blue",
  Pago:        "badge--green",
  Pendente:    "badge--orange",
};

function StatusBadge({ status }) {
  const className = statusMap[status] || "badge--blue";
  return <span className={`status-badge ${className}`}>{status}</span>;
}

export default StatusBadge;
