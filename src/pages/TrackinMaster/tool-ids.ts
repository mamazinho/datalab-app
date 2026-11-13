import type { IInvalidId, IMissingId, ITrackingIdRule } from '../../services/datalab-api/trackingResource';

// The rules say which tools ask for each id; ids of no tool (the sGTM URL) belong to server-side only
export const idRulesFor = (rules: ITrackingIdRule[], tools: string[], serverSide: boolean): ITrackingIdRule[] =>
  rules.filter((rule) => {
    if (rule.server_only && !serverSide) return false;
    return rule.tools.length === 0 || rule.tools.some((tool) => tools.includes(tool));
  });

export const idLabel = (rule: ITrackingIdRule): string => rule.constant.replace(/^CONS - /, '');

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

// A refused build lists, in the error detail, the missing and the malformed ids: one message per field
export const idProblemsFrom = (detail: unknown): Record<string, string> => {
  if (!isRecord(detail)) return {};
  const problems: Record<string, string> = {};
  const missing = Array.isArray(detail.missing_ids) ? (detail.missing_ids as IMissingId[]) : [];
  const invalid = Array.isArray(detail.invalid_ids) ? (detail.invalid_ids as IInvalidId[]) : [];
  for (const item of missing) {
    problems[item.key] = `Obrigatório para ${item.tool_label}. Onde encontrar: ${item.where}`;
  }
  for (const item of invalid) {
    problems[item.key] = item.where ? `${item.message} Onde encontrar: ${item.where}` : item.message;
  }
  return problems;
};

// Secrets never leave the form again: the publication check only needs ids that are public anyway
export const publicIds = (ids: Record<string, string>, rules: ITrackingIdRule[]): Record<string, string> => {
  const secret = new Set(rules.filter((rule) => rule.secret || rule.server_only).map((rule) => rule.key));
  return Object.fromEntries(Object.entries(ids).filter(([key]) => !secret.has(key)));
};
