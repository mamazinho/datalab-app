import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor, within } from '../../test/test-utils';
import { api, apiErrorResponse } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import {
  buildApiError,
  buildBuildResult,
  buildCompany,
  buildImportHelp,
  buildPublicationResult,
  buildSiteAnalysis,
} from '../../test/factories';
import type { IBuildRequest, IPublicationRequest } from '../../services/datalab-api/trackingResource';
import { TrackinMaster } from './trackin-master';

type User = ReturnType<typeof userEvent.setup>;

const ANTI_BOT =
  'Seu site tem proteção anti-robô e não pôde ser mapeado automaticamente. Você pode continuar informando os dados manualmente ou liberar nosso leitor no firewall.';

const analyze = async (user: User, url = 'https://www.lojaexemplo.com.br') => {
  await user.type(screen.getByRole('textbox', { name: 'URL do site *' }), url);
  await user.click(screen.getByRole('button', { name: 'Analisar site' }));
  return screen.findByRole('region', { name: 'Diagnóstico do site' });
};

const buildWithGa4 = async (user: User) => {
  await user.click(await screen.findByRole('checkbox', { name: /GA4/ }));
  await user.type(screen.getByRole('textbox', { name: /GA4 \| Measurement ID/ }), 'G-ABC123XYZ9');
  await user.click(screen.getByRole('button', { name: 'Gerar containers' }));
};

const missingIdsResponse = () =>
  HttpResponse.json(
    buildApiError({
      status: 400,
      error: 'TrackingRequestRefusedFriendlyException',
      friendly_message: 'Faltam IDs obrigatórios: Meta Ads (Meta Ads | Pixel ID). O container não foi gerado.',
      detail: {
        upstream_error: 'MissingTrackingIdsFriendlyException',
        missing_ids: [
          {
            key: 'meta_pixel_id',
            tool: 'meta_ads',
            tool_label: 'Meta Ads',
            label: 'Meta Ads | Pixel ID',
            where: 'Gerenciador de Eventos da Meta > Configurações',
            format: 'só números',
          },
        ],
      },
    }),
    { status: 400 },
  );

describe('<TrackinMaster />', () => {
  it('asks for the site before showing the rest of the form', () => {
    renderWithProviders(<TrackinMaster />);

    expect(screen.getByRole('textbox', { name: 'URL do site *' })).toBeRequired();
    expect(screen.queryByRole('button', { name: 'Gerar containers' })).not.toBeInTheDocument();
  });

  it('shows the site diagnosis and prefills what was found on the site', async () => {
    server.use(
      http.post(api('tracking/scan/'), () =>
        HttpResponse.json(
          buildSiteAnalysis({
            gtm_containers: ['GTM-ABC1234'],
            detected_tools: ['meta_ads'],
            suggested_ids: { cookie_domain: '.lojaexemplo.com.br', meta_pixel_id: '1234567890123456' },
            considerations: ['O site já carrega o GTM GTM-ABC1234.'],
          }),
        ),
      ),
    );
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);

    const diagnosis = await analyze(user);

    expect(within(diagnosis).getByText('VTEX')).toBeInTheDocument();
    expect(within(diagnosis).getByText('O site já carrega o GTM GTM-ABC1234.')).toBeInTheDocument();
    expect(await screen.findByRole('checkbox', { name: /Meta Ads/ })).toBeChecked();
    expect(screen.getByRole('textbox', { name: /Meta Ads \| Pixel ID/ })).toHaveValue('1234567890123456');
    expect(screen.getByText(/anexe o export para mesclar/)).toBeInTheDocument();
  });

  it('asks the server-side ids only when server-side is on', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);
    await analyze(user);
    await user.click(await screen.findByRole('checkbox', { name: /Meta Ads/ }));

    expect(screen.queryByLabelText(/API Access Token/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('switch', { name: 'O cliente tem (ou quer) server-side' }));

    expect(screen.getByLabelText(/API Access Token/)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Transport URL/ })).toBeInTheDocument();
  });

  it('warns about the anti-bot protection and still lets the data be filled by hand', async () => {
    server.use(
      http.post(api('tracking/scan/'), () =>
        HttpResponse.json(
          buildSiteAnalysis({
            reachable: false,
            blocked: true,
            protection: 'Cloudflare',
            platform: null,
            cmp: null,
            error: ANTI_BOT,
            considerations: [`${ANTI_BOT} Proteção detectada: Cloudflare.`],
          }),
        ),
      ),
    );
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);

    const diagnosis = await analyze(user);

    expect(within(diagnosis).getByRole('alert')).toHaveTextContent(ANTI_BOT);
    expect(within(diagnosis).getByText('Proteção detectada: Cloudflare.')).toBeInTheDocument();
    expect(within(diagnosis).queryByText('GTM instalado')).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Gerar containers' })).toBeEnabled();
  });

  it('highlights the tags installed in the site code with where to remove them', async () => {
    server.use(
      http.post(api('tracking/scan/'), () =>
        HttpResponse.json(
          buildSiteAnalysis({
            hardcoded_warnings: [
              {
                tool: 'meta_ads',
                label: 'Meta Ads',
                ids: ['1234567890123456'],
                chosen: true,
                why: 'A Meta conta as conversões duas vezes.',
                where: ['Admin VTEX > Apps > Meus apps'],
              },
            ],
          }),
        ),
      ),
    );
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);

    await analyze(user);

    const warnings = screen.getByRole('region', { name: 'Tags instaladas direto no código' });
    expect(within(warnings).getByText(/Meta Ads instalado direto no código do site/)).toBeInTheDocument();
    expect(within(warnings).getByText('ID encontrado: 1234567890123456')).toBeInTheDocument();
    expect(within(warnings).getByText('A Meta conta as conversões duas vezes.')).toBeInTheDocument();
    expect(within(warnings).getByText('Admin VTEX > Apps > Meus apps')).toBeInTheDocument();
  });

  it('shows next to the field which required id is missing and where to find it', async () => {
    server.use(http.post(api('tracking/build/'), missingIdsResponse));
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);
    await analyze(user);

    await user.click(await screen.findByRole('checkbox', { name: /Meta Ads/ }));
    await user.click(screen.getByRole('button', { name: 'Gerar containers' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Faltam IDs obrigatórios');
    const field = screen.getByRole('textbox', { name: /Meta Ads \| Pixel ID/ });
    expect(field).toBeInvalid();
    expect(field).toHaveAccessibleDescription(/Obrigatório para Meta Ads. Onde encontrar: Gerenciador de Eventos/);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps what was typed when the build is refused', async () => {
    server.use(http.post(api('tracking/build/'), missingIdsResponse));
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);
    await analyze(user);
    await user.click(await screen.findByRole('checkbox', { name: /GA4/ }));
    await user.type(screen.getByRole('textbox', { name: /GA4 \| Measurement ID/ }), 'G-ABC123XYZ9');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Modelo do banner' }), 'opt_out');

    await user.click(screen.getByRole('button', { name: 'Gerar containers' }));
    await screen.findByRole('alert');

    expect(screen.getByRole('textbox', { name: /GA4 \| Measurement ID/ })).toHaveValue('G-ABC123XYZ9');
    expect(screen.getByRole('combobox', { name: 'Modelo do banner' })).toHaveValue('opt_out');
  });

  it('sends the analyzed site with the choices and opens the import popup', async () => {
    let sent: IBuildRequest | null = null;
    server.use(
      http.post(api('tracking/build/'), async ({ request }) => {
        sent = (await request.json()) as IBuildRequest;
        return HttpResponse.json(buildBuildResult());
      }),
    );
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);
    await analyze(user);

    await buildWithGa4(user);

    const popup = await screen.findByRole('dialog', { name: 'Importar e testar' });
    expect(within(popup).getByRole('button', { name: 'Baixar GoTrackin_Web.json' })).toBeInTheDocument();
    expect(within(popup).getByRole('button', { name: 'Baixar GoTrackin_Documentacao.pdf' })).toBeInTheDocument();
    expect(within(popup).getByText('GT_purchase')).toBeInTheDocument();
    expect(within(popup).getByText(/prefixo GT_/)).toBeInTheDocument();
    expect(within(popup).getByText('Permissão de Publicar no contêiner web do GTM.')).toBeInTheDocument();
    expect(within(popup).getByText('Acesse o Google Tag Manager')).toBeInTheDocument();
    expect(within(popup).getByText(/Não publique ainda/)).toBeInTheDocument();
    await waitFor(() => expect(sent).not.toBeNull());
    expect(sent).toMatchObject({
      site_url: 'https://www.lojaexemplo.com.br',
      site: { platform: 'VTEX' },
      tools: ['ga4'],
      has_cmp: true,
      consent: { banner: 'opt_in', mode: 'advanced' },
      ids: { ga4_measurement_id: 'G-ABC123XYZ9' },
      client_export: null,
    });
  });

  it('keeps the implementation check visible but disabled for now', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);
    await analyze(user);

    await buildWithGa4(user);

    const validate = await screen.findByRole('button', { name: /Validar implementação/ });
    expect(validate).toBeDisabled();
    expect(validate).toHaveTextContent('em breve');
  });

  it('moves on to publishing and checks whether the container is live', async () => {
    let checked: IPublicationRequest | null = null;
    server.use(
      http.post(api('tracking/scan/'), () => HttpResponse.json(buildSiteAnalysis({ gtm_containers: ['GTM-ABC1234'] }))),
      http.post(api('tracking/build/'), () =>
        HttpResponse.json(buildBuildResult({ site: buildSiteAnalysis({ gtm_containers: ['GTM-ABC1234'] }) })),
      ),
      http.post(api('tracking/verify/'), async ({ request }) => {
        checked = (await request.json()) as IPublicationRequest;
        return HttpResponse.json(buildPublicationResult({
          ids: [{ key: 'ga4_measurement_id', label: 'GA4 | Measurement ID', value: 'G-ABC123XYZ9', found: false }],
          missing: ['GA4 | Measurement ID'],
        }));
      }),
    );
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);
    await analyze(user);
    await buildWithGa4(user);

    await user.click(await screen.findByRole('button', { name: 'Avançar' }));
    const popup = await screen.findByRole('dialog', { name: 'Publicar' });
    expect(within(popup).getByText('Publique')).toBeInTheDocument();
    expect(within(popup).getByRole('textbox', { name: 'Código do contêiner publicado' })).toHaveValue('GTM-ABC1234');
    await user.click(within(popup).getByRole('button', { name: 'Avançar' }));

    expect(await within(popup).findByRole('status')).toHaveTextContent('faltam na versão no ar: GA4 | Measurement ID');
    expect(checked).toEqual({ container_id: 'GTM-ABC1234', ids: { ga4_measurement_id: 'G-ABC123XYZ9' } });
  });

  it('answers an import problem and regenerates the container when the json was refused', async () => {
    let builds = 0;
    server.use(
      http.post(api('tracking/build/'), () => {
        builds += 1;
        return HttpResponse.json(buildBuildResult());
      }),
      http.post(api('tracking/import-help/'), () => HttpResponse.json(buildImportHelp())),
    );
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);
    await analyze(user);
    await buildWithGa4(user);

    await user.click(await screen.findByRole('button', { name: 'Tive um problema ao importar' }));
    const popup = await screen.findByRole('dialog', { name: 'Tive um problema ao importar' });
    await user.selectOptions(within(popup).getByRole('combobox', { name: 'O que aconteceu?' }), 'json_rejected');
    await user.type(within(popup).getByRole('textbox', { name: 'Mensagem do GTM' }), 'Invalid exportFormatVersion');
    await user.click(within(popup).getByRole('button', { name: 'Ver o que fazer' }));

    const answer = await within(popup).findByRole('region', { name: 'Diagnóstico do problema' });
    expect(within(answer).getByText('O arquivo chegou ao GTM corrompido.')).toBeInTheDocument();
    await user.click(within(answer).getByRole('button', { name: 'Gerar o container de novo' }));

    await waitFor(() => expect(builds).toBe(2));
    expect(await screen.findByRole('dialog', { name: 'Importar e testar' })).toBeInTheDocument();
  });

  it('refuses to build without a tool', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);
    await analyze(user);

    await user.click(await screen.findByRole('button', { name: 'Gerar containers' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Escolha ao menos uma ferramenta.');
  });

  it('asks for the responsibility term when the site has no cookie banner', async () => {
    server.use(http.post(api('tracking/scan/'), () => HttpResponse.json(buildSiteAnalysis({ cmp: null }))));
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);
    await analyze(user);

    expect(await screen.findByRole('switch', { name: 'O site já tem banner de cookies (CMP)' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /assumo a responsabilidade/ })).toBeRequired();
  });

  it('shows the message of the engine when the build fails', async () => {
    server.use(http.post(api('tracking/build/'), () => apiErrorResponse(400, 'Informe a URL do site.')));
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);
    await analyze(user);

    await buildWithGa4(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('Informe a URL do site.');
  });

  it('warns about the containers of the company that fell behind the standard', async () => {
    server.use(
      http.get(api('tracking/updates/'), () =>
        HttpResponse.json([
          {
            site_host: 'www.lojaexemplo.com.br',
            generated_version: '1.0.0',
            latest_version: '1.1.0',
            tools: ['meta_ads'],
            summaries: ['A deduplicação da Meta mudou.'],
            generated_at: '2026-11-13T12:00:00Z',
          },
        ]),
      ),
    );
    renderWithProviders(<TrackinMaster />, { companies: [buildCompany()] });

    const notices = await screen.findByRole('region', { name: 'Containers que precisam de atualização' });

    expect(within(notices).getByText(/O container de www.lojaexemplo.com.br precisa de atualização/)).toBeInTheDocument();
    expect(within(notices).getByText('A deduplicação da Meta mudou.')).toBeInTheDocument();
  });

  it('tells, before generating, that the organization will receive the update e-mails', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);
    await analyze(user);

    expect(await screen.findByRole('button', { name: 'Gerar containers' })).toHaveAccessibleDescription(
      /todas as pessoas com acesso a esta organização passam a receber por e-mail os avisos/,
    );
  });
});
