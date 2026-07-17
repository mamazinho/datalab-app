import type { IRoutePermission } from '../../services/datalab-api/usersResource';

export function groupPermissionsByTag(permissions: IRoutePermission[]): Record<string, IRoutePermission[]> {
  return permissions.reduce<Record<string, IRoutePermission[]>>((acc, p) => {
    const key = p.tag ?? 'Geral';
    (acc[key] ??= []).push(p);
    return acc;
  }, {});
}
