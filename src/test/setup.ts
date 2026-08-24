import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup, configure } from '@testing-library/react';
import { setCompanyId, setSessionExpiredHandler } from '../services/datalab-api/axios';
import { server } from './msw/server';

// O padrão de 1s do findBy/waitFor estoura em teste de página quando a suíte
// roda em paralelo. Não atrasa quem passa: a espera termina na primeira checagem
// bem-sucedida — só amplia a margem antes de declarar falha.
configure({ asyncUtilTimeout: 5_000 });

// jsdom não implementa matchMedia, usado pelo tema (prefers-color-scheme).
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }) as unknown as MediaQueryList;
}

// onUnhandledRequest: 'error' — requisição sem handler falha o teste em vez de
// vazar para a rede de verdade ou virar um erro silencioso de query.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers();
  cleanup();
  localStorage.clear();
  // Estado de módulo do axios não é resetado pelo cleanup do React.
  setCompanyId(null);
  setSessionExpiredHandler(null);
});

afterAll(() => server.close());
