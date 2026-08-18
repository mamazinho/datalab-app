import type { ReactNode } from 'react';
import type { IProviderPermission, IRoutePermission } from '../../../services/datalab-api/usersResource';
import type { UUID } from '../../../types/ids';
import { groupPermissionsByTag, groupProviderPermissionsByProvider } from '../permissions-helpers';
import { PermissionToggleMethod } from '../company-members.style';

/**
 * Forma neutra que as listas de permissão consomem — é o que permite os mesmos
 * componentes servirem às permissões de rota e às de provider, que são coisas
 * independentes e ficam em seções separadas na tela.
 */
export interface IPermissionOption {
  id: UUID;
  name: string;
  description?: ReactNode;
}

const mapGroups = <T,>(
  groups: Record<string, T[]>,
  toOption: (item: T) => IPermissionOption,
): Record<string, IPermissionOption[]> =>
  Object.entries(groups).reduce<Record<string, IPermissionOption[]>>((acc, [key, items]) => {
    acc[key] = items.map(toOption);
    return acc;
  }, {});

export const routePermissionGroups = (
  permissions: IRoutePermission[],
): Record<string, IPermissionOption[]> =>
  mapGroups(groupPermissionsByTag(permissions), (permission) => ({
    id: permission.id,
    name: permission.description || permission.name,
    description: (
      <>
        <PermissionToggleMethod>{permission.method}</PermissionToggleMethod> {permission.path}
      </>
    ),
  }));

export const providerPermissionGroups = (
  permissions: IProviderPermission[],
): Record<string, IPermissionOption[]> =>
  mapGroups(groupProviderPermissionsByProvider(permissions), (permission) => ({
    id: permission.id,
    name: permission.name,
    description: permission.description,
  }));
