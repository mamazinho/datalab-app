import { HttpResponse, http } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { ACCESS_TOKEN, api } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import { createTestQueryClient } from '../../test/test-utils';
import { axiosPrivateInstance } from '../../services/datalab-api/axios';
import { AuthProvider } from './providers';
import { useAuthContext } from './contexts';

const renderAuth = (queryClient: QueryClient = createTestQueryClient()) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );

  return { queryClient, ...renderHook(() => useAuthContext(), { wrapper }) };
};

const loginResponse = {
  access_token: ACCESS_TOKEN,
  token_type: 'bearer',
  expires_in: 3600,
  scope: '',
};

describe('AuthProvider', () => {
  it('starts logged out when there is no stored token', () => {
    const { result } = renderAuth();

    expect(result.current.accessToken).toBeUndefined();
  });

  it('resumes the session stored in a previous visit', () => {
    localStorage.setItem('accessToken', 'token-anterior');

    const { result } = renderAuth();

    expect(result.current.accessToken).toBe('token-anterior');
  });

  it('stores the token on login', async () => {
    const { result } = renderAuth();

    await act(() => result.current.login(loginResponse));

    expect(result.current.accessToken).toBe(ACCESS_TOKEN);
    expect(localStorage.getItem('accessToken')).toBe(ACCESS_TOKEN);
  });

  it('drops the token and the cached data on logout', async () => {
    const { result, queryClient } = renderAuth();
    await act(() => result.current.login(loginResponse));
    queryClient.setQueryData(['me'], { name: 'Ana' });

    act(() => result.current.logout());

    expect(result.current.accessToken).toBeUndefined();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(queryClient.getQueryData(['me'])).toBeUndefined();
  });

  it('logs the user out when the backend rejects the session', async () => {
    localStorage.setItem('accessToken', 'token-expirado');
    server.use(
      http.get(api('users/me'), () =>
        HttpResponse.json({ detail: 'Not authenticated' }, { status: 401 }),
      ),
    );
    const { result } = renderAuth();

    await expect(axiosPrivateInstance.get('users/me')).rejects.toThrow();

    await waitFor(() => expect(result.current.accessToken).toBeUndefined());
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});
