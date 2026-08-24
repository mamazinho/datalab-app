import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../../test/test-utils';
import { api } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import { buildCompany, buildCurrentMembership, buildRoutePermission, uuid } from '../../test/factories';
import type { IUserCompany } from '../../services/datalab-api/usersResource';
import { CompanyManagement } from './company-management';

type User = ReturnType<typeof userEvent.setup>;

const owned = buildCompany({ id: uuid(1), name: 'Acme' });

const asMember = (company: IUserCompany): IUserCompany => ({
  ...company,
  membership: { ...company.membership, membership_role: 'member' },
});

const givenMemberWith = (paths: { method: string; path: string }[]) => {
  server.use(
    http.get(api('memberships/current/'), () =>
      HttpResponse.json(
        buildCurrentMembership({
          membership_role: 'member',
          permissions: paths.map(({ method, path }) =>
            buildRoutePermission({ method, path, tag: 'companies' }),
          ),
        }),
      ),
    ),
  );
};

const renderManagement = (companies: IUserCompany[] = [owned]) =>
  renderWithProviders(<CompanyManagement />, { companies });

const openDeleteModal = async (user: User) => {
  await user.click(await screen.findByRole('button', { name: 'Deletar' }));
  return screen.findByRole('dialog');
};

describe('<CompanyManagement />', () => {
  it('shows the active company', async () => {
    renderManagement();

    expect(await screen.findByText('Acme')).toBeInTheDocument();
    expect(screen.getByText('Empresa ativa')).toBeInTheDocument();
  });

  it('renders nothing while no company is selected', () => {
    renderManagement([owned, buildCompany({ id: uuid(2), name: 'Globex' })]);

    expect(screen.queryByText('Gerenciamento de empresa')).not.toBeInTheDocument();
  });

  describe('permissions', () => {
    it('offers both actions to the owner', async () => {
      renderManagement();

      expect(await screen.findByRole('button', { name: 'Editar nome' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Deletar' })).toBeInTheDocument();
    });

    it('hides deletion from a member who can only edit', async () => {
      givenMemberWith([{ method: 'PATCH', path: '/v1/companies/{id}/' }]);
      renderManagement([asMember(owned)]);

      expect(await screen.findByRole('button', { name: 'Editar nome' })).toBeInTheDocument();
      await waitFor(() =>
        expect(screen.queryByRole('button', { name: 'Deletar' })).not.toBeInTheDocument(),
      );
    });

    it('hides both actions from a member with neither permission', async () => {
      givenMemberWith([]);
      renderManagement([asMember(owned)]);

      await screen.findByText('Acme');
      await waitFor(() =>
        expect(screen.queryByRole('button', { name: 'Editar nome' })).not.toBeInTheDocument(),
      );
      expect(screen.queryByRole('button', { name: 'Deletar' })).not.toBeInTheDocument();
    });
  });

  describe('renaming', () => {
    it('sends the new name and closes the modal', async () => {
      const user = userEvent.setup({ delay: null });
      let body: unknown;
      server.use(
        http.patch(api(`companies/${owned.id}/`), async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({ ...owned, name: 'Acme Brasil' });
        }),
      );
      renderManagement();

      await user.click(await screen.findByRole('button', { name: 'Editar nome' }));
      const input = await screen.findByLabelText('Nome *');
      await user.clear(input);
      await user.type(input, 'Acme Brasil');
      await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

      expect(await screen.findByText('Empresa atualizada.')).toBeInTheDocument();
      expect(body).toEqual({ name: 'Acme Brasil' });
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('keeps the modal open and shows the failure inline', async () => {
      const user = userEvent.setup({ delay: null });
      server.use(
        http.patch(api(`companies/${owned.id}/`), () =>
          HttpResponse.json({ detail: 'Nome já usado.' }, { status: 409 }),
        ),
      );
      renderManagement();

      await user.click(await screen.findByRole('button', { name: 'Editar nome' }));
      await user.type(await screen.findByLabelText('Nome *'), ' Brasil');
      await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

      expect(await screen.findByText(/Nome já usado\./)).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('deletion', () => {
    it('stays blocked until the company name is typed exactly', async () => {
      const user = userEvent.setup({ delay: null });
      renderManagement();
      await openDeleteModal(user);

      const submit = screen.getByRole('button', { name: 'Deletar empresa' });
      expect(submit).toBeDisabled();

      await user.type(screen.getByLabelText('Nome da empresa'), 'acme');
      expect(submit).toBeDisabled();

      await user.clear(screen.getByLabelText('Nome da empresa'));
      await user.type(screen.getByLabelText('Nome da empresa'), 'Acme');
      expect(submit).toBeEnabled();
    });

    it('deletes the company and clears the selection', async () => {
      const user = userEvent.setup({ delay: null });
      localStorage.setItem('selectedCompanyId', owned.id);
      let deleted = false;
      server.use(
        http.delete(api(`companies/${owned.id}/`), () => {
          deleted = true;
          return new HttpResponse(null, { status: 204 });
        }),
      );
      renderManagement();
      await openDeleteModal(user);

      await user.type(screen.getByLabelText('Nome da empresa'), 'Acme');
      await user.click(screen.getByRole('button', { name: 'Deletar empresa' }));

      expect(await screen.findByText('Empresa deletada.')).toBeInTheDocument();
      expect(deleted).toBe(true);
      await waitFor(() => expect(localStorage.getItem('selectedCompanyId')).toBeNull());
    });

    it('reports the backend refusal without closing the modal', async () => {
      const user = userEvent.setup({ delay: null });
      server.use(
        http.delete(api(`companies/${owned.id}/`), () =>
          HttpResponse.json({ detail: 'Empresa possui membros ativos.' }, { status: 400 }),
        ),
      );
      renderManagement();
      await openDeleteModal(user);

      await user.type(screen.getByLabelText('Nome da empresa'), 'Acme');
      await user.click(screen.getByRole('button', { name: 'Deletar empresa' }));

      expect(await screen.findByText(/Empresa possui membros ativos\./)).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
