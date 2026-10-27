import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { ACCESS_TOKEN, api } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import { renderWithProviders, screen } from '../../test/test-utils';
import { SOCIAL_AUTH_CHANNEL, SOCIAL_LOGIN_SUCCESS, type AuthChannelEvent } from '../../types/auth';
import { SocialCallback } from './social-callback';

const nextAuthMessage = () => {
  const channel = new BroadcastChannel(SOCIAL_AUTH_CHANNEL);
  return new Promise<AuthChannelEvent>((resolve) => {
    channel.onmessage = (event: MessageEvent<AuthChannelEvent>) => {
      resolve(event.data);
      channel.close();
    };
  });
};

describe('<SocialCallback />', () => {
  it('hands the access token from the session cookie to the tab that opened the popup', async () => {
    const message = nextAuthMessage();

    renderWithProviders(<SocialCallback />, { route: '/auth/google/callback' });

    await expect(message).resolves.toMatchObject({
      type: SOCIAL_LOGIN_SUCCESS,
      response: { access_token: ACCESS_TOKEN },
    });
  });

  it('shows the error the provider sent back', async () => {
    renderWithProviders(<SocialCallback />, { route: '/auth/google/callback?error=access_denied' });

    expect(await screen.findByText('access_denied')).toBeInTheDocument();
  });

  it('explains when the session did not come back from the provider', async () => {
    server.use(http.post(api('auth/refresh/'), () => HttpResponse.json({ detail: 'Session expired' }, { status: 401 })));

    renderWithProviders(<SocialCallback />, { route: '/auth/google/callback' });

    expect(await screen.findByText('Não foi possível concluir o login com o provedor.')).toBeInTheDocument();
  });
});
