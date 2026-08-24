import type { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '../contexts/auth';
import { CompanyProvider } from '../contexts/company';
import { CustomThemeProvider } from '../contexts/theme';
import type { IUserCompany } from '../services/datalab-api/usersResource';

interface IRenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Rota inicial do MemoryRouter (para componentes que usam Link/useLocation) */
  route?: string;
  /** Empresas do usuário; uma só é auto-selecionada pelo CompanyProvider */
  companies?: IUserCompany[];
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
 * Renderiza com a mesma árvore de providers do App (query, tema, auth, empresa,
 * router e toasts). Use no lugar do render puro: é o que torna teste de página
 * possível sem mockar hook nenhum — só a rede, via MSW.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    route = '/',
    companies = [],
    queryClient = createTestQueryClient(),
    ...options
  }: IRenderWithProvidersOptions = {},
): RenderResult & { queryClient: QueryClient } {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider>
        <AuthProvider>
          <CompanyProvider companies={companies}>
            <MemoryRouter initialEntries={[route]}>
              {children}
              <ToastContainer autoClose={false} />
            </MemoryRouter>
          </CompanyProvider>
        </AuthProvider>
      </CustomThemeProvider>
    </QueryClientProvider>
  );

  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
