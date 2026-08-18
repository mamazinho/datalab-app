import type { IProviderPermission, IRoutePermission } from '../../services/datalab-api/usersResource';
import { PROVIDER_LABELS } from '../../utils/integrations';

export function groupPermissionsByTag(permissions: IRoutePermission[]): Record<string, IRoutePermission[]> {
  return permissions.reduce<Record<string, IRoutePermission[]>>((acc, p) => {
    const key = p.tag ?? 'Geral';
    (acc[key] ??= []).push(p);
    return acc;
  }, {});
}

// Permissões de provider não têm tag: o agrupamento natural é a plataforma.
export function groupProviderPermissionsByProvider(
  permissions: IProviderPermission[],
): Record<string, IProviderPermission[]> {
  return permissions.reduce<Record<string, IProviderPermission[]>>((acc, p) => {
    const key = PROVIDER_LABELS[p.provider] ?? p.provider;
    (acc[key] ??= []).push(p);
    return acc;
  }, {});
}
