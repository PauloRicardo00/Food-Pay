import { getDashboard } from "../services/funcionarioService";
import { useAsync } from "./useAsync";

/** Hook do painel do funcionário — carrega dados via useAsync + funcionarioService */
export function useFuncionarioDashboard() {
  return useAsync(() => getDashboard(), []);
}
