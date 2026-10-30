import modal from '../../../styles/modal-form.module.css';
import { useRoutePermissions } from '../../../hooks/use-route-permissions';
import { useProviderPermissions } from '../../../hooks/use-provider-permissions';
import { PermissionsSelector } from './permissions-list';
import { providerPermissionGroups, routePermissionGroups, type IPermissionOption } from './permission-options';
import type { UUID7 } from '../../../types/ids';

interface IPermissionsFieldProps {
  selected: Set<UUID7>;
  onChange: (selected: Set<UUID7>) => void;
}

interface IPermissionGroupsFieldProps extends IPermissionsFieldProps {
  label: string;
  name: 'route_permissions' | 'provider_permissions';
  groups: Record<string, IPermissionOption[]>;
}

const PermissionGroupsField = ({ label, name, groups, selected, onChange }: IPermissionGroupsFieldProps) => (
  <div className={modal.field}>
    {Array.from(selected).map((permissionId) => (
      <input key={permissionId} type="hidden" name={name} value={permissionId} />
    ))}
    <label className={modal.label}>{label}</label>
    <PermissionsSelector groups={groups} selected={selected} onChange={onChange} />
  </div>
);

export const RoutePermissionsField = (props: IPermissionsFieldProps) => {
  const { data: routePermissions } = useRoutePermissions();

  if (routePermissions.length === 0) return null;

  return (
    <PermissionGroupsField
      label="Permissões do app"
      name="route_permissions"
      groups={routePermissionGroups(routePermissions)}
      {...props}
    />
  );
};

export const ProviderPermissionsField = (props: IPermissionsFieldProps) => {
  const { data: providerPermissions } = useProviderPermissions();

  if (providerPermissions.length === 0) return null;

  return (
    <PermissionGroupsField
      label="Permissões nos agentes"
      name="provider_permissions"
      groups={providerPermissionGroups(providerPermissions)}
      {...props}
    />
  );
};
