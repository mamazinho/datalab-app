import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor, within } from '../../test/test-utils';
import { apiErrorResponse, trackingApi } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import { buildBuildResult, buildContainerFile, buildSiteAnalysis } from '../../test/factories';
import type { IBuildRequest } from '../../services/tracking-api/trackingResource';
import { TrackinMaster } from './trackin-master';

type User = ReturnType<typeof userEvent.setup>;

const analyze = async (user: User, url = 'https://www.lojaexemplo.com.br') => {
  await user.type(screen.getByRole('textbox', { name: 'URL do site *' }), url);
  await user.click(screen.getByRole('button', { name: 'Analisar site' }));
  return screen.findByRole('region', { name: 'Diagnóstico do site' });
};

describe('<TrackinMaster />', () => {
  it('asks for the site before showing the rest of the form', () => {
    renderWithProviders(<TrackinMaster />);

    expect(screen.getByRole('textbox', { name: 'URL do site *' })).toBeRequired();
    expect(screen.queryByRole('button', { name: 'Gerar containers' })).not.toBeInTheDocument();
  });

  it('shows the site diagnosis and prefills what was found on the site', async () => {
    server.use(
      http.post(trackingApi('scan'), () =>
        HttpResponse.json(
          buildSiteAnalysis({
            gtm_containers: ['GTM-ABC1234'],
            detected_tools: ['meta_ads'],
            hardcoded: { meta_ads: ['1234567890123456'] },
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
    expect(screen.getByRole('checkbox', { name: /GA4/ })).not.toBeChecked();
    expect(screen.getByRole('textbox', { name: /Meta Ads \| Pixel ID/ })).toHaveValue('1234567890123456');
    expect(screen.getByText(/anexe o export para mesclar/)).toBeInTheDocument();
  });

  it('sends the analyzed site with the choices and shows the files to download', async () => {
    let sent: IBuildRequest | null = null;
    server.use(
      http.post(trackingApi('build'), async ({ request }) => {
        sent = (await request.json()) as IBuildRequest;
        return HttpResponse.json(
          buildBuildResult({ web: buildContainerFile({ pending_ids: ['ga4_measurement_id'] }) }),
        );
      }),
    );
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);
    await analyze(user);

    await user.click(await screen.findByRole('checkbox', { name: /GA4/ }));
    await user.click(screen.getByRole('button', { name: 'Gerar containers' }));

    expect(await screen.findByRole('button', { name: 'Baixar GoTrackin_Web.json' })).toBeInTheDocument();
    expect(screen.getByText('IDs pendentes: ga4_measurement_id')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Mapa de Tags e Mapa de Atributos' })).toBeInTheDocument();
    await waitFor(() => expect(sent).not.toBeNull());
    expect(sent).toMatchObject({
      site_url: 'https://www.lojaexemplo.com.br',
      site: { platform: 'VTEX' },
      tools: ['ga4'],
      has_cmp: true,
      consent: { banner: 'opt_in', mode: 'advanced' },
      ids: { cookie_domain: '.lojaexemplo.com.br' },
      client_export: null,
    });
  });

  it('refuses to build without a tool', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);
    await analyze(user);

    await user.click(await screen.findByRole('button', { name: 'Gerar containers' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Escolha ao menos uma ferramenta.');
  });

  it('asks for the responsibility term when the site has no cookie banner', async () => {
    server.use(http.post(trackingApi('scan'), () => HttpResponse.json(buildSiteAnalysis({ cmp: null }))));
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);
    await analyze(user);

    expect(await screen.findByRole('switch', { name: 'O site já tem banner de cookies (CMP)' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /assumo a responsabilidade/ })).toBeRequired();
  });

  it('shows the message of the engine when the build fails', async () => {
    server.use(http.post(trackingApi('build'), () => apiErrorResponse(400, 'Informe a URL do site.')));
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<TrackinMaster />);
    await analyze(user);

    await user.click(await screen.findByRole('checkbox', { name: /GA4/ }));
    await user.click(screen.getByRole('button', { name: 'Gerar containers' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Informe a URL do site.');
  });
});
