import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '../../test/test-utils';
import { ACCESS_TOKEN, api } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import { buildUser } from '../../test/factories';
import { Home } from './home';

const givenLoggedUser = (name: string) => {
  localStorage.setItem('accessToken', ACCESS_TOKEN);
  server.use(http.get(api('users/me'), () => HttpResponse.json(buildUser({ name }))));
};

describe('<Home />', () => {
  it('greets the user by first name', async () => {
    givenLoggedUser('Ana Maria Souza');
    renderWithProviders(<Home />);

    expect(await screen.findByText(/Bem-vindo a DataLab, Ana!/)).toBeInTheDocument();
  });

  it('greets without a name while the user is still loading', () => {
    renderWithProviders(<Home />);

    expect(screen.getByText(/Bem-vindo a DataLab,/)).toBeInTheDocument();
  });

  it('points to the chat area', () => {
    renderWithProviders(<Home />);

    expect(screen.getByRole('link', { name: 'Acessar conversas' })).toHaveAttribute(
      'href',
      '/ia/conversas',
    );
  });
});
