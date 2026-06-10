/**
 * Camada de mapeamento entre o JSON do backend e os objetos esperados pela UI.
 *
 * Centralizar aqui evita que mudanças de contrato na API se propaguem
 * para os componentes — basta atualizar o mapper correspondente.
 */
import { formatCurrency } from "../utils/format";

/** Normaliza um pedido retornado pelo painel do funcionário */
export function mapPedidoFuncionario(p) {
  return {
    id: p.id,
    data: p.data ?? p.dataHora ?? "",
    cliente: p.cliente ?? p.clienteNome ?? "",
    status: p.status,
    valorFormatado:
      typeof p.valor === "number" ? formatCurrency(p.valor) : p.valor ?? p.valorFormatado,
  };
}

/** Normaliza um produto do cardápio para exibição */
export function mapProdutoCardapio(p) {
  return {
    id: p.id,
    nome: p.nome,
    precoFormatado:
      typeof p.preco === "number" ? formatCurrency(p.preco) : p.preco ?? p.precoFormatado,
    imagem: p.imagem ?? p.imagemUrl ?? "",
  };
}

/** Normaliza um pedido do histórico do aluno */
export function mapPedidoAluno(p) {
  return {
    id: p.id,
    data: p.data ?? "",
    item: p.item ?? p.descricao ?? "",
    status: p.status,
    valorFormatado:
      typeof p.valor === "number" ? formatCurrency(p.valor) : p.valor ?? p.valorFormatado,
  };
}

/** Normaliza uma transação financeira */
export function mapTransacao(t) {
  return {
    id: t.id,
    item: t.item,
    local: t.local,
    data: t.data,
    imagem: t.imagem ?? t.imagemUrl ?? "",
    valorFormatado:
      typeof t.valor === "number" ? formatCurrency(t.valor) : t.valor ?? t.valorFormatado,
  };
}

/** Transforma a resposta de GET /funcionario/dashboard no formato usado pelo componente */
export function mapDashboardFuncionario(data) {
  return {
    resumoPagamentos: {
      totalHojeFormatado: formatCurrency(data.resumoPagamentos?.totalHoje ?? 0),
      mensagem: data.resumoPagamentos?.mensagem ?? "",
    },
    pedidosRecentes: (data.pedidosRecentes ?? []).map(mapPedidoFuncionario),
    kpis: {
      pedidosDia:               data.kpis?.pedidosDia ?? 0,
      pedidosDiaVariacao:       data.kpis?.pedidosDiaVariacao ?? 0,
      faturamentoDiaFormatado:  formatCurrency(data.kpis?.faturamentoDia ?? 0),
      faturamentoDiaVariacao:   data.kpis?.faturamentoDiaVariacao ?? 0,
      pedidosEmAndamento:       data.kpis?.pedidosEmAndamento ?? 0,
      pedidosEntregues:         data.kpis?.pedidosEntregues ?? 0,
    },
  };
}

/** Transforma a resposta de GET /aluno/dashboard no formato usado pelo componente */
export function mapDashboardAluno(data) {
  return {
    saldoFormatado: formatCurrency(Number(data?.aluno?.saldo ?? 0)),
    nomeAluno: data?.aluno?.nome ?? "Aluno",
    cardapio: (data?.cardapio ?? []).map((p) => ({
      id: p.id,
      nome: p.nome,
      preco: p.preco,
      precoFormatado: formatCurrency(Number(p.preco ?? 0)),
      imagem: p.imagem ?? p.imagemUrl ?? "",
    })),
    ultimosPedidos: (data?.pedidosRecentes ?? []).map((p) => ({
      id: p.id,
      data: p.dataPedido ?? "",
      item: `Pedido #${p.id}`,
      status: p.status,
      valorFormatado: formatCurrency(Number(p.valorTotal ?? 0)),
    })),
  };
}

/** Transforma a resposta de GET /responsavel/dashboard no formato usado pelo componente */
export function mapDashboardResponsavel(data) {
  return {
    dependentes: data.dependentes ?? [],
    resumo: {
      saldoFormatado:         formatCurrency(data.resumo?.saldo ?? 0),
      limiteMensalFormatado:  formatCurrency(data.resumo?.limiteMensal ?? 0),
      gastoMesFormatado:      formatCurrency(data.resumo?.gastoMes ?? 0),
      percentualLimite:       data.resumo?.percentualLimite ?? 0,
      diasRestantes:          data.resumo?.diasRestantes ?? 0,
      fimCiclo:               data.resumo?.fimCiclo ?? "",
    },
    transacoes:               (data.transacoes ?? []).map(mapTransacao),
    gastosPorCategoria:       data.gastosPorCategoria ?? [],
    gastoTotalMesFormatado:   formatCurrency(data.gastoTotalMes ?? data.resumo?.gastoMes ?? 0),
  };
}
