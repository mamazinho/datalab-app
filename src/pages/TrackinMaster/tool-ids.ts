import type { ITrackingIdRule } from '../../services/datalab-api/trackingResource';

// Engine ID keys start with the tool they belong to; keys without a tool prefix (cookie domain, sGTM URL) are always asked
const ID_PREFIX_BY_TOOL: Record<string, string> = {
  ga4: 'ga4_',
  google_ads: 'google_ads_',
  meta_ads: 'meta_',
  tiktok_ads: 'tiktok_',
  pinterest_ads: 'pinterest_',
  clarity: 'clarity_',
  dito: 'dito_',
  revbridge: 'revbridge_',
  awin: 'awin_',
  rakuten: 'rakuten_',
};

const TOOL_PREFIXES = Object.values(ID_PREFIX_BY_TOOL);

export const idRulesFor = (rules: ITrackingIdRule[], tools: string[]): ITrackingIdRule[] => {
  const chosen = tools.map((tool) => ID_PREFIX_BY_TOOL[tool]).filter(Boolean);
  return rules.filter((rule) => {
    const belongsToATool = TOOL_PREFIXES.some((prefix) => rule.key.startsWith(prefix));
    return !belongsToATool || chosen.some((prefix) => rule.key.startsWith(prefix));
  });
};

export const idLabel = (rule: ITrackingIdRule): string => rule.constant.replace(/^CONS - /, '');
