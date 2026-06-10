/**
 * Service do responsável — carrega dados do painel de acompanhamento.
 * O parâmetro dependenteId filtra os dados pelo filho selecionado no painel.
 */
import { api } from "../api/client";
import { endpoints } from "../api/endpoints";
import { mapDashboardResponsavel } from "../api/mappers";
import { env } from "../config/env";
import { responsavelDashboardMock } from "../mocks/data";

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** GET /responsavel/dashboard?dependenteId=... */
export async function getDashboard(dependenteId) {
  if (env.useMock) {
    await delay(300);
    return mapDashboardResponsavel({
      ...responsavelDashboardMock,
      dependenteId: dependenteId || responsavelDashboardMock.dependentePadraoId,
    });
  }
  const query = dependenteId ? `?dependenteId=${encodeURIComponent(dependenteId)}` : "";
  const data  = await api.get(`${endpoints.responsavel.dashboard}${query}`);
  return mapDashboardResponsavel(data);
}
