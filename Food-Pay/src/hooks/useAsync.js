import { useCallback, useEffect, useState } from "react";

/**
 * Hook genérico para chamadas assíncronas com controle de estado.
 *
 * Elimina a repetição de loading / error / refetch em cada tela da aplicação.
 *
 * @param {() => Promise<any>} fetcher - Função que retorna os dados (ex.: getDashboard)
 * @param {unknown[]}          deps    - Dependências do fetcher; quando mudam, os dados são recarregados
 *
 * @returns {{ data, loading, error, refetch }}
 */
export function useAsync(fetcher, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

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
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run };
}
