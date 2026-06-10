import { getDashboard } from "../services/alunoService";
import { useAsync } from "./useAsync";

/**
 * Hook dedicado ao carregamento dos dados do Dashboard do aluno.
 * Encapsula a chamada ao service e expõe loading, error e refetch
 * prontos para uso no componente DashboardAluno.
 */
export function useAlunoDashboard() {
  return useAsync(() => getDashboard(), []);
}
