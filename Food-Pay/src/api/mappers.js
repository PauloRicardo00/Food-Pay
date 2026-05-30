/**
 * Adaptadores (mappers): convertem JSON do backend para o formato que as telas esperam.
 * Se o backend usar nomes diferentes, altere aqui em vez de mudar cada componente visual.
 */
import { formatCurrency } from "../utils/format";

/** Um pedido na lista do funcionário */
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

export function mapProdutoCardapio(p) {
  return {
    id: p.id,
    nome: p.nome,
    precoFormatado:
      typeof p.preco === "number" ? formatCurrency(p.preco) : p.preco ?? p.precoFormatado,
    imagem: p.imagem ?? p.imagemUrl ?? "",
  };
}

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

/** Resposta GET /funcionario/dashboard → objeto usado em DashboardFuncionario */
export function mapDashboardFuncionario(data) {
  return {
    resumoPagamentos: {
      totalHojeFormatado: formatCurrency(data.resumoPagamentos?.totalHoje ?? 0),
      mensagem: data.resumoPagamentos?.mensagem ?? "",
    },
    pedidosRecentes: (data.pedidosRecentes ?? []).map(mapPedidoFuncionario),
    kpis: {
      pedidosDia: data.kpis?.pedidosDia ?? 0,
      pedidosDiaVariacao: data.kpis?.pedidosDiaVariacao ?? 0,
      faturamentoDiaFormatado: formatCurrency(data.kpis?.faturamentoDia ?? 0),
      faturamentoDiaVariacao: data.kpis?.faturamentoDiaVariacao ?? 0,
      pedidosEmAndamento: data.kpis?.pedidosEmAndamento ?? 0,
      pedidosEntregues: data.kpis?.pedidosEntregues ?? 0,
    },
  };
}

/** Resposta GET /aluno/dashboard */
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

/** Resposta GET /responsavel/dashboard */
export function mapDashboardResponsavel(data) {
  return {
    dependentes: data.dependentes ?? [],
    resumo: {
      saldoFormatado: formatCurrency(data.resumo?.saldo ?? 0),
      limiteMensalFormatado: formatCurrency(data.resumo?.limiteMensal ?? 0),
      gastoMesFormatado: formatCurrency(data.resumo?.gastoMes ?? 0),
      percentualLimite: data.resumo?.percentualLimite ?? 0,
      diasRestantes: data.resumo?.diasRestantes ?? 0,
      fimCiclo: data.resumo?.fimCiclo ?? "",
    },
    transacoes: (data.transacoes ?? []).map(mapTransacao),
    gastosPorCategoria: data.gastosPorCategoria ?? [],
    gastoTotalMesFormatado: formatCurrency(data.gastoTotalMes ?? data.resumo?.gastoMes ?? 0),
  };
}
