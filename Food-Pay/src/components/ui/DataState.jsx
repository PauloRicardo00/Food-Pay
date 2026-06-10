/**
 * Componentes de estado visual para carregamento e erro de dados.
 *
 * Uso padrão nos dashboards:
 *   if (loading) return <LoadingState />;
 *   if (error)   return <ErrorState error={error} onRetry={refetch} />;
 */

/** Exibido enquanto useAsync.loading === true */
export function LoadingState({ message = "Carregando..." }) {
  return (
    <div className="data-state data-state--loading">
      <p>{message}</p>
    </div>
  );
}

/**
 * Exibido quando a chamada de dados retorna erro.
 * onRetry, quando fornecido, chama refetch do hook useAsync.
 */
export function ErrorState({ error, onRetry }) {
  const message = error?.message || "Não foi possível carregar os dados. Tente novamente.";

  return (
    <div className="data-state data-state--error">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="data-state__retry" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}
