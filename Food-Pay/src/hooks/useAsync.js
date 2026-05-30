import { useCallback, useEffect, useState } from "react";

/**
 * Hook reutilizável para carregar dados assíncronos (API ou mock).
 *
 * Por que existe: evita repetir loading/erro/refetch em cada tela.
 * Como funciona: chama fetcher(), guarda resultado em data e expõe refetch.
 *
 * @param {() => Promise<any>} fetcher função que retorna os dados (ex.: getDashboard)
 * @param {unknown[]} deps quando mudam, o fetcher é recriado e os dados recarregam
 */
export function useAsync(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useCallback memoriza a função run; deps controla quando ela muda
  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, deps);

  // Ao montar o componente (ou quando run mudar), busca os dados automaticamente
  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, refetch: run };
}
