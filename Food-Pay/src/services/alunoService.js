/**
 * Service do aluno — abstrai as chamadas de API da camada de UI.
 * Os dados retornados já passam pelo mapper antes de chegar aos componentes.
 */
import { api } from "../api/client";
import { endpoints } from "../api/endpoints";
import { mapDashboardAluno } from "../api/mappers";

/** Carrega saldo, cardápio do dia e últimos pedidos para o dashboard */
export async function getDashboard() {
  const data = await api.get(endpoints.aluno.dashboard);
  return mapDashboardAluno(data);
}

/** Adiciona um produto ao pedido em aberto do aluno */
export async function adicionarAoPedido(produtoId) {
  return api.post(endpoints.aluno.pedidos, { produtoId });
}
