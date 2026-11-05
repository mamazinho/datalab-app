import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, userEvent } from '../../../../test/test-utils';
import { ACCESS_TOKEN, api } from '../../../../test/msw/handlers';
import { server } from '../../../../test/msw/server';
import { buildCompany, buildUser, uuid } from '../../../../test/factories';
import { Header } from './header';

const company = buildCompany({ id: uuid(1), name: 'Acme' });

const renderHeader = () => {
  localStorage.setItem('accessToken', ACCESS_TOKEN);
  server.use(http.get(api('users/me'), () => HttpResponse.json(buildUser({ name: 'Ana Souza', companies: [company] }))));
  return renderWithProviders(<Header />, { companies: [company] });
};

describe('<Header />', () => {
  it('closes the profile menu when the company dropdown opens', async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(await screen.findByRole('button', { name: /Foto de perfil de Ana Souza/ }));
    expect(screen.getByRole('link', { name: 'Editar perfil' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Acme' }));

    expect(screen.queryByRole('link', { name: 'Editar perfil' })).not.toBeInTheDocument();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('closes the profile menu on a click outside it', async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(await screen.findByRole('button', { name: /Foto de perfil de Ana Souza/ }));
    await user.click(screen.getByRole('link', { name: 'Página inicial' }));

    expect(screen.queryByRole('link', { name: 'Editar perfil' })).not.toBeInTheDocument();
  });
});
