import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, userEvent, within } from '../../../test/test-utils';
import { api } from '../../../test/msw/handlers';
import { server } from '../../../test/msw/server';
import { ModelSelect } from './model-select';

const renderModelSelect = (defaultValue = '') =>
  renderWithProviders(
    <form aria-label="agente">
      <ModelSelect name="model_name" defaultValue={defaultValue} emptyOptionLabel="Padrão do sistema" />
    </form>,
  );

const submittedModel = () => new FormData(screen.getByRole('form', { name: 'agente' }) as HTMLFormElement).get('model_name');

describe('<ModelSelect />', () => {
  it('groups the models under the provider name', async () => {
    const user = userEvent.setup();
    renderModelSelect();

    await user.click(await screen.findByRole('button', { name: 'Padrão do sistema' }));

    const openai = screen.getByRole('group', { name: 'OpenAI' });
    expect(within(openai).getByRole('option', { name: 'GPT-4o' })).toBeInTheDocument();
    expect(
      within(screen.getByRole('group', { name: 'Google' })).getByRole('option', { name: 'Gemini 2.5 Pro' }),
    ).toBeInTheDocument();
  });

  it('submits the model name and shows its display name', async () => {
    const user = userEvent.setup();
    renderModelSelect();

    await user.click(await screen.findByRole('button', { name: 'Padrão do sistema' }));
    await user.click(screen.getByRole('option', { name: 'Gemini 2.5 Pro' }));

    expect(submittedModel()).toBe('gemini-2.5-pro');
    expect(screen.getByRole('button', { name: 'Gemini 2.5 Pro' })).toBeInTheDocument();
  });

  it('keeps a saved model that left the catalog', async () => {
    const user = userEvent.setup();
    renderModelSelect('gpt-3.5-turbo');

    await user.click(await screen.findByRole('button', { name: 'gpt-3.5-turbo' }));

    expect(screen.getByRole('option', { name: 'gpt-3.5-turbo', selected: true })).toBeInTheDocument();
    expect(submittedModel()).toBe('gpt-3.5-turbo');
  });

  it('falls back to the system default when the models fail to load', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(api('agents/available-models'), () =>
        HttpResponse.json({ detail: 'Falha no provider.' }, { status: 500 }),
      ),
    );
    renderModelSelect('gpt-4o');

    expect(await screen.findByText('Não foi possível carregar a lista de modelos.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'gpt-4o' }));
    await user.click(screen.getByRole('option', { name: 'Padrão do sistema' }));

    expect(submittedModel()).toBe('');
  });
});
