import { use, useState, Suspense, type ReactNode, useEffect, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ServerErrorComponent } from "../Feedback/ErrorBoundaries/server-error";
import { LoadingPiece } from "../Feedback/Loadings/loading";

interface AsyncResourceProps<T> {
  fetcher: () => Promise<T>;
  children: (data: T) => ReactNode;
  loadingFallback?: ReactNode;
  dependencies?: unknown[];
}

const PromiseResolver = <T,>({
  promise,
  children
}: {
  promise: Promise<T>;
  children: (data: T) => ReactNode
}) => {
  const data = use(promise);
  return <>{children(data)}</>;
};

/**
 * Padrão oficial de leitura do app: promise cacheada + use() + Suspense + ErrorBoundary.
 * O refetch é dirigido APENAS por `dependencies` (a identidade do fetcher é ignorada),
 * então fetchers inline são seguros — liste em `dependencies` tudo que o fetcher usa.
 */
export const AsyncResource = <T,>({
  fetcher,
  children,
  loadingFallback,
  dependencies = []
}: AsyncResourceProps<T>) => {
  const [promise, setPromise] = useState<Promise<T> | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refresh = () => {
    setPromise(fetcherRef.current());
  };

  useEffect(() => {
    setPromise(fetcherRef.current());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);

  return (
    <ErrorBoundary
      FallbackComponent={ServerErrorComponent}
      onReset={refresh}
      resetKeys={[...dependencies]}
    >
      {!promise ? (
        loadingFallback || <LoadingPiece />
      ) : (
        <Suspense fallback={loadingFallback || <LoadingPiece />}>
          <PromiseResolver promise={promise}>
            {children}
          </PromiseResolver>
        </Suspense>
      )}
    </ErrorBoundary>
  );
};
