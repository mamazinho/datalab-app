import { describe, expect, it } from 'vitest';
import type { ITrackingIdRule } from '../../services/datalab-api/trackingResource';
import { idLabel, idProblemsFrom, idRulesFor, publicIds } from './tool-ids';

const rule = (key: string, overrides: Partial<ITrackingIdRule> = {}): ITrackingIdRule => ({
  key,
  constant: `CONS - ${key}`,
  secret: false,
  optional: false,
  example: '123',
  tools: [],
  server_only: false,
  format: 'só números',
  where: 'Painel > Configurações',
  confirmed: true,
  ...overrides,
});

const RULES = [
  rule('ga4_measurement_id', { tools: ['ga4'] }),
  rule('meta_pixel_id', { tools: ['meta_ads'] }),
  rule('meta_capi_token', { tools: ['meta_ads'], server_only: true, secret: true }),
  rule('server_container_url', { server_only: true }),
  rule('cookie_domain', { tools: ['rakuten'] }),
];

describe('idRulesFor', () => {
  it('asks only the ids of the chosen tools', () => {
    expect(idRulesFor(RULES, ['meta_ads'], false).map((r) => r.key)).toEqual(['meta_pixel_id']);
  });

  it('adds the server-side ids only when server-side is on', () => {
    expect(idRulesFor(RULES, ['meta_ads'], true).map((r) => r.key)).toEqual([
      'meta_pixel_id',
      'meta_capi_token',
      'server_container_url',
    ]);
  });

  it('asks nothing when no tool is chosen and server-side is off', () => {
    expect(idRulesFor(RULES, [], false)).toEqual([]);
  });
});

describe('idLabel', () => {
  it('drops the constant prefix', () => {
    expect(idLabel(rule('x', { constant: 'CONS - GA4 | Measurement ID' }))).toBe('GA4 | Measurement ID');
  });
});

describe('idProblemsFrom', () => {
  it('says which tool needs a missing id and where to find it', () => {
    const detail = {
      missing_ids: [
        { key: 'meta_pixel_id', tool: 'meta_ads', tool_label: 'Meta Ads', label: 'Pixel ID', where: 'Gerenciador de Eventos', format: '' },
      ],
    };

    expect(idProblemsFrom(detail)).toEqual({
      meta_pixel_id: 'Obrigatório para Meta Ads. Onde encontrar: Gerenciador de Eventos',
    });
  });

  it('keeps the format message of a malformed id', () => {
    const detail = {
      invalid_ids: [{ key: 'ga4_measurement_id', label: 'GA4', message: 'Formato inválido. Use G-XXXX.', format: 'G-XXXX', where: '' }],
    };

    expect(idProblemsFrom(detail)).toEqual({ ga4_measurement_id: 'Formato inválido. Use G-XXXX.' });
  });

  it('ignores a detail that is not about ids', () => {
    expect(idProblemsFrom(null)).toEqual({});
    expect(idProblemsFrom({ upstream_status: 400 })).toEqual({});
  });
});

describe('publicIds', () => {
  it('leaves secrets and server-side ids out', () => {
    expect(publicIds({ ga4_measurement_id: 'G-1', meta_capi_token: 'EAA', server_container_url: 'https://s' }, RULES)).toEqual({
      ga4_measurement_id: 'G-1',
    });
  });
});
