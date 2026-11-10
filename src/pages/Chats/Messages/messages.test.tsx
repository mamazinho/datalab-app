import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import type { QueryClient } from '@tanstack/react-query';
import {
  createTestQueryClient,
  fireEvent,
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
} from '../../../test/test-utils';
import { ACCESS_TOKEN, api, apiErrorResponse } from '../../../test/msw/handlers';
import { server } from '../../../test/msw/server';
import { buildApiError, buildChat, buildCompany, buildUser, uuid } from '../../../test/factories';
import { meQuery } from '../../../queries';
import type { IChatStreamEvent } from '../../../services/datalab-api/chatMessagesResource';
import type { IRetrieveChat } from '../../../services/datalab-api/chatsResource';
import { ChatMessages } from './messages';

type User = ReturnType<typeof userEvent.setup>;

const CHAT_ID = uuid(20);
const company = buildCompany({ id: uuid(1) });
const encoder = new TextEncoder();

type UserMessageEvent = Extract<IChatStreamEvent, { type: 'user_message' }>;

const userMessage = (overrides: Partial<UserMessageEvent> = {}): UserMessageEvent => ({
  type: 'user_message',
  content: 'Qual foi a receita?',
  sender: null,
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

const answer = (content: string): IChatStreamEvent => ({ type: 'text', content, created_at: '2026-01-01T00:00:00Z' });

const givenStreamedAnswer = (events: object[]) => {
  server.use(
    http.post(api(`chats/${CHAT_ID}/messages/`), () => {
      const stream = new ReadableStream({
        start(controller) {
          events.forEach((event) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`)));
          controller.close();
        },
      });

      return new HttpResponse(stream, {
        headers: { 'Content-Type': 'application/x-ndjson' },
      });
    }),
  );
};

// An answer the test streams piece by piece, and closes when it wants
const givenOpenAnswer = () => {
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const stream = new ReadableStream<Uint8Array>({
    start(streamController) {
      controller = streamController;
    },
  });
  const sent: unknown[] = [];
  server.use(
    http.post(api(`chats/${CHAT_ID}/messages/`), async ({ request }) => {
      sent.push(await request.json());
      return new HttpResponse(stream, { headers: { 'Content-Type': 'application/x-ndjson' } });
    }),
  );

  return {
    sent,
    push: (...events: object[]) =>
      events.forEach((event) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))),
    close: () => controller.close(),
    drop: () => controller.error(new TypeError('network error')),
  };
};

const givenHistory = (events: IChatStreamEvent[], chat: Partial<IRetrieveChat> = {}) => {
  server.use(
    http.get(api(`chats/${CHAT_ID}/messages/`), () => HttpResponse.json(events)),
    http.get(api(`chats/${CHAT_ID}/`), () => HttpResponse.json(buildChat({ id: CHAT_ID, ...chat }))),
  );
};

interface IRenderMessagesOptions {
  chatId?: string;
  queryClient?: QueryClient;
}

const renderMessages = ({ chatId = CHAT_ID, queryClient }: IRenderMessagesOptions = {}) =>
  renderWithProviders(
    <Routes>
      <Route path="/ia/conversas/:chatId/mensagens" element={<ChatMessages />} />
      <Route path="/ia/conversas" element={<h1>Conversas</h1>} />
    </Routes>,
    { route: `/ia/conversas/${chatId}/mensagens`, companies: [company], queryClient },
  );

const sendPrompt = async (user: User, prompt: string) => {
  await user.type(await screen.findByRole('textbox'), prompt);
  await user.click(screen.getByRole('button', { name: /Enviar/ }));
};

const scrollUp = (conversation: HTMLElement) => {
  Object.defineProperties(conversation, {
    scrollHeight: { configurable: true, value: 1200 },
    clientHeight: { configurable: true, value: 400 },
  });
  conversation.scrollTop = 100;
  fireEvent.scroll(conversation);
};

describe('<ChatMessages />', () => {
  it('sends a malformed chat id back to the list', () => {
    renderMessages({ chatId: 'nao-e-uuid' });

    expect(screen.getByRole('heading', { name: 'Conversas' })).toBeInTheDocument();
  });

  it('sends the user back to the list when the chat does not exist', async () => {
    server.use(
      http.get(api(`chats/${CHAT_ID}/`), () => apiErrorResponse(404, 'Não encontrado')),
    );
    renderMessages();

    expect(await screen.findByRole('heading', { name: 'Conversas' })).toBeInTheDocument();
  });

  it('shows the error screen when the API breaks', async () => {
    server.use(http.get(api(`chats/${CHAT_ID}/`), () => HttpResponse.json({}, { status: 500 })));
    renderMessages();

    expect(await screen.findByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
  });

  it('shows the title and an empty state for a brand new chat', async () => {
    givenHistory([]);
    renderMessages();

    expect(await screen.findByText('Análise de vendas')).toBeInTheDocument();
    expect(screen.getByText('Nenhuma mensagem ainda')).toBeInTheDocument();
  });

  it('renders the previous conversation', async () => {
    givenHistory([
      userMessage(),
      answer('R$ 10.000 em julho.'),
    ]);
    renderMessages();

    expect(await screen.findByText('Qual foi a receita?')).toBeInTheDocument();
    expect(screen.getByText('R$ 10.000 em julho.')).toBeInTheDocument();
  });

  it('shows the time each message was sent', async () => {
    const sentAt = '2026-01-01T15:30:00Z';
    givenHistory([userMessage({ created_at: sentAt })]);
    renderMessages();

    const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(sentAt));
    expect(await screen.findByText(time)).toHaveAttribute('datetime', sentAt);
  });

  describe('authors', () => {
    const messageFromBruno = userMessage({
      content: 'Qual foi a receita?',
      sender: { name: 'Bruno Lima', avatar_url: null },
    });

    it('shows who sent each message', async () => {
      givenHistory([messageFromBruno]);
      renderMessages();

      expect(await screen.findByText('Bruno Lima')).toBeInTheDocument();
    });

    it('shows the agent that answers', async () => {
      givenHistory([answer('R$ 10.000 em julho.')]);
      renderMessages();

      expect(await screen.findByText('Supervisor')).toBeInTheDocument();
    });

    it('names the author once for consecutive messages', async () => {
      givenHistory([
        messageFromBruno,
        userMessage({ content: 'E em agosto?', sender: { name: 'Bruno Lima', avatar_url: null } }),
      ]);
      renderMessages();

      expect(await screen.findByText('E em agosto?')).toBeInTheDocument();
      expect(screen.getAllByText('Bruno Lima')).toHaveLength(1);
    });

    it('signs the message just sent with the logged-in user', async () => {
      const user = userEvent.setup({ delay: null });
      const queryClient = createTestQueryClient();
      localStorage.setItem('accessToken', ACCESS_TOKEN);
      await queryClient.prefetchQuery(meQuery);
      givenHistory([]);
      givenStreamedAnswer([{ type: 'done' }]);
      renderMessages({ queryClient });

      await sendPrompt(user, 'Qual foi a receita?');

      expect(await screen.findByText('Ana Souza')).toBeInTheDocument();
    });
  });

  describe('scrolling', () => {
    const shortcut = { name: 'Ir para a última mensagem' };

    it('opens the conversation at the last message', async () => {
      vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockReturnValue(1200);
      givenHistory([userMessage()]);
      renderMessages();

      expect((await screen.findByRole('region', { name: 'Mensagens' })).scrollTop).toBe(1200);
    });

    it('offers a shortcut back to the last message while older ones are being read', async () => {
      const user = userEvent.setup();
      givenHistory([userMessage()]);
      renderMessages();
      const conversation = await screen.findByRole('region', { name: 'Mensagens' });
      expect(screen.queryByRole('button', shortcut)).not.toBeInTheDocument();

      scrollUp(conversation);
      await user.click(screen.getByRole('button', shortcut));
      fireEvent.scroll(conversation);

      expect(conversation.scrollTop).toBe(1200);
      expect(screen.queryByRole('button', shortcut)).not.toBeInTheDocument();
    });

    it('goes back to the last message when a new one is sent', async () => {
      const user = userEvent.setup({ delay: null });
      givenHistory([userMessage()]);
      givenStreamedAnswer([{ type: 'done' }]);
      renderMessages();
      const conversation = await screen.findByRole('region', { name: 'Mensagens' });
      scrollUp(conversation);

      await sendPrompt(user, 'E em agosto?');

      expect(await screen.findByText('E em agosto?')).toBeInTheDocument();
      expect(conversation.scrollTop).toBe(1200);
    });
  });

  describe('streaming an answer', () => {
    it('shows the prompt and the assembled response', async () => {
      const user = userEvent.setup({ delay: null });
      givenHistory([]);
      givenStreamedAnswer([
        { type: 'text_delta', channel: 'main', content: 'A receita ' },
        { type: 'text_delta', channel: 'main', content: 'foi R$ 10.000.' },
        { type: 'done' },
      ]);
      renderMessages();

      await sendPrompt(user, 'Qual foi a receita?');

      expect(await screen.findByText('Qual foi a receita?')).toBeInTheDocument();
      expect(await screen.findByText('A receita foi R$ 10.000.')).toBeInTheDocument();
    });

    it('sends the typed prompt to the backend, trimmed', async () => {
      const user = userEvent.setup({ delay: null });
      let body: unknown;
      givenHistory([]);
      server.use(
        http.post(api(`chats/${CHAT_ID}/messages/`), async ({ request }) => {
          body = await request.json();
          return new HttpResponse(encoder.encode('{"type":"done"}\n'), {
            headers: { 'Content-Type': 'application/x-ndjson' },
          });
        }),
      );
      renderMessages();

      await sendPrompt(user, '  Qual foi a receita?  ');

      await waitFor(() => expect(body).toEqual({ prompt: 'Qual foi a receita?' }));
    });

    it('renders the specialist thread that the supervisor opened', async () => {
      const user = userEvent.setup({ delay: null });
      givenHistory([]);
      givenStreamedAnswer([
        {
          type: 'agent_event',
          channel: 'thread',
          thread_id: 't1',
          author: 'specialist',
          agent_key: 'ga4',
          content: 'Consultando o GA4...',
        },
        { type: 'text_delta', channel: 'main', content: 'Pronto!' },
        { type: 'done' },
      ]);
      renderMessages();

      await sendPrompt(user, 'Qual foi a receita?');

      expect(await screen.findByText('Consultando o GA4...')).toBeInTheDocument();
      expect(await screen.findByText('Pronto!')).toBeInTheDocument();
    });

    it('shows the error the backend streamed', async () => {
      const user = userEvent.setup({ delay: null });
      givenHistory([]);
      givenStreamedAnswer([
        { type: 'error', content: buildApiError({ error: 'ChatRunFailedFriendlyException', friendly_message: 'O agente ficou sem contexto.' }) },
      ]);
      renderMessages();

      await sendPrompt(user, 'Qual foi a receita?');

      expect(await screen.findByText('O agente ficou sem contexto.')).toBeInTheDocument();
    });

    it('explains a connection that drops in the middle of the answer', async () => {
      const user = userEvent.setup({ delay: null });
      givenHistory([]);
      server.use(
        http.post(api(`chats/${CHAT_ID}/messages/`), () => {
          const stream = new ReadableStream({
            start(controller) {
              controller.error(new TypeError('network error'));
            },
          });

          return new HttpResponse(stream, { headers: { 'Content-Type': 'application/x-ndjson' } });
        }),
      );
      renderMessages();

      await sendPrompt(user, 'Qual foi a receita?');

      expect(
        await screen.findByText('A conexão com o servidor caiu no meio da resposta. Tente novamente.'),
      ).toBeInTheDocument();
      expect(screen.queryByText('network error')).not.toBeInTheDocument();
    });

    it('reports a request that never became a stream', async () => {
      const user = userEvent.setup({ delay: null });
      givenHistory([]);
      server.use(
        http.post(api(`chats/${CHAT_ID}/messages/`), () =>
          apiErrorResponse(503, 'Agente indisponível.'),
        ),
      );
      renderMessages();

      await sendPrompt(user, 'Qual foi a receita?');

      expect(await screen.findByText('Agente indisponível.')).toBeInTheDocument();
    });

    it('renews an expired session and still sends the message', async () => {
      const user = userEvent.setup({ delay: null });
      givenHistory([]);
      let attempts = 0;
      server.use(
        http.post(api(`chats/${CHAT_ID}/messages/`), () => {
          attempts += 1;
          if (attempts === 1) return apiErrorResponse(401, 'Sessão expirada.', 'InvalidAccessTokenFriendlyException');
          const stream = new ReadableStream({
            start(controller) {
              controller.enqueue(encoder.encode(`${JSON.stringify(answer('Receita de R$ 10 mil.'))}\n`));
              controller.close();
            },
          });
          return new HttpResponse(stream, { headers: { 'Content-Type': 'application/x-ndjson' } });
        }),
      );
      renderMessages();

      await sendPrompt(user, 'Qual foi a receita?');

      expect(await screen.findByText('Receita de R$ 10 mil.')).toBeInTheDocument();
      expect(attempts).toBe(2);
    });
  });

  describe('choosing the model', () => {
    it('lets an admin pick the model of the next message', async () => {
      const user = userEvent.setup({ delay: null });
      const sent: { body?: unknown } = {};
      const queryClient = createTestQueryClient();
      localStorage.setItem('accessToken', ACCESS_TOKEN);
      givenHistory([]);
      server.use(
        http.get(api('users/me'), () => HttpResponse.json(buildUser({ role: 'admin' }))),
        http.post(api(`chats/${CHAT_ID}/messages/`), async ({ request }) => {
          sent.body = await request.json();
          return new HttpResponse(`${JSON.stringify({ type: 'done' })}\n`, {
            headers: { 'Content-Type': 'application/x-ndjson' },
          });
        }),
      );
      await queryClient.prefetchQuery(meQuery);
      renderMessages({ queryClient });

      await user.click(await screen.findByRole('button', { name: /Automático/ }));
      await user.click(screen.getByRole('tab', { name: 'Google' }));
      await user.click(screen.getByRole('button', { name: 'Gemini 2.5 Pro' }));
      await sendPrompt(user, 'Analise o tráfego');

      await waitFor(() => expect(sent.body).toEqual({ prompt: 'Analise o tráfego', model_name: 'gemini-2.5-pro' }));
    });

    it('keeps the chosen model when the history reloads after the answer', async () => {
      const user = userEvent.setup({ delay: null });
      const queryClient = createTestQueryClient();
      localStorage.setItem('accessToken', ACCESS_TOKEN);
      givenHistory([]);
      givenStreamedAnswer([{ type: 'done' }]);
      server.use(http.get(api('users/me'), () => HttpResponse.json(buildUser({ role: 'admin' }))));
      await queryClient.prefetchQuery(meQuery);
      renderMessages({ queryClient });

      await user.click(await screen.findByRole('button', { name: /Automático/ }));
      await user.click(screen.getByRole('tab', { name: 'Google' }));
      await user.click(screen.getByRole('button', { name: 'Gemini 2.5 Pro' }));
      givenHistory([userMessage({ content: 'Analise o tráfego' }), answer('Pronto.')]);
      await sendPrompt(user, 'Analise o tráfego');
      await queryClient.invalidateQueries();

      expect(await screen.findByText('Pronto.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Gemini 2.5 Pro/ })).toBeInTheDocument();
    });

    it('answers a clarification with the chosen model', async () => {
      const user = userEvent.setup({ delay: null });
      const bodies: unknown[] = [];
      const queryClient = createTestQueryClient();
      localStorage.setItem('accessToken', ACCESS_TOKEN);
      givenHistory([]);
      server.use(
        http.get(api('users/me'), () => HttpResponse.json(buildUser({ role: 'admin' }))),
        http.post(api(`chats/${CHAT_ID}/messages/`), async ({ request }) => {
          bodies.push(await request.json());
          const events =
            bodies.length === 1
              ? [{ type: 'clarification', question: 'De qual período?', options: ['Último mês'], tool_call_id: 'call-1' }]
              : [{ type: 'done' }];
          return new HttpResponse(events.map((event) => `${JSON.stringify(event)}\n`).join(''), {
            headers: { 'Content-Type': 'application/x-ndjson' },
          });
        }),
      );
      await queryClient.prefetchQuery(meQuery);
      renderMessages({ queryClient });

      await user.click(await screen.findByRole('button', { name: /Automático/ }));
      await user.click(screen.getByRole('tab', { name: 'Google' }));
      await user.click(screen.getByRole('button', { name: 'Gemini 2.5 Pro' }));
      await sendPrompt(user, 'Qual foi a receita?');
      await user.click(await screen.findByRole('button', { name: 'Último mês' }));

      await waitFor(() =>
        expect(bodies[1]).toEqual({
          prompt: 'Último mês',
          answer_to_tool_call_id: 'call-1',
          model_name: 'gemini-2.5-pro',
        }),
      );
    });

    it('keeps the model choice away from who is not an admin', async () => {
      givenHistory([]);
      renderMessages();

      await screen.findByRole('textbox');
      expect(screen.queryByRole('button', { name: /Automático/ })).not.toBeInTheDocument();
    });
  });

  describe('while the answer runs', () => {
    it('stops the answer from the square button', async () => {
      const user = userEvent.setup({ delay: null });
      givenHistory([]);
      const answerStream = givenOpenAnswer();
      let cancelled = false;
      server.use(
        http.post(api(`chats/${CHAT_ID}/run/cancel/`), () => {
          cancelled = true;
          answerStream.push({ type: 'cancelled' }, { type: 'done' });
          answerStream.close();
          return new HttpResponse(null, { status: 204 });
        }),
      );
      renderMessages();

      await sendPrompt(user, 'Monte o relatório');
      answerStream.push({ type: 'text_delta', content: 'Consultando os dados' });
      await user.click(await screen.findByRole('button', { name: 'Parar resposta' }));

      expect(await screen.findByText('Resposta interrompida.')).toBeInTheDocument();
      expect(cancelled).toBe(true);
      expect(screen.queryByRole('button', { name: 'Parar resposta' })).not.toBeInTheDocument();
    });

    it('queues a message typed during the answer until the answer takes it in', async () => {
      const user = userEvent.setup({ delay: null });
      givenHistory([]);
      const answerStream = givenOpenAnswer();
      const queued: { body?: unknown } = {};
      server.use(
        http.post(api(`chats/${CHAT_ID}/run/messages/`), async ({ request }) => {
          queued.body = await request.json();
          return new HttpResponse(null, { status: 202 });
        }),
      );
      renderMessages();

      await sendPrompt(user, 'Analise o tráfego');
      answerStream.push({ type: 'text_delta', content: 'Vendo o desktop.' });
      await sendPrompt(user, 'Inclua o mobile');

      expect(await screen.findByText('Inclua o mobile', { selector: 'li' })).toBeInTheDocument();
      await waitFor(() => expect(queued.body).toEqual({ prompt: 'Inclua o mobile' }));

      answerStream.push(userMessage({ content: 'Inclua o mobile', queued: true }), { type: 'done' });
      answerStream.close();

      await waitFor(() => expect(screen.queryByRole('list', { name: 'Mensagens na fila' })).not.toBeInTheDocument());
      expect(screen.getByText('Inclua o mobile')).toBeInTheDocument();
    });

    it('does not resend the queue when the connection drops, since the answer may still take it in', async () => {
      const user = userEvent.setup({ delay: null });
      givenHistory([]);
      const answerStream = givenOpenAnswer();
      server.use(http.post(api(`chats/${CHAT_ID}/run/messages/`), () => new HttpResponse(null, { status: 202 })));
      renderMessages();

      await sendPrompt(user, 'Analise o tráfego');
      await sendPrompt(user, 'Inclua o mobile');
      await screen.findByText('Inclua o mobile', { selector: 'li' });
      answerStream.drop();

      expect(
        await screen.findByText('A conexão com o servidor caiu no meio da resposta. Tente novamente.'),
      ).toBeInTheDocument();
      expect(screen.queryByRole('list', { name: 'Mensagens na fila' })).not.toBeInTheDocument();
      expect(answerStream.sent).toEqual([{ prompt: 'Analise o tráfego' }]);
    });

    it('sends a queued message as the next one when the answer ended before taking it', async () => {
      const user = userEvent.setup({ delay: null });
      givenHistory([]);
      const answerStream = givenOpenAnswer();
      const sentPrompts: unknown[] = [];
      server.use(
        http.post(api(`chats/${CHAT_ID}/run/messages/`), () =>
          apiErrorResponse(409, 'Essa resposta já terminou.', 'ChatRunNotRunningFriendlyException'),
        ),
      );
      renderMessages();

      await sendPrompt(user, 'Analise o tráfego');
      await sendPrompt(user, 'Inclua o mobile');
      await screen.findByText('Inclua o mobile', { selector: 'li' });
      server.use(
        http.post(api(`chats/${CHAT_ID}/messages/`), async ({ request }) => {
          sentPrompts.push(await request.json());
          return new HttpResponse(`${JSON.stringify({ type: 'done' })}\n`, {
            headers: { 'Content-Type': 'application/x-ndjson' },
          });
        }),
      );
      answerStream.push({ type: 'done' });
      answerStream.close();

      await waitFor(() => expect(sentPrompts).toEqual([{ prompt: 'Inclua o mobile' }]));
    });

    it('gives the queued messages back to the input when the answer is stopped', async () => {
      const user = userEvent.setup({ delay: null });
      givenHistory([]);
      const answerStream = givenOpenAnswer();
      server.use(
        http.post(api(`chats/${CHAT_ID}/run/messages/`), () => new HttpResponse(null, { status: 202 })),
        http.post(api(`chats/${CHAT_ID}/run/cancel/`), () => {
          answerStream.push({ type: 'cancelled' }, { type: 'done' });
          answerStream.close();
          return new HttpResponse(null, { status: 204 });
        }),
      );
      renderMessages();

      await sendPrompt(user, 'Analise o tráfego');
      await sendPrompt(user, 'Inclua o mobile');
      await screen.findByText('Inclua o mobile', { selector: 'li' });
      await user.click(screen.getByRole('button', { name: 'Parar resposta' }));

      expect(await screen.findByText('Resposta interrompida.')).toBeInTheDocument();
      await waitFor(() => expect(screen.getByRole('textbox')).toHaveValue('Inclua o mobile'));
      expect(screen.queryByRole('list', { name: 'Mensagens na fila' })).not.toBeInTheDocument();
      expect(answerStream.sent).toEqual([{ prompt: 'Analise o tráfego' }]);
    });

    it('keeps in the queue only what the answer did not take in', async () => {
      const user = userEvent.setup({ delay: null });
      givenHistory([]);
      const answerStream = givenOpenAnswer();
      server.use(http.post(api(`chats/${CHAT_ID}/run/messages/`), () => new HttpResponse(null, { status: 202 })));
      renderMessages();

      await sendPrompt(user, 'Analise o tráfego');
      await sendPrompt(user, 'Inclua o mobile');
      await sendPrompt(user, 'Compare com março');
      await sendPrompt(user, 'Separe por canal');
      await screen.findByText('Separe por canal', { selector: 'li' });
      answerStream.push(userMessage({ content: 'Compare com março\nSepare por canal', queued: true }));

      await waitFor(() => expect(screen.queryByText('Separe por canal', { selector: 'li' })).not.toBeInTheDocument());
      expect(screen.queryByText('Compare com março', { selector: 'li' })).not.toBeInTheDocument();
      expect(screen.getByText('Inclua o mobile', { selector: 'li' })).toBeInTheDocument();
    });

    it('follows an answer that was already running when the chat opened', async () => {
      givenHistory([]);
      server.use(
        http.get(api(`chats/${CHAT_ID}/run/`), () =>
          new HttpResponse(
            [userMessage({ content: 'Monte o relatório' }), { type: 'text_delta', content: 'Quase pronto.' }, { type: 'done' }]
              .map((event) => `${JSON.stringify(event)}\n`)
              .join(''),
            { headers: { 'Content-Type': 'application/x-ndjson' } },
          ),
        ),
      );
      renderMessages();

      expect(await screen.findByText('Monte o relatório')).toBeInTheDocument();
      expect(await screen.findByText('Quase pronto.')).toBeInTheDocument();
    });

    it('says so when the running answer cannot be followed', async () => {
      givenHistory([]);
      server.use(
        http.get(api(`chats/${CHAT_ID}/run/`), () => apiErrorResponse(500, 'Não deu para acompanhar a resposta.')),
      );
      renderMessages();

      expect(await screen.findByText('Não deu para acompanhar a resposta.')).toBeInTheDocument();
    });
  });

  describe('clarification', () => {
    const clarificationEvents = [
      {
        type: 'clarification',
        question: 'De qual período?',
        options: ['Últimos 7 dias', 'Último mês'],
        tool_call_id: 'call-1',
      },
    ];

    it('changes the input hint while a question waits', async () => {
      const user = userEvent.setup({ delay: null });
      givenHistory([]);
      givenStreamedAnswer(clarificationEvents);
      renderMessages();

      await sendPrompt(user, 'Qual foi a receita?');

      expect(await screen.findByPlaceholderText(/Responda à pergunta acima/)).toBeInTheDocument();
    });

    it('asks the question with the offered options', async () => {
      const user = userEvent.setup({ delay: null });
      givenHistory([]);
      givenStreamedAnswer(clarificationEvents);
      renderMessages();

      await sendPrompt(user, 'Qual foi a receita?');

      expect(await screen.findByText('De qual período?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Últimos 7 dias' })).toBeEnabled();
    });

    it('answers by clicking an option and links it to the tool call', async () => {
      const user = userEvent.setup({ delay: null });
      const bodies: unknown[] = [];
      givenHistory([]);
      server.use(
        http.post(api(`chats/${CHAT_ID}/messages/`), async ({ request }) => {
          bodies.push(await request.json());
          const events = bodies.length === 1 ? clarificationEvents : [{ type: 'done' }];
          return new HttpResponse(
            encoder.encode(events.map((event) => JSON.stringify(event)).join('\n') + '\n'),
            { headers: { 'Content-Type': 'application/x-ndjson' } },
          );
        }),
      );
      renderMessages();
      await sendPrompt(user, 'Qual foi a receita?');
      await screen.findByText('De qual período?');

      await user.click(screen.getByRole('button', { name: 'Último mês' }));

      await waitFor(() =>
        expect(bodies[1]).toEqual({ prompt: 'Último mês', answer_to_tool_call_id: 'call-1' }),
      );
    });

    it('treats free text as the answer while a question is pending', async () => {
      const user = userEvent.setup({ delay: null });
      const bodies: unknown[] = [];
      givenHistory([]);
      server.use(
        http.post(api(`chats/${CHAT_ID}/messages/`), async ({ request }) => {
          bodies.push(await request.json());
          const events = bodies.length === 1 ? clarificationEvents : [{ type: 'done' }];
          return new HttpResponse(
            encoder.encode(events.map((event) => JSON.stringify(event)).join('\n') + '\n'),
            { headers: { 'Content-Type': 'application/x-ndjson' } },
          );
        }),
      );
      renderMessages();
      await sendPrompt(user, 'Qual foi a receita?');
      await screen.findByText('De qual período?');

      await sendPrompt(user, 'desde março');

      await waitFor(() =>
        expect(bodies[1]).toEqual({ prompt: 'desde março', answer_to_tool_call_id: 'call-1' }),
      );
    });

    it('reopens a question left unanswered in the history', async () => {
      givenHistory([
        { type: 'clarification', question: 'De qual período?', options: ['Últimos 7 dias'], tool_call_id: 'call-1' },
      ]);
      renderMessages();

      expect(await screen.findByRole('button', { name: 'Últimos 7 dias' })).toBeEnabled();
    });

    it('turns the paperclip off while a question waits', async () => {
      const user = userEvent.setup({ delay: null });
      givenHistory([]);
      givenStreamedAnswer(clarificationEvents);
      renderMessages();

      await sendPrompt(user, 'Qual foi a receita?');
      await screen.findByText('De qual período?');

      expect(screen.getByRole('button', { name: 'Anexar arquivo' })).toBeDisabled();
    });
  });

  describe('files', () => {
    const FILE_ID = uuid(70);
    const fileRef = {
      id: FILE_ID,
      filename: 'relatorio.pdf',
      media_type: 'application/pdf',
      size: 2048,
    };
    const pdf = () => new File(['conteudo'], 'relatorio.pdf', { type: 'application/pdf' });

    const givenUpload = () => {
      const contentTypes: string[] = [];
      server.use(
        http.post(api(`chats/${CHAT_ID}/files/`), ({ request }) => {
          contentTypes.push(request.headers.get('content-type') ?? '');
          return HttpResponse.json(fileRef, { status: 201 });
        }),
      );
      return contentTypes;
    };

    const givenUploadRefused = (status: number, apiMessage: string) => {
      server.use(http.post(api(`chats/${CHAT_ID}/files/`), () => apiErrorResponse(status, apiMessage)));
    };

    const captureMessageBody = () => {
      const sent: { body?: unknown } = {};
      server.use(
        http.post(api(`chats/${CHAT_ID}/messages/`), async ({ request }) => {
          sent.body = await request.json();
          return new HttpResponse(encoder.encode('{"type":"done"}\n'), {
            headers: { 'Content-Type': 'application/x-ndjson' },
          });
        }),
      );
      return sent;
    };

    const attach = async (user: User, file: File) => {
      await user.upload(await screen.findByLabelText('Arquivo para anexar'), file);
    };

    it('uploads the file as multipart as soon as it is picked', async () => {
      const user = userEvent.setup({ delay: null });
      const contentTypes = givenUpload();
      givenHistory([]);
      renderMessages();

      await attach(user, pdf());

      expect(await screen.findByText('8 B')).toBeInTheDocument();
      expect(screen.getByText('📎 relatorio.pdf')).toBeInTheDocument();
      expect(screen.queryByText('enviando...')).not.toBeInTheDocument();
      expect(contentTypes[0]).toMatch(/^multipart\/form-data; boundary=/);
    });

    it('sends only the ids of the attachments with the message', async () => {
      const user = userEvent.setup({ delay: null });
      givenUpload();
      givenHistory([]);
      const sent = captureMessageBody();
      renderMessages();

      await attach(user, pdf());
      await screen.findByText('8 B');
      await sendPrompt(user, 'Resuma este arquivo');

      await waitFor(() => expect(sent.body).toEqual({ prompt: 'Resuma este arquivo', file_ids: [FILE_ID] }));
    });

    it('sends an attachment with no text typed', async () => {
      const user = userEvent.setup({ delay: null });
      givenUpload();
      givenHistory([]);
      const sent = captureMessageBody();
      renderMessages();

      await attach(user, pdf());
      await screen.findByText('8 B');
      await user.click(screen.getByRole('button', { name: /Enviar/ }));

      await waitFor(() =>
        expect(sent.body).toEqual({ prompt: 'Analise o arquivo anexado.', file_ids: [FILE_ID] }),
      );
    });

    it('keeps the tray empty after sending', async () => {
      const user = userEvent.setup({ delay: null });
      givenUpload();
      givenHistory([]);
      givenStreamedAnswer([{ type: 'done' }]);
      renderMessages();

      await attach(user, pdf());
      await screen.findByText('8 B');
      await sendPrompt(user, 'Resuma');

      await waitFor(() =>
        expect(screen.queryByRole('button', { name: 'Remover relatorio.pdf' })).not.toBeInTheDocument(),
      );
    });

    it('lets the user drop an attachment before sending', async () => {
      const user = userEvent.setup({ delay: null });
      givenUpload();
      givenHistory([]);
      renderMessages();

      await attach(user, pdf());
      await user.click(await screen.findByRole('button', { name: 'Remover relatorio.pdf' }));

      expect(screen.queryByText('📎 relatorio.pdf')).not.toBeInTheDocument();
    });

    it.each([
      [413, 'Arquivo grande demais. O limite é de 10240KB.'],
      [415, 'Tipo de arquivo não suportado. Envie PDF, imagem ou texto.'],
    ])('shows the reason the API gives for refusing an upload with %i', async (status, friendlyMessage) => {
      const user = userEvent.setup({ delay: null });
      givenHistory([]);
      givenUploadRefused(status, friendlyMessage);
      renderMessages();

      await attach(user, pdf());

      expect(await screen.findByText('falhou')).toBeInTheDocument();
      expect(screen.getByText(`relatorio.pdf: ${friendlyMessage}`)).toBeInTheDocument();
    });

    it('keeps a refused attachment out of the message', async () => {
      const user = userEvent.setup({ delay: null });
      givenHistory([]);
      givenUploadRefused(413, 'Arquivo grande demais. O limite é de 10240KB.');
      const sent = captureMessageBody();
      renderMessages();

      await attach(user, pdf());
      await screen.findByText('falhou');
      await sendPrompt(user, 'e agora?');

      await waitFor(() => expect(sent.body).toEqual({ prompt: 'e agora?' }));
    });

    it('shows a download card for a file the agent delivered', async () => {
      const user = userEvent.setup({ delay: null });
      givenHistory([]);
      givenStreamedAnswer([
        { type: 'file', channel: 'main', author: 'supervisor', files: [fileRef] },
        { type: 'done' },
      ]);
      renderMessages();

      await sendPrompt(user, 'Me manda em PDF');

      expect(await screen.findByText('relatorio.pdf')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Baixar' })).toBeEnabled();
    });

    it('rebuilds the download card from the history', async () => {
      givenHistory([
        { type: 'file', content: "Arquivo 'relatorio.pdf' disponível para download.", files: [fileRef] },
      ]);
      renderMessages();

      expect(await screen.findByRole('button', { name: 'Baixar' })).toBeEnabled();
    });

    it('shows the attachments of a past turn on the user bubble', async () => {
      givenHistory([
        userMessage({ content: 'Resuma', files: [fileRef] }),
      ]);
      renderMessages();

      expect(await screen.findByText('📎 relatorio.pdf')).toBeInTheDocument();
    });
  });
});
