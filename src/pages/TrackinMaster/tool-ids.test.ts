import { describe, expect, it } from 'vitest';
import type { ITrackingIdRule } from '../../services/tracking-api/trackingResource';
import { idLabel, idRulesFor } from './tool-ids';

const rule = (key: string, constant = `CONS - ${key}`): ITrackingIdRule => ({
  key,
  constant,
  secret: false,
  optional: false,
  example: '123',
});

const RULES = [rule('ga4_measurement_id'), rule('meta_pixel_id'), rule('google_ads_conversion_id'), rule('cookie_domain')];

describe('idRulesFor', () => {
  it('keeps the ids of the chosen tools and the ones that belong to no tool', () => {
    expect(idRulesFor(RULES, ['meta_ads']).map((r) => r.key)).toEqual(['meta_pixel_id', 'cookie_domain']);
  });

  it('asks only the site-wide ids when no tool is chosen', () => {
    expect(idRulesFor(RULES, []).map((r) => r.key)).toEqual(['cookie_domain']);
  });
});

describe('idLabel', () => {
  it('drops the constant prefix', () => {
    expect(idLabel(rule('x', 'CONS - GA4 | Measurement ID'))).toBe('GA4 | Measurement ID');
  });
});
