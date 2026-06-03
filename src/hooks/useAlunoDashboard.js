import { getDashboard } from "../services/alunoService";
import { useAsync } from "./useAsync";

/**
 * Hook da tela inicial do aluno.
 * Encapsula a chamada getDashboard() com estados de carregamento e erro.
 */
export function useAlunoDashboard() {
  // Array vazio [] = busca só uma vez ao abrir a página (não refaz a cada render)
  return useAsync(() => getDashboard(), []);
}
