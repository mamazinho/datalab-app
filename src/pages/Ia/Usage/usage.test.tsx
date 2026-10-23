import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor, within } from '../../../test/test-utils';
import { api } from '../../../test/msw/handlers';
import { server } from '../../../test/msw/server';
import {
  buildChatUsage,
  buildChatUsageByChat,
  buildChatUsageReport,
  buildCompany,
  uuid,
} from '../../../test/factories';
import type { IChatUsageReport } from '../../../services/datalab-api/chatsResource';
import { Usage } from './usage';

const company = buildCompany({ id: uuid(1) });

const givenUsageReport = (overrides: Partial<IChatUsageReport>) => {
  server.use(http.get(api('chats/usage/'), () => HttpResponse.json(buildChatUsageReport(overrides))));
};

const renderUsage = () => renderWithProviders(<Usage />, { companies: [company] });

describe('<Usage />', () => {
  it('highlights the tokens and the model calls of the month', async () => {
    givenUsageReport({
      totals: buildChatUsage({ input_tokens: 1000, output_tokens: 500, requests: 42 }),
    });
    renderUsage();

    expect(await screen.findByText('1.500')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('breaks the usage down by person, conversation, origin and model', async () => {
    givenUsageReport({
      totals: buildChatUsage({ requests: 10 }),
      by_member: [
        { ...buildChatUsage(), membership_id: uuid(5), name: 'Bruno Lima', avatar_url: null },
        { ...buildChatUsage(), membership_id: null, name: null, avatar_url: null },
      ],
      by_chat: [buildChatUsageByChat({ title: 'Análise de vendas', created_by: { name: 'Carla Dias', avatar_url: null } })],
      by_origin: [
        { ...buildChatUsage(), origin: 'supervisor' },
        { ...buildChatUsage(), origin: 'specialist' },
        { ...buildChatUsage(), origin: 'complexity_classifier' },
        { ...buildChatUsage(), origin: 'answer_rewriter' },
      ],
      by_model: [{ ...buildChatUsage({ requests: 7 }), model: 'gpt-4o', provider: 'openai' }],
    });
    renderUsage();

    const [byMember, byChat, byOrigin, byModel] = await screen.findAllByRole('table');
    expect(within(byMember).getByText('Bruno Lima')).toBeInTheDocument();
    expect(within(byMember).getByText('—')).toBeInTheDocument();
    expect(within(byChat).getByText('Análise de vendas')).toBeInTheDocument();
    expect(within(byChat).getByText('Carla Dias')).toBeInTheDocument();
    expect(within(byOrigin).getByText('Supervisor')).toBeInTheDocument();
    expect(within(byOrigin).getByText('Especialistas')).toBeInTheDocument();
    expect(within(byOrigin).getByText('Classificador de complexidade')).toBeInTheDocument();
    expect(within(byOrigin).getByText('Reescrita da resposta')).toBeInTheDocument();
    expect(within(byModel).getByText('gpt-4o')).toBeInTheDocument();
    expect(within(byModel).getByText('7')).toBeInTheDocument();
  });

  it('links a conversation to its messages, but not a private or deleted one', async () => {
    givenUsageReport({
      totals: buildChatUsage({ requests: 3 }),
      by_chat: [
        buildChatUsageByChat({ chat_id: uuid(20), title: 'Análise de vendas', archived: true }),
        buildChatUsageByChat({ chat_id: uuid(21), title: null, is_private: true }),
        buildChatUsageByChat({ chat_id: uuid(22), title: 'Campanha antiga', deleted: true }),
      ],
    });
    renderUsage();

    expect(await screen.findByRole('link', { name: 'Análise de vendas' })).toHaveAttribute(
      'href',
      `/ia/conversas/${uuid(20)}/mensagens`,
    );
    expect(screen.getByText('Arquivada')).toBeInTheDocument();
    expect(screen.getByText('Conversa privada')).toBeInTheDocument();
    expect(screen.getByText('Excluída')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('asks for the report of the chosen month', async () => {
    const user = userEvent.setup();
    const requestedPeriods: { start: string | null; end: string | null }[] = [];
    server.use(
      http.get(api('chats/usage/'), ({ request }) => {
        const params = new URL(request.url).searchParams;
        requestedPeriods.push({ start: params.get('start'), end: params.get('end') });
        return HttpResponse.json(buildChatUsageReport());
      }),
    );
    renderUsage();
    const monthInput = await screen.findByLabelText('Mês');

    await user.clear(monthInput);
    await user.type(monthInput, '2024-02');

    await waitFor(() => expect(requestedPeriods.at(-1)).toEqual({ start: '2024-02-01', end: '2024-02-29' }));
  });

  it('says so when nothing was used in the month', async () => {
    renderUsage();

    expect(await screen.findByText('Nenhum consumo registrado neste mês.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
