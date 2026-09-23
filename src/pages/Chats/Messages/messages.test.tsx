import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders, screen, userEvent, waitFor } from '../../../test/test-utils';
import { api } from '../../../test/msw/handlers';
import { server } from '../../../test/msw/server';
import { buildChat, buildCompany, uuid } from '../../../test/factories';
import type { IChatMessageRead } from '../../../services/datalab-api/chatMessagesResource';
import { ChatMessages } from './messages';

type User = ReturnType<typeof userEvent.setup>;

const CHAT_ID = uuid(20);
const company = buildCompany({ id: uuid(1) });
const encoder = new TextEncoder();

const buildHistoryMessage = (overrides: Partial<IChatMessageRead> = {}): IChatMessageRead => ({
  id: uuid(30),
  author: 'user',
  agent_key: null,
  message_type: 'chat',
  thread_id: null,
  content: 'Qual foi a receita?',
  created_at: '2026-01-01T00:00:00Z',
  channel: 'main',
  ...overrides,
});

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

const givenHistory = (messages: IChatMessageRead[]) => {
  server.use(
    http.get(api(`chats/${CHAT_ID}/messages/`), () => HttpResponse.json(messages)),
    http.get(api(`chats/${CHAT_ID}/`), () => HttpResponse.json(buildChat({ id: CHAT_ID }))),
  );
};

const renderMessages = (chatId: string = CHAT_ID) =>
  renderWithProviders(
    <Routes>
      <Route path="/ia/conversas/:chatId/mensagens" element={<ChatMessages />} />
      <Route path="/ia/conversas" element={<h1>Conversas</h1>} />
    </Routes>,
    { route: `/ia/conversas/${chatId}/mensagens`, companies: [company] },
  );

const sendPrompt = async (user: User, prompt: string) => {
  await user.type(await screen.findByRole('textbox'), prompt);
  await user.click(screen.getByRole('button', { name: /Enviar/ }));
};

describe('<ChatMessages />', () => {
  it('sends a malformed chat id back to the list', () => {
    renderMessages('nao-e-uuid');

    expect(screen.getByRole('heading', { name: 'Conversas' })).toBeInTheDocument();
  });

  it('sends the user back to the list when the chat does not exist', async () => {
    server.use(
      http.get(api(`chats/${CHAT_ID}/`), () => HttpResponse.json({ detail: 'Não encontrado' }, { status: 404 })),
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
      buildHistoryMessage({ id: uuid(30), author: 'user', content: 'Qual foi a receita?' }),
      buildHistoryMessage({ id: uuid(31), author: 'supervisor', content: 'R$ 10.000 em julho.' }),
    ]);
    renderMessages();

    expect(await screen.findByText('Qual foi a receita?')).toBeInTheDocument();
    expect(screen.getByText('R$ 10.000 em julho.')).toBeInTheDocument();
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
      givenStreamedAnswer([{ type: 'error', content: 'O agente ficou sem contexto.' }]);
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
          HttpResponse.json({ detail: 'Agente indisponível.' }, { status: 503 }),
        ),
      );
      renderMessages();

      await sendPrompt(user, 'Qual foi a receita?');

      expect(await screen.findByText('Erro:')).toBeInTheDocument();
      expect(await screen.findByText(/status code 503/)).toBeInTheDocument();
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
        buildHistoryMessage({
          id: uuid(32),
          author: 'supervisor',
          message_type: 'clarification',
          content: 'De qual período?',
          options: ['Últimos 7 dias'],
          tool_call_id: 'call-1',
        }),
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
    const zip = () => new File(['conteudo'], 'pacote.zip', { type: 'application/zip' });

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

    const givenUploadRefused = (status: number, detail: string) => {
      server.use(http.post(api(`chats/${CHAT_ID}/files/`), () => HttpResponse.json({ detail }, { status })));
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

    const setupUserIgnoringAccept = () => userEvent.setup({ delay: null, applyAccept: false });

    it('uploads the file as soon as it is picked, as multipart', async () => {
      const user = userEvent.setup({ delay: null });
      const contentTypes = givenUpload();
      givenHistory([]);
      renderMessages();

      await attach(user, pdf());

      expect(await screen.findByText('📎 relatorio.pdf')).toBeInTheDocument();
      await waitFor(() => expect(contentTypes[0]).toMatch(/^multipart\/form-data; boundary=/));
    });

    it('marks the attachment as ready when the upload finishes', async () => {
      const user = userEvent.setup({ delay: null });
      givenUpload();
      givenHistory([]);
      renderMessages();

      await attach(user, pdf());

      expect(await screen.findByText('8 B')).toBeInTheDocument();
      expect(screen.queryByText('enviando...')).not.toBeInTheDocument();
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

    it('reports an upload that failed instead of sending a broken id', async () => {
      const user = userEvent.setup({ delay: null });
      givenHistory([]);
      givenUploadRefused(413, 'File is larger than 10MB');
      renderMessages();

      await attach(user, pdf());

      expect(await screen.findByText('falhou')).toBeInTheDocument();
      expect(await screen.findByText(/relatorio\.pdf: Arquivo grande demais/)).toBeInTheDocument();
    });

    it('explains a file type the API refuses', async () => {
      const user = setupUserIgnoringAccept();
      givenHistory([]);
      givenUploadRefused(415, 'Unsupported file type: application/zip');
      renderMessages();

      await attach(user, zip());

      expect(await screen.findByText(/Tipo de arquivo não suportado/)).toBeInTheDocument();
    });

    it('keeps a refused attachment out of the message', async () => {
      const user = setupUserIgnoringAccept();
      givenHistory([]);
      givenUploadRefused(415, 'Unsupported file type: application/zip');
      const sent = captureMessageBody();
      renderMessages();

      await attach(user, zip());
      await screen.findByText('falhou');
      await sendPrompt(user, 'e agora?');

      await waitFor(() => expect(sent.body).toEqual({ prompt: 'e agora?' }));
    });

    it('offers only the file types the API accepts', async () => {
      givenHistory([]);
      renderMessages();

      const accept = (await screen.findByLabelText('Arquivo para anexar')).getAttribute('accept') ?? '';

      expect(accept).toContain('application/pdf');
      expect(accept).toContain('image/png');
      expect(accept).toContain('text/*');
    });

    it('shows a download card for a file the agent delivered', async () => {
      const user = userEvent.setup({ delay: null });
      givenHistory([]);
      givenStreamedAnswer([
        { type: 'file', channel: 'main', author: 'supervisor', content: 'Arquivo gerado.', file: fileRef },
        { type: 'done' },
      ]);
      renderMessages();

      await sendPrompt(user, 'Me manda em PDF');

      expect(await screen.findByText('relatorio.pdf')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Baixar' })).toBeEnabled();
    });

    it('rebuilds the download card from the history', async () => {
      givenHistory([
        buildHistoryMessage({
          id: uuid(33),
          author: 'supervisor',
          message_type: 'file',
          content: 'Arquivo gerado.',
          file: fileRef,
        }),
      ]);
      renderMessages();

      expect(await screen.findByRole('button', { name: 'Baixar' })).toBeEnabled();
    });

    it('shows the attachments of a past turn on the user bubble', async () => {
      givenHistory([
        buildHistoryMessage({ id: uuid(34), author: 'user', content: 'Resuma', attachments: [fileRef] }),
      ]);
      renderMessages();

      expect(await screen.findByText('📎 relatorio.pdf')).toBeInTheDocument();
    });
  });
});
