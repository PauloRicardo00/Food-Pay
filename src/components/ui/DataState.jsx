/**
 * Estados visuais enquanto dados carregam ou falham.
 * Usado nas dashboards antes de renderizar o conteúdo principal.
 */

/** Exibido enquanto useAsync.loading === true */
export function LoadingState({ message = "Carregando..." }) {
  return (
    <div className="data-state data-state--loading">
      <p>{message}</p>
    </div>
  );
}

/** Exibido quando a API/mock lança erro; onRetry chama refetch do hook */
export function ErrorState({ error, onRetry }) {
  const message =
    error?.message || "Não foi possível carregar os dados. Tente novamente.";

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
