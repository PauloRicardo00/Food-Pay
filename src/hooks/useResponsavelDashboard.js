import { getDashboard } from "../services/responsavelService";
import { useAsync } from "./useAsync";

/**
 * Hook do painel do responsável.
 * dependenteId nas deps: ao trocar de filho na UI, recarrega os dados automaticamente.
 */
export function useResponsavelDashboard(dependenteId) {
  return useAsync(() => getDashboard(dependenteId), [dependenteId]);
}
