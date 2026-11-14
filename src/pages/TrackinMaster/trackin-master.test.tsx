import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor, within } from '../../test/test-utils';
import { api, apiErrorResponse } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import {
  buildApiError,
  buildBuildResult,
  buildImplementationResult,
  buildImportHelp,
  buildPublicationResult,
  buildSiteAnalysis,
  buildTrackingIdRule,
  buildTrackingRules,
} from '../../test/factories';
import type { IBuildRequest, IImplementationRequest, IPublicationRequest } from '../../services/datalab-api/trackingResource';
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

const debugLink = (qaPage: string, containerId = 'GTM-ABC1234') =>
  `https://tagassistant.google.com/#/?id=${containerId}&url=${encodeURIComponent(`${qaPage}?gtm_debug=1`)}` +
  '&source=TAG_MANAGER&canonical_id=248240911&gtm_auth=kOboj7gLiZMAQMYkiZnZuQ&gtm_preview=env-202';

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

  it('explains how to get the debug links and validates each qa page with them', async () => {
    let sent: IImplementationRequest | null = null;
    server.use(
      http.post(api('tracking/validate/'), async ({ request }) => {
        sent = (await request.json()) as IImplementationRequest;
        return HttpResponse.json(buildImplementationResult({
          ok: false,
          notes: ['O navegador do teste não aceita o banner de cookies.'],
          pages: [
            buildImplementationResult().pages[0],
            {
              ...buildImplementationResult().pages[0],
              kind: 'product',
              label: 'Produto',
              url: 'https://qa.lojaexemplo.com.br/camiseta/p',
              events: [{ event: 'GT_view_item', status: 'incomplete', missing_fields: ['ecommerce.value'], note: null }],
              tags: [{ key: 'ga4_measurement_id', label: 'GA4 | Measurement ID', fired: false }],
            },
          ],
        }));
      }),
    );
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);
    await analyze(user);
    await buildWithGa4(user);

    await user.click(await screen.findByRole('button', { name: 'Validar implementação' }));
    const popup = await screen.findByRole('dialog', { name: 'Validar implementação' });
    const howTo = within(popup).getByRole('region', { name: 'Como gerar os links' });
    expect(within(howTo).getByText(/workspace onde você importou o JSON/)).toBeInTheDocument();
    expect(within(howTo).getByText(/três pontinhos no canto superior direito/)).toBeInTheDocument();
    expect(within(howTo).getByText(/Shareable debug link/)).toBeInTheDocument();
    await user.type(within(popup).getByRole('textbox', { name: 'Página inicial *' }), debugLink('https://qa.lojaexemplo.com.br/'));
    await user.type(within(popup).getByRole('textbox', { name: 'Produto' }), debugLink('https://qa.lojaexemplo.com.br/camiseta/p'));
    await user.click(within(popup).getByRole('button', { name: 'Validar' }));

    const report = await within(popup).findByRole('status', { name: 'Resultado da validação' });
    expect(within(report).getByText(/Encontramos pendências/)).toBeInTheDocument();
    expect(within(report).getByText('GT_view_item: enviado, mas faltam ecommerce.value.')).toBeInTheDocument();
    expect(within(report).getByText('GA4 | Measurement ID: não disparou')).toBeInTheDocument();
    expect(within(report).getByText(/não aceita o banner de cookies/)).toBeInTheDocument();
    expect(within(report).getByText('GT_add_to_cart')).toBeInTheDocument();
    expect(sent).toEqual({
      ids: { ga4_measurement_id: 'G-ABC123XYZ9' },
      pages: [
        { kind: 'home', preview_link: debugLink('https://qa.lojaexemplo.com.br/') },
        { kind: 'product', preview_link: debugLink('https://qa.lojaexemplo.com.br/camiseta/p') },
      ],
    });
  });

  it('refuses a page that is not a shareable debug link before calling the api', async () => {
    let called = false;
    server.use(
      http.post(api('tracking/validate/'), () => {
        called = true;
        return HttpResponse.json(buildImplementationResult());
      }),
    );
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);
    await analyze(user);
    await buildWithGa4(user);

    await user.click(await screen.findByRole('button', { name: 'Validar implementação' }));
    const popup = await screen.findByRole('dialog', { name: 'Validar implementação' });
    await user.type(within(popup).getByRole('textbox', { name: 'Página inicial *' }), 'https://www.lojaexemplo.com.br/');
    await user.click(within(popup).getByRole('button', { name: 'Validar' }));

    expect(await within(popup).findByRole('alert')).toHaveTextContent('Página inicial: cole o "Shareable debug link"');
    expect(called).toBe(false);
  });

  it('points the refused link at its page field', async () => {
    server.use(
      http.post(api('tracking/validate/'), () =>
        HttpResponse.json(
          buildApiError({
            status: 400,
            error: 'InvalidPreviewLinksFriendlyException',
            friendly_message: 'Use, em cada página, o link de depuração compartilhável.',
            detail: {
              invalid_links: [
                { kind: 'product', label: 'Produto', message: 'Este link é de outro contêiner ou de outra workspace.' },
              ],
            },
          }),
          { status: 400 },
        ),
      ),
    );
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);
    await analyze(user);
    await buildWithGa4(user);

    await user.click(await screen.findByRole('button', { name: 'Validar implementação' }));
    const popup = await screen.findByRole('dialog', { name: 'Validar implementação' });
    await user.type(within(popup).getByRole('textbox', { name: 'Página inicial *' }), debugLink('https://qa.lojaexemplo.com.br/'));
    await user.type(within(popup).getByRole('textbox', { name: 'Produto' }), debugLink('https://qa.lojaexemplo.com.br/p', 'GTM-OUTRO12'));
    await user.click(within(popup).getByRole('button', { name: 'Validar' }));

    const product = within(popup).getByRole('textbox', { name: 'Produto' });
    await waitFor(() => expect(product).toHaveAccessibleDescription('Este link é de outro contêiner ou de outra workspace.'));
    expect(product).toHaveAttribute('aria-invalid', 'true');
  });

  it('tells why a page could not be validated', async () => {
    server.use(
      http.post(api('tracking/validate/'), () =>
        HttpResponse.json(buildImplementationResult({
          ok: false,
          pages: [{
            ...buildImplementationResult().pages[0],
            opened: false,
            problem: 'A página tem proteção anti-robô (Cloudflare) e bloqueou o navegador do teste.',
            events: [],
            tags: [],
          }],
        })),
      ),
    );
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);
    await analyze(user);
    await buildWithGa4(user);

    await user.click(await screen.findByRole('button', { name: 'Avançar' }));
    await user.click(within(await screen.findByRole('dialog', { name: 'Publicar' })).getByRole('button', { name: 'Validar implementação' }));
    const popup = await screen.findByRole('dialog', { name: 'Validar implementação' });
    await user.type(within(popup).getByRole('textbox', { name: 'Página inicial *' }), debugLink('https://qa.lojaexemplo.com.br/'));
    await user.click(within(popup).getByRole('button', { name: 'Validar' }));

    expect(await within(popup).findByText(/bloqueou o navegador do teste/)).toBeInTheDocument();
    await user.click(within(popup).getByRole('button', { name: 'Voltar' }));
    expect(await screen.findByRole('dialog', { name: 'Publicar' })).toBeInTheDocument();
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

  it('closes the instructions from the publishing step and reopens them from the results', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);
    await analyze(user);
    await buildWithGa4(user);

    await user.click(await screen.findByRole('button', { name: 'Avançar' }));
    const popup = await screen.findByRole('dialog', { name: 'Publicar' });
    await user.click(within(popup).getByRole('button', { name: 'Fechar instruções' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /próximos passos/i }));
    expect(await screen.findByRole('dialog', { name: 'Importar e testar' })).toBeInTheDocument();
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

  it('says when the format of an id is not confirmed yet', async () => {
    server.use(
      http.get(api('tracking/rules/'), () =>
        HttpResponse.json(
          buildTrackingRules({
            ids: [buildTrackingIdRule({ key: 'meta_pixel_id', constant: 'CONS - Meta Ads | Pixel ID', tools: ['meta_ads'], confirmed: false })],
          }),
        ),
      ),
    );
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);
    await analyze(user);

    await user.click(await screen.findByRole('checkbox', { name: /Meta Ads/ }));

    expect(screen.getByRole('textbox', { name: /Meta Ads \| Pixel ID/ })).toHaveAccessibleDescription(
      /Formato ainda não confirmado: confira antes de publicar./,
    );
  });

  it('asks to check, before publishing, the ids accepted with an unconfirmed format', async () => {
    server.use(
      http.post(api('tracking/build/'), () =>
        HttpResponse.json(
          buildBuildResult({
            id_warnings: [
              { key: 'dito_api_key', constant: 'CONS - Dito | API Key', label: 'Dito | API Key',
                message: 'Formato não confirmado: confira antes de publicar.', format: 'letras e números' },
            ],
          }),
        ),
      ),
    );
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);
    await analyze(user);

    await buildWithGa4(user);

    const popup = await screen.findByRole('dialog', { name: 'Importar e testar' });
    expect(within(popup).getByRole('note', { name: 'IDs com formato não confirmado' })).toHaveTextContent('Dito | API Key');
  });
});
