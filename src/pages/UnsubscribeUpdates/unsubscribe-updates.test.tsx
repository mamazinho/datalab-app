import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../../test/test-utils';
import { api, apiErrorResponse } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import { UnsubscribeUpdates } from './unsubscribe-updates';

describe('<UnsubscribeUpdates />', () => {
  it('unsubscribes only after the confirmation click, with the token of the link', async () => {
    let sent: unknown = null;
    server.use(
      http.post(api('tracking/updates/unsubscribe/'), async ({ request }) => {
        sent = await request.json();
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<UnsubscribeUpdates />, { route: '/descadastrar-avisos?token=token-assinado' });

    expect(sent).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Confirmar descadastro' }));

    expect(await screen.findByRole('status')).toHaveTextContent('você não vai mais receber os avisos');
    await waitFor(() => expect(sent).toEqual({ token: 'token-assinado' }));
  });

  it('shows the message of the API for an invalid link', async () => {
    server.use(
      http.post(api('tracking/updates/unsubscribe/'), () =>
        apiErrorResponse(400, 'Este link de descadastro é inválido ou expirou.', 'InvalidUnsubscribeLinkFriendlyException'),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<UnsubscribeUpdates />, { route: '/descadastrar-avisos?token=forjado' });

    await user.click(screen.getByRole('button', { name: 'Confirmar descadastro' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Este link de descadastro é inválido ou expirou.');
  });

  it('refuses a link without the token', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UnsubscribeUpdates />, { route: '/descadastrar-avisos' });

    await user.click(screen.getByRole('button', { name: 'Confirmar descadastro' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Este link de descadastro está incompleto.');
  });
});
