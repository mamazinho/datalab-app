import type { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../styles/themes';

interface IRenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Rota inicial do MemoryRouter (para componentes que usam Link/useLocation) */
  route?: string;
  queryClient?: QueryClient;
}

/** QueryClient de teste: sem retry e sem cache entre testes, para falha virar erro na hora. */
export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
      mutations: { retry: false },
    },
  });

/**
 * Renderiza com os providers globais do app (query, tema, router).
 * Use no lugar do render puro do Testing Library em qualquer componente
 * que dependa de styled-components, react-query ou react-router.
 */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', queryClient = createTestQueryClient(), ...options }: IRenderWithProvidersOptions = {},
): RenderResult & { queryClient: QueryClient } {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );

  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
