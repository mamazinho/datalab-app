import { use, useState, Suspense, type ReactNode, useEffect } from "react";
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

export const AsyncResource = <T,>({ 
  fetcher, 
  children, 
  loadingFallback,
  dependencies = []
}: AsyncResourceProps<T>) => {
  const [promise, setPromise] = useState<Promise<T> | null>(null);

  const refresh = () => {
    setPromise(fetcher());
  };

  useEffect(() => {
    setPromise(fetcher());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher, ...dependencies]);

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