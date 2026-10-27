import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup, configure } from '@testing-library/react';
import { setCompanyId, setSessionExpiredHandler } from '../services/datalab-api/axios';
import { server } from './msw/server';

// The default 1s timeout fails page tests when the suite runs in parallel; passing tests are not slowed down
configure({ asyncUtilTimeout: 5_000 });

// jsdom has no matchMedia, which the theme uses
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

// jsdom has no Element.scrollTo, which the chat message list uses
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = function (this: Element, options?: ScrollToOptions | number) {
    if (typeof options === 'object' && options.top !== undefined) this.scrollTop = options.top;
  };
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers();
  cleanup();
  localStorage.clear();
  // Module state in axios.ts survives React's cleanup
  setCompanyId(null);
  setSessionExpiredHandler(null);
});

afterAll(() => server.close());
