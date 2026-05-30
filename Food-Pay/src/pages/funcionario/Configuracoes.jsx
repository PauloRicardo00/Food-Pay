import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function ConfiguracoesFuncionario() {
  const [novoPedido, setNovoPedido] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [somNotificacao, setSomNotificacao] = useState(false);

  useEffect(() => {
    const config = JSON.parse(
      localStorage.getItem("foodpay_config_funcionario")
    );

    if (config) {
      setNovoPedido(config.novoPedido);
      setAutoRefresh(config.autoRefresh);
      setSomNotificacao(config.somNotificacao);
    }
  }, []);

  function salvarConfiguracoes() {
    localStorage.setItem(
      "foodpay_config_funcionario",
      JSON.stringify({
        novoPedido,
        autoRefresh,
        somNotificacao,
      })
    );

    toast.success("Configurações salvas com sucesso!");
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1 style={tituloStyle}>Configurações</h1>

      <div style={gridStyle}>
        <div style={cardStyle}>
          <h2 style={subtituloStyle}>Dados da cantina</h2>

          <label style={labelStyle}>Nome</label>
          <div style={infoBoxStyle}>Cantina SESI</div>

          <label style={labelStyle}>Email</label>
          <div style={infoBoxStyle}>funcionario@foodpay.com</div>

          <label style={labelStyle}>Perfil</label>
          <div style={infoBoxStyle}>Funcionário</div>
        </div>

        <div style={cardStyle}>
          <h2 style={subtituloStyle}>Preferências</h2>

          <Opcao
            titulo="Receber novos pedidos"
            descricao="Exibir notificações quando um novo pedido for realizado."
            valor={novoPedido}
            onChange={() => setNovoPedido(!novoPedido)}
          />

          <Opcao
            titulo="Atualizar pedidos automaticamente"
            descricao="Atualiza a tela sem necessidade de recarregar."
            valor={autoRefresh}
            onChange={() => setAutoRefresh(!autoRefresh)}
          />

          <Opcao
            titulo="Notificações sonoras"
            descricao="Emitir alerta sonoro quando chegar um pedido."
            valor={somNotificacao}
            onChange={() => setSomNotificacao(!somNotificacao)}
          />

          <button style={botaoStyle} onClick={salvarConfiguracoes}>
            Salvar configurações
          </button>
        </div>
      </div>

      <div style={estatisticasStyle}>
        <div style={cardEstatistica}>
          <span>Produtos cadastrados</span>
          <strong>12</strong>
        </div>

        <div style={cardEstatistica}>
          <span>Pedidos hoje</span>
          <strong>8</strong>
        </div>

        <div style={cardEstatistica}>
          <span>Pedidos entregues</span>
          <strong>6</strong>
        </div>
      </div>
    </div>
  );
}

function Opcao({ titulo, descricao, valor, onChange }) {
  return (
    <div style={opcaoStyle}>
      <div>
        <strong>{titulo}</strong>

        <p style={{ color: "#64748b", marginTop: "4px" }}>
          {descricao}
        </p>
      </div>

      <input
        type="checkbox"
        checked={valor}
        onChange={onChange}
        style={{ width: "22px", height: "22px" }}
      />
    </div>
  );
}

const tituloStyle = {
  fontSize: "42px",
  fontWeight: "700",
  marginBottom: "24px",
};

const subtituloStyle = {
  marginBottom: "20px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
};

const cardStyle = {
  background: "#fff",
  padding: "24px",
  borderRadius: "18px",
};

const labelStyle = {
  display: "block",
  fontWeight: "600",
  marginTop: "14px",
  marginBottom: "6px",
};

const infoBoxStyle = {
  padding: "12px",
  background: "#f8fafc",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
};

const opcaoStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 0",
  borderBottom: "1px solid #e5e7eb",
};

const botaoStyle = {
  width: "100%",
  marginTop: "20px",
  padding: "12px",
  border: "none",
  borderRadius: "10px",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "600",
};

const estatisticasStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "20px",
  marginTop: "20px",
};

const cardEstatistica = {
  background: "#fff",
  padding: "24px",
  borderRadius: "18px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

export default ConfiguracoesFuncionario;