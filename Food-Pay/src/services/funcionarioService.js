/**
 * Dados do painel da cantina / funcionário.
 */
import { api } from "../api/client";
import { endpoints } from "../api/endpoints";
import { mapDashboardFuncionario } from "../api/mappers";
import { env } from "../config/env";
import { funcionarioDashboardMock } from "../mocks/data";

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** KPIs e pedidos recentes — GET /funcionario/dashboard */
export async function getDashboard() {
  if (env.useMock) {
    await delay(300);
    return mapDashboardFuncionario(funcionarioDashboardMock);
  }
  const data = await api.get(endpoints.funcionario.dashboard);
  return mapDashboardFuncionario(data);
}
