import { api } from "../api/client";
import { endpoints } from "../api/endpoints";
import { mapDashboardAluno } from "../api/mappers";

export async function getDashboard() {
  const data = await api.get(endpoints.aluno.dashboard);
  return mapDashboardAluno(data);
}

export async function adicionarAoPedido(produtoId) {
  return api.post(endpoints.aluno.pedidos, { produtoId });
}